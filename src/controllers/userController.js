const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");
const bcrypt = require("bcryptjs");
const { success, error } = require("../utils/response");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return error(res, { message: "User not found", statusCode: 404 });
    }
    return success(res, { data: user });
  } catch (err) {
    return error(res, { message: "Server error", statusCode: 500 });
  }
};

exports.updateProfile = async (req, res) => {
  const {
    name,
    email,
    phoneNumber,
    address,
    dateOfBirth,
    identityNumber,
    employmentType,
    salary,
    accountType,
    job,
    age,
    nationality,
    employerName,
    purposeOfAccount,
    nextOfKin,
    maritalStatus,
    educationLevel,
    residencyStatus,
    preferences,
  } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (address) {
      user.address = { ...user.address, ...address };
    }
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (identityNumber) user.identityNumber = identityNumber;
    if (employmentType) user.employmentType = employmentType;
    if (salary) user.salary = salary;
    if (accountType) user.accountType = accountType;
    if (job) user.job = job;
    if (age) user.age = age;
    if (nationality) user.nationality = nationality;
    if (employerName) user.employerName = employerName;
    if (purposeOfAccount) user.purposeOfAccount = purposeOfAccount;
    if (nextOfKin) {
      user.nextOfKin = { ...user.nextOfKin, ...nextOfKin };
    }
    if (maritalStatus) user.maritalStatus = maritalStatus;
    if (educationLevel) user.educationLevel = educationLevel;
    if (residencyStatus) user.residencyStatus = residencyStatus;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;

    return success(res, { message: "Profile updated", data: userResponse });
  } catch (err) {
    return error(res, { message: "Server error", statusCode: 500 });
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return error(res, {
        message: "Current password is incorrect",
        statusCode: 400,
      });
    }

    user.password = newPassword;

    await user.save();

    return success(res, { message: "Password changed successfully" });
  } catch (err) {
    return error(res, { message: "Server error", statusCode: 500 });
  }
};

// Delete account
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return error(res, { message: "User not found", statusCode: 404 });
    }

    await User.findByIdAndDelete(req.user.id);
    return success(res, { message: "User account deleted successfully" });
  } catch (err) {
    console.error(err.message);
    return error(res, { message: "Server error", statusCode: 500 });
  }
};

// Get activity log for the currently logged-in user
exports.getOwnActivity = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      action,
      status,
      severity,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = { user: req.user.id };

    if (action) query.action = action;
    if (status) query.status = status;
    if (severity) query.severity = severity;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const validSortFields = ["createdAt", "action", "status", "severity"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortDirection = sortOrder.toLowerCase() === "asc" ? 1 : -1;
    const total = await ActivityLog.countDocuments(query);
    const activities = await ActivityLog.find(query)
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("relatedEntity", "accountNumber name email");
    const formattedActivities = activities.map((activity) => activity.format());
    return success(res, {
      message: "User activities fetched",
      data: formattedActivities,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        filters: {
          action,
          status,
          severity,
          startDate,
          endDate,
          sortBy: sortField,
          sortOrder,
        },
      },
    });
  } catch (err) {
    console.error("Error in getOwnActivity:", err);
    if (err.name === "CastError") {
      return error(res, {
        message: "Invalid query parameters",
        statusCode: 400,
        errors: err.message,
      });
    }
    return error(res, {
      message: "Server error",
      statusCode: 500,
      errors: err.message,
    });
  }
};

// Get activity log for a specific user (admin/banker only)
exports.getUserActivity = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      action,
      status,
      severity,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Use the userId from params (middleware already ensures access control)
    const targetUserId = req.params.userId;
    const query = { user: targetUserId };

    if (action) query.action = action;
    if (status) query.status = status;
    if (severity) query.severity = severity;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const validSortFields = ["createdAt", "action", "status", "severity"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortDirection = sortOrder.toLowerCase() === "asc" ? 1 : -1;
    const total = await ActivityLog.countDocuments(query);
    const activities = await ActivityLog.find(query)
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("relatedEntity", "accountNumber name email");
    const formattedActivities = activities.map((activity) => activity.format());
    return success(res, {
      message: "User activities fetched",
      data: formattedActivities,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        filters: {
          action,
          status,
          severity,
          startDate,
          endDate,
          sortBy: sortField,
          sortOrder,
        },
      },
    });
  } catch (err) {
    console.error("Error in getUserActivity:", err);
    if (err.name === "CastError") {
      return error(res, {
        message: "Invalid query parameters",
        statusCode: 400,
        errors: err.message,
      });
    }
    return error(res, {
      message: "Server error",
      statusCode: 500,
      errors: err.message,
    });
  }
};

