const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
    },
    address: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
    },
    dateOfBirth: {
        type: Date,
    },
    preferences: {
        theme: {
            type: String,
            default: 'light'
        },
        language: {
            type: String,
            default: 'en'
        },
        notifications: {
            type: Boolean,
            default: true
        }
    },
    refreshToken: {
        type: String
    }
}, {
    timestamps: true
});

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('User', UserSchema);