const User = require("../../shared/models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * Authenticate a user with email + password.
 * Returns tokens + user data on success.
 * Throws a coded error on failure — controller handles audit logging.
 */
exports.loginUser = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    const err = new Error("Invalid credentials");
    err.statusCode = 400;
    err.code = "USER_NOT_FOUND";
    throw err;
  }

  if (!user.isVerified) {
    const err = new Error(
      "User is not verified. Please complete verification.",
    );
    err.statusCode = 403;
    err.code = "USER_NOT_VERIFIED";
    throw err;
  }

    if (user.status !== "active") {
      const err = new Error(
        "Your account has been suspended. Please contact support.",
      );
      err.statusCode = 403;
      err.code = "USER_SUSPENDED";
      throw err;
    }

    const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error("Invalid credentials");
    err.statusCode = 400;
    err.code = "INVALID_PASSWORD";
    throw err;
  }

  const payload = { user: { id: user.id, role: user.role } };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

  const isFirstTime = user.isFirstTime;
  if (user.isFirstTime) user.isFirstTime = false;
  user.refreshToken = refreshToken;
  await user.save();

  return {
    token,
    refreshToken,
    userData: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      isFirstTime,
    },
  };
};

/**
 * Verify a refresh token and issue a new access token.
 */
exports.refreshAccessToken = async (refreshToken) => {
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.user.id);
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 401;
    throw err;
  }

  const payload = { user: { id: user.id, role: user.role } };
  const newToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  return { newToken };
};

/**
 * Clear the stored refresh token for a user on logout.
 */
exports.logoutUser = async (userId) => {
  const user = await User.findById(userId);
  if (user) {
    user.refreshToken = null;
    await user.save();
  }
};
