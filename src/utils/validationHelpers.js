const { error } = require('./response');

/**
 * Common validation helpers to reduce code duplication
 */

// Amount validation for transactions
const validateAmount = (amount, type = 'amount') => {
  if (!amount || amount <= 0) {
    return { isValid: false, message: `Invalid ${type} amount` };
  }
  return { isValid: true };
};

// User existence validation
const validateUserExists = (user, includeType = false) => {
  if (!user) {
    return { isValid: false, message: "User not found" };
  }
  return { isValid: true };
};

// Account existence validation
const validateAccountExists = (account, message = "Account not found") => {
  if (!account) {
    return { isValid: false, message };
  }
  return { isValid: true };
};

// Token validation
const validateToken = (token, type = 'token') => {
  if (!token) {
    return { isValid: false, message: `No ${type} provided` };
  }
  return { isValid: true };
};

// Validation result helper
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

module.exports = {
  validateAmount,
  validateUserExists,
  validateAccountExists,
  validateToken,
  handleValidationError,
  checkAmount,
  checkUserExists,
  checkAccountExists,
  checkToken
};
