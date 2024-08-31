const express = require('express');
const { register, login } = require('../controllers/authController');
const router = express.Router();
const { validateRegistration } = require('../middleware/authMiddleware');

router.post('/register', validateRegistration, register);
router.post('/login', login);

module.exports = router;