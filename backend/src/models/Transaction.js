const db = require('../config/database');
const logger = require('../utils/logger');

class Transaction {
  /**
   * Create a new transaction
   */
  static async create({ senderId, recipientWallet, amount, memo = null }) {
    try {
      const query = `
        INSERT INTO transactions (sender_id, recipient_wallet, amount, status, memo)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      
      const result = await db.query(query, [
        senderId,
        recipientWallet,
        amount,
        'pending',
        memo
      ]);
      
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating transaction:', error);
      throw error;
    }
  }

  /**
   * Find transaction by ID
   */
  static async findById(id) {
    try {
      const query = `
        SELECT t.*, u.email as sender_email, u.wallet_address as sender_wallet
        FROM transactions t
        LEFT JOIN users u ON t.sender_id = u.id
        WHERE t.id = $1
      `;
      const result = await db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding transaction by ID:', error);
      throw error;
    }
  }

  /**
   * Find transaction by signature
   */
  static async findBySignature(signature) {
    try {
      const query = 'SELECT * FROM transactions WHERE signature = $1';
      const result = await db.query(query, [signature]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding transaction by signature:', error);
      throw error;
    }
  }

  /**
   * Get user transactions (sent)
   */
  static async getUserTransactions(userId, { limit = 10, offset = 0, status = null }) {
    try {
      let query = `
        SELECT t.*, u.email as sender_email
        FROM transactions t
        LEFT JOIN users u ON t.sender_id = u.id
        WHERE t.sender_id = $1
      `;
      
      const params = [userId];
      
      if (status) {
        query += ` AND t.status = $${params.length + 1}`;
        params.push(status);
      }
      
      query += ` ORDER BY t.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);
      
      const result = await db.query(query, params);
      
      // Get total count
      const countQuery = status 
        ? 'SELECT COUNT(*) FROM transactions WHERE sender_id = $1 AND status = $2'
        : 'SELECT COUNT(*) FROM transactions WHERE sender_id = $1';
      const countParams = status ? [userId, status] : [userId];
      const countResult = await db.query(countQuery, countParams);
      
      return {
        transactions: result.rows,
        total: parseInt(countResult.rows[0].count),
      };
    } catch (error) {
      logger.error('Error getting user transactions:', error);
      throw error;
    }
  }

  /**
   * Get transactions by recipient wallet
   */
  static async getRecipientTransactions(recipientWallet, { limit = 10, offset = 0, status = null }) {
    try {
      let query = `
        SELECT t.*, u.email as sender_email, u.wallet_address as sender_wallet
        FROM transactions t
        LEFT JOIN users u ON t.sender_id = u.id
        WHERE t.recipient_wallet = $1
      `;
      
      const params = [recipientWallet];
      
      if (status) {
        query += ` AND t.status = $${params.length + 1}`;
        params.push(status);
      }
      
      query += ` ORDER BY t.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);
      
      const result = await db.query(query, params);
      
      // Get total count
      const countQuery = status
        ? 'SELECT COUNT(*) FROM transactions WHERE recipient_wallet = $1 AND status = $2'
        : 'SELECT COUNT(*) FROM transactions WHERE recipient_wallet = $1';
      const countParams = status ? [recipientWallet, status] : [recipientWallet];
      const countResult = await db.query(countQuery, countParams);
      
      return {
        transactions: result.rows,
        total: parseInt(countResult.rows[0].count),
      };
    } catch (error) {
      logger.error('Error getting recipient transactions:', error);
      throw error;
    }
  }

  /**
   * Update transaction status and signature
   */
  static async updateStatus(id, status, signature = null) {
    try {
      const updates = ['status = $2'];
      const params = [id, status];
      let paramCount = 3;

      if (signature) {
        updates.push(`signature = $${paramCount}`);
        params.push(signature);
        paramCount++;
      }

      if (status === 'completed') {
        updates.push('completed_at = NOW()');
      }

      const query = `
        UPDATE transactions
        SET ${updates.join(', ')}
        WHERE id = $1
        RETURNING *
      `;

      const result = await db.query(query, params);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error updating transaction status:', error);
      throw error;
    }
  }

  /**
   * Cancel transaction
   */
  static async cancel(id, userId) {
    try {
      const query = `
        UPDATE transactions
        SET status = 'cancelled'
        WHERE id = $1 AND sender_id = $2 AND status = 'pending'
        RETURNING *
      `;
      
      const result = await db.query(query, [id, userId]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error cancelling transaction:', error);
      throw error;
    }
  }

  /**
   * Get transaction statistics
   */
  static async getStats() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_transactions,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_transactions,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_transactions,
          COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_volume
        FROM transactions
      `;
      
      const result = await db.query(query);
      return result.rows[0];
    } catch (error) {
      logger.error('Error getting transaction stats:', error);
      throw error;
    }
  }

  /**
   * Get pending transactions (for monitoring)
   */
  static async getPendingTransactions() {
    try {
      const query = `
        SELECT * FROM transactions
        WHERE status = 'pending' AND signature IS NOT NULL
        ORDER BY created_at ASC
      `;
      
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      logger.error('Error getting pending transactions:', error);
      throw error;
    }
  }

  /**
   * Delete transaction (admin only)
   */
  static async delete(id) {
    try {
      const query = 'DELETE FROM transactions WHERE id = $1 RETURNING id';
      const result = await db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error deleting transaction:', error);
      throw error;
    }
  }
}

module.exports = Transaction;