const User = require("../models/User");

const checkActivityAccess = async (req, res, next) => {
  try {
    // If user is admin, allow access to any user's activity
    if (req.user.role === "admin") {
      return next();
    }

    // If user is banker, only allow access to customer activities
    if (req.user.role === "banker") {
      const targetUser = await User.findById(req.params.userId);
      if (!targetUser || targetUser.role !== "customer") {
        return res.status(403).json({
          msg: "Access denied. Bankers can only view customer activities.",
        });
      }
      return next();
    }

    // For regular users, they can only view their own activity
    if (req.params.userId !== req.user.id) {
      return res
        .status(403)
        .json({ msg: "Access denied. You can only view your own activities." });
    }

    next();
  } catch (err) {
    console.error("Error in checkActivityAccess:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = {
  checkActivityAccess,
};
