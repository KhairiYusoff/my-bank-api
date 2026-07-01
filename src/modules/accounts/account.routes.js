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
const { activityLogger } = require("../audit/audit.service");
const router = express.Router();

router.use(authMiddleware);

router.post(
  "/create",
  authorizeRoles("banker"),
  validateAccountCreation,
  activityLogger("ACCOUNT_CREATION", "Banker created a new account"),
  createAccount,
);
router.delete(
  "/:accountNumber",
  authorizeRoles("banker"),
  activityLogger("ACCOUNT_CLOSURE", "Banker deleted an account"),
  deleteAccount,
);
router.get("/all", authorizeRoles("admin", "auditor"), getAllAccounts);
router.get("/limits", getAccountLimits);
router.get("/", authorizeRoles("customer"), getAccounts);
router.get("/balance/:accountNumber", authorizeRoles("customer"), getBalance);
router.post(
  "/deposit",
  authorizeRoles("customer", "banker"),
  activityLogger("DEPOSIT", "Deposit made to account"),
  deposit,
);
router.post(
  "/withdraw",
  authorizeRoles("customer", "banker"),
  activityLogger("WITHDRAW", "Withdrawal from account"),
  withdraw,
);
router.post(
  "/airdrop",
  authorizeRoles("admin"),
  activityLogger("AIRDROP", "Admin airdropped funds"),
  airdrop,
);
router.get(
  "/:accountNumber/detail",
  authorizeRoles("admin", "banker", "auditor"),
  activityLogger("VIEW_ACCOUNT_DETAIL", "Staff viewed account detail"),
  getAccountByNumber,
);
router.patch(
  "/:accountNumber/status",
  authorizeRoles("admin", "banker"),
  activityLogger("ACCOUNT_STATUS_CHANGED", "Account status changed"),
  updateAccountStatus,
);
router.patch(
  "/:accountNumber/overdraft-limit",
  authorizeRoles("admin", "banker"),
  validateOverdraftLimit,
  activityLogger("UPDATE_OVERDRAFT_LIMIT", "Staff updated overdraft limit"),
  setOverdraftLimit,
);

router.post(
  "/request",
  authorizeRoles("customer"),
  activityLogger("ACCOUNT_REQUEST", "Customer requested new account"),
  requestAccount,
);
router.get(
  "/account-requests",
  authorizeRoles("banker", "admin", "auditor"),
  getPendingAccountRequests,
);
router.post(
  "/account-requests/:accountId/approve",
  authorizeRoles("banker"),
  activityLogger("APPROVE_ACCOUNT_REQUEST", "Banker approved account request"),
  approveAccountRequest,
);
router.post(
  "/account-requests/:accountId/reject",
  authorizeRoles("banker"),
  activityLogger("REJECT_ACCOUNT_REQUEST", "Banker rejected account request"),
  rejectAccountRequest,
);

router.put(
  "/:accountNumber/suspend",
  authorizeRoles("banker"),
  activityLogger("ACCOUNT_SUSPENDED", "Banker suspended an account"),
  suspendAccount,
);

router.put(
  "/:accountNumber/reactivate",
  authorizeRoles("banker"),
  activityLogger("ACCOUNT_REACTIVATED", "Banker reactivated an account"),
  reactivateAccount,
);

router.post(
  "/:accountNumber/close-request",
  authorizeRoles("customer"),
  activityLogger(
    "ACCOUNT_CLOSE_REQUESTED",
    "Customer requested account closure",
  ),
  requestClosure,
);

router.post(
  "/:accountNumber/approve-closure",
  authorizeRoles("banker"),
  activityLogger("ACCOUNT_CLOSED", "Banker approved account closure"),
  approveClosure,
);

router.post(
  "/:accountNumber/fd-settle",
  authorizeRoles("customer"),
  activityLogger("FD_PRINCIPAL_SETTLEMENT", "Customer settled FD principal"),
  require("./account.controller").fdSettle,
);

router.patch(
  "/:accountNumber/fd-instructions",
  authorizeRoles("customer"),
  activityLogger("UPDATE_FD_INSTRUCTIONS", "Customer updated FD instructions"),
  require("./account.controller").updateFdInstructions,
);

router.post(
  "/:accountNumber/fd-withdraw-early",
  authorizeRoles("customer"),
  activityLogger("FD_EARLY_WITHDRAWAL", "Customer withdrew FD principal early"),
  require("./account.controller").fdWithdrawEarly,
);

module.exports = router;
