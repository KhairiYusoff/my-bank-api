const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");
const bcrypt = require("bcryptjs");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).send("Server error");
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

    res.json(userResponse);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ msg: "Password changed successfully" });
  } catch (err) {
    res.status(500).send("Server error");
  }
};

// Delete account
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    await User.findByIdAndDelete(req.user.id);
    res.json({ msg: "User account deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Get user activity log
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

    // Build query
    const query = { user: req.user.id };

    // Add filters if provided
    if (action) query.action = action;
    if (status) query.status = status;
    if (severity) query.severity = severity;

    // Add date range if provided
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Validate sort parameters
    const validSortFields = ["createdAt", "action", "status", "severity"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortDirection = sortOrder.toLowerCase() === "asc" ? 1 : -1;

    // Get total count for pagination
    const total = await ActivityLog.countDocuments(query);

    // Get activities with pagination and sorting
    const activities = await ActivityLog.find(query)
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("relatedEntity", "accountNumber name email"); // Populate related entity details

    // Format the response
    const formattedActivities = activities.map((activity) => activity.format());

    res.json({
      activities: formattedActivities,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
      filters: {
        action,
        status,
        severity,
        startDate,
        endDate,
        sortBy: sortField,
        sortOrder,
      },
    });
  } catch (err) {
    console.error("Error in getUserActivity:", err);
    if (err.name === "CastError") {
      return res.status(400).json({
        msg: "Invalid query parameters",
        error: err.message,
      });
    }
    res.status(500).json({
      msg: "Server error",
      error: err.message,
    });
  }
};

// Update user preferences
exports.updatePreferences = async (req, res) => {
  const { theme, language, notifications } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.preferences = { ...user.preferences, theme, language, notifications };
    await user.save();

    res.json({
      msg: "User preferences updated successfully",
      preferences: user.preferences,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.getAllCustomers = async (req, res) => {
  try {
    // Ensure the logged-in user is a banker or admin
    const banker = await User.findById(req.user.id);
    if (!banker || (banker.role !== "banker" && banker.role !== "admin")) {
      return res.status(403).json({ msg: "Access denied" });
    }

    // Fetch all users with the role 'customer'
    const customers = await User.find({ role: "customer" });

    res.json({ customers });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error. Please try again later." });
  }
};
