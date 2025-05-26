const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 255
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: function() {
        return this.role !== 'customer' || this.isVerified;
      }
    },
    identityNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      required: function () {
        return this.role === "customer" && this.isProfileComplete;
      }
    },
    applicationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "on_hold"],
      default: "pending"
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    isProfileComplete: {
      type: Boolean,
      default: false
    },
    role: {
      type: String,
      enum: ["customer", "banker", "admin"],
      default: "customer"
    },
    address: {
      street: { 
        type: String,
        required: function() {
          return this.role === "customer" && this.isProfileComplete;
        }
      },
      city: { 
        type: String,
        required: function() {
          return this.role === "customer" && this.isProfileComplete;
        }
      },
      state: { 
        type: String,
        required: function() {
          return this.role === "customer" && this.isProfileComplete;
        }
      },
      postalCode: { 
        type: String,
        required: function() {
          return this.role === "customer" && this.isProfileComplete;
        }
      }
    },
    dateOfBirth: {
      type: Date,
      required: function () {
        return this.role === "customer" && this.isProfileComplete;
      }
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
      enum: ["savings", "current", "fixed deposit"],
      required: function () {
        return this.role === "customer" && this.isProfileComplete;
      },
    },
    preferences: {
      theme: { type: String, default: "light" },
      language: { type: String, default: "en" },
      notifications: { type: Boolean, default: true },
    },
    refreshToken: {
      type: String,
    },
    employerName: {
      type: String,
      required: function () {
        return this.role === "customer" && this.isProfileComplete;
      },
    },
    employmentType: {
      type: String,
      enum: ["salaried", "self-employed", "unemployed", "retired", "student"],
      required: function () {
        return this.role === "customer" && this.isProfileComplete;
      },
    },
    salary: {
      type: String,
      enum: [
        "<1000",
        "1000-2999",
        "3000-4999",
        "5000-6999",
        "7000-9999",
        "10000+",
      ],
      required: function () {
        return this.role === "customer" && this.isProfileComplete;
      },
    },
    purposeOfAccount: {
      type: String,
      enum: [
        "savings",
        "salary credit",
        "investment",
        "business",
        "education",
        "travel",
        "others",
      ],
      required: function () {
        return this.role === "customer" && this.isProfileComplete;
      },
    },
    nextOfKin: {
      name: { 
        type: String,
        required: function() {
          return this.role === "customer" && this.isProfileComplete;
        }
      },
      phone: { 
        type: String,
        required: function() {
          return this.role === "customer" && this.isProfileComplete;
        }
      },
      relationship: {
        type: String,
        enum: [
          "parent",
          "spouse",
          "child",
          "sibling",
          "relative",
          "friend",
          "other"
        ],
        required: function() {
          return this.role === "customer" && this.isProfileComplete;
        }
      }
    },
    maritalStatus: {
      type: String,
      enum: ["single", "married", "divorced", "widowed"],
      required: function () {
        return this.role === "customer" && this.isProfileComplete;
      },
    },
    educationLevel: {
      type: String,
      enum: [
        "none",
        "primary",
        "secondary",
        "diploma",
        "degree",
        "postgraduate",
      ],
      required: function () {
        return this.role === "customer" && this.isProfileComplete;
      },
    },
    residencyStatus: {
      type: String,
      enum: ["citizen", "permanent resident", "foreigner"],
      required: function () {
        return this.role === "customer" && this.isProfileComplete;
      },
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model("User", UserSchema);
