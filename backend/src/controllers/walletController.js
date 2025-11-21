const Wallet = require('../models/Wallet');
const SolanaService = require('../services/solanaService');
const { asyncHandler } = require('../middleware/errorHandler');

const walletController = {
  connect: asyncHandler(async (req, res) => {
    const { walletAddress } = req.body;
    const user = await Wallet.connect(req.userId, walletAddress);

    res.json({ success: true, message: 'Wallet connected', data: user });
  }),

  disconnect: asyncHandler(async (req, res) => {
    const user = await Wallet.disconnect(req.userId);
    res.json({ success: true, message: 'Wallet disconnected', data: user });
  }),

  getBalance: asyncHandler(async (req, res) => {
    const walletInfo = await Wallet.getInfo(req.userId);
    if (!walletInfo || !walletInfo.wallet_address) {
      return res.status(404).json({ error: 'No wallet connected' });
    }

    const solBalance = await SolanaService.getSolBalance(walletInfo.wallet_address);
    const usdcBalance = await SolanaService.getUsdcBalance(walletInfo.wallet_address);

    res.json({
      success: true,
      data: {
        walletAddress: walletInfo.wallet_address,
        solBalance,
        usdcBalance,
        stats: {
          totalTransactions: walletInfo.total_transactions,
          totalSent: walletInfo.total_sent,
          lastTransaction: walletInfo.last_transaction,
        },
      },
    });
  }),

  getTransactions: asyncHandler(async (req, res) => {
    const walletInfo = await Wallet.getInfo(req.userId);
    if (!walletInfo || !walletInfo.wallet_address) {
      return res.status(404).json({ error: 'No wallet connected' });
    }

    const transactions = await SolanaService.getRecentTransactions(walletInfo.wallet_address);
    res.json({ success: true, data: transactions });
  }),

  getInfo: asyncHandler(async (req, res) => {
    const info = await Wallet.getInfo(req.userId);
    if (!info) {
      return res.status(404).json({ error: 'No wallet connected' });
    }

    res.json({ success: true, data: info });
  }),
};

module.exports = walletController;