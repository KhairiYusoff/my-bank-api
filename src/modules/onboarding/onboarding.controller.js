const { validationResult } = require("express-validator");
const User = require("../../models/User");
const Account = require("../../models/Account");
const { success, error } = require("../../utils/response");
const { notifyNewApplication } = require("../../services/websocketService");
const {
  buildProfileCompletionUrl,
  sendApprovalEmail,
  sendActivationEmail,
} = require("./onboarding.service");

exports.apply = async (req, res) => {
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
    let user = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (user) {
      const duplicateMsg =
        user.email === email
          ? "An application with this email already exists"
          : "An application with this phone number already exists";
      return error(res, { message: duplicateMsg, statusCode: 400 });
    }

    user = new User({
      name,
      email,
      phoneNumber,
      role: "customer",
      isVerified: false,
      isProfileComplete: false,
      applicationStatus: "pending",
    });
    await user.save();

    notifyNewApplication(user);

    return success(res, {
      message:
        "Application submitted successfully. A bank representative will contact you.",
      data: { userId: user._id.toString() },
      statusCode: 201,
    });
  } catch (err) {
    console.error("Registration error:", err.message);
    if (err.name === "ValidationError") {
      return error(res, {
        message: "Invalid user data",
        errors: Object.values(err.errors).map((e) => e.message),
        statusCode: 400,
      });
    } else if (err.code === 11000) {
      return error(res, { message: "Email already in use", statusCode: 400 });
    }
    return error(res, {
      message: "Server error. Please try again later.",
      statusCode: 500,
    });
  }
};

exports.approveApplication = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user)
      return res.status(404).json({ msg: "User application not found" });
    if (user.applicationStatus !== "pending") {
      return res
        .status(400)
        .json({ msg: `Application is already ${user.applicationStatus}` });
    }

    user.applicationStatus = "approved";

    const { url: completeProfileUrl } = buildProfileCompletionUrl(user._id);

    await sendApprovalEmail({
      email: user.email,
      name: user.name,
      completeProfileUrl,
    });

    await user.save();

    res.json({
      msg: "Application approved. An email has been sent to the user to complete their profile.",
      userId: user._id,
      completeProfileUrl,
    });
  } catch (err) {
    console.error("Error approving application:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.completeProfile = async (req, res) => {
  const userId = req.userId;
  const {
    password,
    address,
    dateOfBirth,
    identityNumber,
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
  } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user)
      return error(res, { message: "User not found", statusCode: 404 });
    if (user.isProfileComplete)
      return error(res, {
        message: "Profile has already been completed.",
        statusCode: 400,
      });

    Object.assign(user, {
      password,
      address,
      dateOfBirth,
      identityNumber,
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
      isProfileComplete: true,
    });

    await user.save();

    return success(res, {
      message:
        "Your profile has been completed successfully. It is now pending final verification.",
    });
  } catch (err) {
    console.error("Error completing profile:", err);
    if (err.name === "ValidationError") {
      return error(res, {
        message: "Invalid user data",
        statusCode: 400,
        errors: Object.values(err.errors).map((e) => e.message),
      });
    } else if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return error(res, {
        message: `This ${field} is already in use by another account.`,
        statusCode: 400,
      });
    }
    return error(res, {
      message: "Server error. Please try again later.",
      statusCode: 500,
    });
  }
};

exports.verifyCustomer = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ msg: "User not found" });
    if (!user.isProfileComplete)
      return res.status(400).json({
        msg: "Cannot verify. The user has not completed their profile yet.",
      });
    if (user.isVerified)
      return res.status(400).json({ msg: "User is already verified." });

    user.isVerified = true;
    user.applicationStatus = "completed";
    await user.save();

    const accountTypeMap = {
      savings: "Savings",
      checking: "Checking",
      business: "Business",
    };
    await Account.create({
      user: user._id,
      accountNumber: `MYB${Date.now()}`,
      accountType: accountTypeMap[user.accountType] || "Savings",
      balance: 0,
      currency: "MYR",
      status: "Active",
      dateOpened: new Date(),
    });

    await sendActivationEmail({ email: user.email, name: user.name });

    res.json({
      msg: "Customer has been successfully verified and their account is now active.",
    });
  } catch (err) {
    console.error("Error verifying customer:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getPendingApplications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
      name,
      email,
      phoneNumber,
      identityNumber,
      dateFrom,
      dateTo,
      search,
    } = req.query;
    const numericPage = Math.max(parseInt(page, 10), 1);
    const numericLimit = Math.max(parseInt(limit, 10), 1);
    const skip = (numericPage - 1) * numericLimit;

    const filter = { isVerified: false, role: "customer" };
    if (name) filter.name = new RegExp(name, "i");
    if (email) filter.email = new RegExp(email, "i");
    if (phoneNumber) filter.phoneNumber = new RegExp(phoneNumber, "i");
    if (identityNumber) filter.identityNumber = new RegExp(identityNumber, "i");
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }
    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
        { phoneNumber: new RegExp(search, "i") },
        { identityNumber: new RegExp(search, "i") },
      ];
    }

    const decodeHtmlEntities = (str) =>
      str
        ? str
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#x27;/g, "'")
            .replace(/&#x2F;/g, "/")
        : str;

    let applications = await User.find(filter)
      .select(
        "name email phoneNumber identityNumber createdAt applicationStatus isProfileComplete"
      )
      .sort({ [sortBy]: order === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(numericLimit)
      .lean();

    applications = applications.map((app) => ({
      ...app,
      name: decodeHtmlEntities(app.name),
    }));

    const total = await User.countDocuments(filter);

    return success(res, {
      data: applications,
      meta: {
        page: numericPage,
        limit: numericLimit,
        pages: Math.ceil(total / numericLimit),
        total,
      },
    });
  } catch (err) {
    console.error("Error fetching pending applications:", err.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
