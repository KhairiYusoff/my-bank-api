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
    ] = await Promise.all([
      // customer count
      User.countDocuments({ role: "customer" }),

      // account count
      Account.countDocuments(),

      // staff count
      User.countDocuments({ role: { $in: ["banker", "admin"] } }),

      // transactions today
      Transaction.countDocuments({ createdAt: { $gte: todayStart } }),

      // pending applications
      User.countDocuments({ role: "customer", isVerified: false }),

      // failed transactions today
      Transaction.countDocuments({
        status: "failed",
        createdAt: { $gte: todayStart },
      }),

      // dormant accounts
      Account.countDocuments({ status: "Dormant" }),

      // deposits today
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

      // withdrawals today
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

      // total portfolio balance
      Account.aggregate([
        { $match: { status: "Active" } },
        { $group: { _id: null, total: { $sum: "$balance" } } },
      ]),
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
    };
  }
}

module.exports = new DashboardService();
