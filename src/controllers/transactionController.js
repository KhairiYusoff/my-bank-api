const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

exports.transferFunds = async (req, res) => {
    const { fromAccountNumber, toAccountNumber, amount } = req.body;

    try {
        const fromAccount = await Account.findOne({ accountNumber: fromAccountNumber });
        const toAccount = await Account.findOne({ accountNumber: toAccountNumber });

        if (!fromAccount || !toAccount) {
            return res.status(404).json({ msg: 'Account not found' });
        }

        if (fromAccount.balance < amount) {
            return res.status(400).json({ msg: 'Insufficient funds' });
        }

        fromAccount.balance -= amount;
        toAccount.balance += amount;

        await fromAccount.save();
        await toAccount.save();

        res.json({ msg: 'Transfer successful' });
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.withdrawFunds = async (req, res) => {
    const { accountNumber, amount } = req.body;

    try {
        const account = await Account.findOne({ accountNumber });

        if (!account) {
            return res.status(404).json({ msg: 'Account not found' });
        }

        if (account.balance < amount) {
            return res.status(400).json({ msg: 'Insufficient funds' });
        }

        account.balance -= amount;
        await account.save();

        res.json({ msg: `Withdrawn ${amount} successfully`, account });
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.getTransactionHistory = async (req, res) => {
    const { accountNumber } = req.params;

    try {
        const account = await Account.findOne({ accountNumber });

        if (!account) {
            return res.status(404).json({ msg: 'Account not found' });
        }

        const transactions = await Transaction.find({
            $or: [{ fromAccountNumber: accountNumber }, { toAccountNumber: accountNumber }]
        });

        res.json(transactions);
    } catch (err) {
        res.status(500).send('Server error');
    }
};