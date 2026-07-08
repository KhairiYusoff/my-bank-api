const Account = require("../../shared/models/Account");
const Transaction = require("../../shared/models/Transaction");
const User = require("../../shared/models/User");
const mongoose = require("mongoose");
const {
  sendNotification,
} = require("../../shared/services/notification.service");
const { getNextReference } = require("../../shared/utils/reference");
const { maskName } = require("../../shared/utils/maskName");
const { ACCOUNT_LIMITS } = require("../../shared/constants/accountLimits");
const { ACCOUNT_STATUS } = require("../../shared/constants/accountStatus");
const {
  notifyBelowThreshold,
} = require("../../shared/utils/maintenanceThreshold");

const ROLE_TO_CHANNEL = {
  banker: "branch",
  admin: "system",
  customer: "web",
};

class TransactionService {
  async transferFunds(
    fromAccountNumber,
    toAccountNumber,
    amount,
    memo,
    userId,
    role,
    ip,
    userAgent,
  ) {
    const submittedAt = new Date();
    const channel = ROLE_TO_CHANNEL[role] ?? "web";

    if (amount < 1) {
      const err = new Error("Minimum transfer amount is RM1.00");
      err.statusCode = 400;
      throw err;
    }

    if (fromAccountNumber === toAccountNumber) {
      const err = new Error("Cannot transfer to the same account");
      err.statusCode = 400;
      throw err;
    }

    const fromAccountCheck = await Account.findOne({
      accountNumber: fromAccountNumber,
      user: userId,
    }).select("_id accountType status balance overdraftLimit");
    if (!fromAccountCheck) {
      const err = new Error("Account not found or access denied");
      err.statusCode = 404;
      throw err;
    }

    if (
      role === "customer" &&
      fromAccountCheck.status === ACCOUNT_STATUS.DORMANT
    ) {
      const err = new Error(
        "Account is dormant. Please visit the nearest branch for reactivation.",
      );
      err.statusCode = 403;
      throw err;
    }

    if (
      role === "customer" &&
      fromAccountCheck.status === ACCOUNT_STATUS.SUSPENDED
    ) {
      const err = new Error(
        "Account is suspended. Please contact the branch for assistance.",
      );
      err.statusCode = 403;
      throw err;
    }

    if (
      fromAccountCheck.status !== ACCOUNT_STATUS.ACTIVE &&
      role === "customer"
    ) {
      const err = new Error(
        "This account is not active and cannot process transfers",
      );
      err.statusCode = 400;
      throw err;
    }

    if (fromAccountCheck.accountType === "fixed_deposit") {
      const err = new Error("Fixed Deposit accounts cannot send transfers");
      err.statusCode = 400;
      throw err;
    }

    const typeLimits = ACCOUNT_LIMITS[fromAccountCheck.accountType];
    const maxSingleLimit = typeLimits?.maxSingleTransfer;
    const dailyLimit = typeLimits?.dailyTransferLimit;
    if (!maxSingleLimit || !dailyLimit) {
      const err = new Error("Unsupported account type for transfers");
      err.statusCode = 400;
      throw err;
    }

    if (amount > maxSingleLimit) {
      const err = new Error(
        `Transfer amount exceeds the RM${maxSingleLimit} single transfer limit for this account type`,
      );
      err.statusCode = 400;
      throw err;
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const dailyAgg = await Transaction.aggregate([
      {
        $match: {
          account: fromAccountCheck._id,
          type: "transfer",
          direction: "debit",
          date: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const dailyTotal = dailyAgg[0]?.total ?? 0;
    if (dailyTotal + amount > dailyLimit) {
      const err = new Error(
        `This transfer would exceed the RM${dailyLimit} daily transfer limit for this account type`,
      );
      err.statusCode = 400;
      throw err;
    }

    const availableFunds =
      fromAccountCheck.balance + (fromAccountCheck.overdraftLimit ?? 0);
    if (availableFunds < amount) {
      const err = new Error("Insufficient funds");
      err.statusCode = 400;
      throw err;
    }

    // 2. Check if this is the first ever transfer to this recipient (before session)
    const priorTransfer = await Transaction.findOne({
      account: fromAccountCheck._id,
      counterpartAccount: toAccountNumber,
    })
      .select("_id")
      .lean();
    const isNewRecipient = !priorTransfer;

    const toAccountForName = await Account.findOne({
      accountNumber: toAccountNumber,
    })
      .select("user accountType status")
      .lean();
    if (!toAccountForName) {
      const err = new Error("Recipient account not found");
      err.statusCode = 404;
      throw err;
    }

    if (toAccountForName.status !== ACCOUNT_STATUS.ACTIVE) {
      const err = new Error(
        "Recipient account is not active and cannot receive transfers",
      );
      err.statusCode = 400;
      throw err;
    }

    if (toAccountForName.accountType === "fixed_deposit") {
      const err = new Error("Fixed Deposit accounts cannot receive transfers");
      err.statusCode = 400;
      throw err;
    }
    const counterpartUser = await User.findById(toAccountForName.user)
      .select("name")
      .lean();
    const counterpartNameRaw = counterpartUser?.name ?? "[Account Deleted]";
    const counterpartName = counterpartUser
      ? maskName(counterpartUser.name)
      : "[Account Deleted]";

    // Fetch sender name for credit leg (recipient sees sender as counterpart)
    const senderUser = await User.findById(userId).select("name").lean();
    const senderNameRaw = senderUser?.name ?? "[Account Deleted]";
    const senderNameMasked = senderUser
      ? maskName(senderUser.name)
      : "[Account Deleted]";

    const reference = await getNextReference();

    const session = await mongoose.startSession();
    session.startTransaction();

    let fromTransaction;
    let toTransaction;
    let fromBalanceAfter;
    let toBalanceAfter;
    let fromAccountData;

    try {
      // Re-fetch accounts inside session for consistent balance reads
      const fromAccount = await Account.findOne({
        accountNumber: fromAccountNumber,
        user: userId,
      }).session(session);
      if (!fromAccount) {
        const err = new Error("Account not found or access denied");
        err.statusCode = 404;
        throw err;
      }
      fromAccountData = fromAccount.toObject();

      const toAccount = await Account.findOne({
        accountNumber: toAccountNumber,
      }).session(session);
      if (!toAccount) {
        const err = new Error("Recipient account not found");
        err.statusCode = 404;
        throw err;
      }

      if (fromAccount.status !== ACCOUNT_STATUS.ACTIVE) {
        if (fromAccount.status === ACCOUNT_STATUS.SUSPENDED) {
          const err = new Error(
            "Account is suspended. Please contact the branch for assistance.",
          );
          err.statusCode = 403;
          throw err;
        }
        const err = new Error(
          "This account is not active and cannot process transfers",
        );
        err.statusCode = 400;
        throw err;
      }

      if (toAccount.status !== ACCOUNT_STATUS.ACTIVE) {
        const err = new Error(
          "Recipient account is not active and cannot receive transfers",
        );
        err.statusCode = 400;
        throw err;
      }

      if (fromAccount.accountType === "fixed_deposit") {
        const err = new Error("Fixed Deposit accounts cannot send transfers");
        err.statusCode = 400;
        throw err;
      }

      if (toAccount.accountType === "fixed_deposit") {
        const err = new Error(
          "Fixed Deposit accounts cannot receive transfers",
        );
        err.statusCode = 400;
        throw err;
      }

      const availableInSession =
        fromAccount.balance + (fromAccount.overdraftLimit ?? 0);
      if (availableInSession < amount) {
        const err = new Error("Insufficient funds");
        err.statusCode = 400;
        throw err;
      }

      // Update balances
      const fromBalanceBefore = fromAccount.balance;
      const toBalanceBefore = toAccount.balance;
      fromAccount.balance -= amount;
      toAccount.balance += amount;
      fromBalanceAfter = fromAccount.balance;
      toBalanceAfter = toAccount.balance;

      const currency = fromAccount.currency ?? "MYR";
      const completedAt = new Date();

      fromTransaction = new Transaction({
        account: fromAccount._id,
        amount,
        type: "transfer",
        direction: "debit",
        description: `Transfer to ${toAccountNumber}`,
        memo: memo || undefined,
        reference,
        fee: 0,
        balanceBefore: fromBalanceBefore,
        balanceAfter: fromBalanceAfter,
        currency,
        channel,
        deviceInfo: { ip, userAgent },
        processingTime: { submittedAt, completedAt },
        counterpartAccount: toAccountNumber,
        counterpartNameRaw,
        counterpartName,
        isNewRecipient,
        twoFactorVerified: null,
        riskFlags: [],
        isReversed: false,
        reversalOf: null,
        performedBy: userId,
        status: "completed",
      });

      toTransaction = new Transaction({
        account: toAccount._id,
        amount,
        type: "transfer",
        direction: "credit",
        description: `Transfer from ${fromAccountNumber}`,
        memo: memo || undefined,
        reference,
        fee: 0,
        balanceBefore: toBalanceBefore,
        balanceAfter: toBalanceAfter,
        currency: toAccount.currency ?? "MYR",
        channel,
        deviceInfo: { ip, userAgent },
        processingTime: { submittedAt, completedAt },
        counterpartAccount: fromAccountNumber,
        counterpartNameRaw: senderNameRaw,
        counterpartName: senderNameMasked,
        isNewRecipient: null,
        twoFactorVerified: null,
        riskFlags: [],
        isReversed: false,
        reversalOf: null,
        performedBy: userId,
        status: "completed",
      });

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

    this._sendTransferNotification(
      fromAccountNumber,
      toAccountNumber,
      amount,
      fromTransaction._id,
    ).catch((e) =>
      console.error("Failed to send transfer notification:", e.message),
    );

    notifyBelowThreshold({
      ...fromAccountData,
      balance: fromBalanceAfter,
    }).catch((e) =>
      console.error("Failed to send low balance alert:", e.message),
    );

    return {
      reference,
      amount,
      balanceAfter: fromBalanceAfter,
      counterpartAccount: toAccountNumber,
      counterpartName,
      counterpartNameRaw,
      date: fromTransaction.date,
      fromTransactionId: fromTransaction._id,
    };
  }

  async getAccountTransactions(
    accountNumber,
    user,
    page = 1,
    limit = 10,
    sort = "desc",
  ) {
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
    const numericPage = Math.max(parseInt(page, 10), 1);
    const numericLimit = Math.max(parseInt(limit, 10), 1);
    const skip = (numericPage - 1) * numericLimit;
    const sortDirection = sort === "desc" ? -1 : 1;

    const transactions = await Transaction.find(query)
      .populate("account", "accountNumber")
      .populate("performedBy", "name role")
      .sort({ date: sortDirection })
      .skip(skip)
      .limit(numericLimit);

    const total = await Transaction.countDocuments(query);

    const isCustomer = user.role === "customer";
    const shaped = transactions.map((tx) =>
      this._shapeTxForRole(tx, isCustomer),
    );

    return {
      transactions: shaped,
      meta: {
        total,
        page: numericPage,
        limit: numericLimit,
        pages: Math.ceil(total / numericLimit),
      },
    };
  }

  async getTransactionDetails(transactionId, user) {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      const err = new Error("Transaction not found");
      err.statusCode = 404;
      throw err;
    }

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

    const full = await Transaction.findById(transactionId)
      .populate("account", "accountNumber user")
      .populate("performedBy", "name role");

    return this._shapeTxForRole(full, user.role === "customer");
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

  _shapeTxForRole(tx, isCustomer) {
    const obj = tx.toObject ? tx.toObject() : { ...tx };

    if (isCustomer) {
      delete obj.deviceInfo;
      delete obj.counterpartNameRaw;
      if (obj.counterpartAccount) {
        const acc = obj.counterpartAccount;
        obj.counterpartAccount =
          acc.length > 4
            ? `${acc.slice(0, 3)}****${acc.slice(-4)}`
            : `${acc[0]}****`;
      }
    } else {
      obj.counterpartName = obj.counterpartNameRaw ?? obj.counterpartName;
      delete obj.counterpartNameRaw;
    }

    return obj;
  }

  async _sendTransferNotification(
    fromAccountNumber,
    toAccountNumber,
    amount,
    transactionId,
  ) {
    try {
      const [fromAccount, toAccount] = await Promise.all([
        Account.findOne({ accountNumber: fromAccountNumber }).select("user"),
        Account.findOne({ accountNumber: toAccountNumber }).select("user"),
      ]);

      if (fromAccount) {
        await sendNotification({
          type: "transfer",
          title: "Transfer Completed",
          message: `A transfer of RM${amount} has been made from your account ${fromAccountNumber} to ${toAccountNumber}.`,
          link: `/transactions/${transactionId}`,
          recipient: { role: "customer", userId: fromAccount.user.toString() },
          source: { service: "my-bank-api", id: transactionId.toString() },
          data: {
            amount,
            fromAccountNumber,
            toAccountNumber,
            transactionId: transactionId.toString(),
          },
          read: false,
          delivered: false,
        });
      }

      if (toAccount) {
        await sendNotification({
          type: "transfer",
          title: "Money Received",
          message: `You have received RM${amount} from account ${fromAccountNumber} to your account ${toAccountNumber}.`,
          link: `/transactions/${transactionId}`,
          recipient: { role: "customer", userId: toAccount.user.toString() },
          source: { service: "my-bank-api", id: transactionId.toString() },
          data: {
            amount,
            fromAccountNumber,
            toAccountNumber,
            transactionId: transactionId.toString(),
          },
          read: false,
          delivered: false,
        });
      }
    } catch (notifyErr) {
      console.error("Failed to send transfer notification:", notifyErr.message);
    }
  }
}

module.exports = new TransactionService();
