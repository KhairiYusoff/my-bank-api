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
const { activityLogger } = require("../services/activityService");
const { validateTransfer, validateTransaction } = require("../middleware/validationMiddleware");

/**
 * @swagger
 * tags:
 *   name: V1 - Transactions
 *   description: Transaction management operations (V1)
 */

router.use(authMiddleware);

/**
 * @swagger
 * /transactions/transfer:
 *   post:
 *     summary: Transfer funds between two accounts
 *     tags: [V1 - Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromAccountNumber
 *               - toAccountNumber
 *               - amount
 *             properties:
 *               fromAccountNumber:
 *                 type: string
 *               toAccountNumber:
 *                 type: string
 *               amount:
 *                 type: number
 *                 format: double
 *     responses:
 *       200:
 *         description: Transfer successful.
 *       400:
 *         description: Bad request (e.g., insufficient funds).
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Account not found.
 */
router.post(
  "/transfer",
  authorizeRoles("customer", "banker"),
  validateTransfer, // CRITICAL: Financial input validation
  activityLogger("TRANSFER_INITIATED", "Funds transfer initiated"),
  transferFunds
);

/**
 * @swagger
 * /transactions/account/{accountNumber}:
 *   get:
 *     summary: Get all transactions for a specific account
 *     tags: [V1 - Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of transactions.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Account not found.
 */
router.get(
  "/account/:accountNumber",
  authorizeRoles("customer", "banker", "admin"),
  getAccountTransactions
);

/**
 * @swagger
 * /transactions/all:
 *   get:
 *     summary: Get all transactions in the system (admin only)
 *     tags: [V1 - Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all transactions.
 *       403:
 *         description: Forbidden.
 */
router.get("/all", authorizeRoles("admin"), getAllTransactions);

/**
 * @swagger
 * /transactions/{transactionId}:
 *   get:
 *     summary: Get details for a specific transaction
 *     tags: [V1 - Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction details.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Transaction not found.
 */
router.get(
  "/:transactionId",
  authorizeRoles("customer", "banker", "admin"),
  getTransactionDetails
);

module.exports = router;
