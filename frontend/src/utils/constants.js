import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';

// Network Configuration
export const NETWORK = WalletAdapterNetwork.Devnet;
export const ENDPOINT = clusterApiUrl(NETWORK);

// Token Mints (Devnet)
export const USDC_MINT_ADDRESS = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'; // Devnet USDC

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Transaction Statuses
export const TX_STATUS = {
  IDLE: 'idle',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'remiteasy_token',
  USER: 'remiteasy_user',
  THEME: 'remiteasy_theme',
};