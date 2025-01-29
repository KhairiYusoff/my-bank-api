require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src/models/User"); // ✅ Use correct path to User model
const connectDB = require("../src/config/db"); // ✅ Reuse existing DB connection

// Connect to MongoDB
connectDB();

const createAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ email: "admin@example.com" });
    if (existingAdmin) {
      console.log("Admin user already exists!");
      mongoose.connection.close();
      return;
    }

    const admin = new User({
      name: "Super Admin",
      email: "admin@example.com",
      password: "Admin123!",
      role: "admin",
      isVerified: true,
    });

    await admin.save();
    console.log("✅ Admin user created successfully!");
  } catch (err) {
    console.error("❌ Error creating admin user:", err);
  } finally {
    mongoose.connection.close();
  }
};

// Run script
createAdmin();
