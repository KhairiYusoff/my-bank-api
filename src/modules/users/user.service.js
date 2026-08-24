const User = require("../../shared/models/User");
const bcrypt = require("bcryptjs");
const {
  USER_ROLES,
  STAFF_ROLES,
} = require("../../shared/constants/user");

class UserService {
  async getProfile(userId) {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }
    return user;
  }

  async updateProfile(userId, data) {
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
    } = data;

    const user = await User.findById(userId);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (address) user.address = { ...user.address, ...address };
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
    if (nextOfKin) user.nextOfKin = { ...user.nextOfKin, ...nextOfKin };
    if (maritalStatus) user.maritalStatus = maritalStatus;
    if (educationLevel) user.educationLevel = educationLevel;
    if (residencyStatus) user.residencyStatus = residencyStatus;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;
    return userResponse;
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      const err = new Error("Current password is incorrect");
      err.statusCode = 400;
      throw err;
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      const err = new Error(
        "New password must be different from the current password.",
      );
      err.statusCode = 400;
      throw err;
    }

    user.password = newPassword;
    user.passwordChangedAt = new Date();
    user.isFirstTime = false;
    await user.save();
  }

  async resetPassword(email, newPassword) {
    const user = await User.findOne({ email });
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    user.password = newPassword;
    user.passwordChangedAt = new Date();
    user.isFirstTime = false;
    await user.save();
  }

  async deleteAccount(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }
    await User.findByIdAndDelete(userId);
  }

  async updatePreferences(userId, preferences) {
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    user.preferences = { ...user.preferences, ...preferences };
    await user.save();
    return user.preferences;
  }

  async getAllCustomers(query) {
    const {
      page = 1,
      limit = 20,
      sort = "desc",
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
    } = query;

    const numericPage = Math.max(parseInt(page, 10), 1);
    const numericLimit = Math.max(parseInt(limit, 10), 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = { role: USER_ROLES.CUSTOMER };
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

    return {
      customers,
      meta: {
        page: numericPage,
        limit: numericLimit,
        total,
        pages: Math.ceil(total / numericLimit),
      },
    };
  }

  async getAllStaff(query) {
    const {
      page = 1,
      limit = 20,
      sort = "desc",
      name,
      email,
      status,
      isVerified,
      isProfileComplete,
      applicationStatus,
      search,
    } = query;

    const numericPage = Math.max(parseInt(page, 10), 1);
    const numericLimit = Math.max(parseInt(limit, 10), 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = { role: { $in: STAFF_ROLES } };
    if (name) filter.name = new RegExp(name, "i");
    if (email) filter.email = new RegExp(email, "i");
    if (status) filter.status = status;
    if (typeof isVerified !== "undefined")
      filter.isVerified = isVerified === "true";
    if (typeof isProfileComplete !== "undefined")
      filter.isProfileComplete = isProfileComplete === "true";
    if (applicationStatus) filter.applicationStatus = applicationStatus;
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

    return {
      staff,
      meta: {
        page: numericPage,
        limit: numericLimit,
        total,
        pages: Math.ceil(total / numericLimit),
      },
    };
  }
}

module.exports = new UserService();
