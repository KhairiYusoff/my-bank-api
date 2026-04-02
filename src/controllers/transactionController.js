const { success, error } = require("../utils/response");
const { checkAmount } = require("../utils/validationHelpers");
const transactionService = require("../services/transactionService");

exports.transferFunds = async (req, res) => {
  const { fromAccountNumber, toAccountNumber, amount, description } = req.body;

  // Validate amount
  const amountError = checkAmount(res, amount, 'transfer');
  if (amountError) return amountError;

  try {
    // Delegate business logic to service layer
    const result = await transactionService.transferFunds(
      fromAccountNumber, 
      toAccountNumber, 
      amount, 
      description, 
      req.user.id
    );

    return success(res, {
      message: "Transfer successful",
      data: result
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: err.message || "Internal server error"
    });
  }
};

// Get transaction history for an account
exports.getAccountTransactions = async (req, res) => {
  const { accountNumber } = req.params;
  const { page = 1, limit = 10, sort = "desc" } = req.query;

  try {
    // Delegate to service layer
    const result = await transactionService.getAccountTransactions(
      accountNumber, 
      req.user, 
      page, 
      limit, 
      sort
    );

    return success(res, {
      message: "Transactions fetched successfully",
      data: result.transactions,
      meta: result.meta
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: err.message || "Internal server error"
    });
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
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get transaction details
exports.getTransactionDetails = async (req, res) => {
  const { transactionId } = req.params;

  try {
    // Delegate to service layer
    const transaction = await transactionService.getTransactionDetails(
      transactionId, 
      req.user
    );

    return success(res, { data: transaction });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: err.message || "Internal server error"
    });
  }
};
