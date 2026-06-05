const User = require("../../shared/models/User");
const Account = require("../../shared/models/Account");
const Transaction = require("../../shared/models/Transaction");

class DashboardService {
  async getDashboardSummary() {
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const [
      customerCount,
      accountCount,
      staffCount,
      transactionsToday,
      pendingApplicationCount,
      failedTransactionsToday,
      dormantAccountCount,
      depositsTodayResult,
      withdrawalsTodayResult,
      portfolioResult,
      recentPendingApplications,
      recentTransactions,
    ] = await Promise.all([
      // counts
      User.countDocuments({ role: "customer" }),
      Account.countDocuments(),
      User.countDocuments({ role: { $in: ["banker", "admin"] } }),
      Transaction.countDocuments({ createdAt: { $gte: todayStart } }),

      // attention
      User.countDocuments({ role: "customer", applicationStatus: "pending" }),
      Transaction.countDocuments({
        status: "failed",
        createdAt: { $gte: todayStart },
      }),
      Account.countDocuments({ status: "Dormant" }),

      // financials — aggregate sums
      Transaction.aggregate([
        {
          $match: {
            type: "deposit",
            status: "completed",
            createdAt: { $gte: todayStart },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            type: "withdrawal",
            status: "completed",
            createdAt: { $gte: todayStart },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Account.aggregate([
        { $match: { status: "Active" } },
        { $group: { _id: null, total: { $sum: "$balance" } } },
      ]),

      // tables
      User.find({ role: "customer", applicationStatus: "pending" })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("_id name email createdAt")
        .lean(),

      Transaction.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate({ path: "account", select: "accountNumber" })
        .select("_id type amount status date direction account")
        .lean(),
    ]);

    return {
      counts: {
        customers: customerCount,
        accounts: accountCount,
        staff: staffCount,
        transactionsToday,
      },
      attention: {
        pendingApplications: pendingApplicationCount,
        failedTransactionsToday,
        dormantAccounts: dormantAccountCount,
      },
      financials: {
        depositsToday: depositsTodayResult[0]?.total ?? 0,
        withdrawalsToday: withdrawalsTodayResult[0]?.total ?? 0,
        totalPortfolioBalance: portfolioResult[0]?.total ?? 0,
      },
      recentPendingApplications,
      recentTransactions,
    };
  }
}

module.exports = new DashboardService();
