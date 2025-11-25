'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top">
      <div
        className={`${bgColors[type]} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-4 min-w-[300px]`}
      >
        <p className="flex-1">{message}</p>
        <button
          onClick={onClose}
          className="hover:bg-black/20 rounded p-1 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

