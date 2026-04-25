const mongoose = require("mongoose");

const AiAuditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  tool: {
    type: String,
    required: true,
    enum: [
      "getSpendingBreakdown",
      "getTransactionHistory",
      "getAccountSummary",
      "getUserProfile",
      "getActivitySummary",
    ],
  },
  inputSummary: {
    type: String,
    maxlength: 500,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

module.exports = mongoose.model("AiAuditLog", AiAuditLogSchema);
