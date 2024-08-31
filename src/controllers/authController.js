const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

exports.register = async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phoneNumber, address, dateOfBirth } = req.body;

    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User with this email already exists' });
        }

        // Create new user
        user = new User({
            name,
            email,
            password,
            phoneNumber,
            address,
            dateOfBirth
        });

        // Save user to database
        // Note: Password hashing is handled by the pre-save hook in the User model
        await user.save();

        // Create and send JWT
        const payload = { user: { id: user.id } };
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        if (err.name === 'ValidationError') {
            // Handle Mongoose validation errors
            const validationErrors = Object.values(err.errors).map(error => error.message);
            return res.status(400).json({ msg: 'Invalid user data', errors: validationErrors });
        } else if (err.code === 11000) {
            // Handle duplicate key error (likely email)
            return res.status(400).json({ msg: 'Email already in use' });
        } else {
            // Handle other types of errors
            res.status(500).json({ msg: 'Server error. Please try again later.' });
        }
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        res.status(500).send('Server error');
    }
};
