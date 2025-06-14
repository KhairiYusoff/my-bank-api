const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const { notifyNewApplication } = require("../services/websocketService");
const { success, error } = require("../utils/response");

// Public application for new customers
exports.apply = async (req, res) => {
  // Validate input
  const errorsResult = validationResult(req);
  if (!errorsResult.isEmpty()) {
    return error(res, {
      message: "Validation failed",
      errors: errorsResult.array(),
      statusCode: 400,
    });
  }

  const { name, email, phoneNumber } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (user) {
      const duplicateMsg =
        user.email === email
          ? "An application with this email already exists"
          : "An application with this phone number already exists";
      return error(res, { message: duplicateMsg, statusCode: 400 });
    }

    // Create initial application with basic info
    user = new User({
      name,
      email,
      phoneNumber,
      role: "customer",
      isVerified: false,
      isProfileComplete: false,
      applicationStatus: "pending", // Track application status
    });
    // Save user to database (Password hashing handled by pre-save hook in User model)
    await user.save();

    // Notify staff about new application
    notifyNewApplication(user);

    return success(res, {
      message: "Application submitted successfully. A bank representative will contact you.",
      data: { userId: user._id.toString() },
      statusCode: 201,
    });
  } catch (err) {
    console.error("Registration error:", err.message);

    if (err.name === "ValidationError") {
      // Handle Mongoose validation errors
      const validationErrors = Object.values(err.errors).map(
        (error) => error.message
      );
      return error(res, {
        message: "Invalid user data",
        errors: validationErrors,
        statusCode: 400,
      });
    } else if (err.code === 11000) {
      // Handle duplicate key error (likely email)
      return error(res, { message: "Email already in use", statusCode: 400 });
    } else {
      // Handle other types of errors
      return error(res, { message: "Server error. Please try again later.", statusCode: 500 });
    }
  }
};

//login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return error(res, { message: "Invalid credentials", statusCode: 400 });
    }

    if (!user.isVerified) {
      return error(res, { message: "User is not verified. Please complete verification.", statusCode: 403 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return error(res, { message: "Invalid credentials", statusCode: 400 });
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

    return success(res, {
      message: "Login successful",
      data: {
        token,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return error(res, { message: "No refresh token provided", statusCode: 401 });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.user.id);

    if (!user) {
      return error(res, { message: "User not found", statusCode: 404 });
    }

    // Generate a new access token (JWT)
    const payload = { user: { id: user.id } };
    const newToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return success(res, { message: "Token refreshed", data: { token: newToken } });
  } catch (err) {
    return error(res, { message: "Invalid refresh token", statusCode: 401 });
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
    return success(res, { message: "Logged out successfully." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Check token validity
exports.checkToken = async (req, res) => {
  return success(res, { message: "Token is valid", data: { user: req.user } });
};
