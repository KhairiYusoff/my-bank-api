const express = require('express');
const { createAccount, getAccounts, getBalance, deleteAccount } = require('../controllers/accountController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validateAccountCreation } = require('../middleware/accountMiddleware')
const router = express.Router();

router.post('/create', authMiddleware, validateAccountCreation, createAccount);
router.get('/', authMiddleware, getAccounts);
router.get('/balance/:accountNumber', authMiddleware, getBalance);
router.delete('/:accountNumber', authMiddleware, deleteAccount);

module.exports = router;
