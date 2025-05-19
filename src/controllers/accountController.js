const Account = require("../models/Account");
const User = require("../models/User");

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
  const { accountNumber, amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ msg: "Invalid deposit amount" });
  }
  try {
    let account;
    if (req.user.role === "customer") {
      account = await Account.findOne({ accountNumber, user: req.user.id });
    } else if (req.user.role === "banker") {
      account = await Account.findOne({ accountNumber });
    }
    if (!account) {
      return res.status(404).json({ msg: "Account not found" });
    }
    account.balance += amount;
    await account.save();
    res.json({ msg: "Deposit successful", account });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Withdraw: banker (any), customer (own)
exports.withdraw = async (req, res) => {
  const { accountNumber, amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ msg: "Invalid withdraw amount" });
  }
  try {
    let account;
    if (req.user.role === "customer") {
      account = await Account.findOne({ accountNumber, user: req.user.id });
    } else if (req.user.role === "banker") {
      account = await Account.findOne({ accountNumber });
    }
    if (!account) {
      return res.status(404).json({ msg: "Account not found" });
    }
    if (account.balance < amount) {
      return res.status(400).json({ msg: "Insufficient funds" });
    }
    account.balance -= amount;
    await account.save();
    res.json({ msg: "Withdraw successful", account });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Airdrop: admin only
exports.airdrop = async (req, res) => {
  const { accountNumber, amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ msg: "Invalid airdrop amount" });
  }
  try {
    const account = await Account.findOne({ accountNumber });
    if (!account) {
      return res.status(404).json({ msg: "Account not found" });
    }
    account.balance += amount;
    await account.save();
    res.json({ msg: "Airdrop successful", account });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
