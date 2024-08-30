const express = require('express');
const { transferFunds } = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/transfer', authMiddleware, transferFunds);

module.exports = router;
