const ActivityLog = require("../models/ActivityLog");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const mongoose = require("mongoose");

// Core activity types with their configurations
const ACTIVITY_TYPES = {
  // Critical Security Events
  CUSTOMER_REGISTRATION: {
    severity: "HIGH",
    getUserId: async (req, data) => {
      // Try to get user ID from response data first
      if (data?.userId) {
        // Convert string ID to ObjectId
        return new mongoose.Types.ObjectId(data.userId);
      }
      // Fallback to finding user by email
      const user = await User.findOne({ email: req.body.email });
      return user?._id;
    },
  },
  LOGIN: {
    severity: "HIGH",
    getUserId: async (req, data) => {
      if (data.token) {
        const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
        return decoded.user.id;
      }
      return null;
    },
  },
  LOGOUT: {
    severity: "MEDIUM",
    getUserId: (req) => req.user.id,
  },

  // Critical Financial Events
  TRANSACTION_CREATE: {
    severity: "HIGH",
    getUserId: (req) => req.user.id,
  },
  TRANSACTION_COMPLETE: {
    severity: "HIGH",
    getUserId: (req) => req.user.id,
  },
  TRANSFER_INITIATED: {
    severity: "HIGH",
    getUserId: (req) => req.user.id,
  },

  // Critical Account Events
  ACCOUNT_CREATION: {
    severity: "HIGH",
    getUserId: (req) => req.user.id,
  },
  ACCOUNT_CLOSURE: {
    severity: "CRITICAL",
    getUserId: (req) => req.user.id,
  },
};

// Main logging function
const logActivity = async (req, res, action, details = "") => {
  try {
    const activityConfig = ACTIVITY_TYPES[action];
    if (!activityConfig) {
      console.error(`Unknown activity type: ${action}`);
      return;
    }

    // Get user ID based on activity type
    const userId = await activityConfig.getUserId(req, res.locals.responseData);

    if (!userId) {
      console.error(`Could not determine user ID for activity: ${action}`);
      return;
    }

    // Create activity log
    const activityLog = new ActivityLog({
      user: userId,
      action,
      details,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers["user-agent"],
      status:
        res.statusCode >= 200 && res.statusCode < 300 ? "SUCCESS" : "FAILED",
      severity: activityConfig.severity,
      metadata: {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        responseTime: Date.now() - req._startTime,
      },
    });

    const savedLog = await activityLog.save();
  } catch (error) {
    console.error("Error logging activity:", error);
  }
};

// Middleware factory
const activityLogger = (action, details = "") => {
  return async (req, res, next) => {
    try {
      const originalJson = res.json;
      res.json = function (data) {
        res.locals.responseData = data;
        originalJson.call(this, data);
        logActivity(req, res, action, details);
      };
      req._startTime = Date.now();
      next();
    } catch (error) {
      console.error("Error in activityLogger middleware:", error);
      next();
    }
  };
};

module.exports = {
  activityLogger,
  ACTIVITY_TYPES,
};
