const Account = require('../models/Account');
const User = require('../models/User');

exports.createAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const accountNumber = `MYB${Date.now()}`;
        const newAccount = new Account({
            user: req.user.id,
            accountNumber,
        });

        await newAccount.save();
        res.json(newAccount);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.getAccounts = async (req, res) => {
    try {
        const accounts = await Account.find({ user: req.user.id });
        res.json(accounts);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.getBalance = async (req, res) => {
    const { accountNumber } = req.params;

    try {
        const account = await Account.findOne({ accountNumber });

        if (!account) {
            return res.status(404).json({ msg: 'Account not found' });
        }

        res.json({ balance: account.balance });
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.deleteAccount = async (req, res) => {
    const { accountNumber } = req.params;

    try {
        const account = await Account.findOne({ accountNumber });

        if (!account) {
            return res.status(404).json({ msg: 'Account not found' });
        }

        if (account.balance !== 0) {
            return res.status(400).json({ msg: 'Account balance must be 0 to delete' });
        }

        await Account.deleteOne({ accountNumber });

        res.json({ msg: 'Account closed successfully' });
    } catch (err) {
        res.status(500).send('Server error');
    }
};
