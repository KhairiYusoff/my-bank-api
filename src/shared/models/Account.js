const mongoose = require("mongoose");
const { ACCOUNT_STATUS_VALUES } = require("../constants/accounts");
const { ACCOUNT_TYPE_VALUES } = require("../constants/user");

function isFixedDeposit() {
  return this.accountType === "fixed_deposit";
}

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
    enum: ACCOUNT_TYPE_VALUES,
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
    required: isFixedDeposit,
  },
  maturityDate: {
    type: Date,
    required: isFixedDeposit,
  },
  linkedAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: isFixedDeposit,
  },
  principal: {
    type: Number,
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