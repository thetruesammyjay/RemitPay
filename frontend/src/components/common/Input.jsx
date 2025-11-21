import React from 'react';
import { twMerge } from 'tailwind-merge';

const Input = ({ 
  label, 
  error, 
  icon: Icon, 
  rightElement, 
  className, 
  wrapperClassName,
  ...props 
}) => {
  return (
    <div className={twMerge("w-full", wrapperClassName)}>
      {label && (
        <label className="block text-sm font-medium text-light-muted mb-1.5 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-light-muted group-focus-within:text-primary transition-colors pointer-events-none">
            <Icon size={18} />
          </div>
        )}
        
        <input
          className={twMerge(
            "w-full bg-dark-bg border border-dark-border rounded-xl py-3 md:py-3.5 text-white placeholder:text-light-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm md:text-base appearance-none",
            Icon ? "pl-10 pr-4" : "px-4",
            rightElement ? "pr-12" : "",
            error ? "border-error focus:border-error focus:ring-error" : "",
            className
          )}
          {...props}
        />
        
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-xs text-error ml-1">{error}</p>
      )}
    </div>
  );
};

export default Input;