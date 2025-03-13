import React from 'react';

export const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        {children}
      </div>
    </div>
  );
};

export const DialogContent = ({ children, className = "" }) => {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
};

export const DialogHeader = ({ children }) => {
  return (
    <div className="mb-4">
      {children}
    </div>
  );
};

export const DialogTitle = ({ children }) => {
  return (
    <h2 className="text-lg font-semibold">
      {children}
    </h2>
  );
};

export const DialogFooter = ({ children }) => {
  return (
    <div className="mt-6 flex justify-end space-x-2">
      {children}
    </div>
  );
};