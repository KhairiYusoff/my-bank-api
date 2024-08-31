
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { getProfile, updateProfile } = require('../controllers/userController');
const { validateProfileUpdate } = require('../middleware/userMiddleware');

router.get('/me', authMiddleware, getProfile);
router.put('/me', authMiddleware, validateProfileUpdate, updateProfile);

module.exports = router;
