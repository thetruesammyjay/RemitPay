import React from 'react';
import { twMerge } from 'tailwind-merge';

const AmountInput = ({ value, onChange, currency = 'SOL', balance, onMax, error }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm px-1">
        <label className="font-medium text-light-muted">You Send</label>
        {balance && (
          <span className="text-light-muted text-xs md:text-sm truncate max-w-[150px]">
            Bal: <span className="text-white">{balance} {currency}</span>
          </span>
        )}
      </div>

      <div className={twMerge(
        "bg-dark-bg border border-dark-border rounded-2xl p-4 md:p-5 flex items-center focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all active:scale-[0.99] duration-100",
        error && "border-error focus-within:border-error focus-within:ring-error"
      )}>
        <input
          type="number"
          inputMode="decimal" // Triggers number pad on mobile
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0.00"
          className="w-full bg-transparent text-2xl md:text-4xl font-bold text-white outline-none placeholder:text-dark-border"
        />
        
        <div className="flex items-center gap-2 md:gap-3 ml-2 shrink-0">
          <button 
            type="button"
            onClick={onMax}
            className="text-xs font-bold bg-secondary/20 text-secondary px-2 py-1.5 rounded-md hover:bg-secondary/30 transition-colors touch-manipulation"
          >
            MAX
          </button>
          <div className="bg-dark-surface px-2 md:px-3 py-1 rounded-lg border border-dark-border font-bold text-white text-sm md:text-base">
            {currency}
          </div>
        </div>
      </div>
      
      {error && <p className="text-xs text-error px-1 animate-in slide-in-from-left-1">{error}</p>}
    </div>
  );
};

export default AmountInput;