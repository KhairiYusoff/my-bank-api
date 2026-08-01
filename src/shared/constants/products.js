
const MAINTENANCE_FEE_RULES = {
  savings: { fee: 5, threshold: 1000 },
  current: { fee: 8, threshold: 2000 },
  business: { fee: 15, threshold: 5000 },
};

const FD_INTEREST_RATES = {
  1: 2.5,   // 1 month  — 2.5% p.a.
  3: 2.8,   // 3 months — 2.8% p.a.
  6: 3.1,   // 6 months — 3.1% p.a.
  12: 3.5,  // 12 months — 3.5% p.a.
};

function getFDRateDecimal(lockPeriod) {
  const pct = FD_INTEREST_RATES[lockPeriod];
  return typeof pct === "number" ? pct / 100 : 0;
}

const SAVINGS_INTEREST_TIERS = [
  { maxBalance: 9999.99, annualRate: 0.5 },
  { maxBalance: 49999.99, annualRate: 1.0 },
  { maxBalance: Infinity, annualRate: 1.5 },
];

function getSavingsAnnualRate(balance) {
  return SAVINGS_INTEREST_TIERS.find((tier) => balance <= tier.maxBalance).annualRate;
}

module.exports = {
  MAINTENANCE_FEE_RULES,
  FD_INTEREST_RATES,
  getFDRateDecimal,
  SAVINGS_INTEREST_TIERS,
  getSavingsAnnualRate,
};