const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true
  },
  type: {
    type: String,
    enum: ["deposit", "withdrawal", "airdrop", "transfer"],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: String,
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "completed"
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// Indexes for faster queries
TransactionSchema.index({ account: 1 }); // Account transactions
TransactionSchema.index({ performedBy: 1 }); // User transactions
TransactionSchema.index({ type: 1 }); // Transaction type filters
TransactionSchema.index({ status: 1 }); // Status filters
TransactionSchema.index({ amount: 1 }); // Amount-based queries
TransactionSchema.index({ date: -1 }); // Recent transactions
TransactionSchema.index({ account: 1, date: -1 }); // Account history

module.exports = mongoose.model("Transaction", TransactionSchema);
