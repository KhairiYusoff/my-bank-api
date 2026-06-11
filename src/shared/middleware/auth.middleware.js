const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async function (req, res, next) {
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id);

    if (!user || !user.refreshToken) {
      return res.status(401).json({ msg: "Token invalid or user logged out" });
    }

    // Rejects tokens issued before a password change — prevents old sessions
    // from remaining valid after a security-critical credential reset.
    if (user.passwordChangedAt) {
      const issuedAt = decoded.iat * 1000; // iat is in seconds, convert to ms
      const pwdChangedAt = new Date(user.passwordChangedAt).getTime();
      if (issuedAt < pwdChangedAt) {
        return res.status(401).json({
          msg: "Token invalid due to password change. Please log in again.",
        });
      }
    }

    if (user.status !== "active") {
      return res
        .status(403)
        .json({ msg: "Account suspended. Please contact support." });
    }

    // Force first-login handshake
    if (user.isFirstTime) {
      // Allow only password change and essential auth routes
      const allowedPaths = ["/me/password", "/logout", "/check-token"];
      const isAllowed = allowedPaths.some((path) => req.path.endsWith(path));

      if (!isAllowed) {
        return res.status(403).json({
          msg: "First login change required",
          mustChangePassword: true,
        });
      }
    }

    req.user = user;
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
