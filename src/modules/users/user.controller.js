const User = require("../../shared/models/User");
const bcrypt = require("bcryptjs");
const { success, error } = require("../../shared/utils/response");
const { checkUserExists } = require("../../shared/utils/validation.helpers");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    const userError = checkUserExists(res, user);
    if (userError) return userError;

    return success(res, { data: user });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
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
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
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

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return error(res, {
        message: "New password must be different from the current password.",
        statusCode: 400,
      });
    }

    user.password = newPassword;
    user.passwordChangedAt = new Date();
    await user.save();
    return success(res, { message: "Password changed successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Reset password for all roles
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return error(res, {
        message: "Email and new password are required",
        statusCode: 400,
      });
    }
    const user = await User.findOne({ email });
    const userError = checkUserExists(res, user);
    if (userError) return userError;

    user.password = newPassword;
    user.passwordChangedAt = new Date();
    await user.save();
    return success(res, { message: "Password reset successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const userError = checkUserExists(res, user);
    if (userError) return userError;

    await User.findByIdAndDelete(req.user.id);
    return success(res, { message: "User account deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update user preferences
exports.updatePreferences = async (req, res) => {
  const { theme, language, notifications } = req.body;

  try {
    const user = await User.findById(req.user.id);

    // Validate user exists
    const userError = checkUserExists(res, user);
    if (userError) return userError;

    user.preferences = { ...user.preferences, theme, language, notifications };
    await user.save();

    return success(res, {
      message: "User preferences updated successfully",
      data: { preferences: user.preferences },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
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
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
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
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
