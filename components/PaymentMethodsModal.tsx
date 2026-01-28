
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useStore';
import { CloseIcon, TrashIcon, LockIcon } from './Icons';

interface PaymentMethodsModalProps {
  onClose: () => void;
}

const PaymentMethodsModal: React.FC<PaymentMethodsModalProps> = ({ onClose }) => {
  // Fixed missing methods from useAuth
  const { currentUser, addCreditCard, removeCreditCard } = useAuth();
  const [stripe, setStripe] = useState<any>(null);
  const [elements, setElements] = useState<any>(null);
  
  // Refs for mounting individual elements
  const cardNumberRef = useRef<HTMLDivElement>(null);
  const cardExpiryRef = useRef<HTMLDivElement>(null);
  const cardCvcRef = useRef<HTMLDivElement>(null);

  // States for individual elements
  const [cardNumberEl, setCardNumberEl] = useState<any>(null);
  const [cardExpiryEl, setCardExpiryEl] = useState<any>(null);
  const [cardCvcEl, setCardCvcEl] = useState<any>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Shared styles for Stripe Elements
  const elementStyles = {
    style: {
      base: {
        color: '#1f2937',
        fontFamily: '"Inter", sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': { color: '#9ca3af' },
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
  };

  useEffect(() => {
    if ((window as any).Stripe) {
      const stripeInstance = (window as any).Stripe('pk_test_51SLiceAp4OGbPA6SOa3r6wUFPX5TQNHNctdVBfU8eqLg1qjRw7CKPChQOYHetwFWbtwCUBgfQGIJKPmtjzqMtzDU00lQ0PKUUA');
      setStripe(stripeInstance);
      
      const elementsInstance = stripeInstance.elements();
      setElements(elementsInstance);

      // Create individual elements
      const num = elementsInstance.create('cardNumber', { ...elementStyles, showIcon: true });
      const exp = elementsInstance.create('cardExpiry', elementStyles);
      const cvc = elementsInstance.create('cardCvc', elementStyles);
      
      setCardNumberEl(num);
      setCardExpiryEl(exp);
      setCardCvcEl(cvc);
    }
  }, []);

  // Mount elements when they are created and refs are ready
  useEffect(() => {
    if (cardNumberEl && cardNumberRef.current) cardNumberEl.mount(cardNumberRef.current);
    if (cardExpiryEl && cardExpiryRef.current) cardExpiryEl.mount(cardExpiryRef.current);
    if (cardCvcEl && cardCvcRef.current) cardCvcEl.mount(cardCvcRef.current);

    return () => {
      if (cardNumberEl) cardNumberEl.unmount();
      if (cardExpiryEl) cardExpiryEl.unmount();
      if (cardCvcEl) cardCvcEl.unmount();
    };
  }, [cardNumberEl, cardExpiryEl, cardCvcEl]);

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !cardNumberEl) return;

    setIsProcessing(true);
    setMessage({ type: '', text: '' });

    // Stripe's createPaymentMethod handles multiple elements automatically if they belong to the same 'elements' instance
    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardNumberEl, // Pass the cardNumber element, Stripe finds the others
      billing_details: {
          name: currentUser?.username,
      }
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
      setIsProcessing(false);
    } else {
      addCreditCard({
        last4: paymentMethod.card.last4,
        expiry: `${paymentMethod.card.exp_month}/${paymentMethod.card.exp_year.toString().slice(-2)}`,
        brand: paymentMethod.card.brand.charAt(0).toUpperCase() + paymentMethod.card.brand.slice(1)
      });

      setMessage({ type: 'success', text: 'Card securely added!' });
      
      // Clear all fields
      cardNumberEl.clear();
      cardExpiryEl.clear();
      cardCvcEl.clear();
      
      setIsProcessing(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl w-full max-w-md relative border border-gray-200 max-h-[95vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100">
          <CloseIcon className="w-6 h-6" />
        </button>
        
        <div className="p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-2">Wallet Settings</h2>
            <p className="text-sm text-gray-500 mb-8">Manage your payment methods securely.</p>

            {/* Existing Cards Section */}
            <div className="mb-10 space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your Saved Cards</h3>
                {/* Fixed savedCards access */}
                {currentUser.savedCards && currentUser.savedCards.length > 0 ? (
                    currentUser.savedCards.map(card => (
                        <div key={card.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary/20 hover:bg-white transition-all group shadow-sm hover:shadow-md">
                            <div className="flex items-center gap-4">
                                <div className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm group-hover:border-primary/30">
                                    <span className="text-[11px] font-black italic text-blue-900">{card.brand.toUpperCase()}</span>
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-900 tracking-tight">•••• •••• •••• {card.last4}</div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase">Exp. {card.expiry}</div>
                                </div>
                            </div>
                            <button onClick={() => removeCreditCard(card.id)} className="text-gray-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
                                <TrashIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
                        <p className="text-sm text-gray-400 italic">No cards added yet.</p>
                    </div>
                )}
            </div>

            {/* Add New Card Section */}
            <form onSubmit={handleAddCard} className="pt-8 border-t border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold text-gray-900">Add New Card</h3>
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-100">
                        <LockIcon className="w-3.5 h-3.5" />
                        <span className="uppercase tracking-tighter">Stripe Encrypted</span>
                    </div>
                </div>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl text-sm font-bold animate-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                        {message.text}
                    </div>
                )}

                <div className="space-y-5">
                    {/* Card Number */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">Card Number</label>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary focus-within:bg-white transition-all shadow-sm">
                            <div ref={cardNumberRef}>
                                {!stripe && <div className="h-5 bg-gray-200 animate-pulse rounded w-full"></div>}
                            </div>
                        </div>
                    </div>

                    {/* Expiry and CVC Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">Expiry Date</label>
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary focus-within:bg-white transition-all shadow-sm">
                                <div ref={cardExpiryRef}>
                                    {!stripe && <div className="h-5 bg-gray-200 animate-pulse rounded w-full"></div>}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">CVC / CVV</label>
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary focus-within:bg-white transition-all shadow-sm">
                                <div ref={cardCvcRef}>
                                    {!stripe && <div className="h-5 bg-gray-200 animate-pulse rounded w-full"></div>}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <p className="text-[10px] text-gray-400 font-medium leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                        This site uses Stripe for secure transactions. Your full card data is never stored on our local database, but tokenized and handled exclusively by Stripe's PCI-compliant infrastructure.
                    </p>

                    <button 
                        type="submit" 
                        disabled={isProcessing || !stripe}
                        className="w-full bg-primary text-white font-black text-sm py-4 px-6 rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 uppercase tracking-wider"
                    >
                        {isProcessing ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <span>Verifying...</span>
                            </>
                        ) : (
                            <>
                                <LockIcon className="w-4 h-4" />
                                <span>Add Card Securely</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodsModal;
