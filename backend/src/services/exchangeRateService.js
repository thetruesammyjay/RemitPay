const axios = require('axios');
const logger = require('../utils/logger');
const { getCache, setCache } = require('../config/redis');

const CACHE_KEY_PREFIX = 'exchange_rate:';
const CACHE_DURATION = 300; // 5 minutes

class ExchangeRateService {
  /**
   * Get exchange rate from cache or API
   */
  static async getRate(fromCurrency, toCurrency) {
    try {
      const cacheKey = `${CACHE_KEY_PREFIX}${fromCurrency}_${toCurrency}`;
      
      // Check cache first
      const cached = await getCache(cacheKey);
      if (cached) {
        logger.debug('Exchange rate from cache:', cached);
        return cached;
      }

      // Fetch from API
      const rate = await this.fetchRate(fromCurrency, toCurrency);
      
      // Cache the result
      await setCache(cacheKey, rate, CACHE_DURATION);
      
      return rate;
    } catch (error) {
      logger.error('Error getting exchange rate:', error);
      // Return fallback rate
      return {
        from: fromCurrency,
        to: toCurrency,
        rate: 1.0,
        timestamp: new Date().toISOString(),
        source: 'fallback',
      };
    }
  }

  /**
   * Fetch exchange rate from external API
   */
  static async fetchRate(fromCurrency, toCurrency) {
    try {
      // Using a free exchange rate API (you can replace with your preferred provider)
      const response = await axios.get(
        `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
      );

      const rate = response.data.rates[toCurrency];
      
      if (!rate) {
        throw new Error(`Rate not found for ${toCurrency}`);
      }

      return {
        from: fromCurrency,
        to: toCurrency,
        rate: parseFloat(rate),
        timestamp: new Date().toISOString(),
        source: 'exchangerate-api',
      };
    } catch (error) {
      logger.error('Error fetching exchange rate:', error);
      throw error;
    }
  }

  /**
   * Convert amount from one currency to another
   */
  static async convert(amount, fromCurrency, toCurrency) {
    try {
      if (fromCurrency === toCurrency) {
        return {
          amount,
          fromCurrency,
          toCurrency,
          rate: 1.0,
          convertedAmount: amount,
        };
      }

      const rateData = await this.getRate(fromCurrency, toCurrency);
      const convertedAmount = parseFloat(amount) * rateData.rate;

      return {
        amount: parseFloat(amount),
        fromCurrency,
        toCurrency,
        rate: rateData.rate,
        convertedAmount: parseFloat(convertedAmount.toFixed(6)),
        timestamp: rateData.timestamp,
      };
    } catch (error) {
      logger.error('Error converting currency:', error);
      throw error;
    }
  }

  /**
   * Get multiple exchange rates
   */
  static async getMultipleRates(baseCurrency, targetCurrencies) {
    try {
      const rates = {};
      
      for (const targetCurrency of targetCurrencies) {
        try {
          rates[targetCurrency] = await this.getRate(baseCurrency, targetCurrency);
        } catch (error) {
          logger.warn(`Failed to get rate for ${targetCurrency}:`, error);
          rates[targetCurrency] = null;
        }
      }

      return rates;
    } catch (error) {
      logger.error('Error getting multiple rates:', error);
      throw error;
    }
  }
}

module.exports = ExchangeRateService;