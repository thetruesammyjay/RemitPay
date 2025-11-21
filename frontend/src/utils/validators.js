import { PublicKey } from '@solana/web3.js';

/**
 * Validates a Solana wallet address
 * @param {string} address - The address to validate
 * @returns {boolean}
 */
export const isValidSolanaAddress = (address) => {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Validates a transaction amount
 * @param {number|string} amount - The amount to check
 * @param {number} balance - Current wallet balance
 * @returns {string|null} - Error message or null if valid
 */
export const validateAmount = (amount, balance) => {
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount) || numAmount <= 0) {
    return 'Please enter a valid amount greater than 0';
  }
  
  if (balance !== undefined && numAmount > balance) {
    return 'Insufficient funds';
  }
  
  return null;
};

/**
 * Validates an email address
 * @param {string} email 
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};