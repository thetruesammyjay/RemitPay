const Transaction = require('../models/Transaction');
const SolanaService = require('../services/solanaService');
const NotificationService = require('../services/notificationService');
const { asyncHandler } = require('../middleware/errorHandler');
const { paginate, buildPaginationResponse } = require('../utils/helpers');

const transactionController = {
  send: asyncHandler(async (req, res) => {
    const { recipientWallet, amount, memo } = req.body;
    const senderId = req.userId;

    // Create transaction record
    const transaction = await Transaction.create({
      senderId,
      recipientWallet,
      amount,
      memo,
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created. Please sign and submit to blockchain.',
      data: transaction,
    });
  }),

  updateSignature: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { signature } = req.body;

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.sender_id !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Transaction.updateStatus(id, 'pending', signature);

    // Monitor transaction in background
    SolanaService.monitorTransaction(signature, async (error, result) => {
      if (error) {
        await Transaction.updateStatus(id, 'failed');
        NotificationService.notifyTransferFailed({
          email: transaction.sender_email,
          amount: transaction.amount,
          recipientWallet: transaction.recipient_wallet,
          reason: error.message,
        });
      } else {
        await Transaction.updateStatus(id, 'completed', signature);
        NotificationService.notifyTransferCompleted({
          email: transaction.sender_email,
          amount: transaction.amount,
          recipientWallet: transaction.recipient_wallet,
          signature,
        });
      }
    });

    res.json({ success: true, message: 'Transaction submitted. Monitoring confirmation.' });
  }),

  getAll: asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    const { limit: paginationLimit, offset } = paginate(page, limit);

    const result = await Transaction.getUserTransactions(req.userId, {
      limit: paginationLimit,
      offset,
      status,
    });

    res.json({
      success: true,
      ...buildPaginationResponse(result.transactions, result.total, parseInt(page), paginationLimit),
    });
  }),

  getById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.sender_id !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({ success: true, data: transaction });
  }),

  cancel: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const transaction = await Transaction.cancel(id, req.userId);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found or cannot be cancelled' });
    }

    res.json({ success: true, message: 'Transaction cancelled', data: transaction });
  }),

  getStats: asyncHandler(async (req, res) => {
    const stats = await Transaction.getStats();
    res.json({ success: true, data: stats });
  }),
};

module.exports = transactionController;