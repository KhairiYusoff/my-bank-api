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
      return error(res, { message: "User with this email already exists", statusCode: 400 });
    }

    user = new User({
      name,
      email,
      password,
      role,
      isVerified: true,
      isProfileComplete: true  // Staff should have complete profiles
    });

    await user.save();
    return success(res, { message: `${role} created successfully.`, statusCode: 201 });
  } catch (err) {
    console.error(err.message);
    return error(res, { message: "Server error. Please try again later.", statusCode: 500 });
  }
};

// Get all pending (unverified) customer applications
exports.getPendingApplications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'createdAt';
    const order = req.query.order === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    // Find all unverified customers
    let applications = await User.find({ 
      isVerified: false,
      role: 'customer'
    })
    .select('name email phoneNumber identityNumber createdAt')
    .sort({ [sortBy]: order })
    .skip(skip)
    .limit(limit)
    .lean();

    // Decode HTML entities in the response
    const decodeHtmlEntities = (str) => {
      if (!str) return str;
      return str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/');
    };

    applications = applications.map(app => ({
      ...app,
      name: decodeHtmlEntities(app.name)
    }));

    // Get total count for pagination
    const total = await User.countDocuments({ 
      isVerified: false,
      role: 'customer'
    });

    return success(res, {
      data: applications,
      meta: {
        page: page,
        limit: limit,
        pages: Math.ceil(total / limit),
        total: total
      }
    });
  } catch (err) {
    console.error('Error fetching pending applications:', err.message);
    return error(res, { message: "Server error. Please try again later.", statusCode: 500 });
  }
};
