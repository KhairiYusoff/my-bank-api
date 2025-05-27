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
router.post("/transfer", authorizeRoles("customer", "banker"), transferFunds);

// Get transactions for a specific account
router.get(
  "/account/:accountNumber",
  authorizeRoles("customer", "banker", "admin"),
  getAccountTransactions
);

// Get all transactions (admin only)
router.get("/all", authorizeRoles("admin"), getAllTransactions);

// Get transaction details
router.get(
  "/:transactionId",
  authorizeRoles("customer", "banker", "admin"),
  getTransactionDetails
);

module.exports = router;
