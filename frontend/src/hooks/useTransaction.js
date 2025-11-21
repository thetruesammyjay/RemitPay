import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { toast } from 'react-toastify';
import api from '../services/api';

export const useTransaction = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, processing, success, error
  const [signature, setSignature] = useState(null);
  const [error, setError] = useState(null);

  const sendSol = async ({ recipient, amount, memo }) => {
    if (!publicKey) {
      toast.error("Wallet not connected");
      return;
    }

    setLoading(true);
    setStatus('processing');
    setError(null);
    setSignature(null);

    try {
      // 1. Validate inputs
      const recipientPubKey = new PublicKey(recipient);
      const lamports = parseFloat(amount) * LAMPORTS_PER_SOL;

      // 2. Build Transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubKey,
          lamports,
        })
      );

      // Add memo if present (using SPL Memo Program ID would be better, but keeping simple)
      // transaction.add(...) 

      // 3. Send to Solana Network
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const txSignature = await sendTransaction(transaction, connection);
      
      // 4. Wait for confirmation
      await connection.confirmTransaction(txSignature, 'confirmed');
      setSignature(txSignature);

      // 5. Record in Backend
      await api.post('/transactions', {
        recipientWallet: recipient,
        amount: parseFloat(amount),
        memo,
        signature: txSignature,
        status: 'completed' // Assuming instant finality for UI
      });

      setStatus('success');
      toast.success(`Sent ${amount} SOL successfully!`);
      return txSignature;

    } catch (err) {
      console.error("Transaction Error:", err);
      const errorMessage = err.message || "Transaction failed";
      setError(errorMessage);
      setStatus('error');
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setStatus('idle');
    setSignature(null);
    setError(null);
  };

  return {
    sendSol,
    loading,
    status,
    signature,
    error,
    resetState
  };
};