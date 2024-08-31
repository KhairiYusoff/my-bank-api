
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { getProfile, updateProfile, changePassword } = require('../controllers/userController');
const { validateProfileUpdate, validatePasswordChange } = require('../middleware/userMiddleware');

router.get('/me', authMiddleware, getProfile);
router.put('/me', authMiddleware, validateProfileUpdate, updateProfile);
router.put('/me/password', authMiddleware, validatePasswordChange, changePassword);

module.exports = router;
