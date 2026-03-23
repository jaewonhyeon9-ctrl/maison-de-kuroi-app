import React, { useState, useEffect } from 'react';

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<{ id: number; message: string }[]>([]);

  useEffect(() => {
    const handleAlert = (e: any) => {
      const message = e.detail;
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    };

    window.addEventListener('custom-alert', handleAlert);
    return () => window.removeEventListener('custom-alert', handleAlert);
  }, []);

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl font-bold text-sm flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {toast.message}
        </div>
      ))}
    </div>
  );
};

export const CustomConfirm: React.FC<{
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-black text-slate-800 mb-4">확인</h3>
        <p className="text-sm text-slate-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">취소</button>
          <button onClick={onConfirm} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">확인</button>
        </div>
      </div>
    </div>
  );
};
