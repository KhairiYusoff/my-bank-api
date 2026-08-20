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
const { activityLogger } = require("../audit/audit.service");
const router = express.Router();

router.use(authMiddleware);

router.post(
  "/create",
  authorizeRoles(USER_ROLES.BANKER),
  validateAccountCreation,
  activityLogger("ACCOUNT_CREATION", "Banker created a new account"),
  createAccount,
);
router.delete(
  "/:accountNumber",
  authorizeRoles(USER_ROLES.BANKER),
  activityLogger("ACCOUNT_CLOSURE", "Banker deleted an account"),
  deleteAccount,
);
router.get("/all", authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.AUDITOR), getAllAccounts);
router.get("/limits", getAccountLimits);
router.get("/", authorizeRoles(USER_ROLES.CUSTOMER), getAccounts);
router.get("/balance/:accountNumber", authorizeRoles(USER_ROLES.CUSTOMER), getBalance);
router.post(
  "/deposit",
  authorizeRoles(USER_ROLES.CUSTOMER, USER_ROLES.BANKER),
  activityLogger("DEPOSIT", "Deposit made to account"),
  deposit,
);
router.post(
  "/withdraw",
  authorizeRoles(USER_ROLES.CUSTOMER, USER_ROLES.BANKER),
  activityLogger("WITHDRAW", "Withdrawal from account"),
  withdraw,
);
router.post(
  "/airdrop",
  authorizeRoles(USER_ROLES.ADMIN),
  activityLogger("AIRDROP", "Admin airdropped funds"),
  airdrop,
);
router.get(
  "/:accountNumber/detail",
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.BANKER, USER_ROLES.AUDITOR),
  activityLogger("VIEW_ACCOUNT_DETAIL", "Staff viewed account detail"),
  getAccountByNumber,
);
router.patch(
  "/:accountNumber/status",
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.BANKER),
  activityLogger("ACCOUNT_STATUS_CHANGED", "Account status changed"),
  updateAccountStatus,
);
router.patch(
  "/:accountNumber/overdraft-limit",
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.BANKER),
  validateOverdraftLimit,
  activityLogger("UPDATE_OVERDRAFT_LIMIT", "Staff updated overdraft limit"),
  setOverdraftLimit,
);

router.post(
  "/request",
  authorizeRoles(USER_ROLES.CUSTOMER),
  activityLogger("ACCOUNT_REQUEST", "Customer requested new account"),
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
  activityLogger("APPROVE_ACCOUNT_REQUEST", "Banker approved account request"),
  approveAccountRequest,
);
router.post(
  "/account-requests/:accountId/reject",
  authorizeRoles(USER_ROLES.BANKER),
  activityLogger("REJECT_ACCOUNT_REQUEST", "Banker rejected account request"),
  rejectAccountRequest,
);

router.put(
  "/:accountNumber/suspend",
  authorizeRoles(USER_ROLES.BANKER),
  activityLogger("ACCOUNT_SUSPENDED", "Banker suspended an account"),
  suspendAccount,
);

router.put(
  "/:accountNumber/reactivate",
  authorizeRoles(USER_ROLES.BANKER),
  activityLogger("ACCOUNT_REACTIVATED", "Banker reactivated an account"),
  reactivateAccount,
);

router.post(
  "/:accountNumber/close-request",
  authorizeRoles(USER_ROLES.CUSTOMER),
  activityLogger(
    "ACCOUNT_CLOSE_REQUESTED",
    "Customer requested account closure",
  ),
  requestClosure,
);

router.post(
  "/:accountNumber/approve-closure",
  authorizeRoles(USER_ROLES.BANKER),
  activityLogger("ACCOUNT_CLOSED", "Banker approved account closure"),
  approveClosure,
);

router.post(
  "/:accountNumber/fd-settle",
  authorizeRoles(USER_ROLES.CUSTOMER),
  activityLogger("FD_PRINCIPAL_SETTLEMENT", "Customer settled FD principal"),
  require("./account.controller").fdSettle,
);

router.patch(
  "/:accountNumber/fd-instructions",
  authorizeRoles(USER_ROLES.CUSTOMER),
  activityLogger("UPDATE_FD_INSTRUCTIONS", "Customer updated FD instructions"),
  require("./account.controller").updateFdInstructions,
);

router.post(
  "/:accountNumber/fd-withdraw-early",
  authorizeRoles(USER_ROLES.CUSTOMER),
  activityLogger("FD_EARLY_WITHDRAWAL", "Customer withdrew FD principal early"),
  require("./account.controller").fdWithdrawEarly,
);

module.exports = router;
