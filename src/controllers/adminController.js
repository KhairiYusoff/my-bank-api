const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Only Admins Can Create Other Admins & Bankers
exports.createStaff = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Ensure only valid roles can be assigned
  const validRoles = ["admin", "banker"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ msg: "Invalid role assignment" });
  }

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ msg: "User with this email already exists" });
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
    res.status(201).json({ msg: `${role} created successfully.` });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error. Please try again later." });
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

    res.json({
      applications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalApplications: total,
        hasMore: skip + applications.length < total
      }
    });
  } catch (err) {
    console.error('Error fetching pending applications:', err.message);
    res.status(500).json({ msg: 'Server error. Please try again later.' });
  }
};
