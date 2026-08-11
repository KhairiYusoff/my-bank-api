const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const {
  APPLICATION_STATUS_VALUES,
  USER_ROLE_VALUES,
  USER_STATUS_VALUES,
  ACCOUNT_TYPE_VALUES,
  EMPLOYMENT_TYPE_VALUES,
  SALARY_BRACKET_VALUES,
  PURPOSE_OF_ACCOUNT_VALUES,
  RELATIONSHIP_VALUES,
  MARITAL_STATUS_VALUES,
  EDUCATION_LEVEL_VALUES,
  RESIDENCY_STATUS_VALUES,
} = require("../constants/user");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 255,
    },
    phoneNumber: {
      type: String,
      required: function () {
        return this.role === "customer";
      },
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return this.role !== "customer" || this.isVerified;
      },
    },
    identityNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      required: function () {
        return this.role === "customer" && this.isProfileComplete;
      },
    },
    applicationStatus: {
      type: String,
      enum: APPLICATION_STATUS_VALUES,
      default: "pending",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    isFirstTime: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: USER_ROLE_VALUES,
      default: "customer",
    },
    status: {
      type: String,
      enum: USER_STATUS_VALUES,
      default: "active",
    },
    address: {
      street: {
        type: String,
        required: function () {
          return this.role === "customer" && this.isProfileComplete;
        },
      },
      city: {
        type: String,
        required: function () {
          return this.role === "customer" && this.isProfileComplete;
        },
      },
      state: {
        type: String,
        required: function () {
          return this.role === "customer" && this.isProfileComplete;
        },
      },
      postalCode: {
        type: String,
        required: function () {
          return this.role === "customer" && this.isProfileComplete;
        },
      },
    },
    dateOfBirth: {
      type: Date,
      required: function () {
        return this.role === "customer" && this.isProfileComplete;
      },
    },
    job: {
      type: String,
      required: function () {
        return this.role === "customer" && this.isProfileComplete;
      },
    },
    age: {
      type: Number,
      required: function () {
        return this.role === "customer" && this.isProfileComplete;
      },
    },
    nationality: {
      type: String,
      required: function () {
        return this.role === "customer" && this.isProfileComplete;
      },
    },
    accountType: {
      type: String,
      enum: ACCOUNT_TYPE_VALUES,
      required: function () {
        return this.role === "customer" && this.isProfileComplete;
      },
    },
    branch: {
      type: String,
      required: function () {
        return this.role === "customer" && this.isProfileComplete;
      },
    },
    preferences: {
      language: { type: String, default: "en" },
      notifications: { type: Boolean, default: true },
    },
    refreshToken: {
      type: String,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
    employerName: {
      type: String,
      required: function () {
        return this.role === "customer" && this.isProfileComplete;
      },
    },
    employmentType: {
      type: String,
      enum: EMPLOYMENT_TYPE_VALUES,
      required: function () {
        return this.role === "customer" && this.isProfileComplete;
      },
    },
    salary: {
      type: String,
      enum: SALARY_BRACKET_VALUES,
      required: function () {
        return this.role === "customer" && this.isProfileComplete;
      },
    },
    purposeOfAccount: {
      type: String,
      enum: PURPOSE_OF_ACCOUNT_VALUES,
      required: function () {
        return this.role === "customer" && this.isProfileComplete;
      },
    },
    nextOfKin: {
      name: {
        type: String,
        required: function () {
          return this.role === "customer" && this.isProfileComplete;
        },
      },
      phone: {
        type: String,
        required: function () {
          return this.role === "customer" && this.isProfileComplete;
        },
      },
      relationship: {
        type: String,
        enum: RELATIONSHIP_VALUES,
        required: function () {
          return this.role === "customer" && this.isProfileComplete;
        },
      },
    },
    maritalStatus: {
      type: String,
      enum: MARITAL_STATUS_VALUES,
      required: function () {
        return this.role === "customer" && this.isProfileComplete;
      },
    },
    educationLevel: {
      type: String,
      enum: EDUCATION_LEVEL_VALUES,
      required: function () {
        return this.role === "customer" && this.isProfileComplete;
      },
    },
    residencyStatus: {
      type: String,
      enum: RESIDENCY_STATUS_VALUES,
      required: function () {
        return this.role === "customer" && this.isProfileComplete;
      },
    },
  },
  {
    timestamps: true,
  },
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  // Only hash if not already a bcrypt hash
  if (typeof this.password === "string" && this.password.startsWith("$2")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordChangedAt = new Date();
  next();
});

// Indexes for faster queries
UserSchema.index({ email: 1 }); // Login queries
UserSchema.index({ phoneNumber: 1 }); // Phone lookups
UserSchema.index({ role: 1 }); // Role-based queries
UserSchema.index({ applicationStatus: 1 }); // Application filters
UserSchema.index({ isVerified: 1 }); // Verified users
UserSchema.index({ isProfileComplete: 1 }); // Profile completion
UserSchema.index({ createdAt: -1 }); // Recent users
UserSchema.index({ name: "text" }); // Name search

module.exports = mongoose.model("User", UserSchema);
