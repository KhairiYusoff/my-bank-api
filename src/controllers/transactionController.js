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

        // Create a new transaction record
        const newTransaction = new Transaction({
            fromAccountNumber,
            toAccountNumber,
            amount,
            type: 'transfer'
        });
        await newTransaction.save();

        res.json({ msg: 'Transfer successful', transaction: newTransaction });
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
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

        // Create a new transaction record
        const newTransaction = new Transaction({
            fromAccountNumber: accountNumber,
            toAccountNumber: accountNumber,  // For withdrawal, both are the same
            amount,
            type: 'withdrawal'
        });
        await newTransaction.save();

        res.json({ msg: `Withdrawn ${amount} successfully`, transaction: newTransaction });
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
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
        }).sort({ date: -1 });

        res.json({
            accountNumber,
            transactions: transactions.map(t => ({
                type: t.type,
                amount: t.amount,
                date: t.date,
                fromAccount: t.fromAccountNumber,
                toAccount: t.toAccountNumber
            }))
        });
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};