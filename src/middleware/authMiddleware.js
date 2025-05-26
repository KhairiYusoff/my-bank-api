const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async function (req, res, next) {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id);

    if (!user || !user.refreshToken) {
      return res.status(401).json({ msg: "Token invalid or user logged out" });
    }

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

const authorizeRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ msg: "Access denied" });
      }

      req.userObj = user;
      next();
    } catch (err) {
      res.status(500).json({ msg: "Server error" });
    }
  };
};

module.exports = {
  authMiddleware,
  authorizeRoles,
};
