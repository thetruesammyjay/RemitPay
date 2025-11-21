const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const recipientController = require('../controllers/recipientController');
const { authenticate } = require('../middleware/auth');
const {
  validateCreateRecipient,
  validateUpdateRecipient,
  validateRecipientId,
} = require('../middleware/validation');
const { userRateLimit } = require('../middleware/rateLimit');

router.use(authenticate);
router.use(userRateLimit);

// User profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/password', userController.updatePassword);
router.delete('/account', userController.deleteAccount);

// Recipient routes
router.get('/recipients', recipientController.getAll);
router.post('/recipients', validateCreateRecipient, recipientController.create);
router.get('/recipients/:id', validateRecipientId, recipientController.getById);
router.put('/recipients/:id', validateRecipientId, validateUpdateRecipient, recipientController.update);
router.delete('/recipients/:id', validateRecipientId, recipientController.delete);

module.exports = router;