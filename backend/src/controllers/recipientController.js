const Recipient = require('../models/Recipient');
const { asyncHandler } = require('../middleware/errorHandler');

const recipientController = {
  getAll: asyncHandler(async (req, res) => {
    const recipients = await Recipient.findByUserId(req.userId);
    res.json({ success: true, data: recipients });
  }),

  getById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const recipient = await Recipient.getWithStats(id, req.userId);

    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    res.json({ success: true, data: recipient });
  }),

  create: asyncHandler(async (req, res) => {
    const { name, walletAddress } = req.body;

    // Check if recipient already exists
    const existing = await Recipient.findByWallet(req.userId, walletAddress);
    if (existing) {
      return res.status(409).json({ error: 'Recipient already exists' });
    }

    const recipient = await Recipient.create({
      userId: req.userId,
      name,
      walletAddress,
    });

    res.status(201).json({ success: true, message: 'Recipient added', data: recipient });
  }),

  update: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, walletAddress } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (walletAddress) updates.wallet_address = walletAddress;

    const recipient = await Recipient.update(id, req.userId, updates);
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    res.json({ success: true, message: 'Recipient updated', data: recipient });
  }),

  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const recipient = await Recipient.delete(id, req.userId);

    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    res.json({ success: true, message: 'Recipient deleted' });
  }),
};

module.exports = recipientController;