const { PublicKey } = require('@solana/web3.js');

/**
 * Validate if string is a valid Solana public key
 */
const isValidPublicKey = (address) => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * At least 8 characters, 1 uppercase, 1 lowercase, 1 number
 */
const isValidPassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Validate amount is positive number
 */
const isValidAmount = (amount) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};

/**
 * Validate transaction signature format
 */
const isValidSignature = (signature) => {
  return typeof signature === 'string' && signature.length === 88;
};

/**
 * Sanitize input to prevent XSS
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/[<>]/g, '')
    .trim();
};

/**
 * Validate memo length
 */
const isValidMemo = (memo) => {
  if (!memo) return true; // Memo is optional
  return typeof memo === 'string' && memo.length <= 200;
};

module.exports = {
  isValidPublicKey,
  isValidEmail,
  isValidPassword,
  isValidAmount,
  isValidSignature,
  sanitizeInput,
  isValidMemo,
};