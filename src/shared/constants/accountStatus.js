/** Account lifecycle statuses — must match Account model enum and business-rules.md §5.1 */
const ACCOUNT_STATUS = {
  PENDING_APPROVAL: "pending_approval",
  ACTIVE: "active",
  DORMANT: "dormant",
  SUSPENDED: "suspended",
  PENDING_CLOSURE: "pending_closure",
  CLOSED: "closed",
};

const ACCOUNT_STATUS_VALUES = Object.values(ACCOUNT_STATUS);

/** Statuses bankers may set via PATCH /accounts/:accountNumber/status */
const BANKER_MUTABLE_STATUSES = [
  ACCOUNT_STATUS.ACTIVE,
  ACCOUNT_STATUS.DORMANT,
  ACCOUNT_STATUS.SUSPENDED,
  ACCOUNT_STATUS.CLOSED,
];

module.exports = {
  ACCOUNT_STATUS,
  ACCOUNT_STATUS_VALUES,
  BANKER_MUTABLE_STATUSES,
};
