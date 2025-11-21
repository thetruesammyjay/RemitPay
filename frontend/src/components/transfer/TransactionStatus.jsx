import React from 'react';
import { CheckCircle2, Loader2, XCircle, ExternalLink } from 'lucide-react';

const TransactionStatus = ({ status, signature, error }) => {
  // status: 'idle' | 'processing' | 'success' | 'error'

  if (status === 'idle') return null;

  const config = {
    processing: {
      icon: Loader2,
      color: 'text-warning',
      bg: 'bg-warning/10',
      title: 'Processing Transaction',
      desc: 'Confirming on Solana blockchain...'
    },
    success: {
      icon: CheckCircle2,
      color: 'text-success',
      bg: 'bg-success/10',
      title: 'Transfer Successful',
      desc: 'Funds have been sent.'
    },
    error: {
      icon: XCircle,
      color: 'text-error',
      bg: 'bg-error/10',
      title: 'Transaction Failed',
      desc: error || 'Something went wrong.'
    }
  };

  const current = config[status];
  const Icon = current.icon;

  return (
    <div className={`rounded-xl p-4 border ${current.bg} border-opacity-20 flex items-start gap-4`}>
      <div className={`p-2 rounded-full bg-dark-bg ${current.color} ${status === 'processing' ? 'animate-spin' : ''}`}>
        <Icon size={24} />
      </div>
      <div className="flex-1">
        <h4 className={`font-bold ${current.color}`}>{current.title}</h4>
        <p className="text-sm text-light-muted mt-1">{current.desc}</p>
        
        {signature && (
          <a 
            href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary mt-2 hover:underline"
          >
            View on Explorer <ExternalLink size={10} />
          </a>
        )}
      </div>
    </div>
  );
};

export default TransactionStatus;