const Account = require("../../models/Account");
const Transaction = require("../../models/Transaction");
const mongoose = require("mongoose");
const { sendNotification } = require("./notificationService");

/**
 * Service layer for transaction operations
 * Separates business logic from HTTP concerns
 */

class TransactionService {
  /**
   * Transfer funds between accounts
   * @param {string} fromAccountNumber 
   * @param {string} toAccountNumber 
   * @param {number} amount 
   * @param {string} description 
   * @param {string} userId 
   * @returns {object} Transaction result
   */
  async transferFunds(fromAccountNumber, toAccountNumber, amount, description, userId) {
    // 1. Find accounts
    const fromAccount = await Account.findOne({
      accountNumber: fromAccountNumber,
      user: userId, // Only allow transfers from own accounts
    });
    const toAccount = await Account.findOne({ accountNumber: toAccountNumber });

    if (!fromAccount || !toAccount) {
      throw new Error("Account not found");
    }

    if (fromAccount.balance < amount) {
      throw new Error("Insufficient funds");
    }

    // 2. Create transaction records (one for each account)
    const fromTransaction = new Transaction({
      account: fromAccount._id,
      amount: -amount,
      type: "transfer",
      description: `Transfer to ${toAccountNumber}`,
      performedBy: userId,
      status: "completed"
    });

    const toTransaction = new Transaction({
      account: toAccount._id,
      amount: amount,
      type: "transfer",
      description: `Transfer from ${fromAccountNumber}`,
      performedBy: userId,
      status: "completed"
    });

    // 3. Update account balances
    fromAccount.balance -= amount;
    toAccount.balance += amount;

    // 4. Save everything in a transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await fromTransaction.save({ session });
      await toTransaction.save({ session });
      await fromAccount.save({ session });
      await toAccount.save({ session });
      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw new Error("Transaction failed");
    } finally {
      session.endSession();
    }

    // 5. Send notifications (non-blocking)
    this._sendTransferNotification(fromAccount, toAccount, amount, fromTransaction._id);

    return {
      success: true,
      transactions: [fromTransaction, toTransaction],
      fromAccount,
      toAccount
    };
  }

  /**
   * Get account transactions with pagination
   */
  async getAccountTransactions(accountNumber, user, page = 1, limit = 10, sort = "desc") {
    // Build query
    const query = { accountNumber };
    
    // For customers, only show their own accounts
    if (user.role === "customer") {
      const account = await Account.findOne({ accountNumber, user: user.id });
      if (!account) {
        throw new Error("Account not found or access denied");
      }
    }

    // Pagination
    const numericPage = Math.max(parseInt(page, 10), 1);
    const numericLimit = Math.max(parseInt(limit, 10), 1);
    const skip = (numericPage - 1) * numericLimit;

    // Sort direction
    const sortDirection = sort === "desc" ? -1 : 1;

    // Execute query
    const transactions = await Transaction.find(query)
      .populate("account", "accountNumber")
      .populate("performedBy", "name role")
      .sort({ date: sortDirection })
      .skip(skip)
      .limit(numericLimit);

    const total = await Transaction.countDocuments(query);

    return {
      transactions,
      meta: {
        total,
        page: numericPage,
        limit: numericLimit,
        pages: Math.ceil(total / numericLimit),
      },
    };
  }

  /**
   * Get transaction details with permission check
   */
  async getTransactionDetails(transactionId, user) {
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // For customers, verify they own the account associated with the transaction
    if (user.role === "customer") {
      const account = await Account.findOne({
        _id: transaction.account,
        user: user.id,
      });

      if (!account) {
        throw new Error("Transaction not found");
      }
    }

    // Return fully populated transaction
    return await Transaction.findById(transactionId)
      .populate("account", "accountNumber user")
      .populate("performedBy", "name role");
  }

  /**
   * Private method to send transfer notification
   */
  async _sendTransferNotification(fromAccount, toAccount, amount, transactionId) {
    try {
      await sendNotification({
        type: "transfer",
        title: "Transfer Completed",
        message: `A transfer of RM${amount} has been made from your account ${fromAccount.accountNumber} to ${toAccount.accountNumber}.`,
        link: `/transactions/${transactionId}`,
        recipient: {
          role: "customer",
          userId: fromAccount.user.toString(),
        },
        source: {
          service: "my-bank-api",
          id: transactionId.toString(),
        },
        data: {
          amount,
          fromAccountNumber: fromAccount.accountNumber,
          toAccountNumber: toAccount.accountNumber,
          transactionId: transactionId.toString(),
        },
        read: false,
        delivered: false,
      });
    } catch (notifyErr) {
      console.error("Failed to send transfer notification:", notifyErr.message);
    }
  }
}

module.exports = new TransactionService();
