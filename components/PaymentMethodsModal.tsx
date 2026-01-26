
import React, { useState } from 'react';
import { useAuth } from '../hooks/useStore';
import { CloseIcon, TrashIcon } from './Icons';

interface PaymentMethodsModalProps {
  onClose: () => void;
}

const PaymentMethodsModal: React.FC<PaymentMethodsModalProps> = ({ onClose }) => {
  const { currentUser, addCreditCard, removeCreditCard } = useAuth();
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry || !cardCvc) {
      setMessage({ type: 'error', text: 'All fields are required.' });
      return;
    }
    if (cardNumber.length < 12) {
      setMessage({ type: 'error', text: 'Invalid card number.' });
      return;
    }

    const result = addCreditCard({
      last4: cardNumber.slice(-4),
      expiry: cardExpiry,
      brand: 'Visa' // Mock
    });

    setMessage({ type: result.success ? 'success' : 'error', text: result.message });
    if (result.success) {
      setCardNumber('');
      setCardExpiry('');
      setCardCvc('');
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
        
        <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Methods</h2>

        <div className="mb-6 space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">Saved Cards</h3>
            {currentUser.savedCards && currentUser.savedCards.length > 0 ? (
                currentUser.savedCards.map(card => (
                    <div key={card.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="bg-gray-200 rounded px-2 py-1 text-xs font-bold text-gray-600">{card.brand}</div>
                            <div className="text-sm text-gray-700">•••• {card.last4}</div>
                            <div className="text-xs text-gray-500">Exp: {card.expiry}</div>
                        </div>
                        <button onClick={() => removeCreditCard(card.id)} className="text-red-500 hover:bg-red-50 p-2 rounded">
                            <TrashIcon className="w-4 h-4"/>
                        </button>
                    </div>
                ))
            ) : (
                <p className="text-sm text-gray-500 italic">No saved cards.</p>
            )}
        </div>

        <form onSubmit={handleAddCard} className="border-t border-gray-100 pt-4">
             <h3 className="text-sm font-semibold text-gray-700 mb-3">Add New Card</h3>
             {message.text && (
                <p className={`mb-3 text-xs ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {message.text}
                </p>
             )}
             <div className="space-y-3">
                  <div>
                      <label className="block text-gray-600 mb-1 text-xs" htmlFor="card-number">Card Number</label>
                      <input type="text" id="card-number" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-md p-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary text-sm" placeholder="•••• •••• •••• 4242" />
                  </div>
                  <div className="flex gap-2">
                      <div className="flex-1">
                          <label className="block text-gray-600 mb-1 text-xs" htmlFor="expiry">Expiry</label>
                          <input type="text" id="expiry" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-md p-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary text-sm" placeholder="MM/YY" />
                      </div>
                      <div className="flex-1">
                          <label className="block text-gray-600 mb-1 text-xs" htmlFor="cvc">CVC</label>
                          <input type="text" id="cvc" value={cardCvc} onChange={(e) => setCardCvc(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-md p-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary text-sm" placeholder="123" />
                      </div>
                  </div>
                  <button type="submit" className="w-full bg-gray-800 text-white font-bold py-2 px-6 rounded-md hover:bg-gray-900 transition-opacity text-sm">Save Card</button>
             </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentMethodsModal;
