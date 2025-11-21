const axios = require('axios');
const logger = require('../utils/logger');

const CIRCLE_API_BASE = 'https://api.circle.com/v1';
const CIRCLE_API_KEY = process.env.CIRCLE_API_KEY;

class CircleService {
  /**
   * Get Circle API headers
   */
  static getHeaders() {
    return {
      'Authorization': `Bearer ${CIRCLE_API_KEY}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get USDC balance (if using Circle account)
   */
  static async getBalance() {
    try {
      if (!CIRCLE_API_KEY) {
        logger.warn('Circle API key not configured');
        return null;
      }

      const response = await axios.get(`${CIRCLE_API_BASE}/balances`, {
        headers: this.getHeaders(),
      });

      return response.data;
    } catch (error) {
      logger.error('Error getting Circle balance:', error.response?.data || error.message);
      throw new Error('Failed to fetch Circle balance');
    }
  }

  /**
   * Create a transfer (for fiat on/off ramp in future)
   */
  static async createTransfer(data) {
    try {
      if (!CIRCLE_API_KEY) {
        throw new Error('Circle API key not configured');
      }

      const response = await axios.post(
        `${CIRCLE_API_BASE}/transfers`,
        data,
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error) {
      logger.error('Error creating Circle transfer:', error.response?.data || error.message);
      throw new Error('Failed to create transfer');
    }
  }

  /**
   * Get transfer status
   */
  static async getTransfer(transferId) {
    try {
      if (!CIRCLE_API_KEY) {
        throw new Error('Circle API key not configured');
      }

      const response = await axios.get(
        `${CIRCLE_API_BASE}/transfers/${transferId}`,
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error) {
      logger.error('Error getting Circle transfer:', error.response?.data || error.message);
      throw new Error('Failed to fetch transfer');
    }
  }

  /**
   * Get USDC exchange rate (placeholder for future implementation)
   */
  static async getExchangeRate(fromCurrency, toCurrency) {
    // This would integrate with Circle's pricing APIs
    // For now, return a placeholder
    logger.info(`Getting exchange rate: ${fromCurrency} to ${toCurrency}`);
    return {
      from: fromCurrency,
      to: toCurrency,
      rate: 1.0, // Placeholder
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = CircleService;