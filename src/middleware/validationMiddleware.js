const { check } = require("express-validator");

// Basic validation for customer's initial application
const validateInitialApplication = [
  // Only these 3 fields are required
  check("name", "Name is required").not().isEmpty().trim().escape(),
  check("email", "Please include a valid email")
    .isEmail()
    .normalizeEmail()
    .isLength({ max: 255 }),
  check("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/\\d/)
    .withMessage("Password must contain a number")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain a lowercase letter")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Password must contain a special character"),
];

// Full validation for banker registering a customer
const validateFullRegistration = [
  ...validateInitialApplication,
  // Personal Information
  check("phoneNumber")
    .not()
    .isEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone("any")
    .withMessage("Invalid phone number format"),
  check("identityNumber", "Identity number is required").not().isEmpty(),
  check("dateOfBirth", "Date of birth is required")
    .not()
    .isEmpty()
    .isISO8601()
    .withMessage("Invalid date format"),
  check("age", "Age is required")
    .not()
    .isEmpty()
    .isInt({ min: 18, max: 100 })
    .withMessage("Age must be between 18 and 100"),
  check("nationality", "Nationality is required").not().isEmpty(),
  check("maritalStatus", "Marital status is required")
    .not()
    .isEmpty()
    .isIn(["single", "married", "divorced", "widowed"]),
  check("educationLevel", "Education level is required")
    .not()
    .isEmpty()
    .isIn(["none", "primary", "secondary", "diploma", "degree", "postgraduate"]),
  check("residencyStatus", "Residency status is required")
    .not()
    .isEmpty()
    .isIn(["citizen", "permanent resident", "foreigner"]),

  // Address
  check("address.street", "Street address is required").not().isEmpty(),
  check("address.city", "City is required").not().isEmpty(),
  check("address.state", "State is required").not().isEmpty(),
  check("address.postalCode", "Postal code is required").not().isEmpty(),

  // Employment & Financial
  check("job", "Job is required").not().isEmpty(),
  check("employerName", "Employer name is required").not().isEmpty(),
  check("employmentType", "Employment type is required")
    .not()
    .isEmpty()
    .isIn(["salaried", "self-employed", "unemployed", "retired", "student"]),
  check("salary", "Salary range is required")
    .not()
    .isEmpty()
    .isIn(["<1000", "1000-2999", "3000-4999", "5000-6999", "7000-9999", "10000+"]),
  check("accountType", "Account type is required")
    .not()
    .isEmpty()
    .isIn(["savings", "current", "fixed deposit"]),
  check("purposeOfAccount", "Purpose of account is required")
    .not()
    .isEmpty()
    .isIn([
      "savings",
      "salary credit",
      "investment",
      "business",
      "education",
      "travel",
      "others",
    ]),

  // Next of Kin
  check("nextOfKin.name", "Next of kin name is required").not().isEmpty(),
  check("nextOfKin.phone", "Next of kin phone is required")
    .not()
    .isEmpty()
    .isMobilePhone("any")
    .withMessage("Invalid phone number format"),
  check("nextOfKin.relationship", "Next of kin relationship is required")
    .not()
    .isEmpty()
    .isIn([
      "parent",
      "spouse",
      "child",
      "sibling",
      "relative",
      "friend",
      "other",
    ]),
];

// Staff registration validation
const validateStaffRegistration = [
  check("name", "Name is required").not().isEmpty().trim().escape(),
  check("email", "Please include a valid email")
    .isEmail()
    .normalizeEmail()
    .isLength({ max: 255 }),
  check("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/\\d/)
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
    .isIn(["banker", "admin"]),
];

module.exports = {
  validateInitialApplication,
  validateFullRegistration,
  validateStaffRegistration,
};
