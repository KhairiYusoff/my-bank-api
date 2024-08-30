
const User = require('../models/User');

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.updateProfile = async (req, res) => {
    const { name, email } = req.body;

    try {
        const user = await User.findById(req.user.id);

        if (name) user.name = name;
        if (email) user.email = email;

        await user.save();

        res.json(user);
    } catch (err) {
        res.status(500).send('Server error');
    }
};
