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
