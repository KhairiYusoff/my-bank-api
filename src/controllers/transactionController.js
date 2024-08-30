const Account = require('../models/Account');

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
