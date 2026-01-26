
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useStore';
import { useNavigate, Link } from 'react-router-dom';
import { MastercardIcon, CheckIcon, WalletIcon } from '../components/Icons';
import PaymentMethodsModal from '../components/PaymentMethodsModal';

const DepositPage: React.FC = () => {
  const { currentUser, buyKopeki } = useAuth();
  const navigate = useNavigate();
  
  const [selectedCardId, setSelectedCardId] = useState('');
  const [amountKopeki, setAmountKopeki] = useState('');
  const [showPaymentMethodsModal, setShowPaymentMethodsModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
      if (!currentUser) {
          navigate('/');
          return;
      }
      if (currentUser.savedCards && currentUser.savedCards.length > 0) {
          setSelectedCardId(currentUser.savedCards[0].id);
      }
  }, [currentUser, navigate]);

  const selectedCard = currentUser?.savedCards?.find(c => c.id === selectedCardId);

  const handleAmountPreset = (amount: number) => {
      setAmountKopeki(amount.toString());
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCardId) {
        setMessage({ type: 'error', text: 'Please select a payment method.' });
        return;
    }
    
    const kopeki = parseInt(amountKopeki, 10);
    if (isNaN(kopeki) || kopeki < 100000) {
        setMessage({ type: 'error', text: 'Minimum deposit is 100,000 Kopeki (€10.00).' });
        return;
    }

    setIsProcessing(true);
    
    // Calculate EUR for display message
    const eurCost = kopeki / 10000;
    
    setTimeout(() => {
        const result = buyKopeki(kopeki);
        setIsProcessing(false);
        if (result.success) {
            setMessage({ type: 'success', text: `Successfully deposited ${kopeki.toLocaleString()} Kopeki (€${eurCost.toFixed(2)})` });
            setAmountKopeki('');
            // Optional: navigate away after success
            setTimeout(() => navigate('/settings'), 2000);
        } else {
            setMessage({ type: 'error', text: result.message });
        }
    }, 1500); // Simulate network delay
  };

  if (!currentUser) return null;

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      <Link to="/settings" className="text-gray-500 hover:text-gray-900 mb-6 inline-block font-medium">&larr; Back to Wallet</Link>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column - Payment Method */}
        <div className="w-full md:w-1/3 space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="font-bold text-gray-800">Metodo di pagamento</h2>
                    <button 
                        type="button" 
                        onClick={() => setShowPaymentMethodsModal(true)} 
                        className="text-primary text-sm font-semibold hover:underline"
                    >
                        + Aggiungi Metodo
                    </button>
                </div>
                
                <div className="p-6 flex flex-col items-center">
                    {selectedCard ? (
                        <div className="relative w-full aspect-[1.586] bg-gray-900 rounded-xl p-5 text-white shadow-lg mb-6">
                             <div className="absolute top-4 right-4 opacity-50">
                                 {/* Simulating chip/contactless */}
                                <div className="w-8 h-5 border border-gray-500 rounded flex items-center justify-center">
                                    <div className="w-6 h-3 border border-gray-500 rounded-sm"></div>
                                </div>
                             </div>
                             
                             <div className="h-full flex flex-col justify-between">
                                 <MastercardIcon className="w-12 h-12 mt-2" />
                                 <div>
                                     <div className="text-lg tracking-widest font-mono mb-1">
                                         **** **** **** {selectedCard.last4}
                                     </div>
                                     <div className="text-xs text-gray-400">
                                         Scad. {selectedCard.expiry}
                                     </div>
                                 </div>
                             </div>
                             
                             {/* Checkmark badge */}
                             <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm border border-gray-200">
                                 <div className="bg-gray-200 rounded-full p-0.5">
                                    <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                                        <span className="text-gray-400 text-xs">...</span>
                                    </div>
                                 </div>
                             </div>
                        </div>
                    ) : (
                         <div className="w-full aspect-[1.586] bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 mb-6">
                             <p className="text-sm font-medium">No card selected</p>
                             <button onClick={() => setShowPaymentMethodsModal(true)} className="text-primary text-sm underline mt-1">Add Card</button>
                         </div>
                    )}

                    {/* Method Selector */}
                    <div className="w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center cursor-pointer">
                            <span className="font-semibold text-gray-700 text-sm">I miei metodi di pagamento</span>
                            <span className="text-gray-400">^</span>
                        </div>
                        <div className="max-h-40 overflow-y-auto">
                             {currentUser.savedCards && currentUser.savedCards.length > 0 ? (
                                 currentUser.savedCards.map(card => (
                                     <button 
                                        key={card.id}
                                        onClick={() => setSelectedCardId(card.id)}
                                        className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 ${selectedCardId === card.id ? 'bg-blue-50' : ''}`}
                                     >
                                         <div className="bg-gray-200 w-8 h-5 rounded flex items-center justify-center text-xs text-gray-600 font-bold">{card.brand}</div>
                                         <span className="text-sm text-gray-700 flex-1">•••• {card.last4}</span>
                                         {selectedCardId === card.id && <CheckIcon className="w-4 h-4 text-primary" />}
                                     </button>
                                 ))
                             ) : (
                                 <div className="p-4 text-center text-sm text-gray-500">
                                     No saved methods.
                                 </div>
                             )}
                             <button 
                                onClick={() => setShowPaymentMethodsModal(true)}
                                className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 text-gray-500"
                             >
                                 <div className="w-8 h-5 border border-gray-300 rounded flex items-center justify-center text-gray-400">+</div>
                                 <span className="text-sm font-medium">+ Aggiungi Metodo</span>
                             </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column - Payment Details */}
        <div className="w-full md:w-2/3">
             
             {/* Exchange Rate Box */}
             <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-5 mb-6 flex flex-col sm:flex-row items-center justify-between shadow-sm">
                 <div className="flex items-center gap-3 mb-2 sm:mb-0">
                     <div className="bg-indigo-100 text-indigo-600 p-2 rounded-full">
                         <WalletIcon className="w-5 h-5" />
                     </div>
                     <span className="text-indigo-900 font-semibold">Tasso di Cambio Attuale</span>
                 </div>
                 <div className="text-right">
                     <p className="text-indigo-900 font-bold text-xl">1 EUR = 10.000 <span className="text-sm font-normal">Kopeki</span></p>
                 </div>
             </div>

             <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-auto">
                <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                    <h2 className="font-bold text-gray-800">Dati del versamento</h2>
                </div>
                
                <div className="p-6 md:p-8">
                    <form onSubmit={handleDeposit} className="space-y-6">
                        {message.text && (
                            <div className={`p-4 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                {message.text}
                            </div>
                        )}
                        
                        <div>
                             <label className="block text-gray-600 font-semibold mb-2 text-sm">Importo in Kopeki</label>
                             <div className="relative">
                                 <input 
                                    type="number" 
                                    value={amountKopeki} 
                                    onChange={(e) => setAmountKopeki(e.target.value)}
                                    className="w-full border-2 border-green-500 rounded-md p-4 text-2xl font-bold text-gray-900 focus:outline-none focus:ring-0"
                                    placeholder="0"
                                    min="100000"
                                    step="1000"
                                 />
                                 {amountKopeki && parseInt(amountKopeki) >= 100000 && (
                                     <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-green-500 rounded-full p-1">
                                         <CheckIcon className="w-5 h-5 text-white" />
                                     </div>
                                 )}
                             </div>
                             <p className="text-xs text-gray-500 mt-2">
                                 Min: 100.000 Kopeki (10,00 €) <br/>
                                 <span className="text-primary font-semibold text-lg">
                                     Costo: €{amountKopeki ? (parseInt(amountKopeki, 10) / 10000).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}
                                 </span>
                             </p>
                        </div>

                        <div className="grid grid-cols-4 gap-2 md:gap-4">
                            {[200000, 500000, 1000000, 2500000].map(val => (
                                <button 
                                    key={val}
                                    type="button"
                                    onClick={() => handleAmountPreset(val)}
                                    className="border border-gray-300 rounded-md py-3 text-sm md:text-md font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 bg-white transition-colors shadow-sm flex flex-col items-center justify-center"
                                >
                                    <span>+{val >= 1000000 ? `${val/1000000}M` : `${val/1000}k`}</span>
                                    <span className="text-xs text-gray-400 font-normal">Kopeki</span>
                                </button>
                            ))}
                        </div>

                        <button 
                            type="submit" 
                            disabled={isProcessing}
                            className="w-full bg-[#FFE066] hover:bg-[#FFD633] text-gray-800 font-bold text-lg py-4 rounded-md shadow-sm uppercase tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? 'Processing...' : 'EFFETTUA UN VERSAMENTO'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
      </div>
      
      {showPaymentMethodsModal && (
          <PaymentMethodsModal onClose={() => setShowPaymentMethodsModal(false)} />
      )}
    </div>
  );
};

export default DepositPage;
