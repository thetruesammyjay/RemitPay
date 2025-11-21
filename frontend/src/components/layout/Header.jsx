import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Home, Send, ArrowDownLeft, History, Users } from 'lucide-react';
import Logo from '../common/Logo';
import WalletConnect from '../wallet/WalletConnect';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const NavItem = ({ to, icon: Icon, label, mobileOnly = false }) => (
    <NavLink 
      to={to} 
      className={({ isActive }) => 
        `flex items-center gap-3 px-4 py-3 md:py-2 rounded-xl transition-all duration-200 ${
          mobileOnly ? 'md:hidden' : ''
        } ${
          isActive 
            ? 'bg-primary/10 text-primary font-medium' 
            : 'text-light-muted hover:text-white hover:bg-white/5'
        }`
      }
    >
      <Icon size={20} className="shrink-0" />
      <span>{label}</span>
    </NavLink>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-dark-border bg-dark-bg/90 backdrop-blur-md supports-[backdrop-filter]:bg-dark-bg/60">
      <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Logo className="h-8 md:h-9" />
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <NavItem to="/" icon={Home} label="Home" />
            <NavItem to="/send" icon={Send} label="Send" />
            <NavItem to="/history" icon={History} label="History" />
            <NavItem to="/recipients" icon={Users} label="Recipients" />
          </nav>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          {/* Wallet Button - CSS in globals.css handles the sizing now */}
          <div>
            <WalletConnect />
          </div>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-light-muted hover:text-white active:bg-white/10 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      <div className={`md:hidden fixed inset-x-0 top-16 bg-dark-surface border-b border-dark-border shadow-2xl transition-all duration-300 ease-in-out overflow-hidden ${isMobileMenuOpen ? 'max-h-screen opacity-100 py-4' : 'max-h-0 opacity-0 py-0'}`}>
        <div className="container mx-auto px-4 flex flex-col space-y-2">
          <NavItem to="/" icon={Home} label="Dashboard" />
          <NavItem to="/send" icon={Send} label="Send Money" />
          <NavItem to="/receive" icon={ArrowDownLeft} label="Receive" />
          <NavItem to="/history" icon={History} label="Transaction History" />
          <NavItem to="/recipients" icon={Users} label="Saved Recipients" />
        </div>
      </div>
      
      {/* Backdrop for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 top-16 bg-black/60 z-[-1] md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;