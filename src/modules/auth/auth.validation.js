const { check } = require("express-validator");

const validateLogin = [
  check("email", "Valid email is required")
    .isEmail()
    .normalizeEmail()
    .escape(),
  check("password", "Password is required")
    .not()
    .isEmpty()
    .isLength({ min: 1, max: 128 })
    .withMessage("Password must be between 1 and 128 characters"),
];

module.exports = { validateLogin };
