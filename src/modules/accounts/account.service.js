const Account = require("../../shared/models/Account");
const User = require("../../shared/models/User");
const Transaction = require("../../shared/models/Transaction");
const ActivityLog = require("../../shared/models/ActivityLog");
const mongoose = require("mongoose");
const {
  sendNotification,
} = require("../../shared/services/notification.service");
const { getNextReference } = require("../../shared/utils/reference");
const {
  ACCOUNT_LIMITS,
  MIN_OPENING_BALANCE,
  FD_INTEREST_RATES,
  DORMANCY_FEE,
} = require("../../shared/constants/accountLimits");
const {
  ACCOUNT_STATUS,
  BANKER_MUTABLE_STATUSES,
} = require("../../shared/constants/accountStatus");
const {
  notifyBelowThreshold,
} = require("../../shared/utils/maintenanceThreshold");
const {
  generateAccountNumber,
} = require("../../shared/utils/generateAccountNumber");
const { isDormancyAnniversary } = require("../../shared/utils/date");
const { getReadableAccountType } = require("../../shared/utils/validation.helpers");

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

    const accountNumber = await generateAccountNumber(accountType, branch);
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
      status: ACCOUNT_STATUS.ACTIVE,
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

    const filter = { user: userId, status: { $ne: ACCOUNT_STATUS.CLOSED } };
    if (accountType) filter.accountType = accountType;
    if (branch) filter.branch = branch;
    if (status) filter.status = status;
    if (currency) filter.currency = currency;

    const [total, accounts] = await Promise.all([
      Account.countDocuments(filter),
      Account.find(filter)
        .populate("linkedAccount", "accountNumber")
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
      .populate("linkedAccount", "accountNumber")
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
        .populate("linkedAccount", "accountNumber")
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

    if (amount < 10) {
      const err = new Error("Minimum deposit amount is RM 10");
      err.statusCode = 400;
      throw err;
    }

    if (amount > 100000) {
      const err = new Error("Maximum deposit amount is RM 100,000");
      err.statusCode = 400;
      throw err;
    }

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

      if (role === "customer" && account.status === ACCOUNT_STATUS.DORMANT) {
        const err = new Error(
          "Account is dormant. Please visit the nearest branch for reactivation.",
        );
        err.statusCode = 403;
        throw err;
      }

      if (role === "customer" && account.status === ACCOUNT_STATUS.SUSPENDED) {
        const err = new Error(
          "Account is suspended. Please contact the branch for assistance.",
        );
        err.statusCode = 403;
        throw err;
      }

      if (account.status !== ACCOUNT_STATUS.ACTIVE && role === "customer") {
        const err = new Error(
          "This account is not active and cannot receive deposits",
        );
        err.statusCode = 400;
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

    if (amount < 10) {
      const err = new Error("Minimum withdrawal amount is RM10.00");
      err.statusCode = 400;
      throw err;
    }

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

      if (role === "customer" && account.status === ACCOUNT_STATUS.DORMANT) {
        const err = new Error(
          "Account is dormant. Please visit the nearest branch for reactivation.",
        );
        err.statusCode = 403;
        throw err;
      }

      if (role === "customer" && account.status === ACCOUNT_STATUS.SUSPENDED) {
        const err = new Error(
          "Account is suspended. Please contact the branch for assistance.",
        );
        err.statusCode = 403;
        throw err;
      }

      if (account.status !== ACCOUNT_STATUS.ACTIVE) {
        const err = new Error(
          "This account is not active and cannot process withdrawals",
        );
        err.statusCode = 400;
        throw err;
      }

      if (account.accountType === "fixed_deposit") {
        const err = new Error(
          "Fixed Deposit withdrawals are not permitted until the account matures",
        );
        err.statusCode = 400;
        throw err;
      }

      const available = account.balance + (account.overdraftLimit ?? 0);
      if (available < amount) {
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

    await notifyBelowThreshold(account);

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
    const account = await Account.findOne({ accountNumber })
      .populate("user", "name email phoneNumber role")
      .populate("linkedAccount", "accountNumber");
    if (!account) {
      const err = new Error("Account not found.");
      err.statusCode = 404;
      throw err;
    }
    return account;
  }

  async updateAccountStatus(accountNumber, status) {
    if (!BANKER_MUTABLE_STATUSES.includes(status)) {
      const err = new Error(
        `Invalid status. Must be one of: ${BANKER_MUTABLE_STATUSES.join(", ")}.`,
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

    if (account.status === ACCOUNT_STATUS.CLOSED) {
      const err = new Error("Account is already closed and cannot be updated.");
      err.statusCode = 400;
      throw err;
    }

    account.status = status;
    if (status === ACCOUNT_STATUS.CLOSED) {
      account.dateClosed = new Date();
    }
    await account.save();
    return account;
  }

  async requestAccount(userId, accountData) {
    const {
      accountType,
      branch,
      amount,
      lockPeriod,
      linkedAccount,
      companyRegistrationDoc,
    } = accountData;

    if (!["current", "business", "fixed_deposit"].includes(accountType)) {
      const err = new Error("Account type requires banker approval");
      err.statusCode = 400;
      throw err;
    }

    const customer = await User.findOne({ _id: userId, role: "customer" });
    if (!customer) {
      const err = new Error("Customer not found");
      err.statusCode = 404;
      throw err;
    }

    const minBalance = MIN_OPENING_BALANCE[accountType];
    if (!amount || amount < minBalance) {
      const readableAccountType = getReadableAccountType(accountType);
      const err = new Error(
        `Minimum initial deposit for ${readableAccountType} is RM${minBalance}`,
      );
      err.statusCode = 400;
      throw err;
    }

    if (accountType === "fixed_deposit") {
      if (!lockPeriod || ![1, 3, 6, 12].includes(lockPeriod)) {
        const err = new Error(
          "Valid lock period (1, 3, 6, or 12 months) is required for Fixed Deposit",
        );
        err.statusCode = 400;
        throw err;
      }
      if (!linkedAccount) {
        const err = new Error(
          "Linked account number is required for Fixed Deposit",
        );
        err.statusCode = 400;
        throw err;
      }

      const linkedAccountDoc = await Account.findOne({
        accountNumber: linkedAccount,
        user: userId,
      });
      if (!linkedAccountDoc) {
        const err = new Error("Linked account not found or access denied");
        err.statusCode = 404;
        throw err;
      }
      if (linkedAccountDoc.status !== ACCOUNT_STATUS.ACTIVE) {
        const err = new Error("Linked account is not active");
        err.statusCode = 400;
        throw err;
      }
      if (linkedAccountDoc.accountType === "fixed_deposit") {
        const err = new Error(
          "Cannot link a Fixed Deposit account to another Fixed Deposit",
        );
        err.statusCode = 400;
        throw err;
      }
    }

    if (accountType === "business" && !companyRegistrationDoc) {
      const err = new Error(
        "Company registration document is required for Business account",
      );
      err.statusCode = 400;
      throw err;
    }

    const accountNumber = await generateAccountNumber(accountType, branch);
    const newAccount = new Account({
      user: userId,
      accountNumber,
      accountType,
      branch,
      status: ACCOUNT_STATUS.PENDING_APPROVAL,
      balance: 0,
      currency: "MYR",
      principal: accountType === "fixed_deposit" ? amount : undefined,
      lockPeriod: accountType === "fixed_deposit" ? lockPeriod : undefined,
      linkedAccount:
        accountType === "fixed_deposit"
          ? (await Account.findOne({ accountNumber: linkedAccount }))._id
          : undefined,
      companyRegistrationDoc:
        accountType === "business" ? companyRegistrationDoc : undefined,
      dateOpened: new Date(),
    });

    return await newAccount.save();
  }

  async getPendingAccountRequests(query) {
    const { page = 1, limit = 20, sort = "desc" } = query;

    const numericPage = Math.max(parseInt(page, 10), 1);
    const numericLimit = Math.max(parseInt(limit, 10), 1);
    const skip = (numericPage - 1) * numericLimit;

    const [total, accounts] = await Promise.all([
      Account.countDocuments({ status: ACCOUNT_STATUS.PENDING_APPROVAL }),
      Account.find({ status: ACCOUNT_STATUS.PENDING_APPROVAL })
        .populate("user", "name email phoneNumber role")
        .sort({ dateOpened: sort === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(numericLimit),
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

  async approveAccountRequest(accountId, bankerId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const account = await Account.findById(accountId).session(session);
      if (!account) {
        const err = new Error("Account request not found");
        err.statusCode = 404;
        throw err;
      }

      if (account.status !== ACCOUNT_STATUS.PENDING_APPROVAL) {
        const err = new Error("Account is not in pending approval state");
        err.statusCode = 400;
        throw err;
      }

      if (account.accountType === "fixed_deposit") {
        account.maturityDate = new Date();
        account.maturityDate.setMonth(
          account.maturityDate.getMonth() + account.lockPeriod,
        );
        account.interestRate = FD_INTEREST_RATES[account.lockPeriod];

        const linkedAccount = await Account.findById(
          account.linkedAccount,
        ).session(session);
        if (!linkedAccount) {
          const err = new Error("Linked account not found");
          err.statusCode = 404;
          throw err;
        }
        if (linkedAccount.balance < account.principal) {
          const err = new Error("Insufficient funds in linked account");
          err.statusCode = 400;
          throw err;
        }

        linkedAccount.balance -= account.principal;
        account.balance = account.principal;

        await linkedAccount.save({ session });
      }

      account.status = ACCOUNT_STATUS.ACTIVE;
      account.dateOpened = new Date();

      await account.save({ session });
      await ActivityLog.create({
        action: "APPROVE_ACCOUNT_REQUEST",
        actor: bankerId,
        target: accountId,
        targetType: "Account",
        details: {
          accountType: account.accountType,
          accountNumber: account.accountNumber,
        },
      });

      await session.commitTransaction();

      try {
        await sendNotification({
          type: "account_opened",
          title: "Account Approved",
          message: `Your ${getReadableAccountType(account.accountType)} ${account.accountNumber} has been approved!`,
          link: `/accounts/${account.accountNumber}`,
          recipient: { role: "customer", userId: account.user.toString() },
          source: { service: "my-bank-api", id: accountId.toString() },
          data: {
            accountType: account.accountType,
            accountNumber: account.accountNumber,
          },
          read: false,
          delivered: false,
        });
      } catch (notifyErr) {
        console.error(
          "Failed to send account approval notification:",
          notifyErr.message,
        );
      }

      return account;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  async rejectAccountRequest(accountId, bankerId, reason) {
    const account = await Account.findById(accountId);
    if (!account) {
      const err = new Error("Account request not found");
      err.statusCode = 404;
      throw err;
    }

    if (account.status !== ACCOUNT_STATUS.PENDING_APPROVAL) {
      const err = new Error("Account is not in pending approval state");
      err.statusCode = 400;
      throw err;
    }

    account.status = ACCOUNT_STATUS.CLOSED;
    await account.save();

    await ActivityLog.create({
      action: "REJECT_ACCOUNT_REQUEST",
      actor: bankerId,
      target: accountId,
      targetType: "Account",
      details: {
        accountType: account.accountType,
        accountNumber: account.accountNumber,
        reason,
      },
    });

    try {
      await sendNotification({
        type: "account_rejected",
        title: "Account Request Rejected",
        message: `Your ${getReadableAccountType(account.accountType)} request has been rejected. Reason: ${reason}`,
        link: "/accounts",
        recipient: { role: "customer", userId: account.user.toString() },
        source: { service: "my-bank-api", id: accountId.toString() },
        data: {
          accountType: account.accountType,
          reason,
        },
        read: false,
        delivered: false,
      });
    } catch (notifyErr) {
      console.error(
        "Failed to send account rejection notification:",
        notifyErr.message,
      );
    }

    return account;
  }

  async setOverdraftLimit(accountNumber, overdraftLimit) {
    const account = await Account.findOne({ accountNumber });
    if (!account) {
      const err = new Error("Account not found");
      err.statusCode = 404;
      throw err;
    }

    if (
      account.accountType === "savings" ||
      account.accountType === "fixed_deposit"
    ) {
      const err = new Error("Overdraft is not available for this account type");
      err.statusCode = 400;
      throw err;
    }

    account.overdraftLimit = overdraftLimit;
    await account.save();
    return {
      accountNumber: account.accountNumber,
      overdraftLimit: account.overdraftLimit,
    };
  }

  async fdSettle(accountNumber, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const fd = await Account.findOne({ accountNumber, user: userId }).session(
        session,
      );
      if (!fd) {
        const err = new Error("Account not found");
        err.statusCode = 404;
        throw err;
      }

      if (fd.accountType !== "fixed_deposit") {
        const err = new Error("Only Fixed Deposit accounts can be settled");
        err.statusCode = 400;
        throw err;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const maturityDate = new Date(fd.maturityDate);
      maturityDate.setHours(0, 0, 0, 0);

      const diffTime = today.getTime() - maturityDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        const err = new Error("FD has not matured yet");
        err.statusCode = 400;
        throw err;
      }

      if (diffDays > 7) {
        const err = new Error("Grace period for manual settlement has expired");
        err.statusCode = 400;
        throw err;
      }

      const linkedAccount = await Account.findById(fd.linkedAccount).session(
        session,
      );
      if (!linkedAccount) {
        const err = new Error("Linked account not found");
        err.statusCode = 404;
        throw err;
      }

      const balanceBefore = linkedAccount.balance;
      linkedAccount.balance += fd.principal;
      await linkedAccount.save({ session });

      const reference = await getNextReference();
      await Transaction.create(
        [
          {
            account: linkedAccount._id,
            amount: fd.principal,
            type: "credit",
            direction: "credit",
            description: `Manual FD Principal Settlement: ${fd.accountNumber}`,
            reference,
            currency: "MYR",
            status: "completed",
            balanceBefore,
            balanceAfter: linkedAccount.balance,
          },
        ],
        { session },
      );

      fd.status = ACCOUNT_STATUS.CLOSED;
      fd.balance = 0;
      await fd.save({ session });

      await ActivityLog.create(
        [
          {
            action: "FD_PRINCIPAL_SETTLEMENT",
            actor: userId,
            target: fd._id,
            targetType: "Account",
            details: {
              accountNumber: fd.accountNumber,
              amount: fd.principal,
            },
          },
        ],
        { session },
      );

      await session.commitTransaction();

      try {
        await sendNotification({
          type: "fd_settled",
          title: "FD Principal Withdrawn",
          message: `Your manual withdrawal of RM${fd.principal.toFixed(2)} from FD ${fd.accountNumber} has been processed.`,
          link: `/accounts/${fd.accountNumber}`,
          recipient: { role: "customer", userId: userId.toString() },
          source: { service: "my-bank-api", id: fd._id.toString() },
          data: {
            amount: fd.principal,
            accountNumber: fd.accountNumber,
          },
        });
      } catch (notifyErr) {
        console.error(
          "Failed to send FD settlement notification:",
          notifyErr.message,
        );
      }

      return fd;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  async updateFdInstructions(accountNumber, userId, instructions) {
    const { autoRenew, linkedAccount } = instructions;
    const fd = await Account.findOne({ accountNumber, user: userId });

    if (!fd || fd.accountType !== "fixed_deposit") {
      const err = new Error("Fixed Deposit account not found");
      err.statusCode = 404;
      throw err;
    }

    if (autoRenew !== undefined) fd.autoRenew = autoRenew;

    if (linkedAccount) {
      const linkedAccDoc = await Account.findOne({
        accountNumber: linkedAccount,
        user: userId,
      });
      if (!linkedAccDoc) {
        const err = new Error("Invalid linked account");
        err.statusCode = 400;
        throw err;
      }
      if (linkedAccDoc.accountType === "fixed_deposit") {
        const err = new Error(
          "Cannot link a Fixed Deposit account to another Fixed Deposit",
        );
        err.statusCode = 400;
        throw err;
      }
      fd.linkedAccount = linkedAccDoc._id;
    }

    await fd.save();

    await ActivityLog.create({
      action: "UPDATE_FD_INSTRUCTIONS",
      actor: userId,
      target: fd._id,
      targetType: "Account",
      details: instructions,
    });

    return fd;
  }

  async fdWithdrawEarly(accountNumber, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const fd = await Account.findOne({ accountNumber, user: userId }).session(
        session,
      );
      if (!fd) {
        const err = new Error("Account not found");
        err.statusCode = 404;
        throw err;
      }

      if (fd.accountType !== "fixed_deposit") {
        const err = new Error(
          "Only Fixed Deposit accounts can be withdrawn early",
        );
        err.statusCode = 400;
        throw err;
      }

      const today = new Date();
      const maturityDate = new Date(fd.maturityDate);

      if (today >= maturityDate) {
        const err = new Error(
          "Account has matured. Please use the standard settlement flow.",
        );
        err.statusCode = 400;
        throw err;
      }

      const linkedAccount = await Account.findById(fd.linkedAccount).session(
        session,
      );
      if (!linkedAccount) {
        const err = new Error("Linked account not found for principal return");
        err.statusCode = 404;
        throw err;
      }

      const balanceBefore = linkedAccount.balance;
      linkedAccount.balance += fd.principal;
      await linkedAccount.save({ session });

      const reference = await getNextReference();
      await Transaction.create(
        [
          {
            account: linkedAccount._id,
            amount: fd.principal,
            type: "credit",
            direction: "credit",
            description: `Early FD Principal Withdrawal (Interest Forfeited): ${fd.accountNumber}`,
            reference,
            currency: "MYR",
            status: "completed",
            balanceBefore,
            balanceAfter: linkedAccount.balance,
          },
        ],
        { session },
      );

      fd.status = ACCOUNT_STATUS.CLOSED;
      fd.balance = 0;
      await fd.save({ session });

      await ActivityLog.create(
        [
          {
            action: "FD_EARLY_WITHDRAWAL",
            actor: userId,
            target: fd._id,
            targetType: "Account",
            details: {
              accountNumber: fd.accountNumber,
              principal: fd.principal,
              penalty: "100% Interest Forfeited",
            },
          },
        ],
        { session },
      );

      await session.commitTransaction();

      try {
        await sendNotification({
          type: "fd_settled",
          title: "Early FD Withdrawal Processed",
          message: `Your emergency early withdrawal of RM${fd.principal.toFixed(2)} from FD ${fd.accountNumber} has been processed. Accrued interest was forfeited.`,
          link: `/accounts/${fd.accountNumber}`,
          recipient: { role: "customer", userId: userId.toString() },
          source: { service: "my-bank-api", id: fd._id.toString() },
          data: {
            amount: fd.principal,
            accountNumber: fd.accountNumber,
            type: "early_withdrawal",
          },
        });
      } catch (notifyErr) {
        console.error(
          "Failed to send early FD withdrawal notification:",
          notifyErr.message,
        );
      }

      return fd;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  getAccountLimits() {
    return ACCOUNT_LIMITS;
  }

  async identifyDormantAccounts() {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);

    const elevenMonthsAgo = new Date();
    elevenMonthsAgo.setMonth(elevenMonthsAgo.getMonth() - 11);

    const activeAccounts = await Account.find({
      status: ACCOUNT_STATUS.ACTIVE,
      accountType: { $ne: "fixed_deposit" },
    });

    const results = { dormant: 0, warned: 0 };

    for (const account of activeAccounts) {
      const latestTxn = await Transaction.findOne({
        account: account._id,
        performedBy: { $ne: null },
      }).sort({ date: -1 });

      const lastActivityDate = latestTxn ? latestTxn.date : account.dateOpened;

      // Check for 12-month dormancy
      if (lastActivityDate < twelveMonthsAgo) {
        account.status = ACCOUNT_STATUS.DORMANT;
        account.statusUpdatedDate = new Date();
        await account.save();

        await ActivityLog.create({
          action: "ACCOUNT_DORMANT",
          relatedEntity: account._id,
          relatedEntityModel: "Account",
          details: {
            accountNumber: account.accountNumber,
            lastActivityDate,
          },
        });

        try {
          await sendNotification({
            type: "account_dormant",
            title: "Account Dormant",
            message: `Your account ${account.accountNumber} has been marked as dormant due to 12 months of inactivity. Self-service transactions are disabled.`,
            link: `/accounts/${account.accountNumber}`,
            recipient: { role: "customer", userId: account.user.toString() },
            source: { service: "my-bank-api", id: account._id.toString() },
            data: { accountNumber: account.accountNumber },
          });
        } catch (notifyErr) {
          console.error("Failed to send dormancy notice:", notifyErr.message);
        }

        results.dormant++;
      }
      // Check for 11-month warning
      else if (lastActivityDate < elevenMonthsAgo) {
        // Prevent daily notification spam by checking for recent warnings
        const recentWarning = await ActivityLog.findOne({
          action: "DORMANCY_WARNING",
          relatedEntity: account._id,
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        });

        if (!recentWarning) {
          await ActivityLog.create({
            action: "DORMANCY_WARNING",
            relatedEntity: account._id,
            relatedEntityModel: "Account",
            details: {
              accountNumber: account.accountNumber,
              lastActivityDate,
            },
          });

          try {
            await sendNotification({
              type: "account_dormant_warning",
              title: "Dormancy Warning",
              message: `Your account ${account.accountNumber} has had no activity for 11 months. It will be marked as dormant in 30 days unless a transaction is performed.`,
              link: `/accounts/${account.accountNumber}`,
              recipient: { role: "customer", userId: account.user.toString() },
              source: { service: "my-bank-api", id: account._id.toString() },
              data: { accountNumber: account.accountNumber },
            });
          } catch (notifyErr) {
            console.error(
              "Failed to send dormancy warning:",
              notifyErr.message,
            );
          }

          results.warned++;
        }
      }
    }

    return results;
  }

  async processDormancyFees() {
    const today = new Date();
    const dormantAccounts = await Account.find({
      status: ACCOUNT_STATUS.DORMANT,
    });

    const results = { charged: 0, warningsLogged: 0, errors: 0 };

    for (const account of dormantAccounts) {
      try {
        // Skip accounts that already have zero or negative balance
        if (account.balance <= 0) continue;

        const baselineDate = account.statusUpdatedDate || account.dateOpened;
        if (!baselineDate) continue;

        if (isDormancyAnniversary(baselineDate, today)) {
          const session = await mongoose.startSession();
          session.startTransaction();

          try {
            const freshAccount = await Account.findById(account._id).session(
              session,
            );

            if (freshAccount.status !== ACCOUNT_STATUS.DORMANT) {
              await session.abortTransaction();
              session.endSession();
              continue;
            }

            if (freshAccount.balance <= 0) {
              await session.abortTransaction();
              session.endSession();
              continue;
            }

            const actualFee = Math.min(freshAccount.balance, DORMANCY_FEE);
            const balanceBefore = freshAccount.balance;

            freshAccount.balance =
              Math.round((freshAccount.balance - actualFee) * 100) / 100;
            await freshAccount.save({ session });

            const reference = await getNextReference();
            const completedAt = new Date();

            const transaction = new Transaction({
              account: freshAccount._id,
              amount: actualFee,
              type: "fee",
              direction: "debit",
              description: "Dormancy Maintenance Fee",
              memo: "Annual Dormancy Maintenance Fee",
              reference,
              fee: 0,
              balanceBefore,
              balanceAfter: freshAccount.balance,
              currency: freshAccount.currency || "MYR",
              channel: "system",
              processingTime: { submittedAt: today, completedAt },
              status: "completed",
              performedBy: null,
              counterpartName: "MyBank",
              counterpartNameRaw: "MyBank",
            });

            await transaction.save({ session });

            await ActivityLog.create(
              [
                {
                  action: "DORMANCY_FEE_CHARGE",
                  user: freshAccount.user,
                  details: {
                    accountNumber: freshAccount.accountNumber,
                    feeCharged: actualFee,
                    balanceBefore,
                    balanceAfter: freshAccount.balance,
                  },
                  relatedEntity: freshAccount._id,
                  relatedEntityModel: "Account",
                  severity: "MEDIUM",
                },
              ],
              { session },
            );

            if (freshAccount.balance === 0) {
              await ActivityLog.create(
                [
                  {
                    action: "DORMANCY_FEE_WARNING",
                    user: freshAccount.user,
                    details: {
                      accountNumber: freshAccount.accountNumber,
                      message:
                        "Account balance is zero after dormancy maintenance fee deduction. Review required.",
                      feeCharged: actualFee,
                    },
                    relatedEntity: freshAccount._id,
                    relatedEntityModel: "Account",
                    severity: "HIGH",
                  },
                ],
                { session },
              );
              results.warningsLogged++;
            }

            await session.commitTransaction();
            results.charged++;
          } catch (txnErr) {
            await session.abortTransaction();
            throw txnErr;
          } finally {
            session.endSession();
          }
        }
      } catch (err) {
        console.error(
          `Failed to process dormancy fee for account ${account.accountNumber}:`,
          err.message,
        );
        results.errors++;
      }
    }

    return results;
  }

  async requestClosure(accountNumber, userId) {
    const account = await Account.findOne({ accountNumber });
    if (!account) {
      const err = new Error("Account not found");
      err.statusCode = 404;
      throw err;
    }

    if (account.user.toString() !== userId) {
      const err = new Error(
        "You can only request closure on your own accounts",
      );
      err.statusCode = 403;
      throw err;
    }

    if (account.status === ACCOUNT_STATUS.CLOSED) {
      const err = new Error("Account is already closed");
      err.statusCode = 400;
      throw err;
    }

    if (account.status === ACCOUNT_STATUS.PENDING_CLOSURE) {
      const err = new Error("Account already has a pending closure request");
      err.statusCode = 400;
      throw err;
    }

    account.status = ACCOUNT_STATUS.PENDING_CLOSURE;
    await account.save();

    await ActivityLog.create({
      action: "ACCOUNT_CLOSE_REQUESTED",
      actor: userId,
      target: account._id,
      targetType: "Account",
      details: {
        accountNumber: account.accountNumber,
        accountType: account.accountType,
      },
    });

    try {
      await sendNotification({
        type: "account_closure_requested",
        title: "Closure Request Submitted",
        message: `Your closure request for account ${account.accountNumber} has been submitted and is pending banker approval.`,
        link: `/accounts/${account.accountNumber}`,
        recipient: { role: "customer", userId: account.user.toString() },
        source: { service: "my-bank-api", id: account._id.toString() },
        data: { accountNumber: account.accountNumber },
        read: false,
        delivered: false,
      });
    } catch (notifyErr) {
      console.error(
        "Failed to send closure request notification:",
        notifyErr.message,
      );
    }

    return account;
  }

  async approveClosure(accountNumber, bankerId) {
    const account = await Account.findOne({ accountNumber });
    if (!account) {
      const err = new Error("Account not found");
      err.statusCode = 404;
      throw err;
    }

    if (account.status !== ACCOUNT_STATUS.PENDING_CLOSURE) {
      const err = new Error("Account does not have a pending closure request");
      err.statusCode = 400;
      throw err;
    }

    if (account.balance > 0) {
      const err = new Error("Account balance must be zero before closure");
      err.statusCode = 400;
      throw err;
    }

    account.status = ACCOUNT_STATUS.CLOSED;
    account.dateClosed = new Date();
    await account.save();

    await ActivityLog.create({
      action: "ACCOUNT_CLOSED",
      actor: bankerId,
      target: account._id,
      targetType: "Account",
      details: {
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        closedBy: bankerId,
      },
    });

    try {
      await sendNotification({
        type: "account_closed",
        title: "Account Closed",
        message: `Your account ${account.accountNumber} has been officially closed.`,
        link: `/accounts/${account.accountNumber}`,
        recipient: { role: "customer", userId: account.user.toString() },
        source: { service: "my-bank-api", id: account._id.toString() },
        data: { accountNumber: account.accountNumber },
        read: false,
        delivered: false,
      });
    } catch (notifyErr) {
      console.error("Failed to send closure notification:", notifyErr.message);
    }

    return account;
  }

  async suspendAccount(accountNumber) {
    const account = await Account.findOne({ accountNumber });
    if (!account) {
      const err = new Error("Account not found");
      err.statusCode = 404;
      throw err;
    }

    if (account.status === ACCOUNT_STATUS.SUSPENDED) {
      const err = new Error("Account is already suspended");
      err.statusCode = 400;
      throw err;
    }

    account.status = ACCOUNT_STATUS.SUSPENDED;
    await account.save();

    return account;
  }

  async reactivateAccount(accountNumber) {
    const account = await Account.findOne({ accountNumber });
    if (!account) {
      const err = new Error("Account not found");
      err.statusCode = 404;
      throw err;
    }

    if (account.status === ACCOUNT_STATUS.ACTIVE) {
      const err = new Error("Account is already active");
      err.statusCode = 400;
      throw err;
    }

    account.status = ACCOUNT_STATUS.ACTIVE;
    await account.save();

    return account;
  }
}

module.exports = new AccountService();
