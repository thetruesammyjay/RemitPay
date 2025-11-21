const db = require('../config/database');
const bcrypt = require('bcrypt');
const logger = require('../utils/logger');

class User {
  /**
   * Create a new user
   */
  static async create({ email, password, walletAddress }) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const query = `
        INSERT INTO users (email, password_hash, wallet_address)
        VALUES ($1, $2, $3)
        RETURNING id, email, wallet_address, created_at
      `;
      
      const result = await db.query(query, [email, hashedPassword, walletAddress]);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    try {
      const query = 'SELECT id, email, wallet_address, created_at FROM users WHERE id = $1';
      const result = await db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      throw error;
    }
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    try {
      const query = 'SELECT * FROM users WHERE email = $1';
      const result = await db.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw error;
    }
  }

  /**
   * Find user by wallet address
   */
  static async findByWalletAddress(walletAddress) {
    try {
      const query = 'SELECT id, email, wallet_address, created_at FROM users WHERE wallet_address = $1';
      const result = await db.query(query, [walletAddress]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding user by wallet address:', error);
      throw error;
    }
  }

  /**
   * Verify user password
   */
  static async verifyPassword(user, password) {
    try {
      return await bcrypt.compare(password, user.password_hash);
    } catch (error) {
      logger.error('Error verifying password:', error);
      return false;
    }
  }

  /**
   * Update user
   */
  static async update(id, updates) {
    try {
      const allowedUpdates = ['email', 'wallet_address'];
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

      values.push(id);
      const query = `
        UPDATE users
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING id, email, wallet_address, created_at
      `;

      const result = await db.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Update user password
   */
  static async updatePassword(id, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const query = 'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id';
      const result = await db.query(query, [hashedPassword, id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error updating password:', error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  static async delete(id) {
    try {
      const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
      const result = await db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  static async getStats(userId) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_transactions,
          COALESCE(SUM(amount), 0) as total_sent,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_transactions
        FROM transactions
        WHERE sender_id = $1
      `;
      const result = await db.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      logger.error('Error getting user stats:', error);
      throw error;
    }
  }
}

module.exports = User;