const User = require("../models/User");
const { USER_ROLES } = require("../constants/user");

const checkActivityAccess = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = req.user;

    // Admin can access any user's activity
    if (user.role === USER_ROLES.ADMIN) {
      return next();
    }

    // Banker can only access customer activities
    if (user.role === USER_ROLES.BANKER) {
      const targetUser = await User.findById(userId);
      if (!targetUser) {
        return res.status(404).json({ msg: "User not found" });
      }
      if (targetUser.role !== USER_ROLES.CUSTOMER) {
        return res.status(403).json({
          msg: "Access denied. Bankers can only view customer activities.",
        });
      }
      return next();
    }

    // Regular users can only view their own activities
    if (userId !== user.id) {
      return res
        .status(403)
        .json({ msg: "Access denied. You can only view your own activities." });
    }

    next();
  } catch (err) {
    console.error("Activity access check error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = {
  checkActivityAccess,
};
