import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Button from '../common/Button';
import AmountInput from './AmountInput';
import RecipientSelector from './RecipientSelector';
import TransactionStatus from './TransactionStatus';

const TransferForm = ({ onSend, loading, status, signature, error }) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSend({ recipient, amount, memo });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
      <RecipientSelector 
        value={recipient}
        onChange={setRecipient}
      />

      <AmountInput 
        value={amount}
        onChange={setAmount}
        currency="SOL"
        onMax={() => setAmount('1.5')} 
      />

      <div>
        <label className="block text-sm font-medium text-light-muted mb-1.5 ml-1">
          Note (Optional)
        </label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={2}
          className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white resize-none focus:outline-none focus:border-primary transition-all text-sm md:text-base"
          placeholder="Rent, Dinner, etc."
        />
      </div>

      {/* Status component handles its own responsiveness internally */}
      <TransactionStatus status={status} signature={signature} error={error} />

      <div className="pt-2">
        <Button 
          size="full" 
          variant="primary" 
          type="submit" 
          isLoading={loading}
          disabled={!recipient || !amount}
          icon={ArrowRight}
          className="h-12 md:h-14 text-lg shadow-xl shadow-primary/10" // Taller button for mobile tapping
        >
          {loading ? 'Processing...' : 'Send Now'}
        </Button>
      </div>
    </form>
  );
};

export default TransferForm;