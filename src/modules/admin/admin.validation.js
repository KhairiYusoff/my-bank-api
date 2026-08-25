const { check } = require("express-validator");
const { STAFF_ASSIGNABLE_ROLES } = require("../../shared/constants/user");

const validateStaffRegistration = [
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
  check("role", "Role is required")
    .not()
    .isEmpty()
    .isIn(STAFF_ASSIGNABLE_ROLES),
];

module.exports = { validateStaffRegistration };
