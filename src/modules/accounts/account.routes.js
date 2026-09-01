const express = require("express");
const {
  createAccount,
  getAccounts,
  getBalance,
  deleteAccount,
  getAllAccounts,
  deposit,
  withdraw,
  airdrop,
  getAccountByNumber,
  updateAccountStatus,
  setOverdraftLimit,
  getAccountLimits,
  requestAccount,
  getPendingAccountRequests,
  approveAccountRequest,
  rejectAccountRequest,
  suspendAccount,
  reactivateAccount,
} = require("./account.controller");
const {
  authMiddleware,
  authorizeRoles,
} = require("../../shared/middleware/auth.middleware");
const { requestClosure, approveClosure } = require("./account.controller");
const {
  validateAccountCreation,
  validateOverdraftLimit,
} = require("../../shared/middleware/account.middleware");
const { USER_ROLES } = require("../../shared/constants/user");
const {
  ACTIVITY_ACTIONS,
  ACTIVITY_DETAILS,
} = require("../../shared/constants/activities");
const { activityLogger } = require("../audit/audit.service");
const router = express.Router();

router.use(authMiddleware);

router.post(
  "/create",
  authorizeRoles(USER_ROLES.BANKER),
  validateAccountCreation,
  activityLogger(ACTIVITY_ACTIONS.ACCOUNT_CREATION, ACTIVITY_DETAILS.ACCOUNT_CREATION),
  createAccount,
);
router.delete(
  "/:accountNumber",
  authorizeRoles(USER_ROLES.BANKER),
  activityLogger(ACTIVITY_ACTIONS.ACCOUNT_CLOSURE, ACTIVITY_DETAILS.ACCOUNT_CLOSURE),
  deleteAccount,
);
router.get("/all", authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.AUDITOR), getAllAccounts);
router.get("/limits", getAccountLimits);
router.get("/", authorizeRoles(USER_ROLES.CUSTOMER), getAccounts);
router.get("/balance/:accountNumber", authorizeRoles(USER_ROLES.CUSTOMER), getBalance);
router.post(
  "/deposit",
  authorizeRoles(USER_ROLES.CUSTOMER, USER_ROLES.BANKER),
  activityLogger(ACTIVITY_ACTIONS.DEPOSIT, ACTIVITY_DETAILS.DEPOSIT),
  deposit,
);
router.post(
  "/withdraw",
  authorizeRoles(USER_ROLES.CUSTOMER, USER_ROLES.BANKER),
  activityLogger(ACTIVITY_ACTIONS.WITHDRAW, ACTIVITY_DETAILS.WITHDRAW),
  withdraw,
);
router.post(
  "/airdrop",
  authorizeRoles(USER_ROLES.ADMIN),
  activityLogger(ACTIVITY_ACTIONS.AIRDROP, ACTIVITY_DETAILS.AIRDROP),
  airdrop,
);
router.get(
  "/:accountNumber/detail",
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.BANKER, USER_ROLES.AUDITOR),
  activityLogger(ACTIVITY_ACTIONS.VIEW_ACCOUNT_DETAIL, ACTIVITY_DETAILS.VIEW_ACCOUNT_DETAIL),
  getAccountByNumber,
);
router.patch(
  "/:accountNumber/status",
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.BANKER),
  activityLogger(ACTIVITY_ACTIONS.ACCOUNT_STATUS_CHANGED, ACTIVITY_DETAILS.ACCOUNT_STATUS_CHANGED),
  updateAccountStatus,
);
router.patch(
  "/:accountNumber/overdraft-limit",
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.BANKER),
  validateOverdraftLimit,
  activityLogger(ACTIVITY_ACTIONS.UPDATE_OVERDRAFT_LIMIT, ACTIVITY_DETAILS.UPDATE_OVERDRAFT_LIMIT),
  setOverdraftLimit,
);

router.post(
  "/request",
  authorizeRoles(USER_ROLES.CUSTOMER),
  activityLogger(ACTIVITY_ACTIONS.ACCOUNT_REQUEST, ACTIVITY_DETAILS.ACCOUNT_REQUEST),
  requestAccount,
);
router.get(
  "/account-requests",
  authorizeRoles(USER_ROLES.BANKER, USER_ROLES.ADMIN, USER_ROLES.AUDITOR),
  getPendingAccountRequests,
);
router.post(
  "/account-requests/:accountId/approve",
  authorizeRoles(USER_ROLES.BANKER),
  activityLogger(ACTIVITY_ACTIONS.APPROVE_ACCOUNT_REQUEST, ACTIVITY_DETAILS.APPROVE_ACCOUNT_REQUEST),
  approveAccountRequest,
);
router.post(
  "/account-requests/:accountId/reject",
  authorizeRoles(USER_ROLES.BANKER),
  activityLogger(ACTIVITY_ACTIONS.REJECT_ACCOUNT_REQUEST, ACTIVITY_DETAILS.REJECT_ACCOUNT_REQUEST),
  rejectAccountRequest,
);

router.put(
  "/:accountNumber/suspend",
  authorizeRoles(USER_ROLES.BANKER),
  activityLogger(ACTIVITY_ACTIONS.ACCOUNT_SUSPENDED, ACTIVITY_DETAILS.ACCOUNT_SUSPENDED),
  suspendAccount,
);

router.put(
  "/:accountNumber/reactivate",
  authorizeRoles(USER_ROLES.BANKER),
  activityLogger(ACTIVITY_ACTIONS.ACCOUNT_REACTIVATED, ACTIVITY_DETAILS.ACCOUNT_REACTIVATED),
  reactivateAccount,
);

router.post(
  "/:accountNumber/close-request",
  authorizeRoles(USER_ROLES.CUSTOMER),
  activityLogger(
    ACTIVITY_ACTIONS.ACCOUNT_CLOSE_REQUESTED,
    ACTIVITY_DETAILS.ACCOUNT_CLOSE_REQUESTED,
  ),
  requestClosure,
);

router.post(
  "/:accountNumber/approve-closure",
  authorizeRoles(USER_ROLES.BANKER),
  activityLogger(ACTIVITY_ACTIONS.ACCOUNT_CLOSED, ACTIVITY_DETAILS.ACCOUNT_CLOSED),
  approveClosure,
);

router.post(
  "/:accountNumber/fd-settle",
  authorizeRoles(USER_ROLES.CUSTOMER),
  activityLogger(ACTIVITY_ACTIONS.FD_PRINCIPAL_SETTLEMENT, ACTIVITY_DETAILS.FD_PRINCIPAL_SETTLEMENT),
  require("./account.controller").fdSettle,
);

router.patch(
  "/:accountNumber/fd-instructions",
  authorizeRoles(USER_ROLES.CUSTOMER),
  activityLogger(ACTIVITY_ACTIONS.UPDATE_FD_INSTRUCTIONS, ACTIVITY_DETAILS.UPDATE_FD_INSTRUCTIONS),
  require("./account.controller").updateFdInstructions,
);

router.post(
  "/:accountNumber/fd-withdraw-early",
  authorizeRoles(USER_ROLES.CUSTOMER),
  activityLogger(ACTIVITY_ACTIONS.FD_EARLY_WITHDRAWAL, ACTIVITY_DETAILS.FD_EARLY_WITHDRAWAL),
  require("./account.controller").fdWithdrawEarly,
);

module.exports = router;
