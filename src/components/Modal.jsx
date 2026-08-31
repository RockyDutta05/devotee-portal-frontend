import React from 'react';
import { X } from 'lucide-react';
import { cn } from './Button';

export default function Modal({ isOpen, onClose, title, children, className }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={cn("w-full max-w-lg rounded-xl bg-white p-6 shadow-xl relative", className)}>
        <button 
          onClick={onClose} 
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
        {title && <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>}
        <div>{children}</div>
      </div>
    </div>
  );
}
