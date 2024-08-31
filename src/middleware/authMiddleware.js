const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { check } = require('express-validator');

const authMiddleware = async function (req, res, next) {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

const validateRegistration = [
    check('name', 'Name is required').not().isEmpty().trim().escape(),
    check('email', 'Please include a valid email')
        .isEmail()
        .normalizeEmail()
        .isLength({ max: 255 }),
    check('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/\d/)
        .withMessage('Password must contain a number')
        .matches(/[A-Z]/)
        .withMessage('Password must contain an uppercase letter')
        .matches(/[a-z]/)
        .withMessage('Password must contain a lowercase letter')
        .matches(/[!@#$%^&*(),.?":{}|<>]/)
        .withMessage('Password must contain a special character'),
    check('phoneNumber', 'Phone number is optional').optional().isMobilePhone(),
    check('address', 'Address is optional').optional(),
    check('dateOfBirth', 'Date of birth is optional').optional().isISO8601().toDate()
];

module.exports = {
    authMiddleware,
    validateRegistration
};