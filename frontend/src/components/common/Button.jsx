import React from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';
import Spinner from './Spinner';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  isLoading, 
  disabled, 
  icon: Icon,
  ...props 
}) => {
  const baseStyles = "rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";
  
  const variants = {
    primary: "bg-gradient-to-r from-secondary to-primary text-dark hover:shadow-lg hover:shadow-primary/20 text-white font-bold",
    secondary: "bg-dark-surface border border-dark-border hover:border-primary text-white",
    outline: "border-2 border-primary text-primary hover:bg-primary/10",
    ghost: "text-light-muted hover:text-white hover:bg-white/5",
    danger: "bg-error/10 text-error hover:bg-error/20 border border-error/20"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-6 py-3.5 text-lg",
    full: "w-full py-3 text-base"
  };

  return (
    <button 
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))} 
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? <Spinner size="sm" color="current" /> : Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

export default Button;