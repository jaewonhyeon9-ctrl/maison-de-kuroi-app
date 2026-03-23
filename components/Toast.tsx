import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl font-bold text-sm flex items-center gap-3">
        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
        {message}
      </div>
    </div>
  );
};

export default Toast;
