const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");

exports.transferFunds = async (req, res) => {
  const { fromAccountNumber, toAccountNumber, amount, description } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ msg: "Invalid transfer amount" });
  }

  try {
    // 1. Find accounts
    const fromAccount = await Account.findOne({
      accountNumber: fromAccountNumber,
      user: req.user.id, // Only allow transfers from own accounts
    });
    const toAccount = await Account.findOne({ accountNumber: toAccountNumber });

    if (!fromAccount || !toAccount) {
      return res.status(404).json({ msg: "Account not found" });
    }

    if (fromAccount.balance < amount) {
      return res.status(400).json({ msg: "Insufficient funds" });
    }

    // 2. Create transaction record
    const transaction = new Transaction({
      fromAccount: fromAccount._id,
      toAccount: toAccount._id,
      amount,
      type: "transfer",
      description: description || "Transfer",
      performedBy: req.user.id,
      status: "completed",
    });

    // 3. Update account balances
    fromAccount.balance -= amount;
    toAccount.balance += amount;

    // 4. Save everything in a session
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await transaction.save({ session });
      await fromAccount.save({ session });
      await toAccount.save({ session });
      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }

    res.json({
      msg: "Transfer successful",
      transaction,
      fromAccount,
      toAccount,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
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
      return res.status(404).json({ msg: "Account not found" });
    }

    // 2. Check permissions
    if (
      req.user.role === "customer" &&
      account.user.toString() !== req.user.id
    ) {
      return res.status(403).json({ msg: "Access denied" });
    }

    // 3. Build query
    const query = {
      $or: [{ fromAccount: account._id }, { toAccount: account._id }],
    };

    if (type) query.type = type;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // 4. Get transactions with pagination
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("fromAccount", "accountNumber")
      .populate("toAccount", "accountNumber")
      .populate("performedBy", "name role");

    // 5. Get total count for pagination
    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Get all transactions (admin only)
exports.getAllTransactions = async (req, res) => {
  const { page = 1, limit = 10, type, startDate, endDate } = req.query;

  try {
    // 1. Build query
    const query = {};
    if (type) query.type = type;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // 2. Get transactions with pagination
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("fromAccount", "accountNumber")
      .populate("toAccount", "accountNumber")
      .populate("performedBy", "name role");

    // 3. Get total count for pagination
    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Get transaction details
exports.getTransactionDetails = async (req, res) => {
  const { transactionId } = req.params;

  try {
    const transaction = await Transaction.findById(transactionId)
      .populate("fromAccount", "accountNumber user")
      .populate("toAccount", "accountNumber user")
      .populate("performedBy", "name role");

    if (!transaction) {
      return res.status(404).json({ msg: "Transaction not found" });
    }

    // Check permissions
    if (req.user.role === "customer") {
      const fromAccount = transaction.fromAccount;
      const toAccount = transaction.toAccount;

      if (
        fromAccount &&
        fromAccount.user.toString() !== req.user.id &&
        toAccount &&
        toAccount.user.toString() !== req.user.id
      ) {
        return res.status(403).json({ msg: "Access denied" });
      }
    }

    res.json(transaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
