const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  authorizeRoles,
} = require("../../shared/middleware/auth.middleware");
const {
  transferFunds,
  getAccountTransactions,
  getAllTransactions,
  getTransactionDetails,
} = require("./transaction.controller");
const { activityLogger } = require("../audit/audit.service");
const {
  validateTransfer,
  validateTransaction,
} = require("../../shared/middleware/validation.middleware");

router.use(authMiddleware);

router.post(
  "/transfer",
  authorizeRoles("customer", "banker"),
  validateTransfer,
  activityLogger("TRANSFER_INITIATED", "Funds transfer initiated"),
  transferFunds,
);
router.get(
  "/account/:accountNumber",
  authorizeRoles("customer", "banker", "admin"),
  getAccountTransactions,
);
router.get("/all", authorizeRoles("admin"), getAllTransactions);
router.get(
  "/:transactionId",
  authorizeRoles("customer", "banker", "admin"),
  getTransactionDetails,
);

module.exports = router;
