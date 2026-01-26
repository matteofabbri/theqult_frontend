
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useStore';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, LockIcon, MastercardIcon, BankIcon, ImageFileIcon } from '../components/Icons';

const VerifyPage: React.FC = () => {
  const { currentUser, updateProfile, addCreditCard, addIban } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Personal Info State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');
  const [taxId, setTaxId] = useState('');

  // Financial Info State
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [iban, setIban] = useState('');

  // Document Upload State
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const idFrontRef = useRef<HTMLInputElement>(null);
  const idBackRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    } else if (currentUser.isVerified || currentUser.isPendingVerification) {
      navigate('/settings');
    }
  }, [currentUser, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!idFront || !idBack) {
        alert("Please upload both sides of your identity document.");
        return;
    }

    if (cardNumber.length < 12 || !cardExpiry || !cardCvc) {
        alert("Please provide valid credit card details for identity verification.");
        return;
    }

    setIsSubmitting(true);
    
    // Simulate submission delay
    setTimeout(() => {
        // Save financial details
        addCreditCard({
            last4: cardNumber.slice(-4),
            expiry: cardExpiry,
            brand: 'Mastercard' // Mock logic
        });

        if (iban) {
            addIban({
                iban: iban,
                label: 'Verified Bank Account'
            });
        }

        // Set pending status instead of verifying immediately
        updateProfile({ isPendingVerification: true, isVerified: false });
        setIsSubmitting(false);
        navigate('/settings');
    }, 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (f: File | null) => void) => {
      if (e.target.files && e.target.files[0]) {
          setter(e.target.files[0]);
      }
  };

  if (!currentUser) return null;

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-3xl">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 p-6 border-b border-gray-200 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                <LockIcon className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Identity Verification</h1>
            <p className="text-gray-500 mt-2">To comply with financial regulations (KYC/AML) and unlock your Kopeki wallet, we need to verify your identity.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            
            {/* 1. Personal Information */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">1. Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full border border-gray-300 rounded p-2.5 focus:ring-2 focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} className="w-full border border-gray-300 rounded p-2.5 focus:ring-2 focus:ring-primary focus:border-primary" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input type="date" required value={dob} onChange={e => setDob(e.target.value)} className="w-full border border-gray-300 rounded p-2.5 focus:ring-2 focus:ring-primary focus:border-primary" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID / SSN / Fiscal Code</label>
                    <input type="text" required value={taxId} onChange={e => setTaxId(e.target.value)} className="w-full border border-gray-300 rounded p-2.5 focus:ring-2 focus:ring-primary focus:border-primary uppercase" placeholder="e.g. ABC12345..." />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                    <input type="text" required value={address} onChange={e => setAddress(e.target.value)} className="w-full border border-gray-300 rounded p-2.5 focus:ring-2 focus:ring-primary focus:border-primary" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input type="text" required value={city} onChange={e => setCity(e.target.value)} className="w-full border border-gray-300 rounded p-2.5 focus:ring-2 focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Zip / Postal Code</label>
                        <input type="text" required value={zipCode} onChange={e => setZipCode(e.target.value)} className="w-full border border-gray-300 rounded p-2.5 focus:ring-2 focus:ring-primary focus:border-primary" />
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <select required value={country} onChange={e => setCountry(e.target.value)} className="w-full border border-gray-300 rounded p-2.5 focus:ring-2 focus:ring-primary focus:border-primary bg-white">
                        <option value="">Select Country</option>
                        <option value="US">United States</option>
                        <option value="GB">United Kingdom</option>
                        <option value="IT">Italy</option>
                        <option value="FR">France</option>
                        <option value="DE">Germany</option>
                        <option value="JP">Japan</option>
                    </select>
                </div>
            </div>

            {/* 2. Financial Information */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">2. Financial Information</h2>
                <p className="text-xs text-gray-500">A valid payment method is required to verify your identity. You will not be charged.</p>
                
                {/* Credit Card */}
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                        <MastercardIcon className="w-6 h-6" />
                        <h3 className="font-bold text-gray-700 text-sm">Credit / Debit Card</h3>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Card Number</label>
                            <input 
                                type="text" 
                                required 
                                value={cardNumber} 
                                onChange={e => setCardNumber(e.target.value)} 
                                className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-primary"
                                placeholder="0000 0000 0000 0000"
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Expiry</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={cardExpiry} 
                                    onChange={e => setCardExpiry(e.target.value)} 
                                    className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-primary"
                                    placeholder="MM/YY"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CVC</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={cardCvc} 
                                    onChange={e => setCardCvc(e.target.value)} 
                                    className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-primary"
                                    placeholder="123"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* IBAN */}
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <BankIcon className="w-6 h-6 text-gray-600" />
                            <h3 className="font-bold text-gray-700 text-sm">Bank Account (IBAN)</h3>
                        </div>
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Optional</span>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">IBAN for Withdrawals</label>
                        <input 
                            type="text" 
                            value={iban} 
                            onChange={e => setIban(e.target.value)} 
                            className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-primary"
                            placeholder="IT00 0000 0000 0000..."
                        />
                    </div>
                </div>
            </div>

            {/* 3. Document Verification */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">3. Identity Documents</h2>
                <p className="text-xs text-gray-500">Please upload a clear photo of your government-issued ID (Driver's License, Passport, or National ID).</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Front */}
                    <div 
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${idFront ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-primary hover:bg-gray-50'}`}
                        onClick={() => idFrontRef.current?.click()}
                    >
                        <input type="file" className="hidden" ref={idFrontRef} accept="image/*" onChange={(e) => handleFileChange(e, setIdFront)} />
                        {idFront ? (
                            <div className="flex flex-col items-center text-green-700">
                                <CheckIcon className="w-8 h-8 mb-2" />
                                <span className="text-sm font-bold truncate max-w-full px-2">{idFront.name}</span>
                                <span className="text-xs mt-1">Click to change</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-gray-500">
                                <div className="bg-gray-100 p-3 rounded-full mb-2">
                                    <ImageFileIcon className="w-6 h-6" />
                                </div>
                                <span className="text-sm font-bold">Upload ID Front</span>
                                <span className="text-xs mt-1">JPG or PNG</span>
                            </div>
                        )}
                    </div>

                    {/* Back */}
                    <div 
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${idBack ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-primary hover:bg-gray-50'}`}
                        onClick={() => idBackRef.current?.click()}
                    >
                        <input type="file" className="hidden" ref={idBackRef} accept="image/*" onChange={(e) => handleFileChange(e, setIdBack)} />
                        {idBack ? (
                            <div className="flex flex-col items-center text-green-700">
                                <CheckIcon className="w-8 h-8 mb-2" />
                                <span className="text-sm font-bold truncate max-w-full px-2">{idBack.name}</span>
                                <span className="text-xs mt-1">Click to change</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-gray-500">
                                <div className="bg-gray-100 p-3 rounded-full mb-2">
                                    <ImageFileIcon className="w-6 h-6" />
                                </div>
                                <span className="text-sm font-bold">Upload ID Back</span>
                                <span className="text-xs mt-1">JPG or PNG</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
                <div className="flex items-start gap-3 mb-6 bg-yellow-50 p-4 rounded text-sm text-yellow-800 border border-yellow-200">
                    <div className="mt-0.5"><LockIcon className="w-4 h-4" /></div>
                    <p>By submitting this form, you certify that the information provided is true and accurate. Your documents will be encrypted and processed securely.</p>
                </div>

                <div className="flex justify-end gap-4">
                    <button type="button" onClick={() => navigate('/settings')} className="px-6 py-3 font-semibold text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="bg-green-600 text-white font-bold py-3 px-8 rounded-full hover:bg-green-700 transition-all shadow-md flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Verifying...' : 'Submit Verification'}
                    </button>
                </div>
            </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyPage;
