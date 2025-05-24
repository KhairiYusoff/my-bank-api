const Account = require("../models/Account");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");

exports.createAccount = async (req, res) => {
  const {
    userId, // Customer ID
    accountType,
    branch,
    balance,
    interestRate,
    currency,
    overdraftLimit,
    minimumBalance,
  } = req.body;

  try {
    // 1. Verify the customer exists
    const customer = await User.findOne({
      _id: userId,
      role: "customer", // Ensure it's a customer
    });

    if (!customer) {
      return res.status(404).json({
        msg: "Customer not found or is not a customer",
      });
    }

    // 2. Create the account
    const accountNumber = `MYB${Date.now()}`;
    const newAccount = new Account({
      user: userId, // Link to the customer
      accountNumber,
      accountType,
      branch,
      balance: balance || 0, // Default to 0 if no initial deposit
      interestRate,
      currency,
      overdraftLimit,
      minimumBalance,
      status: "Active",
      dateOpened: new Date(),
    });

    const account = await newAccount.save();
    res.json(account);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user.id });

    if (!accounts || accounts.length === 0) {
      return res.status(404).json({ msg: "No accounts found for this user" });
    }

    res.json(accounts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Get all accounts (admin only)
exports.getAllAccounts = async (req, res) => {
  try {
    const accounts = await Account.find().populate("user", "name email role");
    res.json(accounts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.getBalance = async (req, res) => {
  const { accountNumber } = req.params;

  try {
    const account = await Account.findOne({ accountNumber, user: req.user.id });

    if (!account) {
      return res.status(404).json({ msg: "Account not found" });
    }

    res.json({ balance: account.balance });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.deleteAccount = async (req, res) => {
  const { accountNumber } = req.params;

  try {
    const account = await Account.findOne({ accountNumber });

    if (!account) {
      return res.status(404).json({ msg: "Account not found" });
    }

    if (account.balance !== 0) {
      return res
        .status(400)
        .json({ msg: "Account balance must be 0 to delete" });
    }

    await Account.deleteOne({ accountNumber });

    res.json({ msg: "Account closed successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Deposit: banker (any), customer (own)
exports.deposit = async (req, res) => {
  const { accountNumber, amount, description } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ msg: "Invalid deposit amount" });
  }

  try {
    // 1. Find account without user restriction
    const account = await Account.findOne({ accountNumber });

    if (!account) {
      return res.status(404).json({ msg: "Account not found" });
    }

    // 2. Create transaction record
    const transaction = new Transaction({
      account: account._id,
      amount,
      type: "deposit",
      description: description || "Deposit",
      performedBy: req.user.id,
      status: "completed",
    });

    // 3. Update account balance
    account.balance += amount;

    // 4. Save both transaction and account in a session
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await transaction.save({ session });
      await account.save({ session });
      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }

    res.json({
      msg: "Deposit successful",
      account,
      transaction,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Withdraw: banker (any), customer (own)
exports.withdraw = async (req, res) => {
  const { accountNumber, amount, description } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ msg: "Invalid withdraw amount" });
  }

  try {
    // 1. Find account
    let account;
    if (req.user.role === "customer") {
      account = await Account.findOne({ accountNumber, user: req.user.id });
    } else if (req.user.role === "banker") {
      account = await Account.findOne({ accountNumber });
    }

    if (!account) {
      return res.status(404).json({ msg: "Account not found" });
    }

    // 2. Check sufficient balance
    if (account.balance < amount) {
      return res.status(400).json({ msg: "Insufficient funds" });
    }

    // 3. Create transaction record
    const transaction = new Transaction({
      account: account._id,
      amount,
      type: "withdrawal",
      description: description || "Withdrawal",
      performedBy: req.user.id,
      status: "completed",
    });

    // 4. Update account balance
    account.balance -= amount;

    // 5. Save both transaction and account in a session
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await transaction.save({ session });
      await account.save({ session });
      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }

    res.json({
      msg: "Withdrawal successful",
      account,
      transaction,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Airdrop: admin only
exports.airdrop = async (req, res) => {
  const { accountNumber, amount, description } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ msg: "Invalid airdrop amount" });
  }

  try {
    // 1. Find account
    const account = await Account.findOne({ accountNumber });
    if (!account) {
      return res.status(404).json({ msg: "Account not found" });
    }

    // 2. Create transaction record
    const transaction = new Transaction({
      account: account._id,
      amount,
      type: "airdrop",
      description: description || "Airdrop",
      performedBy: req.user.id,
      status: "completed",
    });

    // 3. Update account balance
    account.balance += amount;

    // 4. Save both transaction and account in a session
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await transaction.save({ session });
      await account.save({ session });
      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }

    res.json({
      msg: "Airdrop successful",
      account,
      transaction,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
