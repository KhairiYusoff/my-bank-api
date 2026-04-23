/**
 * AI Data Tools — Spend Insights Queries
 *
 * Fetches aggregated spending data from MongoDB for LLM context injection.
 * Returns AGGREGATE figures only — no raw transaction records, no PII.
 * Pass output through maskSpendingDataForLLM() before sending to the LLM.
 */

const Expense = require('../../shared/models/Expense');
const Account = require('../../shared/models/Account');

const PERIOD_DAYS = {
  week: 7,
  month: 30,
  quarter: 90,
  year: 365,
};

/**
 * Aggregate a user's spending by category for a given time period,
 * plus their current account balances.
 *
 * @param {import('mongoose').Types.ObjectId} userId
 * @param {'week'|'month'|'quarter'|'year'} period
 * @returns {Promise<{
 *   period: string,
 *   since: string,
 *   totalSpent: number,
 *   topCategories: Array<{ category: string, total: number, count: number, pct: number }>,
 *   accounts: Array<{ accountType: string, balance: number, currency: string }>
 * }>}
 */
const getSpendingBreakdown = async (userId, period = 'month') => {
  const days = PERIOD_DAYS[period] || PERIOD_DAYS.month;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [breakdown, accounts] = await Promise.all([
    Expense.aggregate([
      {
        $match: {
          user: userId,
          status: 'active',
          date: { $gte: since },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]),
    Account.find(
      { user: userId, status: 'Active' },
      'accountType balance currency'
    ).lean(),
  ]);

  const totalSpent = breakdown.reduce((sum, c) => sum + c.total, 0);

  return {
    period,
    since: since.toISOString().split('T')[0],
    totalSpent: +totalSpent.toFixed(2),
    topCategories: breakdown.slice(0, 5).map((c) => ({
      category: c._id,
      total: +c.total.toFixed(2),
      count: c.count,
      pct: totalSpent > 0 ? +(c.total / totalSpent * 100).toFixed(1) : 0,
    })),
    accounts: accounts.map((a) => ({
      accountType: a.accountType,
      balance: +a.balance.toFixed(2),
      currency: a.currency,
    })),
  };
};

module.exports = { getSpendingBreakdown };
