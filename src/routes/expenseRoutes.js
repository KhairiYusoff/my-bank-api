const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getMonthlyAnalytics,
  getYearlyAnalytics,
  getDashboardStats,
  getExpenseCategories,
  getPaymentMethods
} = require("../controllers/expenseController");

/**
 * @swagger
 * tags:
 *   name: V1 - Expenses
 *   description: Expense tracking and analytics operations (V1)
 */

// Apply authentication middleware to all expense routes
router.use(authMiddleware);

/**
 * @swagger
 * /expenses:
 *   post:
 *     summary: Create a new expense
 *     tags: [V1 - Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - category
 *               - description
 *               - date
 *               - paymentMethod
 *               - account
 *             properties:
 *               amount:
 *                 type: number
 *                 format: double
 *                 description: Expense amount
 *                 example: 25.50
 *               category:
 *                 type: string
 *                 description: Expense category
 *                 example: "food"
 *               subCategory:
 *                 type: string
 *                 description: Expense subcategory (optional)
 *                 example: "restaurant"
 *               description:
 *                 type: string
 *                 description: Expense description
 *                 example: "Lunch at mamak stall"
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Expense date (YYYY-MM-DD)
 *                 example: "2024-01-15"
 *               paymentMethod:
 *                 type: string
 *                 description: Payment method
 *                 example: "cash"
 *               account:
 *                 type: string
 *                 description: Account ID
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: User-defined tags
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *               location:
 *                 type: string
 *                 description: Expense location
 *               merchant:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   category:
 *                     type: string
 *     responses:
 *       201:
 *         description: Expense created successfully
 *       400:
 *         description: Bad request (validation error)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  authorizeRoles("customer", "banker"),
  createExpense
);

/**
 * @swagger
 * /expenses:
 *   get:
 *     summary: Get expenses with filtering and pagination
 *     tags: [V1 - Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: subCategory
 *         schema:
 *           type: string
 *         description: Filter by subcategory
 *       - in: query
 *         name: paymentMethod
 *         schema:
 *           type: string
 *         description: Filter by payment method
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from date (YYYY-MM-DD)
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter to date (YYYY-MM-DD)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in description and notes
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [date_desc, date_asc, amount_desc, amount_asc, category_asc, description_asc]
 *           default: date_desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Expenses retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  authorizeRoles("customer", "banker", "admin"),
  getExpenses
);

/**
 * @swagger
 * /expenses/categories:
 *   get:
 *     summary: Get available expense categories and subcategories
 *     tags: [V1 - Expenses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  "/categories",
  authorizeRoles("customer", "banker", "admin"),
  getExpenseCategories
);

/**
 * @swagger
 * /expenses/payment-methods:
 *   get:
 *     summary: Get available payment methods
 *     tags: [V1 - Expenses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment methods retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  "/payment-methods",
  authorizeRoles("customer", "banker", "admin"),
  getPaymentMethods
);

/**
 * @swagger
 * /expenses/analytics/monthly:
 *   get:
 *     summary: Get monthly expense analytics
 *     tags: [V1 - Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: Year (e.g., 2024)
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Month (1-12)
 *     responses:
 *       200:
 *         description: Monthly analytics retrieved successfully
 *       400:
 *         description: Bad request (missing parameters)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  "/analytics/monthly",
  authorizeRoles("customer", "banker"),
  getMonthlyAnalytics
);

/**
 * @swagger
 * /expenses/analytics/yearly:
 *   get:
 *     summary: Get yearly expense analytics
 *     tags: [V1 - Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: Year (e.g., 2024)
 *     responses:
 *       200:
 *         description: Yearly analytics retrieved successfully
 *       400:
 *         description: Bad request (missing parameters)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  "/analytics/yearly",
  authorizeRoles("customer", "banker"),
  getYearlyAnalytics
);

/**
 * @swagger
 * /expenses/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [V1 - Expenses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  "/dashboard/stats",
  authorizeRoles("customer", "banker"),
  getDashboardStats
);

/**
 * @swagger
 * /expenses/{expenseId}:
 *   get:
 *     summary: Get expense by ID
 *     tags: [V1 - Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: expenseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Expense ID
 *     responses:
 *       200:
 *         description: Expense retrieved successfully
 *       404:
 *         description: Expense not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:expenseId",
  authorizeRoles("customer", "banker", "admin"),
  getExpenseById
);

/**
 * @swagger
 * /expenses/{expenseId}:
 *   put:
 *     summary: Update expense
 *     tags: [V1 - Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: expenseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Expense ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 format: double
 *               category:
 *                 type: string
 *               subCategory:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               paymentMethod:
 *                 type: string
 *               account:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               notes:
 *                 type: string
 *               location:
 *                 type: string
 *               merchant:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   category:
 *                     type: string
 *     responses:
 *       200:
 *         description: Expense updated successfully
 *       404:
 *         description: Expense not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:expenseId",
  authorizeRoles("customer", "banker"),
  updateExpense
);

/**
 * @swagger
 * /expenses/{expenseId}:
 *   delete:
 *     summary: Delete expense (soft delete)
 *     tags: [V1 - Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: expenseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Expense ID
 *     responses:
 *       200:
 *         description: Expense deleted successfully
 *       404:
 *         description: Expense not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:expenseId",
  authorizeRoles("customer", "banker"),
  deleteExpense
);

module.exports = router;
