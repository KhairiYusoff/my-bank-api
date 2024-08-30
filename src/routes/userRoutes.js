
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getProfile, updateProfile } = require('../controllers/userController');

router.get('/me', authMiddleware, getProfile);
router.put('/me', authMiddleware, updateProfile);

module.exports = router;
