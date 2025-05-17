const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        // Authentication Actions
        "LOGIN",
        "LOGOUT",
        "LOGIN_FAILED",
        "PASSWORD_CHANGE",
        "PASSWORD_RESET",
        "REFRESH_TOKEN",

        // Profile Actions
        "PROFILE_UPDATE",
        "PROFILE_VERIFICATION",
        "CONTACT_UPDATE",
        "ADDRESS_UPDATE",

        // Account Actions
        "ACCOUNT_CREATION",
        "ACCOUNT_UPDATE",
        "ACCOUNT_CLOSURE",
        "ACCOUNT_FREEZE",
        "ACCOUNT_UNFREEZE",

        // Transaction Actions
        "TRANSACTION_CREATE",
        "TRANSACTION_COMPLETE",
        "TRANSACTION_FAILED",
        "TRANSACTION_REVERSAL",
        "TRANSFER_INITIATED",
        "TRANSFER_COMPLETED",
        "TRANSFER_FAILED",
        "DEPOSIT",
        "WITHDRAWAL",

        // Document Actions
        "DOCUMENT_UPLOAD",
        "DOCUMENT_VERIFICATION",
        "DOCUMENT_REJECTION",
        "DOCUMENT_EXPIRY",

        // Security Actions
        "SECURITY_SETTINGS_UPDATE",
        "2FA_ENABLE",
        "2FA_DISABLE",
        "PIN_CHANGE",
        "SECURITY_QUESTIONS_UPDATE",

        // Notification Actions
        "NOTIFICATION_PREFERENCES_UPDATE",
        "NOTIFICATION_SENT",

        // System Actions
        "SYSTEM_ERROR",
        "MAINTENANCE_MODE",
        "OTHER",
      ],
    },
    details: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED", "PENDING", "CANCELLED", "REVERSED"],
      default: "SUCCESS",
    },
    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "LOW",
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
    relatedEntity: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "relatedEntityModel",
    },
    relatedEntityModel: {
      type: String,
      enum: ["User", "Account", "Transaction", "Document", "Notification"],
    },
    location: {
      country: String,
      city: String,
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: "2dsphere",
      },
    },
    deviceInfo: {
      type: {
        type: String,
        enum: ["MOBILE", "TABLET", "DESKTOP", "OTHER"],
      },
      browser: String,
      os: String,
      version: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for faster queries
ActivityLogSchema.index({ createdAt: -1 });
ActivityLogSchema.index({ action: 1, createdAt: -1 });
ActivityLogSchema.index({ user: 1, action: 1 });
ActivityLogSchema.index({ status: 1, severity: 1 });
ActivityLogSchema.index({ "location.coordinates": "2dsphere" });

// Add a method to format the log entry
ActivityLogSchema.methods.format = function () {
  return {
    id: this._id,
    user: this.user,
    action: this.action,
    details: this.details,
    status: this.status,
    severity: this.severity,
    ipAddress: this.ipAddress,
    userAgent: this.userAgent,
    metadata: this.metadata,
    relatedEntity: this.relatedEntity,
    location: this.location,
    deviceInfo: this.deviceInfo,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Add a method to check if the action requires immediate attention
ActivityLogSchema.methods.requiresAttention = function () {
  return (
    this.severity === "HIGH" ||
    this.severity === "CRITICAL" ||
    this.status === "FAILED" ||
    this.action.includes("SECURITY")
  );
};

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);
