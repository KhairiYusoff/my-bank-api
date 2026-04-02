// Utility functions for standardized API responses
// Usage:
//   const { success, error } = require("../utils/response");
//   return success(res, { message: "User created", data: user, statusCode: 201 });
//   return error(res, { message: "Validation failed", errors });

/**
 * Send a formatted JSON response.
 * @param {object} res       Express response object
 * @param {number} status    HTTP status code
 * @param {boolean} success  Indicator of success
 * @param {string} message   Human-readable message
 * @param {object|null} data Response payload for successful calls
 * @param {object|array|null} errors Details about validation or other errors
 * @param {object|null} meta Additional metadata (pagination, traceId, etc.)
 */
function send(res, { status, success, message, data = null, errors = null, meta = null }) {
  return res.status(status).json({ success, message, data, errors, meta });
}

/**
 * Success helper.
 * @param {object} res Express response object
 * @param {object} opts { message, data, meta, statusCode }
 */
function success(res, { message = "Success", data = null, meta = null, statusCode = 200 } = {}) {
  return send(res, {
    status: statusCode,
    success: true,
    message,
    data,
    meta,
  });
}

/**
 * Error helper.
 * @param {object} res Express response object
 * @param {object} opts { message, errors, meta, statusCode }
 */
function error(res, { message, statusCode = 500, errors = null, meta = null }) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(meta && { meta })
  });
}

module.exports = { success, error };
