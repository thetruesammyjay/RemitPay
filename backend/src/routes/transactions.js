const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticate } = require('../middleware/auth');
const {
  validateSendTransaction,
  validateTransactionId,
  validatePagination,
  validateTransactionStatus,
} = require('../middleware/validation');
const { userRateLimit } = require('../middleware/rateLimit');

router.use(authenticate);
router.use(userRateLimit);

router.post('/', validateSendTransaction, transactionController.send);
router.put('/:id/signature', validateTransactionId, transactionController.updateSignature);
router.get('/', validatePagination, validateTransactionStatus, transactionController.getAll);
router.get('/stats', transactionController.getStats);
router.get('/:id', validateTransactionId, transactionController.getById);
router.post('/:id/cancel', validateTransactionId, transactionController.cancel);

module.exports = router;