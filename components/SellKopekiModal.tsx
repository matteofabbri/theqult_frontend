
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useStore';
import { CloseIcon } from './Icons';
import { Link } from 'react-router-dom';

interface SellKopekiModalProps {
  onClose: () => void;
}

const SellKopekiModal: React.FC<SellKopekiModalProps> = ({ onClose }) => {
  // Fixed missing sellKopeki from useAuth
  const { currentUser, sellKopeki } = useAuth();
  const [amount, setAmount] = useState('');
  const [selectedIbanId, setSelectedIbanId] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
      // Fixed savedIbans access
      if (currentUser && currentUser.savedIbans && currentUser.savedIbans.length > 0) {
          setSelectedIbanId(currentUser.savedIbans[0].id);
      }
  }, [currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(amount, 10);
    if (isNaN(amountNum) || amountNum <= 0) {
        setMessage({type: 'error', text: 'Please enter a valid amount to sell.'});
        return;
    }
    if (!selectedIbanId) {
      setMessage({type: 'error', text: 'Please select a payout method.'});
      return;
    }
    
    const result = sellKopeki(amountNum);
    setMessage({type: result.success ? 'success' : 'error', text: result.message});
    if (result.success) {
        setAmount('');
        setTimeout(() => onClose(), 2000);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md relative border border-gray-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
          <CloseIcon className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Sell Kopeki</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            {message.text && (
                <p className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                {message.text}
                </p>
            )}
            <div>
                <label className="block text-gray-600 mb-1 text-sm" htmlFor="sell-amount">Amount in Kopeki</label>
                <input type="number" id="sell-amount" value={amount} onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., 50000" min="1" step="1" />
                <p className="text-xs text-gray-500 mt-1">You receive: €{amount ? (parseInt(amount, 10) / 10000).toFixed(2) : '0.00'}</p>
            </div>
            <div>
                <label className="block text-gray-600 mb-1 text-sm">Payout Method</label>
                <select 
                    value={selectedIbanId} 
                    onChange={(e) => setSelectedIbanId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="">Select an IBAN</option>
                    {/* Fixed savedIbans access */}
                    {currentUser.savedIbans?.map(iban => (
                        <option key={iban.id} value={iban.id}>{iban.label} ({iban.iban.slice(0, 6)}...)</option>
                    ))}
                </select>
                {/* Fixed savedIbans access */}
                {(!currentUser.savedIbans || currentUser.savedIbans.length === 0) && (
                     <p className="text-xs text-red-500 mt-1">
                        No IBANs found. <Link to="/settings" onClick={onClose} className="underline">Add one in settings</Link>.
                    </p>
                )}
            </div>
            <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-full hover:bg-green-700 transition-opacity">Sell Now</button>
        </form>
      </div>
    </div>
  );
};

export default SellKopekiModal;
