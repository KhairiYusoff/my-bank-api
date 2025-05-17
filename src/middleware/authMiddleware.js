const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { check } = require("express-validator");

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

const validateRegistration = [
  check("name", "Name is required").not().isEmpty().trim().escape(),
  check("email", "Please include a valid email")
    .isEmail()
    .normalizeEmail()
    .isLength({ max: 255 }),
  check("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/\d/)
    .withMessage("Password must contain a number")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain a lowercase letter")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Password must contain a special character"),
  check("phoneNumber")
    .optional()
    .isMobilePhone("any")
    .withMessage("Invalid phone number format"),
  check("address").optional(),
  check("dateOfBirth", "Invalid date of birth format")
    .optional()
    .isISO8601()
    .toDate(),
  check("job", "Job is required").not().isEmpty(),
  check("age", "Age must be a number").isInt({ min: 18, max: 100 }),
  check("nationality", "Nationality is required").not().isEmpty(),
  check("accountType", "Account type is required").not().isEmpty(),
];

module.exports = {
  authMiddleware,
  authorizeRoles,
  validateRegistration,
};
