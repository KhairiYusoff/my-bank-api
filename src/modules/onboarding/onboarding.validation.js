const { check } = require("express-validator");

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
    .withMessage("Please enter a valid phone number"),
];

const validateFullRegistration = [
  ...validateInitialApplication,
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
    .isIn([
      "none",
      "primary",
      "secondary",
      "diploma",
      "degree",
      "postgraduate",
    ]),
  check("residencyStatus", "Residency status is required")
    .not()
    .isEmpty()
    .isIn(["citizen", "permanent resident", "foreigner"]),
  check("address.street", "Street address is required").not().isEmpty(),
  check("address.city", "City is required").not().isEmpty(),
  check("address.state", "State is required").not().isEmpty(),
  check("address.postalCode", "Postal code is required").not().isEmpty(),
  check("job", "Job is required").not().isEmpty(),
  check("employerName", "Employer name is required").not().isEmpty(),
  check("employmentType", "Employment type is required")
    .not()
    .isEmpty()
    .isIn(["salaried", "self-employed", "unemployed", "retired", "student"]),
  check("salary", "Salary range is required")
    .not()
    .isEmpty()
    .isIn([
      "<1000",
      "1000-2999",
      "3000-4999",
      "5000-6999",
      "7000-9999",
      "10000+",
    ]),
  check("accountType", "Account type is required")
    .not()
    .isEmpty()
    .isIn(["savings", "current", "business", "fixed_deposit"]),
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

module.exports = { validateInitialApplication, validateFullRegistration };