// Update user preferences
exports.updatePreferences = async (req, res) => {
  const { theme, language, notifications } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return error(res, { message: "User not found", statusCode: 404 });
    }

    user.preferences = { ...user.preferences, theme, language, notifications };
    await user.save();

    return success(res, {
      message: "User preferences updated successfully",
      data: { preferences: user.preferences },
    });
  } catch (err) {
    console.error(err.message);
    return error(res, { message: "Server error", statusCode: 500 });
  }
};

exports.getAllCustomers = async (req, res) => {
  try {
    // Extract pagination & sorting
    const { page = 1, limit = 20, sort = "desc" } = req.query;
    const numericPage = Math.max(parseInt(page, 10), 1);
    const numericLimit = Math.max(parseInt(limit, 10), 1);
    const skip = (numericPage - 1) * numericLimit;

    // Build dynamic filter
    const filter = { role: "customer" };
    const {
      name,
      email,
      phoneNumber,
      job,
      age,
      status,
      salary,
      applicationStatus,
      isVerified,
      isProfileComplete,
      minAge,
      maxAge,
      minSalary,
      maxSalary,
      search,
    } = req.query;

    if (name) filter.name = new RegExp(name, "i");
    if (email) filter.email = new RegExp(email, "i");
    if (phoneNumber) filter.phoneNumber = new RegExp(phoneNumber, "i");
    if (job) filter.job = new RegExp(job, "i");
    if (status) filter.status = status;
    if (salary) filter.salary = salary;
    if (applicationStatus) filter.applicationStatus = applicationStatus;
    if (typeof isVerified !== "undefined")
      filter.isVerified = isVerified === "true";
    if (typeof isProfileComplete !== "undefined")
      filter.isProfileComplete = isProfileComplete === "true";
    if (age) filter.age = Number(age);
    if (minAge || maxAge) {
      filter.age = {};
      if (minAge) filter.age.$gte = Number(minAge);
      if (maxAge) filter.age.$lte = Number(maxAge);
    }
    if (minSalary || maxSalary) {
      // Only works if salary is stored as a number; if string, skip this block or enhance for range strings
      filter.salary = {};
      if (minSalary) filter.salary.$gte = minSalary;
      if (maxSalary) filter.salary.$lte = maxSalary;
    }
    // General search across name, email, phoneNumber
    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
        { phoneNumber: new RegExp(search, "i") },
      ];
    }

    const [total, customers] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select("-password -refreshToken")
        .sort({ createdAt: sort === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(numericLimit),
    ]);

    const totalPages = Math.ceil(total / numericLimit);

    return success(res, {
      message: "Customers fetched",
      data: customers,
      meta: {
        page: numericPage,
        limit: numericLimit,
        total,
        pages: totalPages,
      },
    });
  } catch (err) {
    console.error(err.message);
    return error(res, { message: "Server error", statusCode: 500 });
  }
};

exports.getAllStaff = async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = "desc" } = req.query;
    const numericPage = Math.max(parseInt(page, 10), 1);
    const numericLimit = Math.max(parseInt(limit, 10), 1);
    const skip = (numericPage - 1) * numericLimit;

    // Build dynamic filter
    const filter = { role: "banker" };
    const {
      name,
      email,
      status,
      isVerified,
      isProfileComplete,
      applicationStatus,
      search,
    } = req.query;

    if (name) filter.name = new RegExp(name, "i");
    if (email) filter.email = new RegExp(email, "i");
    if (status) filter.status = status;
    if (typeof isVerified !== "undefined")
      filter.isVerified = isVerified === "true";
    if (typeof isProfileComplete !== "undefined")
      filter.isProfileComplete = isProfileComplete === "true";
    if (applicationStatus) filter.applicationStatus = applicationStatus;
    // General search across name, email
    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
      ];
    }

    const [total, staff] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select("-password -refreshToken")
        .sort({ createdAt: sort === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(numericLimit),
    ]);

    const totalPages = Math.ceil(total / numericLimit);

    return success(res, {
      message: "Staff fetched",
      data: staff,
      meta: {
        page: numericPage,
        limit: numericLimit,
        total,
        pages: totalPages,
      },
    });
  } catch (err) {
    console.error(err.message);
    return error(res, { message: "Server error", statusCode: 500 });
  }
};
