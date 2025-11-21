import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TransferForm from '../components/transfer/TransferForm';
import WalletBalance from '../components/wallet/WalletBalance';
import { useWallet } from '../hooks/useWallet';
import { useTransaction } from '../hooks/useTransaction';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Send = () => {
  const { connected } = useWallet();
  const { sendSol, loading, status, signature, error, resetState } = useTransaction();
  const navigate = useNavigate();

  // Cleanup state when leaving page
  useEffect(() => {
    return () => resetState();
  }, []);

  const handleSend = async (formData) => {
    try {
      await sendSol(formData);
      // Optional: Navigate after success or let user start new transfer
      // setTimeout(() => navigate('/history'), 2000);
    } catch (e) {
      // Error handled in hook
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-xl pb-20">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/" className="p-2 hover:bg-white/5 rounded-full text-light-muted hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-white">Send Money</h1>
      </div>

      {!connected ? (
        <div className="bg-dark-surface border border-dark-border rounded-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-dark-bg rounded-full flex items-center justify-center mx-auto text-light-muted">
            <ArrowLeft size={32} className="rotate-180" />
          </div>
          <h3 className="text-xl font-bold text-white">Wallet Not Connected</h3>
          <p className="text-light-muted">Please connect your wallet in the header to start sending funds.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Wallet Balance Card for Context */}
          <WalletBalance />

          {/* Main Form Card */}
          <div className="bg-dark-surface border border-dark-border rounded-2xl p-5 md:p-8 shadow-xl">
            <TransferForm 
              onSend={handleSend}
              loading={loading}
              status={status}
              signature={signature}
              error={error}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Send;