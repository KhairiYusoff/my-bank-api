const { check, validationResult } = require('express-validator');

const validateProfileUpdate = [
    check('name', 'Name is required').optional().not().isEmpty().trim().escape(),
    check('email', 'Please include a valid email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .isLength({ max: 255 }),
    check('phoneNumber', 'Phone number is optional').optional().isMobilePhone().withMessage('Invalid phone number format'),
    check('address', 'Address is optional').optional(),
    check('dateOfBirth', 'Date of birth is optional').optional().isISO8601().toDate(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = { validateProfileUpdate };
