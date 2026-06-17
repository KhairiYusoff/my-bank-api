const mongoose = require("mongoose");
const { ACCOUNT_STATUS_VALUES } = require("../constants/accountStatus");

const AccountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true,
  },
  accountType: {
    type: String,
    enum: ["savings", "current", "business", "fixed_deposit"],
    required: false,
  },
  branch: {
    type: String,
    required: false,
  },
  balance: {
    type: Number,
    default: 0,
  },
  interestRate: {
    type: Number,
  },
  currency: {
    type: String,
    enum: ["MYR"],
    default: "MYR",
  },
  status: {
    type: String,
    enum: ACCOUNT_STATUS_VALUES,
    default: "active",
  },
  statusUpdatedDate: {
    type: Date,
    default: Date.now,
  },
  dateOpened: {
    type: Date,
    default: Date.now,
  },
  dateClosed: {
    type: Date,
  },
  overdraftLimit: {
    type: Number,
    default: 0,
  },
  minimumBalance: {
    type: Number,
    default: 0,
  },
  // Fixed Deposit fields
  lockPeriod: {
    type: Number,
    enum: [1, 3, 6, 12],
    required: function () {
      return this.accountType === "fixed_deposit";
    },
  },
  maturityDate: {
    type: Date,
    required: function () {
      return this.accountType === "fixed_deposit";
    },
  },
  linkedAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: function () {
      return this.accountType === "fixed_deposit";
    },
  },
  principal: {
    type: Number,
    required: function () {
      return this.accountType === "fixed_deposit";
    },
  },
  autoRenew: {
    type: Boolean,
    default: false,
  },
  interestPaid: {
    type: Boolean,
    default: false,
  },
  lastMaturityProcessed: {
    type: Date,
  },
  // Business field
  companyRegistrationDoc: {
    type: String,
    required: function () {
      return this.accountType === "business";
    },
  },
});

// Indexes for faster queries
AccountSchema.index({ accountNumber: 1 }); // Unique account numbers
AccountSchema.index({ user: 1 }); // User's accounts lookup
AccountSchema.index({ status: 1 }); // Filter by status
AccountSchema.index({ accountType: 1 }); // Filter by account type
AccountSchema.index({ branch: 1 }); // Filter by branch
AccountSchema.index({ dateOpened: -1 }); // Recent accounts
AccountSchema.index({ balance: 1 }); // Balance queries

module.exports = mongoose.model("Account", AccountSchema);