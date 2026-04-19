const Expense = require("../models/Expense");
const Account = require("../models/Account");
const mongoose = require("mongoose");
const { success, error } = require("../utils/response");

/**
 * Expense Service Layer
 * Handles all expense-related business logic and data operations
 */

class ExpenseService {
  /**
   * Create a new expense
   * @param {string} userId - User ID
   * @param {object} expenseData - Expense details
   * @returns {object} Created expense
   */
  async createExpense(userId, expenseData) {
    try {
      // Validate account ownership
      const account = await Account.findOne({ 
        _id: expenseData.account, 
        user: userId 
      });
      
      if (!account) {
        throw new Error("Account not found or doesn't belong to user");
      }

      // Business logic: validate and normalize data
      const normalizedData = this._validateAndNormalizeExpenseData(expenseData);

      // Create expense with user context
      const expense = new Expense({
        ...normalizedData,
        user: userId,
        isManualEntry: true
      });

      await expense.save();

      // Populate related data for response
      await expense.populate('account', 'accountNumber accountType');

      return expense;
    } catch (err) {
      throw new Error(`Failed to create expense: ${err.message}`);
    }
  }

  /**
   * Get expenses for a user with filtering and pagination
   * @param {string} userId - User ID
   * @param {object} options - Query options
   * @returns {object} Expenses and pagination info
   */
  async getExpenses(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        subCategory,
        paymentMethod,
        dateFrom,
        dateTo,
        search,
        sort = 'date_desc'
      } = options;

      // Build query
      const query = {
        user: userId,
        status: 'active'
      };

      // Add filters
      if (category) query.category = category;
      if (subCategory) query.subCategory = subCategory;
      if (paymentMethod) query.paymentMethod = paymentMethod;

      // Date range filter
      if (dateFrom || dateTo) {
        query.date = {};
        if (dateFrom) query.date.$gte = new Date(dateFrom);
        if (dateTo) query.date.$lte = new Date(dateTo);
      }

      // Search in description and notes
      if (search) {
        query.$or = [
          { description: { $regex: search, $options: 'i' } },
          { notes: { $regex: search, $options: 'i' } },
          { 'merchant.name': { $regex: search, $options: 'i' } }
        ];
      }

      // Sort options
      const sortOptions = this._buildSortOptions(sort);

      // Execute query with pagination
      const expenses = await Expense.find(query)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate('account', 'accountNumber accountType')
        .populate('transaction', 'type status');

      // Get total count for pagination
      const total = await Expense.countDocuments(query);

      return {
        expenses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (err) {
      throw new Error(`Failed to get expenses: ${err.message}`);
    }
  }

  /**
   * Get expense by ID (user-specific)
   * @param {string} userId - User ID
   * @param {string} expenseId - Expense ID
   * @returns {object} Expense details
   */
  async getExpenseById(userId, expenseId) {
    try {
      const expense = await Expense.findOne({
        _id: expenseId,
        user: userId,
        status: 'active'
      })
        .populate('account', 'accountNumber accountType')
        .populate('transaction', 'type status date amount');

      if (!expense) {
        throw new Error("Expense not found");
      }

      return expense;
    } catch (err) {
      throw new Error(`Failed to get expense: ${err.message}`);
    }
  }

  /**
   * Update expense
   * @param {string} userId - User ID
   * @param {string} expenseId - Expense ID
   * @param {object} updateData - Updated expense data
   * @returns {object} Updated expense
   */
  async updateExpense(userId, expenseId, updateData) {
    try {
      // Find and validate ownership
      const expense = await Expense.findOne({
        _id: expenseId,
        user: userId,
        status: 'active'
      });

      if (!expense) {
        throw new Error("Expense not found or access denied");
      }

      // Validate account ownership if account is being updated
      if (updateData.account) {
        const account = await Account.findOne({
          _id: updateData.account,
          user: userId
        });

        if (!account) {
          throw new Error("Account not found or doesn't belong to user");
        }
      }

      // Update expense
      Object.assign(expense, updateData);
      await expense.save();

      await expense.populate('account', 'accountNumber accountType');

      return expense;
    } catch (err) {
      throw new Error(`Failed to update expense: ${err.message}`);
    }
  }

  /**
   * Delete expense (soft delete)
   * @param {string} userId - User ID
   * @param {string} expenseId - Expense ID
   * @returns {boolean} Success status
   */
  async deleteExpense(userId, expenseId) {
    try {
      const expense = await Expense.findOne({
        _id: expenseId,
        user: userId,
        status: 'active'
      });

      if (!expense) {
        throw new Error("Expense not found or access denied");
      }

      // Soft delete
      expense.status = 'deleted';
      await expense.save();

      return true;
    } catch (err) {
      throw new Error(`Failed to delete expense: ${err.message}`);
    }
  }

