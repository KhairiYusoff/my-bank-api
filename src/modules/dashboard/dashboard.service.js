const User = require("../../shared/models/User");
const Account = require("../../shared/models/Account");
const Transaction = require("../../shared/models/Transaction");
const { ACCOUNT_STATUS } = require("../../shared/constants/accounts");
const {
  USER_ROLES,
  STAFF_ROLES,
} = require("../../shared/constants/user");

class DashboardService {
  async getDashboardSummary(userRole) {
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
      User.countDocuments({ role: USER_ROLES.CUSTOMER }),

      // account count
      Account.countDocuments(),

      // staff count
      User.countDocuments({ role: { $in: STAFF_ROLES } }),

      // transactions today
      Transaction.countDocuments({ createdAt: { $gte: todayStart } }),

      // pending applications
      User.countDocuments({ role: USER_ROLES.CUSTOMER, isVerified: false }),

      // failed transactions today
      Transaction.countDocuments({
        status: "failed",
        createdAt: { $gte: todayStart },
      }),

      // dormant accounts
      Account.countDocuments({ status: ACCOUNT_STATUS.DORMANT }),

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
        { $match: { status: ACCOUNT_STATUS.ACTIVE } },
        { $group: { _id: null, total: { $sum: "$balance" } } },
      ]),
    ]);

    const summary = {
      counts: {
        customers: customerCount,
        accounts: accountCount,
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

    if ([USER_ROLES.ADMIN, USER_ROLES.AUDITOR].includes(userRole)) {
      summary.counts.staff = staffCount;
    }

    return summary;
  }
}

module.exports = new DashboardService();
