const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  authorizeRoles,
} = require("../../shared/middleware/auth.middleware");
const { USER_ROLES } = require("../../shared/constants/user");
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

router.post(
  "/",
  authorizeRoles(USER_ROLES.CUSTOMER, USER_ROLES.BANKER),
  createExpense,
);
router.get(
  "/",
  authorizeRoles(
    USER_ROLES.CUSTOMER,
    USER_ROLES.BANKER,
    USER_ROLES.ADMIN,
    USER_ROLES.AUDITOR,
  ),
  getExpenses,
);
router.get(
  "/categories",
  authorizeRoles(
    USER_ROLES.CUSTOMER,
    USER_ROLES.BANKER,
    USER_ROLES.ADMIN,
    USER_ROLES.AUDITOR,
  ),
  getExpenseCategories,
);
router.get(
  "/payment-methods",
  authorizeRoles(
    USER_ROLES.CUSTOMER,
    USER_ROLES.BANKER,
    USER_ROLES.ADMIN,
    USER_ROLES.AUDITOR,
  ),
  getPaymentMethods,
);
router.get(
  "/analytics/monthly",
  authorizeRoles(
    USER_ROLES.CUSTOMER,
    USER_ROLES.BANKER,
    USER_ROLES.AUDITOR,
  ),
  getMonthlyAnalytics,
);
router.get(
  "/analytics/yearly",
  authorizeRoles(
    USER_ROLES.CUSTOMER,
    USER_ROLES.BANKER,
    USER_ROLES.AUDITOR,
  ),
  getYearlyAnalytics,
);
router.get(
  "/dashboard/stats",
  authorizeRoles(
    USER_ROLES.CUSTOMER,
    USER_ROLES.BANKER,
    USER_ROLES.AUDITOR,
  ),
  getDashboardStats,
);
router.get(
  "/:expenseId",
  authorizeRoles(
    USER_ROLES.CUSTOMER,
    USER_ROLES.BANKER,
    USER_ROLES.ADMIN,
    USER_ROLES.AUDITOR,
  ),
  getExpenseById,
);
router.put(
  "/:expenseId",
  authorizeRoles(USER_ROLES.CUSTOMER, USER_ROLES.BANKER),
  updateExpense,
);
router.delete(
  "/:expenseId",
  authorizeRoles(USER_ROLES.CUSTOMER, USER_ROLES.BANKER),
  deleteExpense,
);

module.exports = router;
