const Account = require("../models/Account");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");
const { success, error } = require("../utils/response");
const { sendNotification } = require("../services/notificationService");
const { checkAmount, checkAccountExists } = require("../utils/validationHelpers");

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
      return error(res, {
        message: "Customer not found or is not a customer",
        statusCode: 404,
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
    return success(res, {
      message: "Account created",
      data: account,
      statusCode: 201,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get accounts for the authenticated user with pagination, filtering & sorting
exports.getAccounts = async (req, res) => {
  try {
    // Parse query params
    const {
      page = 1,
      limit = 20,
      sort = "desc",
      accountType,
      branch,
      status,
      currency,
    } = req.query;

    const numericPage = Math.max(parseInt(page, 10), 1);
    const numericLimit = Math.max(parseInt(limit, 10), 1);
    const skip = (numericPage - 1) * numericLimit;

    // Build filter
    const filter = { user: req.user.id };
    if (accountType) filter.accountType = accountType;
    if (branch) filter.branch = branch;
    if (status) filter.status = status;
    if (currency) filter.currency = currency;

    // Query DB
    const [total, accounts] = await Promise.all([
      Account.countDocuments(filter),
      Account.find(filter)
        .sort({ dateOpened: sort === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(numericLimit),
    ]);

    if (!accounts || accounts.length === 0) {
      return error(res, {
        message: "No accounts found for this user",
        statusCode: 404,
      });
    }

    const totalPages = Math.ceil(total / numericLimit);

    return success(res, {
      message: "Accounts fetched",
      data: accounts,
      meta: {
        page: numericPage,
        limit: numericLimit,
        total,
        pages: totalPages,
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

// Get all accounts (admin only)
// Get all accounts (admin only) with pagination, filtering & sorting
exports.getAllAccounts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = "desc",
      accountNumber,
      accountType,
      branch,
      status,
      userId,
      minBalance,
      maxBalance,
      overdraftLimit,
      minimumBalance,
      openedDateFrom,
      openedDateTo,
      search,
    } = req.query;

    const numericPage = Math.max(parseInt(page, 10), 1);
    const numericLimit = Math.max(parseInt(limit, 10), 1);
    const skip = (numericPage - 1) * numericLimit;

    // Build dynamic filter for admin
    const filter = {};
    if (accountType) filter.accountType = accountType;
    if (branch) filter.branch = branch;
    if (status) filter.status = status;
    if (userId) filter.user = userId;
    if (accountNumber) filter.accountNumber = new RegExp(accountNumber, "i");
    if (overdraftLimit) filter.overdraftLimit = Number(overdraftLimit);
    if (minimumBalance) filter.minimumBalance = Number(minimumBalance);
    if (minBalance || maxBalance) {
      filter.balance = {};
      if (minBalance) filter.balance.$gte = Number(minBalance);
      if (maxBalance) filter.balance.$lte = Number(maxBalance);
    }
    if (openedDateFrom || openedDateTo) {
      filter.dateOpened = {};
      if (openedDateFrom) filter.dateOpened.$gte = new Date(openedDateFrom);
      if (openedDateTo) filter.dateOpened.$lte = new Date(openedDateTo);
    }

    // General search: accountNumber, user name/email
    let accountsQuery = Account.find(filter)
      .populate("user", "name email role")
      .sort({ dateOpened: sort === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(numericLimit);
    if (search) {
      // Search by accountNumber or user name/email
      accountsQuery = Account.find({
        ...filter,
        $or: [{ accountNumber: new RegExp(search, "i") }],
      })
        .populate({
          path: "user",
          match: {
            $or: [
              { name: new RegExp(search, "i") },
              { email: new RegExp(search, "i") },
            ],
          },
          select: "name email role",
        })
        .sort({ dateOpened: sort === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(numericLimit);
    }

    const [total, accounts] = await Promise.all([
      Account.countDocuments(filter),
      accountsQuery,
    ]);

    const totalPages = Math.ceil(total / numericLimit);

    return success(res, {
      message: "Accounts fetched",
      data: accounts,
      meta: {
        page: numericPage,
        limit: numericLimit,
        total,
        pages: totalPages,
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

exports.getBalance = async (req, res) => {
  const { accountNumber } = req.params;

  try {
    const query = { accountNumber };
    // If the user is a customer, they can only see their own account balance
    if (req.user.role === "customer") {
      query.user = req.user.id;
    }

    const account = await Account.findOne(query);

    if (!account) {
      return error(res, { message: "Account not found or access denied", statusCode: 404 });
    }

    return success(res, {
      message: "Balance fetched",
      data: { balance: account.balance, currency: account.currency },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

exports.deleteAccount = async (req, res) => {
  const { accountNumber } = req.params;

  try {
    const account = await Account.findOne({ accountNumber });

    if (!account) {
      return error(res, { message: "Account not found", statusCode: 404 });
    }

    if (account.balance !== 0) {
      return error(res, {
        message: "Account balance must be 0 to delete",
        statusCode: 400,
      });
    }

    await Account.deleteOne({ accountNumber });

    return success(res, { message: "Account closed successfully." });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Deposit: banker (any), customer (own)
exports.deposit = async (req, res) => {
  const { accountNumber, amount, description } = req.body;

  // Validate amount
  const amountError = checkAmount(res, amount, 'deposit');
  if (amountError) return amountError;

  try {
    const query = { accountNumber };
    // If the user is a customer, they can only deposit into their own account
    if (req.user.role === "customer") {
      query.user = req.user.id;
    }

    const account = await Account.findOne(query);

    // Validate account exists
    const accountError = checkAccountExists(res, account, "Account not found or access denied");
    if (accountError) return accountError;

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

    // Send notification after successful deposit (non-blocking, log errors only)
    try {
      await sendNotification({
        type: "deposit",
        title: "Deposit Received",
        message: `Your account ${account.accountNumber} has received a deposit of RM${amount}.`,
        link: `/accounts/${account.accountNumber}`,
        recipient: {
          role: "customer",
          userId: account.user.toString(),
        },
        source: {
          service: "my-bank-api",
          id: transaction._id.toString(),
        },
        data: {
          amount,
          accountNumber: account.accountNumber,
          transactionId: transaction._id.toString(),
        },
        read: false,
        delivered: false,
      });
    } catch (notifyErr) {
      console.error("Failed to send deposit notification:", notifyErr.message);
    }

    return success(res, {
      message: "Deposit successful",
      data: { account, transaction },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Withdraw: banker (any), customer (own)
exports.withdraw = async (req, res) => {
  const { accountNumber, amount, description } = req.body;

  // Validate amount
  const amountError = checkAmount(res, amount, 'withdraw');
  if (amountError) return amountError;

  try {
        const query = { accountNumber };
    // If the user is a customer, they can only withdraw from their own account
    if (req.user.role === "customer") {
      query.user = req.user.id;
    }

    const account = await Account.findOne(query);

    // Validate account exists
    const accountError = checkAccountExists(res, account, "Account not found");
    if (accountError) return accountError;

    // 3. Check sufficient balance
    if (account.balance < amount) {
      return error(res, { message: "Insufficient funds", statusCode: 400 });
    }

    // 4. Create transaction record
    const transaction = new Transaction({
      account: account._id,
      amount,
      type: "withdrawal",
      description: description || "Withdrawal",
      performedBy: req.user.id,
      status: "completed",
    });

    // 5. Update account balance
    account.balance -= amount;

    // 6. Save both transaction and account in a session
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

    // Send notification after successful withdrawal (non-blocking, log errors only)
    try {
      await sendNotification({
        type: "withdrawal",
        title: "Withdrawal Processed",
        message: `A withdrawal of RM${amount} has been made from your account ${account.accountNumber}.`,
        link: `/accounts/${account.accountNumber}`,
        recipient: {
          role: "customer",
          userId: account.user.toString(),
        },
        source: {
          service: "my-bank-api",
          id: transaction._id.toString(),
        },
        data: {
          amount,
          accountNumber: account.accountNumber,
          transactionId: transaction._id.toString(),
        },
        read: false,
        delivered: false,
      });
    } catch (notifyErr) {
      console.error("Failed to send withdrawal notification:", notifyErr.message);
    }

    return success(res, {
      message: "Withdrawal successful",
      data: { account, transaction },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Airdrop: admin only
exports.airdrop = async (req, res) => {
  const { accountNumber, amount, description } = req.body;

  // Validate amount
  const amountError = checkAmount(res, amount, 'airdrop');
  if (amountError) return amountError;

  try {
    // 1. Find account
    const account = await Account.findOne({ accountNumber });
    
    // Validate account exists
    const accountError = checkAccountExists(res, account, "Account not found");
    if (accountError) return accountError;

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

    // Send notification after successful airdrop (non-blocking, log errors only)
    try {
      await sendNotification({
        type: "airdrop",
        title: "Airdrop Received",
        message: `Your account ${account.accountNumber} has received an airdrop of RM${amount}. ${description ? `Description: ${description}` : ''}`,
        link: `/accounts/${account.accountNumber}`,
        recipient: {
          role: "customer",
          userId: account.user.toString(),
        },
        source: {
          service: "my-bank-api",
          id: transaction._id.toString(),
        },
        data: {
          amount,
          accountNumber: account.accountNumber,
          transactionId: transaction._id.toString(),
          description: description || "Airdrop",
        },
        read: false,
        delivered: false,
      });
    } catch (notifyErr) {
      console.error("Failed to send airdrop notification:", notifyErr.message);
    }

    return success(res, {
      message: "Airdrop successful",
      data: { account, transaction },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
