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

router.use(authMiddleware);

// Only banker can create account
router.post(
  "/create",
  authorizeRoles("banker"),
  validateAccountCreation,
  createAccount
);
// Only banker can delete account
router.delete("/:accountNumber", authorizeRoles("banker"), deleteAccount);
// Only admin can view all accounts
router.get("/all", authorizeRoles("admin"), getAllAccounts);
// Only customer can view their own accounts
router.get("/", authorizeRoles("customer"), getAccounts);
// Only customer can view their own balance
router.get("/balance/:accountNumber", authorizeRoles("customer"), getBalance);
// Deposit: banker (any), customer (own)
router.post("/deposit", authorizeRoles("customer", "banker"), deposit);
// Withdraw: banker (any), customer (own)
router.post("/withdraw", authorizeRoles("customer", "banker"), withdraw);
// Airdrop: admin only
router.post("/airdrop", authorizeRoles("admin"), airdrop);

module.exports = router;
