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

const validatePasswordChange = [
    check('currentPassword', 'Current password is required').not().isEmpty(),
    check('newPassword', 'New password is required')
        .not().isEmpty()
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters long')
        .matches(/\d/)
        .withMessage('New password must contain a number')
        .matches(/[A-Z]/)
        .withMessage('New password must contain an uppercase letter')
        .matches(/[a-z]/)
        .withMessage('New password must contain a lowercase letter')
        .matches(/[!@#$%^&*(),.?":{}|<>]/)
        .withMessage('New password must contain a special character'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validatePreferencesUpdate = [
    check('theme').optional().isIn(['light', 'dark']).withMessage('Theme must be either light or dark'),
    check('language').optional().isLength({ min: 2, max: 5 }).withMessage('Invalid language code'),
    check('notifications').optional().isBoolean().withMessage('Notifications must be a boolean value'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = { validateProfileUpdate, validatePasswordChange, validatePreferencesUpdate };
