const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");
const { success, error } = require("../utils/response");

exports.transferFunds = async (req, res) => {
  const { fromAccountNumber, toAccountNumber, amount, description } = req.body;

  if (!amount || amount <= 0) {
    return error(res, { message: "Invalid transfer amount", statusCode: 400 });
  }

  try {
    // 1. Find accounts
    const fromAccount = await Account.findOne({
      accountNumber: fromAccountNumber,
      user: req.user.id, // Only allow transfers from own accounts
    });
    const toAccount = await Account.findOne({ accountNumber: toAccountNumber });

    if (!fromAccount || !toAccount) {
      return error(res, { message: "Account not found", statusCode: 404 });
    }

    if (fromAccount.balance < amount) {
      return error(res, { message: "Insufficient funds", statusCode: 400 });
    }

    // 2. Create transaction records (one for each account)
    const fromTransaction = new Transaction({
      account: fromAccount._id,
      amount: -amount,
      type: "transfer",
      description: `Transfer to ${toAccountNumber}`,
      performedBy: req.user.id,
      status: "completed"
    });

    const toTransaction = new Transaction({
      account: toAccount._id,
      amount: amount,
      type: "transfer",
      description: `Transfer from ${fromAccountNumber}`,
      performedBy: req.user.id,
      status: "completed"
    });

    // 3. Update account balances
    fromAccount.balance -= amount;
    toAccount.balance += amount;

    // 4. Save everything in a session
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
      throw err;
    } finally {
      session.endSession();
    }

    // Send notifications after successful transfer (non-blocking, log errors only)
    try {

      // Notify sender (fromAccount)
      await sendNotification({
        type: "transfer",
        title: "Funds Transferred",
        message: `You have transferred RM${amount} to account ${toAccountNumber}. Description: ${description || ''}`,
        link: `/accounts/${fromAccount.accountNumber}`,
        recipient: {
          role: "customer",
          userId: fromAccount.user.toString(),
        },
        source: {
          service: "my-bank-api",
          id: fromTransaction._id.toString(),
        },
        data: {
          amount,
          fromAccountNumber: fromAccount.accountNumber,
          toAccountNumber: toAccount.accountNumber,
          transactionId: fromTransaction._id.toString(),
        },
        read: false,
        delivered: false,
      });
      
      // Notify recipient (toAccount)
      await sendNotification({
        type: "transfer",
        title: "Funds Received",
        message: `You have received RM${amount} from account ${fromAccountNumber}. Description: ${description || ''}`,
        link: `/accounts/${toAccount.accountNumber}`,
        recipient: {
          role: "customer",
          userId: toAccount.user.toString(),
        },
        source: {
          service: "my-bank-api",
          id: toTransaction._id.toString(),
        },
        data: {
          amount,
          fromAccountNumber: fromAccount.accountNumber,
          toAccountNumber: toAccount.accountNumber,
          transactionId: toTransaction._id.toString(),
        },
        read: false,
        delivered: false,
      });
    } catch (notifyErr) {
      console.error("Failed to send transfer notification:", notifyErr.message);
    }

    return success(res, {
      message: "Transfer successful",
      data: {
        transactions: [fromTransaction, toTransaction],
        fromAccount,
        toAccount
      }
    });
  } catch (err) {
    console.error(err.message);
    return error(res, { message: "Server error", statusCode: 500 });
  }
};

// Get transaction history for an account
exports.getAccountTransactions = async (req, res) => {
  const { accountNumber } = req.params;
  const { page = 1, limit = 10, type, startDate, endDate } = req.query;

  try {
    // 1. Find the account
    const account = await Account.findOne({ accountNumber });
    if (!account) {
      return error(res, { message: "Account not found", statusCode: 404 });
    }

    // 2. Check permissions
    if (
      req.user.role === "customer" &&
      account.user.toString() !== req.user.id
    ) {
      return error(res, { message: "Access denied", statusCode: 403 });
    }

    // 3. Build query
    const query = { account: account._id };

    if (type) query.type = type;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // 4. Get transactions with pagination
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("account", "accountNumber")
      .populate("performedBy", "name role");

    // 5. Get total count for pagination
    const total = await Transaction.countDocuments(query);

    return success(res, {
      data: transactions,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err.message);
    return error(res, { message: "Server error", statusCode: 500 });
  }
};

// Get all transactions (admin only)
exports.getAllTransactions = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sort = "desc",
    accountNumber,
    type,
    status,
    performedBy,
    minAmount,
    maxAmount,
    dateFrom,
    dateTo,
    search,
  } = req.query;

  try {
    // 1. Build query
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

    // General search: accountNumber, performedBy name/email
    let transactionsQuery = Transaction.find(query)
      .sort({ date: sort === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate({
        path: "account",
        select: "accountNumber"
      })
      .populate({
        path: "performedBy",
        select: "name role"
      });

    if (search) {
      // Find account IDs matching accountNumber
      const Account = require("../models/Account");
      const User = require("../models/User");
      const accounts = accountNumber || search
        ? await Account.find({ accountNumber: new RegExp(search, "i") }).select("_id")
        : [];
      const users = await User.find({
        $or: [
          { name: new RegExp(search, "i") },
          { email: new RegExp(search, "i") },
        ]
      }).select("_id");
      const accountIds = accounts.map(a => a._id);
      const userIds = users.map(u => u._id);
      transactionsQuery = Transaction.find({
        ...query,
        $or: [
          ...(accountIds.length ? [{ account: { $in: accountIds } }] : []),
          ...(userIds.length ? [{ performedBy: { $in: userIds } }] : [])
        ]
      })
        .sort({ date: sort === "asc" ? 1 : -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate({
          path: "account",
          select: "accountNumber"
        })
        .populate({
          path: "performedBy",
          select: "name role"
        });
    }

    // 2. Get transactions with pagination
    const transactions = await transactionsQuery;

    // 3. Get total count for pagination
    const total = await Transaction.countDocuments(query);

    return success(res, {
      data: transactions,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err.message);
    return error(res, { message: "Server error", statusCode: 500 });
  }
};

// Get transaction details
exports.getTransactionDetails = async (req, res) => {
  const { transactionId } = req.params;

  try {
    // First get the transaction without populating (faster for permission check)
    const transaction = await Transaction.findById(transactionId);
    
    if (!transaction) {
      return error(res, { message: "Transaction not found", statusCode: 404 });
    }

    // For customers, verify ownership first
    if (req.user.role === "customer") {
      const account = await Account.findOne({
        _id: transaction.account,
        user: req.user.id
      });
      
      if (!account) {
        return error(res, { message: "Access denied", statusCode: 403 });
      }
    }

    // If we get here, user has permission - now get full details
    const populatedTransaction = await Transaction.findById(transactionId)
      .populate("account", "accountNumber user")
      .populate("performedBy", "name role");

    return success(res, { data: populatedTransaction });
  } catch (err) {
    console.error(err.message);
    return error(res, { message: "Server error", statusCode: 500 });
  }
};
