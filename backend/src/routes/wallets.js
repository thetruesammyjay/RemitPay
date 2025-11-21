const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authenticate } = require('../middleware/auth');
const { validateWalletConnect } = require('../middleware/validation');
const { userRateLimit } = require('../middleware/rateLimit');

router.use(authenticate);
router.use(userRateLimit);

router.post('/connect', validateWalletConnect, walletController.connect);
router.post('/disconnect', walletController.disconnect);
router.get('/balance', walletController.getBalance);
router.get('/transactions', walletController.getTransactions);
router.get('/info', walletController.getInfo);

module.exports = router;