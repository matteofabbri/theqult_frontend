
import React, { useEffect } from 'react';
import { CloseIcon, CheckIcon } from './Icons';

interface ReportModalProps {
  entityId: string;
  entityType: 'post' | 'comment';
  onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ entityId, entityType, onClose }) => {
  useEffect(() => {
    // Simuliamo l'invio del report al caricamento della modal
    console.log({
      report: 'Content Flagged',
      entityType,
      entityId,
      timestamp: new Date().toISOString(),
      status: 'Sent to Administrators'
    });

    // Auto-chiusura opzionale dopo 3 secondi
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [entityId, entityType, onClose]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm relative border border-gray-200 shadow-2xl text-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors p-1 hover:bg-gray-100 rounded-full">
          <CloseIcon className="w-5 h-5" />
        </button>
        
        <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 animate-in zoom-in duration-300">
                <CheckIcon className="w-10 h-10" />
            </div>
        </div>
        
        <h2 className="text-xl font-black text-gray-900 mb-2">Segnalazione Inviata</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
            Il contenuto è stato segnalato con successo. Gli amministratori lo esamineranno a breve. Grazie per il tuo contributo alla community.
        </p>
        
        <button 
            onClick={onClose}
            className="mt-6 w-full py-3 px-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all active:scale-95"
        >
            Chiudi
        </button>
      </div>
    </div>
  );
};

export default ReportModal;
