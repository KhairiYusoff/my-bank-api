const Expense = require("../../shared/models/Expense");
const Account = require("../../shared/models/Account");
const Transaction = require("../../shared/models/Transaction");
const ActivityLog = require("../../shared/models/ActivityLog");
const User = require("../../shared/models/User");
const AiAuditLog = require("../../shared/models/AiAuditLog");

const PERIOD_DAYS = {
  week: 7,
  month: 30,
  quarter: 90,
  year: 365,
};

const logToolCall = (userId, tool, params) => {
  AiAuditLog.create({
    userId,
    tool,
    inputSummary: JSON.stringify(params).slice(0, 500),
    timestamp: new Date(),
  }).catch(() => {});
};

const getSpendingBreakdown = async (userId, period = "month") => {
  const days = PERIOD_DAYS[period] || PERIOD_DAYS.month;
  const since = new Date();
  since.setDate(since.getDate() - days);

  logToolCall(userId, "getSpendingBreakdown", { period });

  const [breakdown, accounts] = await Promise.all([
    Expense.aggregate([
      {
        $match: {
          user: userId,
          status: "active",
          date: { $gte: since },
        },
      },
      { $sort: { amount: -1 } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
          topExpenseDescription: { $first: "$description" },
        },
      },
      { $sort: { total: -1 } },
    ]),
    Account.find(
      { user: userId, status: "Active" },
      "accountType balance currency",
    ).lean(),
  ]);

  const totalSpent = breakdown.reduce((sum, c) => sum + c.total, 0);

  return {
    period,
    since: since.toISOString().split("T")[0],
    totalSpent: +totalSpent.toFixed(2),
    topCategories: breakdown.slice(0, 5).map((c) => ({
      category: c._id,
      total: +c.total.toFixed(2),
      count: c.count,
      pct: totalSpent > 0 ? +((c.total / totalSpent) * 100).toFixed(1) : 0,
      topExpenseDescription: c.topExpenseDescription || null,
    })),
    accounts: accounts.map((a) => ({
      accountType: a.accountType,
      balance: +a.balance.toFixed(2),
      currency: a.currency,
    })),
  };
};

const getTransactionHistory = async (userId, filters = {}) => {
  const { type, from, to, limit = 10 } = filters;
  const safeLimit = Math.min(Number(limit) || 10, 50);

  logToolCall(userId, "getTransactionHistory", {
    type,
    from,
    to,
    limit: safeLimit,
  });

  const accountIds = await Account.find({ user: userId }, "_id")
    .lean()
    .then((a) => a.map((x) => x._id));

  const query = { account: { $in: accountIds } };
  if (type) query.type = type;
  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = new Date(from);
    if (to) query.date.$lte = new Date(to);
  }

  const transactions = await Transaction.find(
    query,
    "type amount description status date",
  )
    .sort({ date: -1 })
    .limit(safeLimit)
    .lean();

  return transactions.map((t) => ({
    type: t.type,
    amount: +t.amount.toFixed(2),
    description: t.description || null,
    status: t.status,
    date: t.date.toISOString().split("T")[0],
  }));
};

const getAccountSummary = async (userId) => {
  logToolCall(userId, "getAccountSummary", {});

  const accounts = await Account.find(
    { user: userId },
    "accountType balance currency status dateOpened",
  ).lean();

  return accounts.map((a) => ({
    accountType: a.accountType,
    balance: +a.balance.toFixed(2),
    currency: a.currency,
    status: a.status,
    dateOpened: a.dateOpened.toISOString().split("T")[0],
  }));
};

const getUserProfile = async (userId) => {
  logToolCall(userId, "getUserProfile", {});

  const user = await User.findById(
    userId,
    "status isVerified isProfileComplete nationality preferredLanguage address.city address.state job age",
  ).lean();

  if (!user) return null;

  return {
    status: user.status,
    isVerified: user.isVerified,
    isProfileComplete: user.isProfileComplete,
    nationality: user.nationality || null,
    preferredLanguage: user.preferredLanguage || null,
    city: user.address?.city || null,
    state: user.address?.state || null,
    job: user.job || null,
    age: user.age || null,
  };
};

const getActivitySummary = async (userId, filters = {}) => {
  const { action, from, to, limit = 10 } = filters;
  const safeLimit = Math.min(Number(limit) || 10, 20);

  logToolCall(userId, "getActivitySummary", {
    action,
    from,
    to,
    limit: safeLimit,
  });

  const query = { user: userId };
  if (action) query.action = action;
  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = new Date(from);
    if (to) query.date.$lte = new Date(to);
  }

  const logs = await ActivityLog.find(query, "action date")
    .sort({ date: -1 })
    .limit(safeLimit)
    .lean();

  return logs.map((l) => ({
    action: l.action,
    date: l.date.toISOString().split("T")[0],
  }));
};

module.exports = {
  getSpendingBreakdown,
  getTransactionHistory,
  getAccountSummary,
  getUserProfile,
  getActivitySummary,
};
