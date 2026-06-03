const Account = require("../../shared/models/Account");
const User = require("../../shared/models/User");
const Transaction = require("../../shared/models/Transaction");
const mongoose = require("mongoose");
const {
  sendNotification,
} = require("../../shared/services/notification.service");
const { getNextReference } = require("../../shared/utils/reference");

const ROLE_TO_CHANNEL = {
  banker: "branch",
  admin: "system",
  customer: "web",
};

class AccountService {
  async createAccount(userId, accountData) {
    const {
      accountType,
      branch,
      balance,
      interestRate,
      overdraftLimit,
      minimumBalance,
    } = accountData;

    const customer = await User.findOne({ _id: userId, role: "customer" });
    if (!customer) {
      const err = new Error("Customer not found or is not a customer");
      err.statusCode = 404;
      throw err;
    }

    const accountNumber = `MYB${Date.now()}`;
    const newAccount = new Account({
      user: userId,
      accountNumber,
      accountType,
      branch,
      balance: balance || 0,
      interestRate,
      currency: "MYR",
      overdraftLimit,
      minimumBalance,
      status: "Active",
      dateOpened: new Date(),
    });

    return await newAccount.save();
  }

  async getAccounts(userId, query) {
    const {
      page = 1,
      limit = 20,
      sort = "desc",
      accountType,
      branch,
      status,
      currency,
    } = query;

    const numericPage = Math.max(parseInt(page, 10), 1);
    const numericLimit = Math.max(parseInt(limit, 10), 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = { user: userId };
    if (accountType) filter.accountType = accountType;
    if (branch) filter.branch = branch;
    if (status) filter.status = status;
    if (currency) filter.currency = currency;

    const [total, accounts] = await Promise.all([
      Account.countDocuments(filter),
      Account.find(filter)
        .sort({ dateOpened: sort === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(numericLimit),
    ]);

    if (!accounts || accounts.length === 0) {
      const err = new Error("No accounts found for this user");
      err.statusCode = 404;
      throw err;
    }

    return {
      accounts,
      meta: {
        page: numericPage,
        limit: numericLimit,
        total,
        pages: Math.ceil(total / numericLimit),
      },
    };
  }

  async getAllAccounts(query) {
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
    } = query;

    const numericPage = Math.max(parseInt(page, 10), 1);
    const numericLimit = Math.max(parseInt(limit, 10), 1);
    const skip = (numericPage - 1) * numericLimit;

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

    let accountsQuery = Account.find(filter)
      .populate("user", "name email role")
      .sort({ dateOpened: sort === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(numericLimit);

    if (search) {
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

    return {
      accounts,
      meta: {
        page: numericPage,
        limit: numericLimit,
        total,
        pages: Math.ceil(total / numericLimit),
      },
    };
  }

  async getBalance(accountNumber, userId, role) {
    const query = { accountNumber };
    if (role === "customer") query.user = userId;

    const account = await Account.findOne(query);
    if (!account) {
      const err = new Error("Account not found or access denied");
      err.statusCode = 404;
      throw err;
    }

    return { balance: account.balance, currency: account.currency };
  }

  async deleteAccount(accountNumber) {
    const account = await Account.findOne({ accountNumber });
    if (!account) {
      const err = new Error("Account not found");
      err.statusCode = 404;
      throw err;
    }

    if (account.balance !== 0) {
      const err = new Error("Account balance must be 0 to delete");
      err.statusCode = 400;
      throw err;
    }

    await Account.deleteOne({ accountNumber });
  }

  async deposit(accountNumber, amount, userId, role, memo, ip, userAgent) {
    const submittedAt = new Date();
    const channel = ROLE_TO_CHANNEL[role] ?? "web";
    const reference = await getNextReference();

    const query = { accountNumber };
    if (role === "customer") query.user = userId;

    const session = await mongoose.startSession();
    session.startTransaction();

    let account;
    let transaction;
    try {
      account = await Account.findOne(query).session(session);
      if (!account) {
        const err = new Error("Account not found or access denied");
        err.statusCode = 404;
        throw err;
      }

      const balanceBefore = account.balance;
      account.balance += amount;
      const completedAt = new Date();

      transaction = new Transaction({
        account: account._id,
        amount,
        type: "deposit",
        description: "Deposit",
        memo: memo || undefined,
        reference,
        fee: 0,
        balanceBefore,
        balanceAfter: account.balance,
        currency: account.currency ?? "MYR",
        channel,
        deviceInfo: { ip, userAgent },
        processingTime: { submittedAt, completedAt },
        counterpartName: "MyBank",
        counterpartNameRaw: "MyBank",
        counterpartAccount: null,
        isNewRecipient: null,
        twoFactorVerified: null,
        riskFlags: [],
        isReversed: false,
        reversalOf: null,
        performedBy: userId,
        status: "completed",
      });

      await transaction.save({ session });
      await account.save({ session });
      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }

    try {
      await sendNotification({
        type: "deposit",
        title: "Deposit Received",
        message: `Your account ${account.accountNumber} has received a deposit of RM${amount}.`,
        link: `/accounts/${account.accountNumber}`,
        recipient: { role: "customer", userId: account.user.toString() },
        source: { service: "my-bank-api", id: transaction._id.toString() },
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

    return { account, transaction };
  }

  async withdraw(accountNumber, amount, userId, role, memo, ip, userAgent) {
    const submittedAt = new Date();
    const channel = ROLE_TO_CHANNEL[role] ?? "web";
    const reference = await getNextReference();

    const query = { accountNumber };
    if (role === "customer") query.user = userId;

    const session = await mongoose.startSession();
    session.startTransaction();

    let account;
    let transaction;
    try {
      account = await Account.findOne(query).session(session);
      if (!account) {
        const err = new Error("Account not found");
        err.statusCode = 404;
        throw err;
      }

      if (account.balance < amount) {
        const err = new Error("Insufficient funds");
        err.statusCode = 400;
        throw err;
      }

      const balanceBefore = account.balance;
      account.balance -= amount;
      const completedAt = new Date();

      transaction = new Transaction({
        account: account._id,
        amount,
        type: "withdrawal",
        description: "Withdrawal",
        memo: memo || undefined,
        reference,
        fee: 0,
        balanceBefore,
        balanceAfter: account.balance,
        currency: account.currency ?? "MYR",
        channel,
        deviceInfo: { ip, userAgent },
        processingTime: { submittedAt, completedAt },
        counterpartName: "MyBank",
        counterpartNameRaw: "MyBank",
        counterpartAccount: null,
        isNewRecipient: null,
        twoFactorVerified: null,
        riskFlags: [],
        isReversed: false,
        reversalOf: null,
        performedBy: userId,
        status: "completed",
      });

      await transaction.save({ session });
      await account.save({ session });
      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }

    try {
      await sendNotification({
        type: "withdrawal",
        title: "Withdrawal Processed",
        message: `A withdrawal of RM${amount} has been made from your account ${account.accountNumber}.`,
        link: `/accounts/${account.accountNumber}`,
        recipient: { role: "customer", userId: account.user.toString() },
        source: { service: "my-bank-api", id: transaction._id.toString() },
        data: {
          amount,
          accountNumber: account.accountNumber,
          transactionId: transaction._id.toString(),
        },
        read: false,
        delivered: false,
      });
    } catch (notifyErr) {
      console.error(
        "Failed to send withdrawal notification:",
        notifyErr.message,
      );
    }

    return { account, transaction };
  }

  async airdrop(accountNumber, amount, memo, userId, role, ip, userAgent) {
    const submittedAt = new Date();
    const channel = ROLE_TO_CHANNEL[role] ?? "system";
    const reference = await getNextReference();

    const session = await mongoose.startSession();
    session.startTransaction();

    let account;
    let transaction;
    try {
      account = await Account.findOne({ accountNumber }).session(session);
      if (!account) {
        const err = new Error("Account not found");
        err.statusCode = 404;
        throw err;
      }

      const balanceBefore = account.balance;
      account.balance += amount;
      const completedAt = new Date();

      transaction = new Transaction({
        account: account._id,
        amount,
        type: "airdrop",
        description: "Airdrop",
        memo: memo || undefined,
        reference,
        fee: 0,
        balanceBefore,
        balanceAfter: account.balance,
        currency: account.currency ?? "MYR",
        channel,
        deviceInfo: { ip, userAgent },
        processingTime: { submittedAt, completedAt },
        counterpartName: "MyBank",
        counterpartNameRaw: "MyBank",
        counterpartAccount: null,
        isNewRecipient: null,
        twoFactorVerified: null,
        riskFlags: [],
        isReversed: false,
        reversalOf: null,
        performedBy: userId,
        status: "completed",
      });

      await transaction.save({ session });
      await account.save({ session });
      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }

    try {
      await sendNotification({
        type: "airdrop",
        title: "Airdrop Received",
        message: `Your account ${account.accountNumber} has received an airdrop of RM${amount}.`,
        link: `/accounts/${account.accountNumber}`,
        recipient: { role: "customer", userId: account.user.toString() },
        source: { service: "my-bank-api", id: transaction._id.toString() },
        data: {
          amount,
          accountNumber: account.accountNumber,
          transactionId: transaction._id.toString(),
        },
        read: false,
        delivered: false,
      });
    } catch (notifyErr) {
      console.error("Failed to send airdrop notification:", notifyErr.message);
    }

    return { account, transaction };
  }

  async getAccountByNumber(accountNumber) {
    const account = await Account.findOne({ accountNumber }).populate(
      "user",
      "name email phoneNumber role",
    );
    if (!account) {
      const err = new Error("Account not found.");
      err.statusCode = 404;
      throw err;
    }
    return account;
  }

  async updateAccountStatus(accountNumber, status) {
    const allowed = ["Active", "Dormant", "Closed"];
    if (!allowed.includes(status)) {
      const err = new Error(
        `Invalid status. Must be one of: ${allowed.join(", ")}.`,
      );
      err.statusCode = 400;
      throw err;
    }

    const account = await Account.findOne({ accountNumber });
    if (!account) {
      const err = new Error("Account not found.");
      err.statusCode = 404;
      throw err;
    }

    if (account.status === "Closed") {
      const err = new Error("Account is already closed and cannot be updated.");
      err.statusCode = 400;
      throw err;
    }

    account.status = status;
    if (status === "Closed") {
      account.dateClosed = new Date();
    }

    await account.save();
    return account;
  }
}

module.exports = new AccountService();
