const TRANSACTION_TYPES = {
  DEPOSIT: "deposit",
  WITHDRAWAL: "withdrawal",
  AIRDROP: "airdrop",
  TRANSFER: "transfer",
  FEE: "fee",
  INTEREST: "interest",
};

const TRANSACTION_STATUSES = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
};

const CHANNELS = {
  WEB: "web",
  BRANCH: "branch",
  MOBILE: "mobile",
  API: "api",
  SYSTEM: "system",
};

const DIRECTIONS = {
  DEBIT: "debit", // — leaves the account
  CREDIT: "credit", // — enters the account
};

const ROLE_TO_CHANNEL = {
  banker: CHANNELS.BRANCH,
  admin: CHANNELS.SYSTEM,
  customer: CHANNELS.WEB,
};

const TRANSACTION_TYPE_VALUES = Object.values(TRANSACTION_TYPES);
const TRANSACTION_STATUS_VALUES = Object.values(TRANSACTION_STATUSES);
const CHANNEL_VALUES = Object.values(CHANNELS);
const DIRECTION_VALUES = Object.values(DIRECTIONS);

module.exports = {
  TRANSACTION_TYPES,
  TRANSACTION_TYPE_VALUES,
  TRANSACTION_STATUSES,
  TRANSACTION_STATUS_VALUES,
  CHANNELS,
  CHANNEL_VALUES,
  DIRECTIONS,
  DIRECTION_VALUES,
  ROLE_TO_CHANNEL,
};