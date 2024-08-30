const express = require('express');
const { transferFunds, withdrawFunds, getTransactionHistory } = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/transfer', authMiddleware, transferFunds);
router.post('/withdraw', authMiddleware, withdrawFunds);
router.get('/history/:accountNumber', authMiddleware, getTransactionHistory);

module.exports = router;
