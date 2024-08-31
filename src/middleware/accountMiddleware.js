const { check, validationResult } = require('express-validator');

const validateAccountCreation = [
    check('accountType', 'Account type is required').not().isEmpty(),
    check('branch', 'Branch is required').not().isEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = { validateAccountCreation };
