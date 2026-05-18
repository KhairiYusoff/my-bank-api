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
} = require("./account.controller");
const {
  authMiddleware,
  authorizeRoles,
} = require("../../shared/middleware/auth.middleware");
const {
  validateAccountCreation,
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

module.exports = router;
