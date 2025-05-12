const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: function () {
        return this.role === "customer";
      },
    },
    identityNumber: {
      type: String,
      unique: true,
      required: function () {
        return this.role === "customer";
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["customer", "banker", "admin"],
      default: "customer",
    },
    address: {
      street: {
        type: String,
        required: function () {
          return this.role === "customer";
        },
      },
      city: {
        type: String,
        required: function () {
          return this.role === "customer";
        },
      },
      state: {
        type: String,
        required: function () {
          return this.role === "customer";
        },
      },
      postalCode: {
        type: String,
        required: function () {
          return this.role === "customer";
        },
      },
    },
    dateOfBirth: {
      type: Date,
      required: function () {
        return this.role === "customer";
      },
    },
    job: {
      type: String,
      required: function () {
        return this.role === "customer";
      },
    },
    age: {
      type: Number,
      required: function () {
        return this.role === "customer";
      },
    },
    nationality: {
      type: String,
      required: function () {
        return this.role === "customer";
      },
    },
    accountType: {
      type: String,
      enum: ["savings", "current", "fixed deposit"],
      required: function () {
        return this.role === "customer";
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
        return this.role === "customer";
      },
    },
    employmentType: {
      type: String,
      enum: ["salaried", "self-employed", "unemployed", "retired", "student"],
      required: function () {
        return this.role === "customer";
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
        return this.role === "customer";
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
        return this.role === "customer";
      },
    },
    nextOfKin: {
      name: {
        type: String,
        required: function () {
          return this.role === "customer";
        },
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
          "other",
        ],
        required: function () {
          return this.role === "customer";
        },
      },
      phone: {
        type: String,
        required: function () {
          return this.role === "customer";
        },
      },
    },
    maritalStatus: {
      type: String,
      enum: ["single", "married", "divorced", "widowed"],
      required: function () {
        return this.role === "customer";
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
        return this.role === "customer";
      },
    },
    residencyStatus: {
      type: String,
      enum: ["citizen", "permanent resident", "foreigner"],
      required: function () {
        return this.role === "customer";
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
