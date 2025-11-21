import React from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Wallet, RefreshCw } from 'lucide-react';

const WalletBalance = ({ refreshTrigger }) => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  const fetchBalance = React.useCallback(async () => {
    if (!publicKey) return;
    setLoading(true);
    try {
      const bal = await connection.getBalance(publicKey);
      setBalance(bal / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error("Failed to fetch balance", error);
    } finally {
      setLoading(false);
    }
  }, [connection, publicKey]);

  React.useEffect(() => {
    fetchBalance();
  }, [fetchBalance, refreshTrigger]);

  if (!publicKey) return null;

  return (
    <div className="bg-dark-surface border border-dark-border rounded-xl p-4 flex items-center justify-between shadow-lg relative overflow-hidden">
      <div className="flex items-center gap-3 md:gap-4 relative z-10">
        <div className="p-2.5 bg-secondary/10 rounded-xl text-secondary shrink-0">
          <Wallet size={24} />
        </div>
        <div>
          <p className="text-xs text-light-muted uppercase tracking-wider font-medium">Total Balance</p>
          <p className="text-lg md:text-2xl font-bold text-white font-mono leading-tight">
            {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} 
            <span className="text-sm md:text-lg text-light-muted ml-1">SOL</span>
          </p>
        </div>
      </div>
      
      <button 
        onClick={fetchBalance}
        className={`p-2 rounded-lg text-light-muted hover:bg-white/5 hover:text-white transition-all active:scale-95 ${loading ? 'animate-spin' : ''}`}
        aria-label="Refresh balance"
      >
        <RefreshCw size={20} />
      </button>
    </div>
  );
};

export default WalletBalance;