
const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.updateProfile = async (req, res) => {
    const { name, email, phoneNumber, address, dateOfBirth } = req.body;

    try {
        const user = await User.findById(req.user.id);

        if (name) user.name = name;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (address) user.address = address;
        if (dateOfBirth) user.dateOfBirth = dateOfBirth;

        await user.save();

        res.json(user);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user.id);

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Current password is incorrect' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.json({ msg: 'Password changed successfully' });
    } catch (err) {
        res.status(500).send('Server error');
    }
};

// Delete account
exports.deleteAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        await User.findByIdAndDelete(req.user.id);
        res.json({ msg: 'User account deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get user activity log
exports.getUserActivity = async (req, res) => {
    try {
        const activities = await ActivityLog.find({ user: req.user.id }).sort({ date: -1 }).limit(10);
        res.json(activities);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Update user preferences
exports.updatePreferences = async (req, res) => {
    const { theme, language, notifications } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user.preferences = { ...user.preferences, theme, language, notifications };
        await user.save();

        res.json({ msg: 'User preferences updated successfully', preferences: user.preferences });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};