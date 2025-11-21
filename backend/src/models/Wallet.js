const db = require('../config/database');
const logger = require('../utils/logger');

class Wallet {
  /**
   * Associate wallet with user
   */
  static async connect(userId, walletAddress) {
    try {
      // Check if wallet is already connected to another user
      const existingQuery = 'SELECT * FROM users WHERE wallet_address = $1 AND id != $2';
      const existing = await db.query(existingQuery, [walletAddress, userId]);
      
      if (existing.rows.length > 0) {
        throw new Error('Wallet already connected to another account');
      }

      // Update user's wallet address
      const query = `
        UPDATE users
        SET wallet_address = $1
        WHERE id = $2
        RETURNING id, email, wallet_address, created_at
      `;
      
      const result = await db.query(query, [walletAddress, userId]);
      return result.rows[0];
    } catch (error) {
      logger.error('Error connecting wallet:', error);
      throw error;
    }
  }

  /**
   * Disconnect wallet from user
   */
  static async disconnect(userId) {
    try {
      const query = `
        UPDATE users
        SET wallet_address = NULL
        WHERE id = $1
        RETURNING id, email, wallet_address, created_at
      `;
      
      const result = await db.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      logger.error('Error disconnecting wallet:', error);
      throw error;
    }
  }

  /**
   * Get wallet information for user
   */
  static async getInfo(userId) {
    try {
      const query = `
        SELECT 
          u.wallet_address,
          COUNT(t.id) as total_transactions,
          COALESCE(SUM(CASE WHEN t.status = 'completed' THEN t.amount ELSE 0 END), 0) as total_sent,
          MAX(t.created_at) as last_transaction
        FROM users u
        LEFT JOIN transactions t ON t.sender_id = u.id
        WHERE u.id = $1
        GROUP BY u.id, u.wallet_address
      `;
      
      const result = await db.query(query, [userId]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error getting wallet info:', error);
      throw error;
    }
  }

  /**
   * Verify wallet ownership (for authentication)
   */
  static async verifyOwnership(walletAddress) {
    try {
      const query = 'SELECT id, email, wallet_address FROM users WHERE wallet_address = $1';
      const result = await db.query(query, [walletAddress]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error verifying wallet ownership:', error);
      throw error;
    }
  }

  /**
   * Check if wallet is connected
   */
  static async isConnected(walletAddress) {
    try {
      const query = 'SELECT id FROM users WHERE wallet_address = $1';
      const result = await db.query(query, [walletAddress]);
      return result.rows.length > 0;
    } catch (error) {
      logger.error('Error checking wallet connection:', error);
      throw error;
    }
  }
}

module.exports = Wallet;