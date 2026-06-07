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
} = require("./account.controller");
const {
  authMiddleware,
  authorizeRoles,
} = require("../../shared/middleware/auth.middleware");
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
router.get("/all", authorizeRoles("admin"), getAllAccounts);
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
  authorizeRoles("admin", "banker"),
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

module.exports = router;
