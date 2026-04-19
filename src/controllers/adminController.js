const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { success, error } = require("../utils/response");

// Only Admins Can Create Other Admins & Bankers
exports.createStaff = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Ensure only valid roles can be assigned
  const validRoles = ["admin", "banker"];
  if (!validRoles.includes(role)) {
    return error(res, { message: "Invalid role assignment", statusCode: 400 });
  }

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return error(res, {
        message: "User with this email already exists",
        statusCode: 400,
      });
    }

    user = new User({
      name,
      email,
      password,
      role,
      isVerified: true,
      isProfileComplete: true, // Staff should have complete profiles
    });

    await user.save();
    return success(res, {
      message: `${role} created successfully.`,
      statusCode: 201,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
