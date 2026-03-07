import React from 'react';

export const ResultModal = ({ 
  isOpen, 
  onClose, 
  result 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  result: { won: boolean; amount: string } | null 
}) => {
  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-2xl">
        <div className={`text-6xl mb-4 ${result.won ? 'scale-110' : 'grayscale'}`}>
          {result.won ? '🎉' : '😔'}
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {result.won ? 'Bạn đã thắng!' : 'Rất tiếc...'}
        </h2>
        <p className="text-slate-400 mb-6">
          {result.won 
            ? `Bạn nhận được ${result.amount} USDC vào ví.` 
            : 'Dự đoán của bạn chưa chính xác lần này.'}
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};
