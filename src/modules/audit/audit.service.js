const ActivityLog = require("../../shared/models/ActivityLog");
const jwt = require("jsonwebtoken");
const User = require("../../shared/models/User");
const mongoose = require("mongoose");

// Core activity types with their configurations
const ACTIVITY_TYPES = {
  // Critical Security Events
  CUSTOMER_APPLICATION: {
    severity: "HIGH",
    getUserId: async (req, data) => {
      // For new applications, the user ID will be in the response data
      if (data?.data?.userId) {
        return new mongoose.Types.ObjectId(data.data.userId);
      }
      // Try to find user by email if not in response
      if (req.body?.email) {
        const user = await User.findOne({ email: req.body.email });
        return user?._id;
      }
      return null;
    },
  },

  CUSTOMER_REGISTRATION: {
    severity: "HIGH",
    getUserId: async (req, data) => {
      // Try to get user ID from response data first
      if (data?.data?.userId) {
        return new mongoose.Types.ObjectId(data.data.userId);
      }
      // Fallback to finding user by email
      const user = await User.findOne({ email: req.body.email });
      return user?._id;
    },
  },
  LOGIN: {
    severity: "HIGH",
    getUserId: async (req, data) => {
      // FIX: Extract ID from the 'user' object in response data
      if (data?.data?.user?.id) {
        return data.data.user.id;
      }
      // Fallback: If not in response, try to find by email in request body
      if (req.body?.email) {
        const user = await User.findOne({ email: req.body.email });
        return user?._id;
      }
      return null;
    },
  },
  LOGIN_FAILED: {
    severity: "HIGH",
    getUserId: async (req) => {
      // Find the user who attempted to login
      if (req.body?.email) {
        const user = await User.findOne({ email: req.body.email });
        return user?._id;
      }
      return null;
    },
  },
  LOGOUT: {
    severity: "MEDIUM",
    getUserId: (req) => req.user?.id,
  },

  // Critical Financial Events
  DEPOSIT: {
    severity: "HIGH",
    getUserId: (req) => req.user?.id,
  },
  WITHDRAW: {
    severity: "HIGH",
    getUserId: (req) => req.user?.id,
  },
  AIRDROP: {
    severity: "HIGH",
    getUserId: (req) => req.user?.id,
  },
  TRANSACTION_COMPLETE: {
    severity: "HIGH",
    getUserId: (req) => req.user?.id,
  },
  TRANSFER_INITIATED: {
    severity: "HIGH",
    getUserId: (req) => req.user?.id,
  },

  // Critical Account Events
  ACCOUNT_CREATION: {
    severity: "HIGH",
    getUserId: (req) => req.user?.id,
  },
  ACCOUNT_CLOSURE: {
    severity: "CRITICAL",
    getUserId: (req) => req.user?.id,
  },
  PROFILE_UPDATED: {
    severity: "MEDIUM",
    getUserId: (req) => req.user?.id,
  },
  PASSWORD_CHANGED: {
    severity: "HIGH",
    getUserId: (req) => req.user?.id,
  },
  PREFERENCES_UPDATED: {
    severity: "LOW",
    getUserId: (req) => req.user?.id,
  },

  // V2 Onboarding Flow
  APPROVE_APPLICATION: {
    severity: "HIGH",
    getUserId: (req) => req.user?.id,
  },
  VERIFY_CUSTOMER: {
    severity: "HIGH",
    getUserId: (req) => req.user?.id,
  },

  // User completes their profile
  PROFILE_COMPLETED: {
    severity: "HIGH",
    getUserId: (req) => req.user?.id || req.body.userId,
  },

  // Admin Actions
  CREATE_STAFF: {
    severity: "HIGH",
    getUserId: (req) => req.user?.id,
  },
  VIEW_APPLICATIONS: {
    severity: "LOW",
    getUserId: (req) => req.user?.id,
  },
  DELETE_STAFF: {
    severity: "CRITICAL",
    getUserId: (req) => req.user?.id,
  },
  DELETE_CUSTOMER: {
    severity: "CRITICAL",
    getUserId: (req) => req.user?.id,
  },
  UPDATE_STAFF: {
    severity: "MEDIUM",
    getUserId: (req) => req.user?.id,
  },
  UPDATE_CUSTOMER: {
    severity: "MEDIUM",
    getUserId: (req) => req.user?.id,
  },
};

const logActivity = async (req, res, action, details = "") => {
  try {
    const activityConfig = ACTIVITY_TYPES[action];
    if (!activityConfig) {
      console.error(`Unknown activity type: ${action}`);
      return;
    }

    const userId = await activityConfig.getUserId(req, res.locals.responseData);

    // For some activities like CUSTOMER_APPLICATION, userId might be null if user doesn't exist
    if (!userId && action !== "CUSTOMER_APPLICATION" && action !== "LOGIN_FAILED") {
      console.error(`Could not determine user ID for activity: ${action}`);
      return;
    }

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

    await activityLog.save();
  } catch (error) {
    console.error("Error logging activity:", error);
  }
};

/**
 * Express middleware factory for recording audit log entries.
 * Intercepts res.json to capture the response payload before async logging.
 */
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
  logActivity,
  ACTIVITY_TYPES,
};
