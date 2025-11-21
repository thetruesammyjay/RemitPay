import api from './api';

/**
 * Sync wallet connection with backend
 * Used to register the wallet address with the user's profile in DB
 * @param {string} walletAddress 
 */
export const syncWalletWithBackend = async (walletAddress) => {
  try {
    const response = await api.post('/wallets/connect', { walletAddress });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch saved recipients for the user
 */
export const getRecipients = async () => {
  const response = await api.get('/users/recipients');
  return response.data;
};

/**
 * Add a new recipient
 */
export const addRecipient = async (data) => {
  const response = await api.post('/users/recipients', data);
  return response.data;
};