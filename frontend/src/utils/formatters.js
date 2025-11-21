import { format, isValid } from 'date-fns';

/**
 * Shortens a Solana wallet address
 * @param {string} address - The full wallet address
 * @param {number} chars - Number of characters to show at start/end
 * @returns {string} - Formatted address (e.g., "8xrt...9jKs")
 */
export const shortenAddress = (address, chars = 4) => {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

/**
 * Formats a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (USD, NGN, SOL)
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (isNaN(amount)) return '0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: currency === 'SOL' ? 'decimal' : 'currency',
    currency: currency === 'SOL' ? undefined : currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: currency === 'SOL' ? 4 : 2,
  }).format(amount) + (currency === 'SOL' ? ' SOL' : '');
};

/**
 * Formats a date string or object
 * @param {string|Date} date - Date to format
 * @param {string} formatStr - Format string (default: 'MMM dd, yyyy HH:mm')
 * @returns {string} - Formatted date
 */
export const formatDate = (date, formatStr = 'MMM dd, yyyy HH:mm') => {
  const d = new Date(date);
  if (!isValid(d)) return 'Invalid Date';
  return format(d, formatStr);
};