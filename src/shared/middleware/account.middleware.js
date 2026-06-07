const { check, validationResult } = require("express-validator");

const validateAccountCreation = [
  check("accountType", "Account type is required").not().isEmpty(),
  check("branch", "Branch is required").not().isEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateOverdraftLimit = [
  check("overdraftLimit", "overdraftLimit is required").exists(),
  check("overdraftLimit", "overdraftLimit must be a number >= 0").isFloat({
    min: 0,
  }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateAccountCreation, validateOverdraftLimit };
