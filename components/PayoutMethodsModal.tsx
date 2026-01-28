
import React, { useState } from 'react';
import { useAuth } from '../hooks/useStore';
import { CloseIcon, TrashIcon } from './Icons';

interface PayoutMethodsModalProps {
  onClose: () => void;
}

const PayoutMethodsModal: React.FC<PayoutMethodsModalProps> = ({ onClose }) => {
  // Fixed missing methods from useAuth
  const { currentUser, addIban, removeIban } = useAuth();
  const [iban, setIban] = useState('');
  const [ibanLabel, setIbanLabel] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleAddIban = (e: React.FormEvent) => {
    e.preventDefault();
    if (!iban || !ibanLabel) {
      setMessage({ type: 'error', text: 'All fields are required.' });
      return;
    }
    const result = addIban({ iban, label: ibanLabel });
    setMessage({ type: result.success ? 'success' : 'error', text: result.message });
    if (result.success) {
      setIban('');
      setIbanLabel('');
    }
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  if (!currentUser) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md relative border border-gray-200 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
          <CloseIcon className="w-6 h-6" />
        </button>
        
        <h2 className="text-xl font-bold text-gray-900 mb-6">Payout Methods (IBAN)</h2>

        <div className="mb-6 space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">Saved IBANs</h3>
            {/* Fixed savedIbans access */}
            {currentUser.savedIbans && currentUser.savedIbans.length > 0 ? (
                currentUser.savedIbans.map(iban => (
                    <div key={iban.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-200">
                        <div className="flex flex-col">
                             <div className="text-sm font-semibold text-gray-700">{iban.label}</div>
                             <div className="text-xs text-gray-500">{iban.iban}</div>
                        </div>
                        <button onClick={() => removeIban(iban.id)} className="text-red-500 hover:bg-red-50 p-2 rounded">
                             <TrashIcon className="w-4 h-4"/>
                        </button>
                    </div>
                ))
            ) : (
                <p className="text-sm text-gray-500 italic">No saved IBANs.</p>
            )}
        </div>

        <form onSubmit={handleAddIban} className="border-t border-gray-100 pt-4">
             <h3 className="text-sm font-semibold text-gray-700 mb-3">Add New IBAN</h3>
             {message.text && (
                <p className={`mb-3 text-xs ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {message.text}
                </p>
             )}
             <div className="space-y-3">
                  <div>
                      <label className="block text-gray-600 mb-1 text-xs" htmlFor="iban-label">Label</label>
                      <input type="text" id="iban-label" value={ibanLabel} onChange={(e) => setIbanLabel(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-md p-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary text-sm" placeholder="My Bank" />
                  </div>
                  <div>
                      <label className="block text-gray-600 mb-1 text-xs" htmlFor="iban">IBAN</label>
                      <input type="text" id="iban" value={iban} onChange={(e) => setIban(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-md p-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary text-sm" placeholder="DE89 3704..." />
                  </div>
                  <button type="submit" className="w-full bg-gray-800 text-white font-bold py-2 px-6 rounded-md hover:bg-gray-900 transition-opacity text-sm">Save IBAN</button>
             </div>
        </form>
      </div>
    </div>
  );
};

export default PayoutMethodsModal;
