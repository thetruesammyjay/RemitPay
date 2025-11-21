import React from 'react';
import { Link } from 'react-router-dom';
import { Send, ArrowDownLeft, History, TrendingUp } from 'lucide-react';
import WalletBalance from '../components/wallet/WalletBalance';
import Button from '../components/common/Button';
import { useWallet } from '../hooks/useWallet';

const Home = () => {
  const { connected } = useWallet();

  const QuickAction = ({ to, icon: Icon, label, colorClass }) => (
    <Link to={to} className="flex-1">
      <div className="bg-dark-surface border border-dark-border rounded-2xl p-4 md:p-6 flex flex-col items-center gap-3 hover:border-primary transition-all active:scale-95 group h-full justify-center">
        <div className={`p-3 md:p-4 rounded-full ${colorClass} bg-opacity-10 group-hover:scale-110 transition-transform`}>
          <Icon size={24} className={colorClass.replace('bg-', 'text-')} />
        </div>
        <span className="font-medium text-sm md:text-base text-white">{label}</span>
      </div>
    </Link>
  );

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8 max-w-5xl pb-20 md:pb-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          Welcome Back
        </h1>
        <WalletBalance />
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-sm font-medium text-light-muted mb-3 uppercase tracking-wider">Quick Actions</h2>
        <div className="flex gap-3 md:gap-4">
          <QuickAction 
            to="/send" 
            icon={Send} 
            label="Send" 
            colorClass="bg-primary text-primary" 
          />
          <QuickAction 
            to="/receive" 
            icon={ArrowDownLeft} 
            label="Receive" 
            colorClass="bg-secondary text-secondary" 
          />
          <QuickAction 
            to="/history" 
            icon={History} 
            label="History" 
            colorClass="bg-tertiary text-tertiary" 
          />
        </div>
      </div>

      {/* Market / Promo Section */}
      <div className="bg-gradient-to-br from-dark-surface to-dark-bg border border-dark-border rounded-2xl p-5 md:p-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 text-primary">
            <TrendingUp size={20} />
            <span className="font-bold">Market Update</span>
          </div>
          <p className="text-white text-lg md:text-xl font-bold mb-1">SOL is up 5.2% today</p>
          <p className="text-light-muted text-sm md:text-base mb-4 max-w-md">
            Exchange rates are favorable. Send money internationally with near-zero fees now.
          </p>
          <Link to="/send">
            <Button size="sm" variant="outline">Send Now</Button>
          </Link>
        </div>
        {/* Decorative BG element */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
      </div>

      {/* Recent Activity Placeholder */}
      <div>
        <div className="flex justify-between items-end mb-3">
          <h2 className="text-sm font-medium text-light-muted uppercase tracking-wider">Recent Activity</h2>
          <Link to="/history" className="text-primary text-sm hover:underline">View All</Link>
        </div>
        
        {!connected ? (
          <div className="bg-dark-surface border border-dark-border rounded-2xl p-8 text-center text-light-muted">
            Connect wallet to view activity
          </div>
        ) : (
          <div className="bg-dark-surface border border-dark-border rounded-2xl p-8 text-center text-light-muted flex flex-col items-center">
            <History size={48} className="opacity-20 mb-3" />
            <p>No recent transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;