import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-dark/90 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Content - Bottom sheet on mobile, Centered on desktop */}
      <div className="relative bg-dark-surface border-t md:border border-dark-border rounded-t-2xl md:rounded-2xl w-full max-w-md shadow-2xl animate-in slide-in-from-bottom-10 md:zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-dark-border/50 sticky top-0 bg-dark-surface z-10">
          <h3 className="text-lg md:text-xl font-bold text-white">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 text-light-muted hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5 md:p-6 pb-8 md:pb-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;