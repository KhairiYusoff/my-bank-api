const express = require('express');
const { chat, getInsights } = require('./ai.controller');
const { authMiddleware } = require('../../shared/middleware/authMiddleware');
const { aiRateLimit } = require('../../shared/middleware/rateLimitMiddleware');

const router = express.Router();

router.post('/chat', aiRateLimit, authMiddleware, chat);
router.get('/insights', aiRateLimit, authMiddleware, getInsights);

module.exports = router;
