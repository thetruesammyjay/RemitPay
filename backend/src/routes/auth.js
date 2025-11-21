const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { strictRateLimit } = require('../middleware/rateLimit');

router.post('/register', strictRateLimit, validateRegistration, authController.register);
router.post('/login', strictRateLimit, validateLogin, authController.login);
router.get('/profile', authenticate, authController.getProfile);
router.post('/refresh', authenticate, authController.refreshToken);

module.exports = router;