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
} = require("../../middleware/authMiddleware");
const { validateAccountCreation } = require("./account.middleware");
const { activityLogger } = require("../../services/activityService");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: V1 - Accounts
 *   description: Account management operations (V1)
 */

router.use(authMiddleware);

/**
 * @swagger
 * /accounts/create:
 *   post:
 *     summary: Create a new bank account for a user (banker only)
 *     tags: [V1 - Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - accountType
 *               - currency
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user for whom to create the account.
 *                 example: "60c72b2f9b1d8c001f8e4d1e"
 *               accountType:
 *                 type: string
 *                 enum: [savings, checking]
 *                 example: "savings"
 *               currency:
 *                 type: string
 *                 example: "USD"
 *     responses:
 *       201:
 *         description: Account created successfully.
 *       400:
 *         description: Bad request (e.g., validation error).
 *       403:
 *         description: Forbidden (user is not a banker).
 *       404:
 *         description: User not found.
 */
router.post(
  "/create",
  authorizeRoles("banker"),
  validateAccountCreation,
  activityLogger("ACCOUNT_CREATION", "Banker created a new account"),
  createAccount
);

/**
 * @swagger
 * /accounts/{accountNumber}:
 *   delete:
 *     summary: Delete a bank account (banker only)
 *     tags: [V1 - Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: The account number to delete.
 *     responses:
 *       200:
 *         description: Account deleted successfully.
 *       403:
 *         description: Forbidden (user is not a banker).
 *       404:
 *         description: Account not found.
 */
router.delete(
  "/:accountNumber",
  authorizeRoles("banker"),
  activityLogger("ACCOUNT_CLOSURE", "Banker deleted an account"),
  deleteAccount
);

/**
 * @swagger
 * /accounts/all:
 *   get:
 *     summary: Get a list of all accounts in the bank (admin only)
 *     tags: [V1 - Accounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all accounts.
 *       403:
 *         description: Forbidden (user is not an admin).
 */
router.get("/all", authorizeRoles("admin"), getAllAccounts);

/**
 * @swagger
 * /accounts:
 *   get:
 *     summary: Get all accounts belonging to the logged-in customer
 *     tags: [V1 - Accounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of the customer's accounts.
 *       403:
 *         description: Forbidden (user is not a customer).
 */
router.get("/", authorizeRoles("customer"), getAccounts);

/**
 * @swagger
 * /accounts/balance/{accountNumber}:
 *   get:
 *     summary: Get the balance of a specific account (customer only)
 *     tags: [V1 - Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: The account number to check the balance of.
 *     responses:
 *       200:
 *         description: The account balance.
 *       403:
 *         description: Forbidden (user is not a customer or does not own the account).
 *       404:
 *         description: Account not found.
 */
router.get("/balance/:accountNumber", authorizeRoles("customer"), getBalance);

/**
 * @swagger
 * /accounts/deposit:
 *   post:
 *     summary: Deposit funds into an account
 *     tags: [V1 - Accounts]
 *     description: A customer can deposit into their own account. A banker can deposit into any account.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountNumber
 *               - amount
 *             properties:
 *               accountNumber:
 *                 type: string
 *               amount:
 *                 type: number
 *                 format: double
 *     responses:
 *       200:
 *         description: Deposit successful.
 *       400:
 *         description: Bad request (e.g., invalid amount).
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Account not found.
 */
router.post(
  "/deposit",
  authorizeRoles("customer", "banker"),
  activityLogger("DEPOSIT", "Deposit made to account"),
  deposit
);

/**
 * @swagger
 * /accounts/withdraw:
 *   post:
 *     summary: Withdraw funds from an account
 *     tags: [V1 - Accounts]
 *     description: A customer can withdraw from their own account. A banker can withdraw from any account.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountNumber
 *               - amount
 *             properties:
 *               accountNumber:
 *                 type: string
 *               amount:
 *                 type: number
 *                 format: double
 *     responses:
 *       200:
 *         description: Withdrawal successful.
 *       400:
 *         description: Bad request (e.g., insufficient funds).
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Account not found.
 */
router.post(
  "/withdraw",
  authorizeRoles("customer", "banker"),
  activityLogger("WITHDRAW", "Withdrawal from account"),
  withdraw
);

/**
 * @swagger
 * /accounts/airdrop:
 *   post:
 *     summary: Airdrop funds to a user (admin only)
 *     tags: [V1 - Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - amount
 *             properties:
 *               userId:
 *                 type: string
 *               amount:
 *                 type: number
 *                 format: double
 *     responses:
 *       200:
 *         description: Airdrop successful.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: User not found.
 */
router.post(
  "/airdrop",
  authorizeRoles("admin"),
  activityLogger("AIRDROP", "Admin airdropped funds"),
  airdrop
);

module.exports = router;
