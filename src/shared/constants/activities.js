const mongoose = require("mongoose");
const User = require("../models/User");

const ACTIVITY_STATUS = {
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
};

const SEVERITY_LEVELS = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
};

const AUDIT_ENTITY_TYPES = {
  USER: "User",
  ACCOUNT: "Account",
  TRANSACTION: "Transaction",
};

const ACTIVITY_TYPES = {
  // ── Critical Security Events ────────────────────────────────────────
  CUSTOMER_APPLICATION: {
    severity: SEVERITY_LEVELS.HIGH,
    getUserId: async (req, data) => {
      if (data?.data?.userId) return new mongoose.Types.ObjectId(data.data.userId);
      if (req.body?.email) {
        const user = await User.findOne({ email: req.body.email });
        return user?._id;
      }
      return null;
    },
  },
  CUSTOMER_REGISTRATION: {
    severity: SEVERITY_LEVELS.HIGH,
    getUserId: async (req, data) => {
      if (data?.data?.userId) return new mongoose.Types.ObjectId(data.data.userId);
      if (req.body?.email) {
        const user = await User.findOne({ email: req.body.email });
        return user?._id;
      }
      return null;
    },
  },
  LOGIN: {
    severity: SEVERITY_LEVELS.HIGH,
    getUserId: async (req, data) => {
      if (data?.data?.user?.id) return data.data.user.id;
      if (req.body?.email) {
        const user = await User.findOne({ email: req.body.email });
        return user?._id;
      }
      return null;
    },
  },
  LOGIN_FAILED: {
    severity: SEVERITY_LEVELS.HIGH,
    getUserId: async (req) => {
      if (req.body?.email) {
        const user = await User.findOne({ email: req.body.email });
        return user?._id;
      }
      return null;
    },
  },
  LOGOUT: {
    severity: SEVERITY_LEVELS.MEDIUM,
    getUserId: (req) => req.user?.id,
  },

  // ── Critical Financial Events ───────────────────────────────────────
  DEPOSIT: { severity: SEVERITY_LEVELS.HIGH, getUserId: (req) => req.user?.id },
  WITHDRAW: { severity: SEVERITY_LEVELS.HIGH, getUserId: (req) => req.user?.id },
  AIRDROP: { severity: SEVERITY_LEVELS.HIGH, getUserId: (req) => req.user?.id },
  TRANSACTION_COMPLETE: { severity: SEVERITY_LEVELS.HIGH, getUserId: (req) => req.user?.id },
  TRANSFER_INITIATED: { severity: SEVERITY_LEVELS.HIGH, getUserId: (req) => req.user?.id },
  TRANSFER_COMPLETED: { severity: SEVERITY_LEVELS.HIGH, getUserId: (req) => req.user?.id },
  TRANSFER_FAILED: { severity: SEVERITY_LEVELS.HIGH, getUserId: (req) => req.user?.id },

  // ── Critical Account Events ─────────────────────────────────────────
  ACCOUNT_CREATION: { severity: SEVERITY_LEVELS.HIGH, getUserId: (req) => req.user?.id },
  ACCOUNT_CLOSURE: { severity: SEVERITY_LEVELS.CRITICAL, getUserId: (req) => req.user?.id },
  ACCOUNT_DORMANT: { severity: SEVERITY_LEVELS.MEDIUM, getUserId: (req) => req.user?.id },
  DORMANCY_WARNING: { severity: SEVERITY_LEVELS.LOW, getUserId: (req) => req.user?.id },
  DORMANCY_FEE_CHARGE: { severity: SEVERITY_LEVELS.MEDIUM, getUserId: (req) => req.user?.id },
  DORMANCY_FEE_WARNING: { severity: SEVERITY_LEVELS.LOW, getUserId: (req) => req.user?.id },

  // ── User Profile and Preferences ────────────────────────────────────
  PROFILE_UPDATED: { severity: SEVERITY_LEVELS.MEDIUM, getUserId: (req) => req.user?.id },
  PASSWORD_CHANGED: { severity: SEVERITY_LEVELS.HIGH, getUserId: (req) => req.user?.id },
  PREFERENCES_UPDATED: { severity: SEVERITY_LEVELS.LOW, getUserId: (req) => req.user?.id },

  // ── V2 Onboarding Flow ──────────────────────────────────────────────
  APPROVE_APPLICATION: { severity: SEVERITY_LEVELS.HIGH, getUserId: (req) => req.user?.id },
  VERIFY_CUSTOMER: { severity: SEVERITY_LEVELS.HIGH, getUserId: (req) => req.user?.id },
  PROFILE_COMPLETED: {
    severity: SEVERITY_LEVELS.HIGH,
    getUserId: (req) => req.user?.id || req.body?.userId,
  },

  APPROVE_ACCOUNT_REQUEST: { severity: SEVERITY_LEVELS.HIGH, getUserId: (req) => req.user?.id },
  REJECT_ACCOUNT_REQUEST: { severity: SEVERITY_LEVELS.HIGH, getUserId: (req) => req.user?.id },
  FD_PRINCIPAL_SETTLEMENT: { severity: SEVERITY_LEVELS.HIGH, getUserId: (req) => req.user?.id },
  UPDATE_FD_INSTRUCTIONS: { severity: SEVERITY_LEVELS.MEDIUM, getUserId: (req) => req.user?.id },
  FD_EARLY_WITHDRAWAL: { severity: SEVERITY_LEVELS.HIGH, getUserId: (req) => req.user?.id },
  ACCOUNT_CLOSE_REQUESTED: { severity: SEVERITY_LEVELS.HIGH, getUserId: (req) => req.user?.id },
  ACCOUNT_CLOSED: { severity: SEVERITY_LEVELS.CRITICAL, getUserId: (req) => req.user?.id },

  // ── Admin Actions ───────────────────────────────────────────────────
  VIEW_APPLICATIONS: { severity: SEVERITY_LEVELS.LOW, getUserId: (req) => req.user?.id },
  DELETE_STAFF: { severity: SEVERITY_LEVELS.CRITICAL, getUserId: (req) => req.user?.id },
  DELETE_CUSTOMER: { severity: SEVERITY_LEVELS.CRITICAL, getUserId: (req) => req.user?.id },
  UPDATE_STAFF: { severity: SEVERITY_LEVELS.MEDIUM, getUserId: (req) => req.user?.id },
  UPDATE_CUSTOMER: { severity: SEVERITY_LEVELS.MEDIUM, getUserId: (req) => req.user?.id },
  VIEW_CUSTOMER_PROFILE: { severity: SEVERITY_LEVELS.LOW, getUserId: (req) => req.user?.id },
  VIEW_STAFF_PROFILE: { severity: SEVERITY_LEVELS.LOW, getUserId: (req) => req.user?.id },
  VIEW_ACCOUNT_DETAIL: { severity: SEVERITY_LEVELS.LOW, getUserId: (req) => req.user?.id },
  ACCOUNT_STATUS_CHANGED: { severity: SEVERITY_LEVELS.HIGH, getUserId: (req) => req.user?.id },
  CREATE_STAFF: { severity: SEVERITY_LEVELS.HIGH, getUserId: (req) => req.user?.id },
  UPDATE_OVERDRAFT_LIMIT: { severity: SEVERITY_LEVELS.HIGH, getUserId: (req) => req.user?.id },
};

const ACTIVITY_ACTION_VALUES = Object.keys(ACTIVITY_TYPES);
const ACTIVITY_STATUS_VALUES = Object.values(ACTIVITY_STATUS);
const SEVERITY_LEVEL_VALUES = Object.values(SEVERITY_LEVELS);
const AUDIT_ENTITY_TYPE_VALUES = Object.values(AUDIT_ENTITY_TYPES);

module.exports = {
  ACTIVITY_TYPES,
  ACTIVITY_ACTION_VALUES,
  ACTIVITY_STATUS,
  ACTIVITY_STATUS_VALUES,
  SEVERITY_LEVELS,
  SEVERITY_LEVEL_VALUES,
  AUDIT_ENTITY_TYPES,
  AUDIT_ENTITY_TYPE_VALUES,
};