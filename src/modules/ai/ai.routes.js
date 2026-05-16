const express = require('express');
const { chat, getInsights } = require('./ai.controller');
const { authMiddleware } = require('../../shared/middleware/auth.middleware');
const { aiRateLimit } = require('../../shared/middleware/rate-limit.middleware');

const router = express.Router();

router.post('/chat', aiRateLimit, authMiddleware, chat);
router.get('/insights', aiRateLimit, authMiddleware, getInsights);

module.exports = router;
