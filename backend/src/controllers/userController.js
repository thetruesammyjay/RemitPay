const User = require('../models/User');
const Recipient = require('../models/Recipient');
const { asyncHandler } = require('../middleware/errorHandler');

const userController = {
  getProfile: asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const stats = await User.getStats(req.userId);
    const recipients = await Recipient.findByUserId(req.userId);

    res.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, walletAddress: user.wallet_address, createdAt: user.created_at },
        stats,
        recipientsCount: recipients.length,
      },
    });
  }),

  updateProfile: asyncHandler(async (req, res) => {
    const { email, walletAddress } = req.body;
    const updates = {};

    if (email) updates.email = email;
    if (walletAddress) updates.wallet_address = walletAddress;

    const user = await User.update(req.userId, updates);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, message: 'Profile updated', data: user });
  }),

  updatePassword: asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValid = await User.verifyPassword(user, currentPassword);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid current password' });
    }

    await User.updatePassword(req.userId, newPassword);
    res.json({ success: true, message: 'Password updated successfully' });
  }),

  deleteAccount: asyncHandler(async (req, res) => {
    await User.delete(req.userId);
    res.json({ success: true, message: 'Account deleted successfully' });
  }),
};

module.exports = userController;