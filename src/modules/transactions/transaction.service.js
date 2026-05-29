const Account = require("../../shared/models/Account");
const Transaction = require("../../shared/models/Transaction");
const User = require("../../shared/models/User");
const mongoose = require("mongoose");
const {
  sendNotification,
} = require("../../shared/services/notification.service");

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
  async transferFunds(
    fromAccountNumber,
    toAccountNumber,
    amount,
    description,
    userId,
  ) {
    // 1. Find accounts
    const fromAccount = await Account.findOne({
      accountNumber: fromAccountNumber,
      user: userId, // Only allow transfers from own accounts
    });
    const toAccount = await Account.findOne({ accountNumber: toAccountNumber });

    if (!fromAccount || !toAccount) {
      const err = new Error("Account not found");
      err.statusCode = 404;
      throw err;
    }

    if (fromAccount.balance < amount) {
      const err = new Error("Insufficient funds");
      err.statusCode = 400;
      throw err;
    }

    // 2. Create transaction records (one for each account)
    const fromTransaction = new Transaction({
      account: fromAccount._id,
      amount: -amount,
      type: "transfer",
      description: `Transfer to ${toAccountNumber}`,
      performedBy: userId,
      status: "completed",
    });

    const toTransaction = new Transaction({
      account: toAccount._id,
      amount: amount,
      type: "transfer",
      description: `Transfer from ${fromAccountNumber}`,
      performedBy: userId,
      status: "completed",
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
    this._sendTransferNotification(
      fromAccount,
      toAccount,
      amount,
      fromTransaction._id,
    );

    return {
      success: true,
      transactions: [fromTransaction, toTransaction],
      fromAccount,
      toAccount,
    };
  }

  /**
   * Get account transactions with pagination
   */
  async getAccountTransactions(
    accountNumber,
    user,
    page = 1,
    limit = 10,
    sort = "desc",
  ) {
    // Resolve account _id from accountNumber
    const accountFilter =
      user.role === "customer"
        ? { accountNumber, user: user.id }
        : { accountNumber };

    const account = await Account.findOne(accountFilter);
    if (!account) {
      const err = new Error("Account not found or access denied");
      err.statusCode = 404;
      throw err;
    }

    const query = { account: account._id };

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
      const err = new Error("Transaction not found");
      err.statusCode = 404;
      throw err;
    }

    // For customers, verify they own the account associated with the transaction
    if (user.role === "customer") {
      const account = await Account.findOne({
        _id: transaction.account,
        user: user.id,
      });

      if (!account) {
        const err = new Error("Transaction not found");
        err.statusCode = 404;
        throw err;
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
  async _sendTransferNotification(
    fromAccount,
    toAccount,
    amount,
    transactionId,
  ) {
    try {
      // Notify sender (User A)
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

      // Notify recipient (User B)
      await sendNotification({
        type: "transfer",
        title: "Money Received",
        message: `You have received RM${amount} from account ${fromAccount.accountNumber} to your account ${toAccount.accountNumber}.`,
        link: `/transactions/${transactionId}`,
        recipient: {
          role: "customer",
          userId: toAccount.user.toString(),
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

  async getAllTransactions({
    page = 1,
    limit = 10,
    sort = "desc",
    type,
    status,
    performedBy,
    minAmount,
    maxAmount,
    dateFrom,
    dateTo,
    search,
    accountNumber,
  } = {}) {
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (performedBy) query.performedBy = performedBy;
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = Number(minAmount);
      if (maxAmount) query.amount.$lte = Number(maxAmount);
    }
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }

    const numericPage = Math.max(parseInt(page, 10), 1);
    const numericLimit = Math.max(parseInt(limit, 10), 1);
    const skip = (numericPage - 1) * numericLimit;
    const sortDir = sort === "asc" ? 1 : -1;

    const populate = [
      { path: "account", select: "accountNumber" },
      { path: "performedBy", select: "name role" },
    ];

    let finalQuery = query;

    if (search) {
      const accounts = await Account.find({
        accountNumber: new RegExp(search, "i"),
      }).select("_id");
      const users = await User.find({
        $or: [
          { name: new RegExp(search, "i") },
          { email: new RegExp(search, "i") },
        ],
      }).select("_id");
      const accountIds = accounts.map((a) => a._id);
      const userIds = users.map((u) => u._id);
      const orClauses = [
        ...(accountIds.length ? [{ account: { $in: accountIds } }] : []),
        ...(userIds.length ? [{ performedBy: { $in: userIds } }] : []),
      ];
      if (orClauses.length) {
        finalQuery = { ...query, $or: orClauses };
      }
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(finalQuery)
        .sort({ date: sortDir })
        .skip(skip)
        .limit(numericLimit)
        .populate(populate),
      Transaction.countDocuments(query),
    ]);

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
}

module.exports = new TransactionService();
