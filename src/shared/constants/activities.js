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
  ACCOUNT_REQUEST: { severity: SEVERITY_LEVELS.HIGH, getUserId: (req) => req.user?.id },
  ACCOUNT_SUSPENDED: { severity: SEVERITY_LEVELS.HIGH, getUserId: (req) => req.user?.id },
  ACCOUNT_REACTIVATED: { severity: SEVERITY_LEVELS.MEDIUM, getUserId: (req) => req.user?.id },
  VIEW_DASHBOARD: { severity: SEVERITY_LEVELS.LOW, getUserId: (req) => req.user?.id },
};

const ACTIVITY_ACTIONS = Object.freeze(
  Object.keys(ACTIVITY_TYPES).reduce(
    (actions, action) => ({ ...actions, [action]: action }),
    {},
  ),
);
const ACTIVITY_ACTION_VALUES = Object.values(ACTIVITY_ACTIONS);
const ACTIVITY_DETAILS = Object.freeze({
  [ACTIVITY_ACTIONS.ACCOUNT_CREATION]: "Banker created a new account",
  [ACTIVITY_ACTIONS.ACCOUNT_CLOSURE]: "Banker deleted an account",
  [ACTIVITY_ACTIONS.DEPOSIT]: "Deposit made to account",
  [ACTIVITY_ACTIONS.WITHDRAW]: "Withdrawal from account",
  [ACTIVITY_ACTIONS.AIRDROP]: "Admin airdropped funds",
  [ACTIVITY_ACTIONS.VIEW_ACCOUNT_DETAIL]: "Staff viewed account detail",
  [ACTIVITY_ACTIONS.ACCOUNT_STATUS_CHANGED]: "Account status changed",
  [ACTIVITY_ACTIONS.UPDATE_OVERDRAFT_LIMIT]: "Staff updated overdraft limit",
  [ACTIVITY_ACTIONS.ACCOUNT_REQUEST]: "Customer requested new account",
  [ACTIVITY_ACTIONS.APPROVE_ACCOUNT_REQUEST]: "Banker approved account request",
  [ACTIVITY_ACTIONS.REJECT_ACCOUNT_REQUEST]: "Banker rejected account request",
  [ACTIVITY_ACTIONS.ACCOUNT_SUSPENDED]: "Banker suspended an account",
  [ACTIVITY_ACTIONS.ACCOUNT_REACTIVATED]: "Banker reactivated an account",
  [ACTIVITY_ACTIONS.ACCOUNT_CLOSE_REQUESTED]: "Customer requested account closure",
  [ACTIVITY_ACTIONS.ACCOUNT_CLOSED]: "Banker approved account closure",
  [ACTIVITY_ACTIONS.FD_PRINCIPAL_SETTLEMENT]: "Customer settled FD principal",
  [ACTIVITY_ACTIONS.UPDATE_FD_INSTRUCTIONS]: "Customer updated FD instructions",
  [ACTIVITY_ACTIONS.FD_EARLY_WITHDRAWAL]: "Customer withdrew FD principal early",
  [ACTIVITY_ACTIONS.CREATE_STAFF]: "Admin creating new staff",
  [ACTIVITY_ACTIONS.DELETE_STAFF]: "Admin deleted a staff (banker)",
  [ACTIVITY_ACTIONS.DELETE_CUSTOMER]: "Admin deleted a customer",
  [ACTIVITY_ACTIONS.UPDATE_STAFF]: "Admin updated a staff (banker)",
  [ACTIVITY_ACTIONS.UPDATE_CUSTOMER]: "Admin updated a customer status",
  [ACTIVITY_ACTIONS.VIEW_CUSTOMER_PROFILE]: "Staff viewed customer profile",
  [ACTIVITY_ACTIONS.VIEW_STAFF_PROFILE]: "Admin viewed staff profile",
  [ACTIVITY_ACTIONS.LOGIN]: "User login attempt",
  [ACTIVITY_ACTIONS.LOGOUT]: "User logout",
  [ACTIVITY_ACTIONS.CUSTOMER_APPLICATION]: "New customer application submitted",
  [ACTIVITY_ACTIONS.PROFILE_COMPLETED]: "Customer completed profile",
  [ACTIVITY_ACTIONS.VIEW_APPLICATIONS]: "Staff viewing pending applications",
  [ACTIVITY_ACTIONS.APPROVE_APPLICATION]: "Staff approved initial application",
  [ACTIVITY_ACTIONS.VERIFY_CUSTOMER]: "Staff verified customer account",
  [ACTIVITY_ACTIONS.TRANSFER_INITIATED]: "Funds transfer initiated",
  [ACTIVITY_ACTIONS.PROFILE_UPDATED]: "User updated their profile",
  [ACTIVITY_ACTIONS.PASSWORD_CHANGED]: "User changed their password",
  [ACTIVITY_ACTIONS.PREFERENCES_UPDATED]: "User updated preferences",
  [ACTIVITY_ACTIONS.VIEW_DASHBOARD]: "Staff viewed dashboard",
});
const ACTIVITY_STATUS_VALUES = Object.values(ACTIVITY_STATUS);
const SEVERITY_LEVEL_VALUES = Object.values(SEVERITY_LEVELS);
const AUDIT_ENTITY_TYPE_VALUES = Object.values(AUDIT_ENTITY_TYPES);

module.exports = {
  ACTIVITY_TYPES,
  ACTIVITY_ACTIONS,
  ACTIVITY_ACTION_VALUES,
  ACTIVITY_DETAILS,
  ACTIVITY_STATUS,
  ACTIVITY_STATUS_VALUES,
  SEVERITY_LEVELS,
  SEVERITY_LEVEL_VALUES,
  AUDIT_ENTITY_TYPES,
  AUDIT_ENTITY_TYPE_VALUES,
};