  /**
   * Get monthly expense analytics
   * @param {string} userId - User ID
   * @param {number} year - Year
   * @param {number} month - Month (1-12)
   * @returns {object} Analytics data
   */
  async getMonthlyAnalytics(userId, year, month) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      // Get category totals using aggregation
      const categoryTotals = await Expense.aggregate([
        {
          $match: {
            user: mongoose.Types.ObjectId(userId),
            date: { $gte: startDate, $lte: endDate },
            status: 'active'
          }
        },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
            average: { $avg: '$amount' }
          }
        },
        {
          $sort: { total: -1 }
        }
      ]);

      // Get daily breakdown using aggregation
      const dailyBreakdown = await Expense.aggregate([
        {
          $match: {
            user: mongoose.Types.ObjectId(userId),
            date: { $gte: startDate, $lte: endDate },
            status: 'active'
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' },
              day: { $dayOfMonth: '$date' }
            },
            total: { $sum: '$amount' },
            count: { $sum: 1 },
            transactions: { $push: '$$ROOT' }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
        }
      ]);

      // Calculate total and statistics
      const totalAmount = categoryTotals.reduce((sum, cat) => sum + cat.total, 0);
      const totalExpenses = categoryTotals.reduce((sum, cat) => sum + cat.count, 0);
      const averageExpense = totalExpenses > 0 ? totalAmount / totalExpenses : 0;

      // Get top spending categories
      const topCategories = categoryTotals.slice(0, 5);

      return {
        period: {
          year,
          month,
          startDate,
          endDate
        },
        summary: {
          totalAmount,
          totalExpenses,
          averageExpense,
          dailyAverage: totalAmount / new Date(year, month, 0).getDate()
        },
        categoryBreakdown: categoryTotals,
        dailyBreakdown,
        topCategories
      };
    } catch (err) {
      throw new Error(`Failed to get monthly analytics: ${err.message}`);
    }
  }

  /**
   * Get yearly expense analytics
   * @param {string} userId - User ID
   * @param {number} year - Year
   * @returns {object} Yearly analytics
   */
  async getYearlyAnalytics(userId, year) {
    try {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);

      // Get monthly totals
      const monthlyTotals = await Expense.aggregate([
        {
          $match: {
            user: require('mongoose').Types.ObjectId(userId),
            date: { $gte: startDate, $lte: endDate },
            status: 'active'
          }
        },
        {
          $group: {
            _id: { month: { $month: '$date' } },
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.month': 1 }
        }
      ]);

      // Get yearly category totals
      const categoryTotals = await Expense.aggregate([
        {
          $match: {
            user: require('mongoose').Types.ObjectId(userId),
            date: { $gte: startDate, $lte: endDate },
            status: 'active'
          }
        },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { total: -1 }
        }
      ]);

      // Calculate yearly summary
      const totalAmount = monthlyTotals.reduce((sum, month) => sum + month.total, 0);
      const totalExpenses = monthlyTotals.reduce((sum, month) => sum + month.count, 0);

      return {
        year,
        summary: {
          totalAmount,
          totalExpenses,
          monthlyAverage: totalAmount / 12
        },
        monthlyBreakdown: monthlyTotals,
        categoryBreakdown: categoryTotals
      };
    } catch (err) {
      throw new Error(`Failed to get yearly analytics: ${err.message}`);
    }
  }

  /**
   * Get expense statistics for dashboard
   * @param {string} userId - User ID
   * @returns {object} Dashboard statistics
   */
  async getDashboardStats(userId) {
    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      // Current month analytics
      const currentMonthAnalytics = await this.getMonthlyAnalytics(
        userId, 
        currentYear, 
        currentMonth
      );

      // Previous month for comparison
      const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      
      const previousMonthAnalytics = await this.getMonthlyAnalytics(
        userId,
        previousYear,
        previousMonth
      );

      // Calculate month-over-month change
      const monthOverMonthChange = previousMonthAnalytics.summary.totalAmount > 0
        ? ((currentMonthAnalytics.summary.totalAmount - previousMonthAnalytics.summary.totalAmount) / 
           previousMonthAnalytics.summary.totalAmount) * 100
        : 0;

      // Recent expenses
      const recentExpenses = await Expense.find({
        user: userId,
        status: 'active'
      })
        .sort({ date: -1 })
        .limit(5)
        .populate('account', 'accountNumber')
        .select('amount category description date');

      return {
        currentMonth: {
          total: currentMonthAnalytics.summary.totalAmount,
          count: currentMonthAnalytics.summary.totalExpenses,
          topCategories: currentMonthAnalytics.topCategories
        },
        monthOverMonthChange: Math.round(monthOverMonthChange * 100) / 100,
        recentExpenses,
        yearlyTotal: currentMonthAnalytics.summary.totalAmount // Will be updated when yearly data is available
      };
    } catch (err) {
      throw new Error(`Failed to get dashboard stats: ${err.message}`);
    }
  }

  /**
   * Validate and normalize expense data
   * @param {object} expenseData - Raw expense data
   * @returns {object} Validated and normalized data
   */
  _validateAndNormalizeExpenseData(expenseData) {
    const { EXPENSE_CATEGORIES } = require("../constants/expense");
    
    // Ensure date is not in future (unless it's a planned expense)
    const expenseDate = new Date(expenseData.date);
    const now = new Date();
    
    if (expenseDate > now) {
      expenseData.date = now;
    }
    
    // Normalize amount to 2 decimal places
    expenseData.amount = Math.round(parseFloat(expenseData.amount) * 100) / 100;
    
    // Validate subcategory against category
    if (expenseData.subCategory) {
      const validSubcategories = Object.values(EXPENSE_CATEGORIES)
        .find(cat => cat.value === expenseData.category)?.subcategories
        .map(sub => sub.value) || [];
        
      if (!validSubcategories.includes(expenseData.subCategory)) {
        expenseData.subCategory = null; // Clear invalid subcategory
      }
    }
    
    return expenseData;
  }

  /**
   * Build sort options for expense queries
   * @param {string} sort - Sort string
   * @returns {object} Sort options
   */
  _buildSortOptions(sort) {
    const sortMap = {
      'date_desc': { date: -1 },
      'date_asc': { date: 1 },
      'amount_desc': { amount: -1 },
      'amount_asc': { amount: 1 },
      'category_asc': { category: 1, date: -1 },
      'description_asc': { description: 1, date: -1 }
    };

    return sortMap[sort] || { date: -1 };
  }
}

module.exports = new ExpenseService();
