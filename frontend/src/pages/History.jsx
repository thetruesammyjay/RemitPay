import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import api from '../services/api';
import { useWallet } from '../hooks/useWallet';
import Spinner from '../components/common/Spinner';
import Input from '../components/common/Input';

const History = () => {
  const { connected, publicKey } = useWallet();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      if (!connected) return;
      
      setLoading(true);
      try {
        // Assuming backend endpoint
        const response = await api.get('/transactions');
        setTransactions(response.data || []);
      } catch (error) {
        console.error("Failed to fetch history", error);
        // Fallback mock data for UI demo if backend is empty
        setTransactions([
          { id: 1, type: 'send', amount: 1.5, recipient: '8xrt...9jKs', date: new Date(), status: 'completed' },
          { id: 2, type: 'receive', amount: 5.0, sender: 'Cb4...Lm90', date: new Date(Date.now() - 86400000), status: 'completed' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [connected]);

  const TransactionItem = ({ tx }) => {
    const isSend = tx.type === 'send' || (tx.sender_id && tx.sender_id === publicKey?.toBase58());
    
    return (
      <div className="bg-dark-surface border border-dark-border p-4 rounded-xl flex items-center justify-between hover:border-primary/50 transition-colors group">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${isSend ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
            {isSend ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
          </div>
          <div>
            <p className="font-bold text-white text-sm md:text-base">
              {isSend ? 'Sent SOL' : 'Received SOL'}
            </p>
            <p className="text-xs text-light-muted">
              {format(new Date(tx.date || tx.created_at), 'MMM dd, HH:mm')} • {tx.status}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-mono font-bold ${isSend ? 'text-white' : 'text-success'}`}>
            {isSend ? '-' : '+'}{tx.amount} SOL
          </p>
          <p className="text-xs text-light-muted truncate w-20 md:w-32">
            {isSend ? `To: ${tx.recipient}` : `From: ${tx.sender}`}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-3xl pb-20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-white/5 rounded-full text-light-muted hover:text-white transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-white">History</h1>
        </div>
      </div>

      {!connected ? (
        <div className="text-center py-20 bg-dark-surface border border-dark-border rounded-2xl">
          <p className="text-light-muted">Connect wallet to view history</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-2">
            <Input 
              placeholder="Search transactions..." 
              icon={Search} 
              className="bg-dark-surface"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <button className="p-3 bg-dark-surface border border-dark-border rounded-xl text-light-muted hover:text-white hover:border-primary transition-colors">
              <Filter size={20} />
            </button>
          </div>

          {/* List */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <TransactionItem key={tx.id} tx={tx} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-light-muted">
              <History size={48} className="mx-auto mb-4 opacity-20" />
              <p>No transactions found yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default History;