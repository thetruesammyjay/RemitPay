import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bell, Moon, Shield, Globe, LogOut } from 'lucide-react';
import Button from '../components/common/Button';

const Settings = () => {
  const Option = ({ icon: Icon, label, value }) => (
    <button className="w-full flex items-center justify-between p-4 bg-dark-surface border border-dark-border first:rounded-t-xl last:rounded-b-xl hover:bg-white/5 transition-colors border-b-0 last:border-b">
      <div className="flex items-center gap-3">
        <Icon size={20} className="text-light-muted" />
        <span className="text-white font-medium">{label}</span>
      </div>
      {value && <span className="text-sm text-light-muted">{value}</span>}
    </button>
  );

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-2xl pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/" className="p-2 hover:bg-white/5 rounded-full text-light-muted hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-sm font-medium text-light-muted mb-2 uppercase tracking-wider px-1">Preferences</h2>
          <div className="flex flex-col">
            <Option icon={Globe} label="Currency" value="USD" />
            <Option icon={Bell} label="Notifications" value="On" />
            <Option icon={Moon} label="Theme" value="Dark" />
          </div>
        </div>

        <div>
          <h2 className="text-sm font-medium text-light-muted mb-2 uppercase tracking-wider px-1">Security</h2>
          <div className="flex flex-col">
            <Option icon={Shield} label="Privacy Policy" />
            <Option icon={Shield} label="Terms of Service" />
          </div>
        </div>

        <div className="pt-4">
          <Button variant="secondary" size="full" className="text-error border-error/20 hover:bg-error/10" icon={LogOut}>
            Disconnect Wallet
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;