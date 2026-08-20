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
const { USER_ROLES } = require("../../shared/constants/user");

router.use(authMiddleware);

router.post(
  "/transfer",
  authorizeRoles(USER_ROLES.CUSTOMER, USER_ROLES.BANKER),
  validateTransfer,
  activityLogger("TRANSFER_INITIATED", "Funds transfer initiated"),
  transferFunds,
);
router.get(
  "/account/:accountNumber",
  authorizeRoles(
    USER_ROLES.CUSTOMER,
    USER_ROLES.BANKER,
    USER_ROLES.ADMIN,
    USER_ROLES.AUDITOR,
  ),
  getAccountTransactions,
);
router.get(
  "/all",
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.AUDITOR),
  getAllTransactions,
);
router.get(
  "/:transactionId",
  authorizeRoles(
    USER_ROLES.CUSTOMER,
    USER_ROLES.BANKER,
    USER_ROLES.ADMIN,
    USER_ROLES.AUDITOR,
  ),
  getTransactionDetails,
);

module.exports = router;
