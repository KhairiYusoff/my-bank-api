const { check } = require("express-validator");

// Basic validation for customer's initial application
const validateInitialApplication = [
  check("name", "Full name is required")
    .not()
    .isEmpty()
    .trim()
    .escape()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  check("email", "Valid email address is required")
    .isEmail()
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage("Email must not exceed 255 characters"),
  check("phoneNumber", "Valid phone number is required")
    .not()
    .isEmpty()
    .isMobilePhone("any")
    .withMessage("Please enter a valid phone number")
];

// CRITICAL: Login validation - prevents brute force & injection attacks
const validateLogin = [
  check("email", "Valid email is required")
    .isEmail()
    .normalizeEmail()
    .escape(), // Prevents XSS
  check("password", "Password is required")
    .not()
    .isEmpty()
    .isLength({ min: 1, max: 128 }) // Prevents DoS with huge passwords
    .withMessage("Password must be between 1 and 128 characters")
];

// CRITICAL: Financial transaction validation - prevents financial attacks
const validateTransfer = [
  check("fromAccountNumber", "From account number is required")
    .not()
    .isEmpty()
    .isNumeric() // Must be numbers only
    .isLength({ min: 8, max: 20 }) // Account number length validation
    .withMessage("Invalid account number format"),
  check("toAccountNumber", "To account number is required")
    .not()
    .isEmpty()
    .isNumeric()
    .isLength({ min: 8, max: 20 })
    .withMessage("Invalid account number format"),
  check("amount", "Amount is required")
    .not()
    .isEmpty()
    .isFloat({ min: 0.01, max: 1000000 }) // Prevents negative amounts & huge transfers
    .withMessage("Amount must be between $0.01 and $1,000,000"),
  check("description", "Description is required")
    .optional()
    .trim()
    .escape()
    .isLength({ max: 255 })
    .withMessage("Description must not exceed 255 characters")
];

// CRITICAL: Deposit/Withdrawal validation
const validateTransaction = [
  check("accountNumber", "Account number is required")
    .not()
    .isEmpty()
    .isNumeric()
    .isLength({ min: 8, max: 20 })
    .withMessage("Invalid account number format"),
  check("amount", "Amount is required")
    .not()
    .isEmpty()
    .isFloat({ min: 0.01, max: 1000000 })
    .withMessage("Amount must be between $0.01 and $1,000,000"),
  check("description", "Description is required")
    .optional()
    .trim()
    .escape()
    .isLength({ max: 255 })
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
  validateLogin,
  validateTransfer,
  validateTransaction,
  validateFullRegistration,
  validateStaffRegistration,
};
