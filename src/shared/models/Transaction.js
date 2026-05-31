const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  type: {
    type: String,
    enum: ["deposit", "withdrawal", "airdrop", "transfer"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: String,
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "completed",
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  reference: {
    type: String,
    unique: true,
    sparse: true,
  },
  memo: {
    type: String,
    maxlength: 255,
  },
  fee: {
    type: Number,
    default: 0,
  },
  balanceBefore: {
    type: Number,
  },
  balanceAfter: {
    type: Number,
  },
  currency: {
    type: String,
    default: "MYR",
  },
  channel: {
    type: String,
    enum: ["web", "branch", "mobile", "api", "system"],
  },
  deviceInfo: {
    ip: { type: String },
    userAgent: { type: String },
  },
  processingTime: {
    submittedAt: { type: Date },
    completedAt: { type: Date },
  },
  counterpartAccount: {
    type: String,
  },
  counterpartNameRaw: {
    type: String,
  },
  counterpartName: {
    type: String,
  },
  isNewRecipient: {
    type: Boolean,
    default: false,
  },
  direction: {
    type: String,
    enum: ["debit", "credit"],
  },
  twoFactorVerified: {
    type: Boolean,
    default: null,
  },
  riskFlags: {
    type: Array,
    default: [],
  },
  isReversed: {
    type: Boolean,
    default: false,
  },
  reversalOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
    default: null,
  },
});

TransactionSchema.index({ account: 1 });
TransactionSchema.index({ performedBy: 1 });
TransactionSchema.index({ type: 1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ amount: 1 });
TransactionSchema.index({ date: -1 });
TransactionSchema.index({ account: 1, date: -1 });
TransactionSchema.index({ reference: 1 });
TransactionSchema.index({ account: 1, counterpartAccount: 1 });
TransactionSchema.index({ reversalOf: 1 }, { sparse: true });

module.exports = mongoose.model("Transaction", TransactionSchema);
