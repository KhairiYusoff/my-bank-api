const ACCOUNT_STATUS = {
  PENDING_APPROVAL: "pending_approval",
  ACTIVE: "active",
  DORMANT: "dormant",
  SUSPENDED: "suspended",
  PENDING_CLOSURE: "pending_closure",
  CLOSED: "closed",
};

const ACCOUNT_STATUS_VALUES = Object.values(ACCOUNT_STATUS);

const BANKER_MUTABLE_STATUSES = [
  ACCOUNT_STATUS.ACTIVE,
  ACCOUNT_STATUS.DORMANT,
  ACCOUNT_STATUS.SUSPENDED,
  ACCOUNT_STATUS.CLOSED,
];

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

const MIN_OPENING_BALANCE = {
  savings: 20,
  current: 20,
  business: 500,
  fixed_deposit: 1000,
};

const ACCOUNT_TYPE_NAMES = {
  savings: "Savings Account",
  current: "Current Account",
  business: "Business Account",
  fixed_deposit: "Fixed Deposit Account",
};

const DORMANCY_FEE = 10;

module.exports = {
  ACCOUNT_STATUS,
  ACCOUNT_STATUS_VALUES,
  BANKER_MUTABLE_STATUSES,
  ACCOUNT_LIMITS,
  MIN_OPENING_BALANCE,
  ACCOUNT_TYPE_NAMES,
  DORMANCY_FEE,
};