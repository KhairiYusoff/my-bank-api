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

// Catches IC numbers (YYMMDDXXXXXX) and MY phone numbers (+60XXXXXXXXX / 01X-XXXXXXXX)
const PII_PATTERN = /\b\d{12}\b|\+?60\d{9,10}\b|0\d{1,2}-?\d{7,8}\b/g;

const maskUserForLLM = (user) => ({
  displayName: "[USER]",
  role: user.role || "customer",
});

const maskSpendingDataForLLM = (spendData) => {
  if (!spendData) return null;

  return {
    period: spendData.period,
    since: spendData.since,
    totalSpent: spendData.totalSpent,
    topCategories: spendData.topCategories.map((c) => ({
      ...c,
      topExpenseDescription: c.topExpenseDescription
        ? c.topExpenseDescription.replace(PII_PATTERN, "[REDACTED]")
        : null,
    })),
    accounts: (spendData.accounts || []).map((a) => ({
      accountType: a.accountType,
      balance: a.balance,
      currency: a.currency,
    })),
  };
};

const maskTransactionsForLLM = (transactions) => {
  if (!transactions) return [];

  return transactions.map((t) => ({
    type: t.type,
    amount: t.amount,
    description: t.description
      ? t.description.replace(PII_PATTERN, "[REDACTED]")
      : null,
    status: t.status,
    date: t.date,
  }));
};

const maskUserProfileForLLM = (profile) => {
  if (!profile) return null;

  return {
    status: profile.status,
    isVerified: profile.isVerified,
    isProfileComplete: profile.isProfileComplete,
    nationality: profile.nationality,
    preferredLanguage: profile.preferredLanguage,
    city: profile.city,
    state: profile.state,
    job: profile.job,
    age: profile.age,
  };
};

const maskActivityForLLM = (logs) => {
  if (!logs) return [];

  return logs.map((l) => ({
    action: l.action,
    date: l.date,
  }));
};

module.exports = {
  maskUserForLLM,
  maskSpendingDataForLLM,
  maskTransactionsForLLM,
  maskUserProfileForLLM,
  maskActivityForLLM,
};
