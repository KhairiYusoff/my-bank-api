const express = require('express');
const { transferFunds, withdrawFunds } = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/transfer', authMiddleware, transferFunds);
router.post('/withdraw', authMiddleware, withdrawFunds);

module.exports = router;
