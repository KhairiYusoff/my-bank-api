const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

// Register Customer
exports.registerCustomer = async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    name,
    email,
    password,
    phoneNumber = "",
    address = {},
    dateOfBirth = null,
    identityNumber = "",
    job,
    age,
    nationality,
    accountType,
    employerName,
    employmentType,
    salary,
    purposeOfAccount,
    maritalStatus,
    educationLevel,
    residencyStatus,
    nextOfKin = {},
  } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ msg: "User with this email already exists" });
    }

    // If identity number is provided, check if it exists in the DB
    if (identityNumber) {
      let existingIdentity = await User.findOne({ identityNumber });
      if (existingIdentity) {
        return res
          .status(400)
          .json({ msg: "Identity number is already registered" });
      }
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      phoneNumber,
      address,
      dateOfBirth,
      identityNumber,
      role: "customer",
      isVerified: false,
      job,
      age,
      nationality,
      accountType,
      employerName,
      employmentType,
      salary,
      purposeOfAccount,
      maritalStatus,
      educationLevel,
      residencyStatus,
      nextOfKin,
    });
    // Save user to database (Password hashing handled by pre-save hook in User model)
    await user.save();

    const response = {
      msg: "User registered successfully. Please verify your identity.",
      userId: user._id.toString(),
    };
    res.status(201).json(response);
  } catch (err) {
    console.error("Registration error:", err.message);

    if (err.name === "ValidationError") {
      // Handle Mongoose validation errors
      const validationErrors = Object.values(err.errors).map(
        (error) => error.message
      );
      return res
        .status(400)
        .json({ msg: "Invalid user data", errors: validationErrors });
    } else if (err.code === 11000) {
      // Handle duplicate key error (likely email)
      return res.status(400).json({ msg: "Email already in use" });
    } else {
      // Handle other types of errors
      res.status(500).json({ msg: "Server error. Please try again later." });
    }
  }
};

//login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ msg: "User is not verified. Please complete verification." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const payload = { user: { id: user.id } };

    // Generate access token (JWT)
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Generate refresh token and store in database
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

    // Store refresh token in the user document
    user.refreshToken = refreshToken;
    await user.save();

    res.json({ token, refreshToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ msg: "No refresh token provided" });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.user.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Generate a new access token (JWT)
    const payload = { user: { id: user.id } };
    const newToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token: newToken });
  } catch (err) {
    res.status(401).json({ msg: "Invalid refresh token" });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    res.json({ msg: "Logged out successfully." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Check token validity
exports.checkToken = async (req, res) => {
  res.json({ msg: "Token is valid", user: req.user });
};
