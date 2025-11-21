const { Connection, Keypair, PublicKey, clusterApiUrl } = require('@solana/web3.js');
const logger = require('../utils/logger');

// Determine network
const getNetwork = () => {
  const network = process.env.SOLANA_NETWORK || 'devnet';
  return network === 'mainnet-beta' ? 'mainnet-beta' : 'devnet';
};

// Get RPC URL
const getRpcUrl = () => {
  if (process.env.SOLANA_RPC_URL) {
    return process.env.SOLANA_RPC_URL;
  }
  return clusterApiUrl(getNetwork());
};

// Initialize connection
const connection = new Connection(getRpcUrl(), {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 60000,
});

// Load program ID
const getProgramId = () => {
  if (!process.env.PROGRAM_ID) {
    throw new Error('PROGRAM_ID environment variable not set');
  }
  return new PublicKey(process.env.PROGRAM_ID);
};

// Load backend wallet keypair
const getBackendKeypair = () => {
  if (!process.env.SOLANA_PRIVATE_KEY) {
    logger.warn('SOLANA_PRIVATE_KEY not set, some features may not work');
    return null;
  }

  try {
    const secretKey = JSON.parse(process.env.SOLANA_PRIVATE_KEY);
    return Keypair.fromSecretKey(Uint8Array.from(secretKey));
  } catch (error) {
    logger.error('Failed to parse SOLANA_PRIVATE_KEY:', error);
    return null;
  }
};

// USDC Mint address (devnet or mainnet)
const getUsdcMint = () => {
  const network = getNetwork();
  if (process.env.USDC_MINT_ADDRESS) {
    return new PublicKey(process.env.USDC_MINT_ADDRESS);
  }
  
  // Default USDC mint addresses
  if (network === 'mainnet-beta') {
    return new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
  } else {
    // Devnet USDC (you'll need to create this)
    return new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');
  }
};

// Validate connection
const validateConnection = async () => {
  try {
    const version = await connection.getVersion();
    logger.info(`Connected to Solana ${getNetwork()}`, { version });
    return true;
  } catch (error) {
    logger.error('Failed to connect to Solana:', error);
    return false;
  }
};

module.exports = {
  connection,
  getProgramId,
  getBackendKeypair,
  getUsdcMint,
  getNetwork,
  getRpcUrl,
  validateConnection,
};