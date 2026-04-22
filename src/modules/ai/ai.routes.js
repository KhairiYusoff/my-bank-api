const express = require('express');
const { chat } = require('./ai.controller');
const { authMiddleware } = require('../../shared/middleware/authMiddleware');
const { aiRateLimit } = require('../../shared/middleware/rateLimitMiddleware');

const router = express.Router();

router.post('/chat', aiRateLimit, authMiddleware, chat);

module.exports = router;
