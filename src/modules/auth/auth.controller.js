const { success, error } = require("../../shared/utils/response");
const { checkToken } = require("../../shared/utils/validation.helpers");
const { logActivity } = require("../audit/audit.service");
const authService = require("./auth.service");

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { token, refreshToken, userData } = await authService.loginUser(
      email,
      password,
    );

    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 3600000,
      path: "/",
    };

    res.cookie("access_token", token, cookieOptions);
    res.cookie("refresh_token", refreshToken, {
      ...cookieOptions,
      maxAge: 604800000,
    });

    return success(res, {
      message: "Login successful",
      data: { user: userData },
    });
  } catch (err) {
    const auditMessages = {
      USER_NOT_FOUND: `Login attempt failed: User with email ${email} not found`,
      USER_NOT_VERIFIED: `Login attempt failed: User ${email} is not verified`,
      INVALID_PASSWORD: `Login attempt failed: Invalid password for user ${email}`,
    };
    if (auditMessages[err.code]) {
      await logActivity(req, res, "LOGIN_FAILED", auditMessages[err.code]);
    }
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;
  const tokenError = checkToken(res, refreshToken, "refresh token");
  if (tokenError) return tokenError;

  try {
    const { newToken } = await authService.refreshAccessToken(refreshToken);
    res.cookie("access_token", newToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 3600000,
      path: "/",
    });
    return success(res, { message: "Token refreshed" });
  } catch (err) {
    return error(res, { message: "Invalid refresh token", statusCode: 401 });
  }
};

exports.logout = async (req, res) => {
  try {
    await authService.logoutUser(req.user.id);
    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      domain: isProduction ? process.env.COOKIE_DOMAIN : "localhost",
      path: "/",
      httpOnly: true,
      secure: isProduction,
    };
    res.clearCookie("access_token", cookieOptions);
    res.clearCookie("refresh_token", cookieOptions);
    return success(res, { message: "Logged out successfully." });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.checkToken = async (req, res) => {
  return success(res, { message: "Token is valid", data: { user: req.user } });
};
