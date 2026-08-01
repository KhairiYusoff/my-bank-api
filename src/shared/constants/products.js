
const MAINTENANCE_FEE_RULES = {
  savings: { fee: 5, threshold: 1000 },
  current: { fee: 8, threshold: 2000 },
  business: { fee: 15, threshold: 5000 },
};

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
  SAVINGS_INTEREST_TIERS,
  getSavingsAnnualRate,
};