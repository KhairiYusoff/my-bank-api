/**
 * AI Guardrails — PII Masking
 *
 * All user/account data MUST be passed through these helpers
 * before being injected into any LLM prompt.
 *
 * PII fields masked:
 *   name           → [USER]
 *   accountNumber  → stripped (not sent)
 *   email          → [EMAIL]
 *   phoneNumber    → [PHONE]
 *   identityNumber → [IC]
 */

/**
 * Return a safe user context object for LLM injection.
 * Strips all PII — only role is kept for personalisation tone.
 *
 * @param {object} user - Mongoose User document
 * @returns {{ displayName: string, role: string }}
 */
const maskUserForLLM = (user) => ({
  displayName: '[USER]',
  role: user.role || 'customer',
});

/**
 * Return spending data safe for LLM injection.
 * Removes account numbers; keeps aggregate figures only.
 *
 * @param {object} spendData - Output from getSpendingBreakdown()
 * @returns {object}
 */
const maskSpendingDataForLLM = (spendData) => {
  if (!spendData) return null;

  return {
    period: spendData.period,
    since: spendData.since,
    totalSpent: spendData.totalSpent,
    topCategories: spendData.topCategories,
    // Accounts: strip all identifying info — only type + balance
    accounts: (spendData.accounts || []).map((a) => ({
      accountType: a.accountType,
      balance: a.balance,
      currency: a.currency,
    })),
  };
};

module.exports = { maskUserForLLM, maskSpendingDataForLLM };
