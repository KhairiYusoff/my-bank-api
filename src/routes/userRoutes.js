const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { getProfile, updateProfile, changePassword, deleteAccount, getUserActivity, updatePreferences } = require('../controllers/userController');
const { validateProfileUpdate, validatePasswordChange, validatePreferencesUpdate } = require('../middleware/userMiddleware');

router.get('/me', authMiddleware, getProfile);
router.put('/me', authMiddleware, validateProfileUpdate, updateProfile);
router.put('/me/password', authMiddleware, validatePasswordChange, changePassword);
router.delete('/me', authMiddleware, deleteAccount);
router.get('/me/activity', authMiddleware, getUserActivity);
router.put('/me/preferences', authMiddleware, validatePreferencesUpdate, updatePreferences);

module.exports = router;