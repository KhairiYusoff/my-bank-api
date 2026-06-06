const mongoose = require("mongoose");

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
    enum: ["Active", "Dormant", "Closed"],
    default: "Active",
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
