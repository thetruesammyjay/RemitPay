const {
  Transaction: SolanaTransaction,
  SystemProgram,
  PublicKey,
  LAMPORTS_PER_SOL,
} = require('@solana/web3.js');
const { Token, TOKEN_PROGRAM_ID } = require('@solana/spl-token');
const { connection, getProgramId, getBackendKeypair, getUsdcMint } = require('../config/solana');
const logger = require('../utils/logger');
const { usdcToLamports, retryWithBackoff } = require('../utils/helpers');

class SolanaService {
  /**
   * Get SOL balance for an address
   */
  static async getSolBalance(address) {
    try {
      const publicKey = new PublicKey(address);
      const balance = await connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      logger.error('Error getting SOL balance:', error);
      throw new Error('Failed to fetch SOL balance');
    }
  }

  /**
   * Get USDC balance for an address
   */
  static async getUsdcBalance(address) {
    try {
      const publicKey = new PublicKey(address);
      const usdcMint = getUsdcMint();
      
      // Get token accounts
      const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, {
        mint: usdcMint,
      });

      if (tokenAccounts.value.length === 0) {
        return 0;
      }

      // Get balance from first account
      const accountInfo = await connection.getTokenAccountBalance(
        tokenAccounts.value[0].pubkey
      );

      return parseFloat(accountInfo.value.uiAmount) || 0;
    } catch (error) {
      logger.error('Error getting USDC balance:', error);
      throw new Error('Failed to fetch USDC balance');
    }
  }

  /**
   * Get transaction details
   */
  static async getTransaction(signature) {
    try {
      const tx = await connection.getTransaction(signature, {
        commitment: 'confirmed',
      });
      
      return tx;
    } catch (error) {
      logger.error('Error getting transaction:', error);
      throw new Error('Failed to fetch transaction');
    }
  }

  /**
   * Confirm transaction
   */
  static async confirmTransaction(signature, maxRetries = 30) {
    try {
      logger.info(`Confirming transaction: ${signature}`);
      
      for (let i = 0; i < maxRetries; i++) {
        const status = await connection.getSignatureStatus(signature);
        
        if (status && status.value) {
          if (status.value.err) {
            logger.error('Transaction failed:', status.value.err);
            return { confirmed: false, error: status.value.err };
          }
          
          if (status.value.confirmationStatus === 'confirmed' || 
              status.value.confirmationStatus === 'finalized') {
            logger.info(`Transaction confirmed: ${signature}`);
            return { confirmed: true, status: status.value };
          }
        }
        
        // Wait before checking again
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      logger.warn(`Transaction confirmation timeout: ${signature}`);
      return { confirmed: false, error: 'Confirmation timeout' };
    } catch (error) {
      logger.error('Error confirming transaction:', error);
      return { confirmed: false, error: error.message };
    }
  }

  /**
   * Monitor transaction status
   */
  static async monitorTransaction(signature, callback) {
    try {
      const result = await this.confirmTransaction(signature);
      
      if (result.confirmed) {
        callback(null, result);
      } else {
        callback(new Error(result.error || 'Transaction failed'), null);
      }
    } catch (error) {
      callback(error, null);
    }
  }

  /**
   * Get recent transactions for an address
   */
  static async getRecentTransactions(address, limit = 10) {
    try {
      const publicKey = new PublicKey(address);
      const signatures = await connection.getSignaturesForAddress(publicKey, {
        limit,
      });
      
      const transactions = [];
      
      for (const sig of signatures) {
        try {
          const tx = await this.getTransaction(sig.signature);
          if (tx) {
            transactions.push({
              signature: sig.signature,
              blockTime: sig.blockTime,
              slot: sig.slot,
              err: sig.err,
              memo: sig.memo,
            });
          }
        } catch (error) {
          logger.warn(`Failed to fetch transaction ${sig.signature}:`, error);
        }
      }
      
      return transactions;
    } catch (error) {
      logger.error('Error getting recent transactions:', error);
      throw new Error('Failed to fetch recent transactions');
    }
  }

  /**
   * Create USDC token account if it doesn't exist
   */
  static async getOrCreateTokenAccount(walletAddress) {
    try {
      const publicKey = new PublicKey(walletAddress);
      const usdcMint = getUsdcMint();
      
      // Check if account exists
      const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, {
        mint: usdcMint,
      });

      if (tokenAccounts.value.length > 0) {
        return tokenAccounts.value[0].pubkey;
      }

      // Account doesn't exist - user needs to create it
      logger.info('USDC token account does not exist for:', walletAddress);
      return null;
    } catch (error) {
      logger.error('Error getting/creating token account:', error);
      throw new Error('Failed to check token account');
    }
  }

  /**
   * Estimate transaction fee
   */
  static async estimateFee() {
    try {
      const { feeCalculator } = await connection.getRecentBlockhash();
      return feeCalculator.lamportsPerSignature / LAMPORTS_PER_SOL;
    } catch (error) {
      logger.error('Error estimating fee:', error);
      // Return default estimate
      return 0.000005; // 5000 lamports
    }
  }

  /**
   * Get network status
   */
  static async getNetworkStatus() {
    try {
      const health = await connection.getHealth();
      const slot = await connection.getSlot();
      const blockHeight = await connection.getBlockHeight();
      
      return {
        healthy: health === 'ok',
        slot,
        blockHeight,
      };
    } catch (error) {
      logger.error('Error getting network status:', error);
      return {
        healthy: false,
        error: error.message,
      };
    }
  }

  /**
   * Validate address
   */
  static isValidAddress(address) {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = SolanaService;