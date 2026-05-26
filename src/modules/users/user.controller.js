const { success, error } = require("../../shared/utils/response");
const userService = require("./user.service");

exports.getProfile = async (req, res) => {
  try {
    const user = await userService.getProfile(req.user.id);
    return success(res, { data: user });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userResponse = await userService.updateProfile(req.user.id, req.body);
    return success(res, { message: "Profile updated", data: userResponse });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    await userService.changePassword(req.user.id, currentPassword, newPassword);
    return success(res, { message: "Password changed successfully" });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return error(res, {
      message: "Email and new password are required",
      statusCode: 400,
    });
  }
  try {
    await userService.resetPassword(email, newPassword);
    return success(res, { message: "Password reset successfully" });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    await userService.deleteAccount(req.user.id);
    return success(res, { message: "User account deleted successfully" });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.updatePreferences = async (req, res) => {
  const { theme, language, notifications } = req.body;
  try {
    const preferences = await userService.updatePreferences(req.user.id, {
      theme,
      language,
      notifications,
    });
    return success(res, {
      message: "User preferences updated successfully",
      data: { preferences },
    });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.getAllCustomers = async (req, res) => {
  try {
    const result = await userService.getAllCustomers(req.query);
    return success(res, {
      message: "Customers fetched",
      data: result.customers,
      meta: result.meta,
    });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};

exports.getAllStaff = async (req, res) => {
  try {
    const result = await userService.getAllStaff(req.query);
    return success(res, {
      message: "Staff fetched",
      data: result.staff,
      meta: result.meta,
    });
  } catch (err) {
    console.error(err.message);
    return error(res, {
      message: err.message || "Internal server error",
      statusCode: err.statusCode || 500,
    });
  }
};
