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
} = require("../controllers/accountController");
const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const { validateAccountCreation } = require("../middleware/accountMiddleware");
const router = express.Router();

// Only banker can create account
router.post(
  "/create",
  authMiddleware,
  authorizeRoles("banker"),
  validateAccountCreation,
  createAccount
);
// Only banker can delete account
router.delete(
  "/:accountNumber",
  authMiddleware,
  authorizeRoles("banker"),
  deleteAccount
);
// Only admin can view all accounts
router.get("/all", authMiddleware, authorizeRoles("admin"), getAllAccounts);
// Only customer can view their own accounts
router.get("/", authMiddleware, authorizeRoles("customer"), getAccounts);
// Only customer can view their own balance
router.get(
  "/balance/:accountNumber",
  authMiddleware,
  authorizeRoles("customer"),
  getBalance
);
// Deposit: banker (any), customer (own)
router.post(
  "/deposit",
  authMiddleware,
  authorizeRoles("customer", "banker"),
  deposit
);
// Withdraw: banker (any), customer (own)
router.post(
  "/withdraw",
  authMiddleware,
  authorizeRoles("customer", "banker"),
  withdraw
);
// Airdrop: admin only
router.post("/airdrop", authMiddleware, authorizeRoles("admin"), airdrop);

module.exports = router;
