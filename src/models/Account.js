const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    accountNumber: {
        type: String,
        required: true,
        unique: true,
    },
    accountType: {
        type: String,
        enum: ['Savings', 'Checking', 'Business'],
        required: true,
    },
    branch: {
        type: String,
        required: true,
    },
    balance: {
        type: Number,
        default: 0,
    },
    interestRate: {
        type: Number,
    },
    currency: {
        type: String,
        default: 'USD',
    },
    status: {
        type: String,
        enum: ['Active', 'Dormant', 'Closed'],
        default: 'Active',
    },
    dateOpened: {
        type: Date,
        default: Date.now,
    },
    dateClosed: {
        type: Date,
    },
    overdraftLimit: {
        type: Number,
    },
    minimumBalance: {
        type: Number,
        default: 0,
    }
});

module.exports = mongoose.model('Account', AccountSchema);
