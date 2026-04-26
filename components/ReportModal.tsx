
import React, { useState } from 'react';
import { CloseIcon, CheckIcon, ReportIcon } from './Icons';

interface ReportModalProps {
  entityId: string;
  entityType: 'post' | 'comment';
  onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ entityId, entityType, onClose }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Logica di segnalazione semplificata: il contenuto è segnalato, i mod decideranno il perché.
    console.log({
      report: 'Content Flagged',
      entityType,
      entityId,
      timestamp: new Date().toISOString()
    });

    setIsSubmitted(true);
    // Chiusura automatica dopo 2 secondi per migliorare la UX
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm relative border border-gray-200 shadow-2xl animate-in fade-in zoom-in duration-200 text-center">
        {!isSubmitted && (
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors">
            <CloseIcon className="w-5 h-5" />
          </button>
        )}
        
        {isSubmitted ? (
            <div className="py-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                    <CheckIcon className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-black text-gray-900 mb-1">Content Reported</h2>
                <p className="text-sm text-gray-500 font-medium">Thank you. Our moderators will review this content shortly.</p>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto text-orange-600">
                  <ReportIcon className="w-8 h-8" />
              </div>
              
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Report Content?</h2>
                <p className="text-sm text-gray-500 font-medium px-4">
                  Flagging this {entityType} will notify the board administrators. This action cannot be undone.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button 
                  type="submit" 
                  className="w-full bg-red-600 text-white font-black py-3 rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:scale-95"
                >
                  Confirm Report
                </button>
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="w-full py-3 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
        )}
      </div>
    </div>
  );
};

export default ReportModal;
