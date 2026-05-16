const User = require("../../shared/models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { success, error } = require("../../shared/utils/response");
const { checkUserExists, checkToken } = require("../../shared/utils/validation.helpers");
const { notifyNewApplication } = require("../../shared/services/websocket.service");
const { logActivity } = require("../audit/audit.service");

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    
    if (!user) {
      await logActivity(req, res, "LOGIN_FAILED", `Login attempt failed: User with email ${email} not found`);
      return error(res, { message: "Invalid credentials", statusCode: 400 });
    }

    if (!user.isVerified) {
      await logActivity(req, res, "LOGIN_FAILED", `Login attempt failed: User ${email} is not verified`);
      return error(res, { message: "User is not verified. Please complete verification.", statusCode: 403 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await logActivity(req, res, "LOGIN_FAILED", `Login attempt failed: Invalid password for user ${email}`);
      return error(res, { message: "Invalid credentials", statusCode: 400 });
    }

    const payload = { 
      user: { 
        id: user.id,
        role: user.role 
      } 
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

    user.refreshToken = refreshToken;
    const isFirstTime = user.isFirstTime;
    if (user.isFirstTime) {
      user.isFirstTime = false;
    }
    await user.save();

    // httpOnly + SameSite flags differ in prod vs dev — cross-domain cookies require sameSite:'none' + secure:true
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction, // HTTPS required in production
      sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-domain
      maxAge: 3600000, // 1 hour
      path: '/'
      // No domain - let browser handle it
    };

    res.cookie('access_token', token, cookieOptions);
    res.cookie('refresh_token', refreshToken, {
      ...cookieOptions,
      maxAge: 604800000 // 7 days
    });

    return success(res, {
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          isFirstTime,
        },
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;
  const tokenError = checkToken(res, refreshToken, 'refresh token');
  if (tokenError) return tokenError;

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.user.id);
    const userError = checkUserExists(res, user);
    if (userError) return userError;

    const payload = { 
      user: { 
        id: user.id,
        role: user.role 
      } 
    };
    const newToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Simplified cookie settings for development
    res.cookie('access_token', newToken, {
      httpOnly: true,
      secure: false, // Disable secure for localhost
      sameSite: 'lax', // More relaxed setting for development
      maxAge: 3600000, // 1 hour
      path: '/', // Explicitly set path
    });

    return success(res, { message: "Token refreshed" });
  } catch (err) {
    return error(res, { message: "Invalid refresh token", statusCode: 401 });
  }
};

exports.logout = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      domain: isProduction ? process.env.COOKIE_DOMAIN : 'localhost',
      path: '/',
      httpOnly: true,
      secure: isProduction
    };
    
    res.clearCookie('access_token', cookieOptions);
    res.clearCookie('refresh_token', cookieOptions);
    return success(res, { message: "Logged out successfully." });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

exports.checkToken = async (req, res) => {
  return success(res, { message: "Token is valid", data: { user: req.user } });
};
