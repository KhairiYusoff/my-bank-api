const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Only Admins Can Create Other Admins & Bankers
exports.createStaff = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Ensure only valid roles can be assigned
  const validRoles = ["admin", "banker"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ msg: "Invalid role assignment" });
  }

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ msg: "User with this email already exists" });
    }

    user = new User({
      name,
      email,
      password,
      role,
      isVerified: true,
    });

    await user.save();
    res.status(201).json({ msg: `${role} created successfully.` });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error. Please try again later." });
  }
};
