const mongoose = require("mongoose");
const { EXPENSE_CATEGORIES, PAYMENT_METHODS } = require("../constants/expense");

const ExpenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      index: true
    },
    
    // Core expense details
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
      max: [999999.99, "Amount cannot exceed 999,999.99"]
    },
    
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: Object.values(EXPENSE_CATEGORIES).map(cat => cat.value),
        message: "Invalid expense category"
      },
      index: true
    },
    
    subCategory: {
      type: String,
      required: false,
      trim: true,
      maxlength: [50, "Subcategory cannot exceed 50 characters"]
    },
    
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [2, "Description must be at least 2 characters"],
      maxlength: [200, "Description cannot exceed 200 characters"]
    },
    
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
      index: true
    },
    
    // Payment and transaction details
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
      enum: {
        values: Object.values(PAYMENT_METHODS).map(method => method.value),
        message: "Invalid payment method"
      },
      index: true
    },
    
    // Manual vs automatic expense tracking
    isManualEntry: {
      type: Boolean,
      default: true,
      index: true
    },
    
    // Future-ready fields for Phase 2
    isRecurring: {
      type: Boolean,
      default: false,
      index: true
    },
    
    recurringPattern: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly", null],
      default: null
    },
    
    // User-defined fields
    tags: [{
      type: String,
      trim: true,
      maxlength: [30, "Tag cannot exceed 30 characters"]
    }],
    
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"]
    },
    
    // Metadata
    location: {
      type: String,
      trim: true,
      maxlength: [100, "Location cannot exceed 100 characters"]
    },
    
    merchant: {
      name: {
        type: String,
        trim: true,
        maxlength: [100, "Merchant name cannot exceed 100 characters"]
      },
      category: {
        type: String,
        trim: true,
        maxlength: [50, "Merchant category cannot exceed 50 characters"]
      }
    },
    
    // Status and soft delete
    status: {
      type: String,
      enum: ["active", "deleted"],
      default: "active",
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Compound indexes for optimal query performance
ExpenseSchema.index({ user: 1, date: -1 }); // User's expenses by date
ExpenseSchema.index({ user: 1, category: 1, date: -1 }); // User's expenses by category and date
ExpenseSchema.index({ user: 1, status: 1, date: -1 }); // User's active expenses by date
ExpenseSchema.index({ account: 1, date: -1 }); // Account expenses by date
ExpenseSchema.index({ paymentMethod: 1, date: -1 }); // Payment method analytics

// Simple pre-save middleware for basic data cleanup
ExpenseSchema.pre("save", function(next) {
  // Basic string trimming
  if (this.description) this.description = this.description.trim();
  if (this.subCategory) this.subCategory = this.subCategory.trim();
  if (this.notes) this.notes = this.notes.trim();
  
  next();
});

// Instance methods
ExpenseSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

ExpenseSchema.methods.isOwner = function(userId) {
  return this.user.toString() === userId.toString();
};

// Simple static method for basic queries
ExpenseSchema.statics.findByUser = function(userId) {
  return this.find({ user: userId, status: 'active' })
    .sort({ date: -1 });
};

module.exports = mongoose.model("Expense", ExpenseSchema);
