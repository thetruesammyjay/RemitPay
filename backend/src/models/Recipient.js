const db = require('../config/database');
const logger = require('../utils/logger');

class Recipient {
  /**
   * Create a new recipient
   */
  static async create({ userId, name, walletAddress }) {
    try {
      const query = `
        INSERT INTO recipients (user_id, name, wallet_address)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      
      const result = await db.query(query, [userId, name, walletAddress]);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating recipient:', error);
      throw error;
    }
  }

  /**
   * Find recipient by ID
   */
  static async findById(id, userId) {
    try {
      const query = 'SELECT * FROM recipients WHERE id = $1 AND user_id = $2';
      const result = await db.query(query, [id, userId]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding recipient by ID:', error);
      throw error;
    }
  }

  /**
   * Get all recipients for a user
   */
  static async findByUserId(userId) {
    try {
      const query = `
        SELECT * FROM recipients
        WHERE user_id = $1
        ORDER BY created_at DESC
      `;
      
      const result = await db.query(query, [userId]);
      return result.rows;
    } catch (error) {
      logger.error('Error finding recipients by user ID:', error);
      throw error;
    }
  }

  /**
   * Find recipient by wallet address
   */
  static async findByWallet(userId, walletAddress) {
    try {
      const query = `
        SELECT * FROM recipients
        WHERE user_id = $1 AND wallet_address = $2
      `;
      
      const result = await db.query(query, [userId, walletAddress]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding recipient by wallet:', error);
      throw error;
    }
  }

  /**
   * Update recipient
   */
  static async update(id, userId, updates) {
    try {
      const allowedUpdates = ['name', 'wallet_address'];
      const updateFields = [];
      const values = [];
      let paramCount = 1;

      Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
          updateFields.push(`${key} = $${paramCount}`);
          values.push(updates[key]);
          paramCount++;
        }
      });

      if (updateFields.length === 0) {
        return null;
      }

      values.push(id, userId);
      const query = `
        UPDATE recipients
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
        RETURNING *
      `;

      const result = await db.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error updating recipient:', error);
      throw error;
    }
  }

  /**
   * Delete recipient
   */
  static async delete(id, userId) {
    try {
      const query = 'DELETE FROM recipients WHERE id = $1 AND user_id = $2 RETURNING id';
      const result = await db.query(query, [id, userId]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error deleting recipient:', error);
      throw error;
    }
  }

  /**
   * Get recipient with transaction stats
   */
  static async getWithStats(id, userId) {
    try {
      const query = `
        SELECT 
          r.*,
          COUNT(t.id) as total_transactions,
          COALESCE(SUM(t.amount), 0) as total_sent
        FROM recipients r
        LEFT JOIN transactions t ON t.recipient_wallet = r.wallet_address AND t.sender_id = $2
        WHERE r.id = $1 AND r.user_id = $2
        GROUP BY r.id
      `;
      
      const result = await db.query(query, [id, userId]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error getting recipient with stats:', error);
      throw error;
    }
  }
}

module.exports = Recipient;