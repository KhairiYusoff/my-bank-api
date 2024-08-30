const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    fromAccountNumber: {
        type: String,
        required: true,
    },
    toAccountNumber: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    type: {
        type: String,
        enum: ['deposit', 'withdrawal', 'transfer'],
        required: true,
    }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
