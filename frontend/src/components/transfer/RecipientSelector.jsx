import React from 'react';
import { User, Users } from 'lucide-react';
import Input from '../common/Input';

const RecipientSelector = ({ value, onChange, savedRecipients = [] }) => {
  return (
    <div className="space-y-4">
      <Input
        label="Recipient Address"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Solana address..."
        icon={User}
        className="text-sm md:text-base" 
        rightElement={
          savedRecipients.length > 0 && (
            <button className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded hover:bg-primary/20 transition-colors">
              <Users size={12} />
              <span className="hidden sm:inline">Contacts</span>
            </button>
          )
        }
      />
    </div>
  );
};

export default RecipientSelector;