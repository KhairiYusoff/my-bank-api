const { error } = require('./response');
const {
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
} = require('../constants/expenses');
const { ACCOUNT_TYPE_NAMES } = require('../constants/accountLimits');

/**
 * Common validation helpers to reduce code duplication
 */

const validateAmount = (amount, type = 'amount') => {
  if (!amount || amount <= 0) {
    return { isValid: false, message: `Invalid ${type} amount` };
  }
  return { isValid: true };
};

const validateUserExists = (user, includeType = false) => {
  if (!user) {
    return { isValid: false, message: "User not found" };
  }
  return { isValid: true };
};

const validateAccountExists = (account, message = "Account not found") => {
  if (!account) {
    return { isValid: false, message };
  }
  return { isValid: true };
};

const validateToken = (token, type = 'token') => {
  if (!token) {
    return { isValid: false, message: `No ${type} provided` };
  }
  return { isValid: true };
};

const handleValidationError = (res, validationResult) => {
  if (!validationResult.isValid) {
    return error(res, { message: validationResult.message, statusCode: 400 });
  }
  return null; // No error
};

// Combined validators with error handling
const checkAmount = (res, amount, type = 'amount') => {
  const result = validateAmount(amount, type);
  return handleValidationError(res, result);
};

const checkUserExists = (res, user) => {
  const result = validateUserExists(user);
  return handleValidationError(res, result);
};

const checkAccountExists = (res, account, message) => {
  const result = validateAccountExists(account, message);
  return handleValidationError(res, result);
};

const checkToken = (res, token, type = 'token') => {
  const result = validateToken(token, type);
  return handleValidationError(res, result);
};

const validateExpenseCategory = (category) => {
  const validCategories = Object.values(EXPENSE_CATEGORIES).map(cat => cat.value);
  if (!category || !validCategories.includes(category)) {
    return { isValid: false, message: "Invalid expense category" };
  }
  return { isValid: true };
};

const validateExpenseSubcategory = (category, subcategory) => {
  if (!subcategory) return { isValid: true }; // Subcategory is optional
  
  const validSubcategories = Object.values(EXPENSE_CATEGORIES)
    .find(cat => cat.value === category)?.subcategories
    .map(sub => sub.value) || [];
    
  if (!validSubcategories.includes(subcategory)) {
    return { isValid: false, message: "Invalid subcategory for selected category" };
  }
  return { isValid: true };
};

const validatePaymentMethod = (paymentMethod) => {
  const validMethods = Object.values(PAYMENT_METHODS).map(method => method.value);
  if (!paymentMethod || !validMethods.includes(paymentMethod)) {
    return { isValid: false, message: "Invalid payment method" };
  }
  return { isValid: true };
};

const validateExpenseDate = (date) => {
  if (!date) {
    return { isValid: false, message: "Expense date is required" };
  }
  
  const expenseDate = new Date(date);
  const now = new Date();
  
  // Allow dates up to 1 year in the past
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  if (expenseDate > now) {
    return { isValid: false, message: "Expense date cannot be in the future" };
  }
  
  if (expenseDate < oneYearAgo) {
    return { isValid: false, message: "Expense date cannot be more than 1 year old" };
  }
  
  return { isValid: true };
};

const validateExpenseDescription = (description) => {
  if (!description || description.trim().length < 2) {
    return { isValid: false, message: "Description must be at least 2 characters" };
  }
  
  if (description.length > 200) {
    return { isValid: false, message: "Description cannot exceed 200 characters" };
  }
  
  return { isValid: true };
};

const checkExpenseCategory = (res, category) => {
  const result = validateExpenseCategory(category);
  return handleValidationError(res, result);
};

const checkExpenseSubcategory = (res, category, subcategory) => {
  const result = validateExpenseSubcategory(category, subcategory);
  return handleValidationError(res, result);
};

const checkPaymentMethod = (res, paymentMethod) => {
  const result = validatePaymentMethod(paymentMethod);
  return handleValidationError(res, result);
};

const checkExpenseDate = (res, date) => {
  const result = validateExpenseDate(date);
  return handleValidationError(res, result);
};

const checkExpenseDescription = (res, description) => {
  const result = validateExpenseDescription(description);
  return handleValidationError(res, result);
};

const getReadableAccountType = (accountType) => {
  return ACCOUNT_TYPE_NAMES[accountType] || accountType;
};

module.exports = {
  validateAmount,
  validateUserExists,
  validateAccountExists,
  validateToken,
  handleValidationError,
  checkAmount,
  checkUserExists,
  checkAccountExists,
  checkToken,
  validateExpenseCategory,
  validateExpenseSubcategory,
  validatePaymentMethod,
  validateExpenseDate,
  validateExpenseDescription,
  checkExpenseCategory,
  checkExpenseSubcategory,
  checkPaymentMethod,
  checkExpenseDate,
  checkExpenseDescription,
  getReadableAccountType
};
