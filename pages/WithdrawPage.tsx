
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useStore';
import { useNavigate, Link } from 'react-router-dom';
import { BankIcon, CheckIcon, WalletIcon } from '../components/Icons';
import PayoutMethodsModal from '../components/PayoutMethodsModal';

const WithdrawPage: React.FC = () => {
  const { currentUser, sellKopeki } = useAuth();
  const navigate = useNavigate();
  
  const [selectedIbanId, setSelectedIbanId] = useState('');
  const [amountKopeki, setAmountKopeki] = useState('');
  const [showPayoutMethodsModal, setShowPayoutMethodsModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
      if (!currentUser) {
          navigate('/');
          return;
      }
      if (currentUser.savedIbans && currentUser.savedIbans.length > 0) {
          setSelectedIbanId(currentUser.savedIbans[0].id);
      }
  }, [currentUser, navigate]);

  const selectedIban = currentUser?.savedIbans?.find(i => i.id === selectedIbanId);

  const handleAmountPreset = (percentage: number) => {
      if (currentUser) {
        const amount = Math.floor(currentUser.kopeki * percentage);
        setAmountKopeki(amount.toString());
      }
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIbanId) {
        setMessage({ type: 'error', text: 'Please select a payout method.' });
        return;
    }
    
    const kopeki = parseInt(amountKopeki, 10);
    if (isNaN(kopeki) || kopeki <= 0) {
        setMessage({ type: 'error', text: 'Please enter a valid amount.' });
        return;
    }

    if (currentUser && kopeki > currentUser.kopeki) {
         setMessage({ type: 'error', text: 'Insufficient balance.' });
         return;
    }

    setIsProcessing(true);
    
    // Calculate EUR for display message
    const eurValue = kopeki / 10000;
    
    setTimeout(() => {
        const result = sellKopeki(kopeki);
        setIsProcessing(false);
        if (result.success) {
            setMessage({ type: 'success', text: `Successfully withdrew ${kopeki.toLocaleString()} Kopeki (€${eurValue.toFixed(2)})` });
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
        {/* Left Column - Payout Method */}
        <div className="w-full md:w-1/3 space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="font-bold text-gray-800">Metodo di accredito</h2>
                    <button 
                        type="button" 
                        onClick={() => setShowPayoutMethodsModal(true)} 
                        className="text-primary text-sm font-semibold hover:underline"
                    >
                        + Aggiungi Metodo
                    </button>
                </div>
                
                <div className="p-6 flex flex-col items-center">
                    {selectedIban ? (
                        <div className="relative w-full aspect-[1.586] bg-white rounded-xl p-5 text-gray-800 shadow-lg mb-6 border border-gray-200 overflow-hidden">
                             {/* Decorative Background */}
                             <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-50 rounded-full opacity-50"></div>
                             
                             <div className="h-full flex flex-col justify-between relative z-10">
                                 <div className="flex justify-between items-start">
                                     <BankIcon className="w-10 h-10 text-blue-600" />
                                     <span className="font-bold text-blue-600 tracking-wider">BANK</span>
                                 </div>
                                 <div>
                                     <div className="text-sm font-semibold text-gray-500 mb-1">{selectedIban.label}</div>
                                     <div className="text-md font-mono tracking-wide text-gray-800 break-all">
                                         {selectedIban.iban}
                                     </div>
                                 </div>
                             </div>
                             
                             {/* Checkmark badge */}
                             <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1 shadow-sm">
                                <CheckIcon className="w-3 h-3 text-white" />
                             </div>
                        </div>
                    ) : (
                         <div className="w-full aspect-[1.586] bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 mb-6">
                             <p className="text-sm font-medium">No IBAN selected</p>
                             <button onClick={() => setShowPayoutMethodsModal(true)} className="text-primary text-sm underline mt-1">Add IBAN</button>
                         </div>
                    )}

                    {/* Method Selector */}
                    <div className="w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center cursor-pointer">
                            <span className="font-semibold text-gray-700 text-sm">I miei metodi di prelievo</span>
                            <span className="text-gray-400">^</span>
                        </div>
                        <div className="max-h-40 overflow-y-auto">
                             {currentUser.savedIbans && currentUser.savedIbans.length > 0 ? (
                                 currentUser.savedIbans.map(iban => (
                                     <button 
                                        key={iban.id}
                                        onClick={() => setSelectedIbanId(iban.id)}
                                        className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 ${selectedIbanId === iban.id ? 'bg-blue-50' : ''}`}
                                     >
                                         <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center text-blue-600">
                                             <BankIcon className="w-4 h-4"/>
                                         </div>
                                         <div className="flex-1 overflow-hidden">
                                             <div className="text-sm font-bold text-gray-700 truncate">{iban.label}</div>
                                             <div className="text-xs text-gray-500 truncate">{iban.iban}</div>
                                         </div>
                                         {selectedIbanId === iban.id && <CheckIcon className="w-4 h-4 text-primary" />}
                                     </button>
                                 ))
                             ) : (
                                 <div className="p-4 text-center text-sm text-gray-500">
                                     No saved methods.
                                 </div>
                             )}
                             <button 
                                onClick={() => setShowPayoutMethodsModal(true)}
                                className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 text-gray-500"
                             >
                                 <div className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center text-gray-400">+</div>
                                 <span className="text-sm font-medium">+ Aggiungi Metodo</span>
                             </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column - Withdrawal Details */}
        <div className="w-full md:w-2/3">
             
             {/* Exchange Rate Box */}
             <div className="bg-green-50 border border-green-100 rounded-lg p-5 mb-6 flex flex-col sm:flex-row items-center justify-between shadow-sm">
                 <div className="flex items-center gap-3 mb-2 sm:mb-0">
                     <div className="bg-green-100 text-green-600 p-2 rounded-full">
                         <WalletIcon className="w-5 h-5" />
                     </div>
                     <span className="text-green-900 font-semibold">Tasso di Cambio Attuale</span>
                 </div>
                 <div className="text-right">
                     <p className="text-green-900 font-bold text-xl">10.000 <span className="text-sm font-normal">Kopeki</span> = 1 EUR</p>
                 </div>
             </div>

             <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-auto">
                <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                    <h2 className="font-bold text-gray-800">Dettagli del Prelievo</h2>
                </div>
                
                <div className="p-6 md:p-8">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-semibold text-gray-600">Disponibile per il prelievo</span>
                        <span className="font-bold text-gray-900">{currentUser.kopeki.toLocaleString()} Kopeki</span>
                    </div>

                    <form onSubmit={handleWithdraw} className="space-y-6">
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
                                    className="w-full border-2 border-gray-300 rounded-md p-4 text-2xl font-bold text-gray-900 focus:outline-none focus:ring-0 focus:border-green-500"
                                    placeholder="0"
                                    min="1"
                                 />
                                  {amountKopeki && parseInt(amountKopeki) > 0 && parseInt(amountKopeki) <= currentUser.kopeki && (
                                     <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-green-500 rounded-full p-1">
                                         <CheckIcon className="w-5 h-5 text-white" />
                                     </div>
                                 )}
                             </div>
                             <p className="text-xs text-gray-500 mt-2">
                                 Riceverai: <br/>
                                 <span className="text-green-600 font-semibold text-lg">
                                     €{amountKopeki ? (parseInt(amountKopeki, 10) / 10000).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}
                                 </span>
                             </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 md:gap-4">
                            <button 
                                type="button"
                                onClick={() => handleAmountPreset(0.25)}
                                className="border border-gray-300 rounded-md py-3 text-sm font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 bg-white transition-colors"
                            >
                                25%
                            </button>
                            <button 
                                type="button"
                                onClick={() => handleAmountPreset(0.5)}
                                className="border border-gray-300 rounded-md py-3 text-sm font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 bg-white transition-colors"
                            >
                                50%
                            </button>
                            <button 
                                type="button"
                                onClick={() => handleAmountPreset(1)}
                                className="border border-gray-300 rounded-md py-3 text-sm font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 bg-white transition-colors"
                            >
                                MAX
                            </button>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isProcessing}
                            className="w-full bg-[#FFE066] hover:bg-[#FFD633] text-gray-800 font-bold text-lg py-4 rounded-md shadow-sm uppercase tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? 'Processing...' : 'PRELIEVO'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
      </div>
      
      {showPayoutMethodsModal && (
          <PayoutMethodsModal onClose={() => setShowPayoutMethodsModal(false)} />
      )}
    </div>
  );
};

export default WithdrawPage;
