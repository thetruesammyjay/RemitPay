import { useConnection, useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useState, useEffect, useCallback } from 'react';

export const useWallet = () => {
  const { connection } = useConnection();
  const { publicKey, connected, signTransaction, sendTransaction } = useSolanaWallet();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!publicKey) {
      setBalance(0);
      return;
    }
    try {
      setLoading(true);
      const bal = await connection.getBalance(publicKey);
      setBalance(bal / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error("Error fetching balance:", error);
    } finally {
      setLoading(false);
    }
  }, [publicKey, connection]);

  // Auto-fetch balance when connected
  useEffect(() => {
    fetchBalance();
    // Poll every 30s
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [fetchBalance]);

  return {
    publicKey,
    connected,
    balance,
    loading,
    refreshBalance: fetchBalance,
    signTransaction,
    sendTransaction,
    shortAddress: publicKey ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}` : ''
  };
};