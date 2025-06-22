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
        // Critical Security Events
        "CUSTOMER_APPLICATION",
        "CUSTOMER_REGISTRATION",
        "LOGIN",
        "LOGOUT",
        "LOGIN_FAILED",

        // Critical Financial Events
        "DEPOSIT",
        "WITHDRAW",
        "AIRDROP",
        "TRANSACTION_COMPLETE",
        "TRANSFER_INITIATED",
        "TRANSFER_COMPLETED",
        "TRANSFER_FAILED",

        // Critical Account Events
        "ACCOUNT_CREATION",
        "ACCOUNT_CLOSURE",

        // V2 Onboarding Flow
        "APPROVE_APPLICATION",
        "VERIFY_CUSTOMER",
        "PROFILE_COMPLETED",
        
        // Admin Actions
        "VIEW_APPLICATIONS",
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
      enum: ["SUCCESS", "FAILED"],
      default: "SUCCESS",
    },
    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM",
    },
    metadata: {
      method: String,
      path: String,
      statusCode: Number,
      responseTime: Number,
    },
    relatedEntity: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "relatedEntityModel",
    },
    relatedEntityModel: {
      type: String,
      enum: ["User", "Account", "Transaction"],
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
    this.status === "FAILED"
  );
};

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);
