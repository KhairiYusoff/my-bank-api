const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    balance: {
        type: Number,
        required: true,
        default: 0,
    },
    accountNumber: {
        type: String,
        required: true,
        unique: true,
    },
});

module.exports = mongoose.model('Account', AccountSchema);
