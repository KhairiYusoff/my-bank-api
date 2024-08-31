
const User = require('../models/User');

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

