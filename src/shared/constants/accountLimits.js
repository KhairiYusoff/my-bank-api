const ACCOUNT_LIMITS = {
  savings: {
    dailyTransferLimit: 10000,
    maxSingleTransfer: 5000,
    overdraftEligible: false,
    minWithdrawal: 10,
    transfersAllowed: true,
  },
  current: {
    dailyTransferLimit: 20000,
    maxSingleTransfer: 10000,
    overdraftEligible: true,
    minWithdrawal: 10,
    transfersAllowed: true,
  },
  business: {
    dailyTransferLimit: 50000,
    maxSingleTransfer: 20000,
    overdraftEligible: true,
    minWithdrawal: 10,
    transfersAllowed: true,
  },
  fixed_deposit: {
    dailyTransferLimit: null,
    maxSingleTransfer: null,
    overdraftEligible: false,
    minWithdrawal: null,
    transfersAllowed: false,
  },
};

module.exports = { ACCOUNT_LIMITS };
