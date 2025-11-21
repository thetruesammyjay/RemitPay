const crypto = require('crypto');

/**
 * Generate random string for tokens
 */
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Format amount to USDC decimals (6 decimals)
 */
const formatUsdcAmount = (amount) => {
  return parseFloat(amount).toFixed(6);
};

/**
 * Convert USDC amount to lamports (smallest unit)
 */
const usdcToLamports = (usdcAmount) => {
  return Math.floor(parseFloat(usdcAmount) * 1000000);
};

/**
 * Convert lamports to USDC
 */
const lamportsToUsdc = (lamports) => {
  return (parseInt(lamports) / 1000000).toFixed(6);
};

/**
 * Calculate fee based on amount
 */
const calculateFee = (amount, feePercentage = 0.001) => {
  const fee = parseFloat(amount) * feePercentage;
  return Math.max(fee, 0.01); // Minimum fee of 0.01 USDC
};

/**
 * Format date to ISO string
 */
const formatDate = (date) => {
  return new Date(date).toISOString();
};

/**
 * Paginate results
 */
const paginate = (page = 1, limit = 10) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;
  
  return {
    limit: limitNum,
    offset,
    page: pageNum,
  };
};

/**
 * Build pagination response
 */
const buildPaginationResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

/**
 * Sleep for specified milliseconds
 */
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry function with exponential backoff
 */
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = baseDelay * Math.pow(2, i);
      await sleep(delay);
    }
  }
};

/**
 * Mask sensitive data for logging
 */
const maskSensitiveData = (data) => {
  if (!data) return data;
  
  const masked = { ...data };
  const sensitiveFields = ['password', 'privateKey', 'secretKey', 'apiKey'];
  
  sensitiveFields.forEach(field => {
    if (masked[field]) {
      masked[field] = '***REDACTED***';
    }
  });
  
  return masked;
};

module.exports = {
  generateRandomString,
  formatUsdcAmount,
  usdcToLamports,
  lamportsToUsdc,
  calculateFee,
  formatDate,
  paginate,
  buildPaginationResponse,
  sleep,
  retryWithBackoff,
  maskSensitiveData,
};