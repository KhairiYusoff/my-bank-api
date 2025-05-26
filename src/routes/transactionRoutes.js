const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const {
  transferFunds,
  getAccountTransactions,
  getAllTransactions,
  getTransactionDetails,
} = require("../controllers/transactionController");

router.use(authMiddleware);

// Transfer funds between accounts
router.post("/transfer", transferFunds);

// Get transactions for a specific account
router.get("/account/:accountNumber", getAccountTransactions);

// Get all transactions (admin only)
router.get("/all", authorizeRoles("admin"), getAllTransactions);

// Get transaction details
router.get("/:transactionId", getTransactionDetails);

module.exports = router;
