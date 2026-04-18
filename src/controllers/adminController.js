const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { success, error } = require("../utils/response");

// Only Admins Can Create Other Admins & Bankers
exports.createStaff = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Ensure only valid roles can be assigned
  const validRoles = ["admin", "banker"];
  if (!validRoles.includes(role)) {
    return error(res, { message: "Invalid role assignment", statusCode: 400 });
  }

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return error(res, {
        message: "User with this email already exists",
        statusCode: 400,
      });
    }

    user = new User({
      name,
      email,
      password,
      role,
      isVerified: true,
      isProfileComplete: true, // Staff should have complete profiles
    });

    await user.save();
    return success(res, {
      message: `${role} created successfully.`,
      statusCode: 201,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get all pending (unverified) customer applications
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

    // Build filter
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

    let applications = await User.find(filter)
      .select("name email phoneNumber identityNumber createdAt applicationStatus isProfileComplete")
      .sort({ [sortBy]: order === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(numericLimit)
      .lean();

    // Decode HTML entities in the response
    const decodeHtmlEntities = (str) => {
      if (!str) return str;
      return str
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, "/");
    };

    applications = applications.map((app) => ({
      ...app,
      name: decodeHtmlEntities(app.name),
    }));

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    return success(res, {
      data: applications,
      meta: {
        page: numericPage,
        limit: numericLimit,
        pages: Math.ceil(total / numericLimit),
        total: total,
      },
    });
  } catch (err) {
    console.error("Error fetching pending applications:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
