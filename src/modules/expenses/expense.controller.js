const { success, error } = require("../../shared/utils/response");
const expenseService = require("./expense.service");
const {
  getAllCategories,
  getPaymentMethodOptions,
} = require("../../shared/constants/expenses");
const {
  checkAmount,
  checkExpenseCategory,
  checkExpenseSubcategory,
  checkPaymentMethod,
  checkExpenseDate,
  checkExpenseDescription,
} = require("../../shared/utils/validation.helpers");

exports.createExpense = async (req, res) => {
  const {
    amount,
    category,
    subCategory,
    description,
    date,
    paymentMethod,
    account,
    tags,
    notes,
    location,
    merchant,
  } = req.body;

  const amountError = checkAmount(res, amount, "expense amount");
  if (amountError) return amountError;

  const categoryError = checkExpenseCategory(res, category);
  if (categoryError) return categoryError;

  const subcategoryError = checkExpenseSubcategory(res, category, subCategory);
  if (subcategoryError) return subcategoryError;

  const descriptionError = checkExpenseDescription(res, description);
  if (descriptionError) return descriptionError;

  const dateError = checkExpenseDate(res, date);
  if (dateError) return dateError;

  const paymentError = checkPaymentMethod(res, paymentMethod);
  if (paymentError) return paymentError;

  try {
    const expenseData = {
      amount: parseFloat(amount),
      category,
      subCategory,
      description: description.trim(),
      date: new Date(date),
      paymentMethod,
      account,
      tags: tags || [],
      notes: notes ? notes.trim() : undefined,
      location: location ? location.trim() : undefined,
      merchant: merchant
        ? {
            name: merchant.name ? merchant.name.trim() : undefined,
            category: merchant.category ? merchant.category.trim() : undefined,
          }
        : undefined,
    };

    const expense = await expenseService.createExpense(
      req.user.id,
      expenseData,
    );

    return success(res, {
      message: "Expense created successfully",
      data: expense,
    });
  } catch (err) {
    console.error("Create expense error:", err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.getExpenses = async (req, res) => {
  const {
    page = 1,
    limit = 20,
    category,
    subCategory,
    paymentMethod,
    dateFrom,
    dateTo,
    search,
    sort = "date_desc",
  } = req.query;

  try {
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      subCategory,
      paymentMethod,
      dateFrom,
      dateTo,
      search,
      sort,
    };

    const result = await expenseService.getExpenses(req.user.id, options);

    return success(res, {
      message: "Expenses retrieved successfully",
      data: result.expenses,
      meta: {
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
        pages: result.pagination.pages,
      },
    });
  } catch (err) {
    console.error("Get expenses error:", err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.getExpenseById = async (req, res) => {
  const { expenseId } = req.params;

  try {
    const expense = await expenseService.getExpenseById(req.user.id, expenseId);

    return success(res, {
      message: "Expense retrieved successfully",
      data: expense,
    });
  } catch (err) {
    console.error("Get expense error:", err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.updateExpense = async (req, res) => {
  const { expenseId } = req.params;
  const updateData = req.body;

  try {
    if (updateData.amount !== undefined) {
      const amountError = checkAmount(res, updateData.amount, "expense amount");
      if (amountError) return amountError;
      updateData.amount = parseFloat(updateData.amount);
    }

    if (updateData.category !== undefined) {
      const categoryError = checkExpenseCategory(res, updateData.category);
      if (categoryError) return categoryError;
    }

    if (updateData.subCategory !== undefined) {
      const subcategoryError = checkExpenseSubcategory(
        res,
        updateData.category || req.body.category,
        updateData.subCategory,
      );
      if (subcategoryError) return subcategoryError;
    }

    if (updateData.description !== undefined) {
      const descriptionError = checkExpenseDescription(
        res,
        updateData.description,
      );
      if (descriptionError) return descriptionError;
      updateData.description = updateData.description.trim();
    }

    if (updateData.date !== undefined) {
      const dateError = checkExpenseDate(res, updateData.date);
      if (dateError) return dateError;
      updateData.date = new Date(updateData.date);
    }

    if (updateData.paymentMethod !== undefined) {
      const paymentError = checkPaymentMethod(res, updateData.paymentMethod);
      if (paymentError) return paymentError;
    }

    if (updateData.notes !== undefined) {
      updateData.notes = updateData.notes ? updateData.notes.trim() : undefined;
    }

    if (updateData.location !== undefined) {
      updateData.location = updateData.location
        ? updateData.location.trim()
        : undefined;
    }

    const expense = await expenseService.updateExpense(
      req.user.id,
      expenseId,
      updateData,
    );

    return success(res, {
      message: "Expense updated successfully",
      data: expense,
    });
  } catch (err) {
    console.error("Update expense error:", err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.deleteExpense = async (req, res) => {
  const { expenseId } = req.params;

  try {
    await expenseService.deleteExpense(req.user.id, expenseId);

    return success(res, {
      message: "Expense deleted successfully",
    });
  } catch (err) {
    console.error("Delete expense error:", err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.getMonthlyAnalytics = async (req, res) => {
  const { year, month } = req.query;

  if (!year || !month) {
    return error(res, {
      message: "Year and month are required",
      statusCode: 400,
    });
  }

  try {
    const analytics = await expenseService.getMonthlyAnalytics(
      req.user.id,
      parseInt(year),
      parseInt(month),
    );

    return success(res, {
      message: "Monthly analytics retrieved successfully",
      data: analytics,
    });
  } catch (err) {
    console.error("Get monthly analytics error:", err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

/**
 * Get yearly expense analytics
 */
exports.getYearlyAnalytics = async (req, res) => {
  const { year } = req.query;

  if (!year) {
    return error(res, {
      message: "Year is required",
      statusCode: 400,
    });
  }

  try {
    const analytics = await expenseService.getYearlyAnalytics(
      req.user.id,
      parseInt(year),
    );

    return success(res, {
      message: "Yearly analytics retrieved successfully",
      data: analytics,
    });
  } catch (err) {
    console.error("Get yearly analytics error:", err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

/**
 * Get dashboard statistics
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const stats = await expenseService.getDashboardStats(req.user.id);

    return success(res, {
      message: "Dashboard stats retrieved successfully",
      data: stats,
    });
  } catch (err) {
    console.error("Get dashboard stats error:", err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

/**
 * Get expense categories and subcategories
 */
exports.getExpenseCategories = async (req, res) => {
  try {
    const categories = getAllCategories();

    return success(res, {
      message: "Expense categories retrieved successfully",
      data: categories,
    });
  } catch (err) {
    console.error("Get expense categories error:", err.message);
    return error(res, {
      message: "Failed to get expense categories",
      statusCode: 500,
    });
  }
};

/**
 * Get payment methods
 */
exports.getPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = getPaymentMethodOptions();

    return success(res, {
      message: "Payment methods retrieved successfully",
      data: paymentMethods,
    });
  } catch (err) {
    console.error("Get payment methods error:", err.message);
    return error(res, {
      message: "Failed to get payment methods",
      statusCode: 500,
    });
  }
};
