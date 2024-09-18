const express = require('express');
const { register, login, refreshToken, logout, checkToken } = require('../controllers/authController');
const { authMiddleware, validateRegistration } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', validateRegistration, register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', authMiddleware, logout);
router.get('/check-token', authMiddleware, checkToken);

module.exports = router;