
import React, { useState } from 'react';
import { useAuth, useData } from '../hooks/useStore';
import { AVAILABLE_AWARDS } from './Awards';
import { CloseIcon, WalletIcon } from './Icons';

interface AwardModalProps {
  entityId: string;
  entityType: 'post' | 'comment';
  receiverId: string;
  onClose: () => void;
}

const AwardModal: React.FC<AwardModalProps> = ({ entityId, entityType, receiverId, onClose }) => {
  const { currentUser } = useAuth();
  // Fixed missing giveAward from useData
  const { giveAward } = useData();
  const [selectedAwardId, setSelectedAwardId] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleGiveAward = () => {
    if (!selectedAwardId) return;
    if (!currentUser) {
        setMessage({ type: 'error', text: 'You must be logged in.' });
        return;
    }

    const result = giveAward(entityId, entityType, selectedAwardId, receiverId);
    
    if (result.success) {
        setMessage({ type: 'success', text: 'Award given successfully!' });
        setTimeout(() => onClose(), 1500);
    } else {
        setMessage({ type: 'error', text: result.message });
    }
  };

  if (!currentUser) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl relative border border-gray-200 max-h-[90vh] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 z-10">
          <CloseIcon className="w-6 h-6" />
        </button>
        
        <div className="flex items-center justify-between mb-4 pr-8">
            <h2 className="text-xl font-bold text-gray-900">Give an Award</h2>
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                <WalletIcon className="w-4 h-4 text-green-600" />
                {/* Fixed kopeki access */}
                <span className="font-bold text-sm">{(currentUser.kopeki || 0).toLocaleString()} K</span>
            </div>
        </div>

        {message.text && (
            <p className={`p-3 mb-4 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.text}
            </p>
        )}

        <div className="flex-1 overflow-y-auto p-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {AVAILABLE_AWARDS.map(award => (
                    <button
                        key={award.id}
                        onClick={() => setSelectedAwardId(award.id)}
                        className={`flex flex-col items-center p-3 rounded-lg border transition-all ${selectedAwardId === award.id ? 'border-primary bg-orange-50 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                    >
                        <div className={`w-12 h-12 mb-2 ${award.color}`}>
                            <award.icon className="w-full h-full" />
                        </div>
                        <span className="font-bold text-xs text-gray-800 mb-1">{award.label}</span>
                        <span className="text-xs text-gray-500 font-medium">{award.cost.toLocaleString()} K</span>
                    </button>
                ))}
            </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                Cancel
            </button>
            <button 
                onClick={handleGiveAward} 
                disabled={!selectedAwardId}
                className="px-6 py-2 text-sm font-bold bg-primary text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Give Award
            </button>
        </div>
      </div>
    </div>
  );
};

export default AwardModal;
