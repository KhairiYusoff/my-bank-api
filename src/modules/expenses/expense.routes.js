const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  authorizeRoles,
} = require("../../shared/middleware/auth.middleware");
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
  getPaymentMethods,
} = require("./expense.controller");

router.use(authMiddleware);

router.post("/", authorizeRoles("customer", "banker"), createExpense);
router.get("/", authorizeRoles("customer", "banker", "admin"), getExpenses);
router.get(
  "/categories",
  authorizeRoles("customer", "banker", "admin"),
  getExpenseCategories,
);
router.get(
  "/payment-methods",
  authorizeRoles("customer", "banker", "admin"),
  getPaymentMethods,
);
router.get(
  "/analytics/monthly",
  authorizeRoles("customer", "banker"),
  getMonthlyAnalytics,
);
router.get(
  "/analytics/yearly",
  authorizeRoles("customer", "banker"),
  getYearlyAnalytics,
);
router.get(
  "/dashboard/stats",
  authorizeRoles("customer", "banker"),
  getDashboardStats,
);
router.get(
  "/:expenseId",
  authorizeRoles("customer", "banker", "admin"),
  getExpenseById,
);
router.put("/:expenseId", authorizeRoles("customer", "banker"), updateExpense);
router.delete(
  "/:expenseId",
  authorizeRoles("customer", "banker"),
  deleteExpense,
);

module.exports = router;
