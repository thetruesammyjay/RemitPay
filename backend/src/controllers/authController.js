const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const NotificationService = require('../services/notificationService');
const logger = require('../utils/logger');

const authController = {
  register: asyncHandler(async (req, res) => {
    const { email, password, walletAddress } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const existingWallet = await User.findByWalletAddress(walletAddress);
    if (existingWallet) {
      return res.status(409).json({ error: 'Wallet already connected' });
    }

    const user = await User.create({ email, password, walletAddress });
    NotificationService.sendWelcomeEmail({ email: user.email }).catch(err =>
      logger.error('Failed to send welcome email:', err)
    );

    const token = generateToken(user.id);
    res.status(201).json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, walletAddress: user.wallet_address },
        token,
      },
    });
  }),

  login: asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await User.verifyPassword(user, password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);
    res.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, walletAddress: user.wallet_address },
        token,
      },
    });
  }),

  getProfile: asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const stats = await User.getStats(req.userId);
    res.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, walletAddress: user.wallet_address, createdAt: user.created_at },
        stats,
      },
    });
  }),

  refreshToken: asyncHandler(async (req, res) => {
    const token = generateToken(req.userId);
    res.json({ success: true, data: { token } });
  }),
};

module.exports = authController;