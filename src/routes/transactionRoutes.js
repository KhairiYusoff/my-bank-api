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

// Transfer funds between accounts
router.post("/transfer", authMiddleware, transferFunds);

// Get transactions for a specific account
router.get("/account/:accountNumber", authMiddleware, getAccountTransactions);

// Get all transactions (admin only)
router.get("/all", authMiddleware, authorizeRoles("admin"), getAllTransactions);

// Get transaction details
router.get("/:transactionId", authMiddleware, getTransactionDetails);

module.exports = router;
