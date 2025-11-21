import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { ENDPOINT } from '../utils/constants';

// Create a connection instance that can be reused outside of React hooks
// (Useful for Redux thunks or background services)
export const connection = new Connection(ENDPOINT, 'confirmed');

/**
 * Get SOL balance for a public key
 * @param {string} publicKeyStr 
 * @returns {Promise<number>} Balance in SOL
 */
export const getSolBalance = async (publicKeyStr) => {
  try {
    const publicKey = new PublicKey(publicKeyStr);
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error fetching SOL balance:', error);
    throw error;
  }
};

/**
 * Get recent transaction history for a wallet directly from chain
 * (Fallback if backend API is down)
 * @param {string} publicKeyStr 
 * @param {number} limit 
 */
export const getChainHistory = async (publicKeyStr, limit = 10) => {
  try {
    const publicKey = new PublicKey(publicKeyStr);
    const signatures = await connection.getSignaturesForAddress(publicKey, { limit });
    return signatures;
  } catch (error) {
    console.error('Error fetching chain history:', error);
    return [];
  }
};