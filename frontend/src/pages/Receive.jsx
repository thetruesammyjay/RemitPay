import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Share2 } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import Button from '../components/common/Button';

const Receive = () => {
  const { publicKey, connected } = useWallet();
  const [copied, setCopied] = useState(false);

  const address = publicKey ? publicKey.toBase58() : '';

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share && address) {
      try {
        await navigator.share({
          title: 'My RemitEasy Address',
          text: address,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-lg h-[calc(100vh-80px)] flex flex-col">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/" className="p-2 hover:bg-white/5 rounded-full text-light-muted hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-white">Receive</h1>
      </div>

      {!connected ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-dark-surface border border-dark-border rounded-2xl p-8 text-center">
          <p className="text-light-muted mb-4">Connect your wallet to view your address</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center bg-dark-surface border border-dark-border rounded-2xl p-6 md:p-10 shadow-2xl relative">
          
          <div className="text-center mb-8">
            <h2 className="text-white font-bold text-lg mb-2">Scan to Pay</h2>
            <p className="text-light-muted text-sm">Send only Solana (SOL) or SPL tokens to this address.</p>
          </div>

          {/* QR Code Container */}
          <div className="bg-white p-4 rounded-2xl shadow-lg mb-8">
            {/* Using a reliable QR API to avoid extra dependencies */}
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${address}&bgcolor=ffffff`}
              alt="Wallet QR Code"
              className="w-48 h-48 md:w-64 md:h-64 object-contain"
            />
          </div>

          {/* Address Display */}
          <div className="w-full bg-dark-bg border border-dark-border rounded-xl p-4 mb-6 flex items-center justify-between gap-3 group">
            <p className="text-light-muted font-mono text-xs md:text-sm break-all text-center w-full">
              {address}
            </p>
          </div>

          <div className="flex gap-3 w-full">
            <Button 
              className="flex-1" 
              variant="secondary" 
              onClick={handleCopy}
              icon={copied ? Check : Copy}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button 
              className="flex-1" 
              variant="outline" 
              onClick={handleShare}
              icon={Share2}
            >
              Share
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Receive;