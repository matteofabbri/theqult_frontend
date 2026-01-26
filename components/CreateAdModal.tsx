
import React, { useState, useRef } from 'react';
import { useAuth, useData } from '../hooks/useStore';
import { CloseIcon, WalletIcon } from './Icons';
import type { Board } from '../types';

interface CreateAdModalProps {
  board: Board;
  onClose: () => void;
}

const CreateAdModal: React.FC<CreateAdModalProps> = ({ board, onClose }) => {
  const { currentUser } = useAuth();
  const { createAd } = useData();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [budget, setBudget] = useState('');
  const [model, setModel] = useState<'CPC' | 'CPM'>('CPC');
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file.');
            return;
        }
        try {
            const dataUrl = await fileToDataUrl(file);
            setImageUrl(dataUrl);
            setError('');
        } catch (err) {
            setError('Failed to read image file.');
        }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setSuccess('');
      
      const budgetNum = parseInt(budget, 10);
      const bidNum = parseInt(bidAmount, 10);

      if (!title || !content || !linkUrl || !budget || !bidAmount) {
          setError('All fields are required.');
          return;
      }
      if (isNaN(budgetNum) || budgetNum <= 0) {
          setError('Invalid budget.');
          return;
      }
      if (isNaN(bidNum) || bidNum <= 0) {
          setError('Invalid bid amount.');
          return;
      }
      if (currentUser && currentUser.kopeki < budgetNum) {
          setError('Insufficient Kopeki balance for this budget.');
          return;
      }

      const result = createAd(board.id, title, content, linkUrl, imageUrl, budgetNum, model, bidNum);
      if (result.success) {
          setSuccess(result.message);
          setTimeout(onClose, 2000);
      } else {
          setError(result.message);
      }
  };

  if (!currentUser) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg relative border border-gray-200 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
          <CloseIcon className="w-6 h-6" />
        </button>
        
        <h2 className="text-xl font-bold text-gray-900 mb-2 p-6 pb-0">Create Ad for b/{board.name}</h2>
        <p className="px-6 text-sm text-gray-500 mb-4">Promote your content on this board.</p>

        <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-4">
            {error && <p className="bg-red-50 text-red-600 p-3 rounded text-sm">{error}</p>}
            {success && <p className="bg-green-50 text-green-600 p-3 rounded text-sm">{success}</p>}

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Headline</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border rounded p-2" maxLength={50} placeholder="Catchy title" />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Ad Text</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} className="w-full border rounded p-2" maxLength={150} placeholder="Short description" rows={3} />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Destination URL</label>
                <input type="url" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} className="w-full border rounded p-2" placeholder="https://..." />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Image (Optional)</label>
                <div className="flex items-center gap-2">
                     <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm border border-gray-300">Upload Image</button>
                     {imageUrl && <span className="text-xs text-green-600">Image attached</span>}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">Total Budget (Kopeki)</label>
                     <div className="relative">
                        <WalletIcon className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
                        <input type="number" value={budget} onChange={e => setBudget(e.target.value)} className="w-full border rounded p-2 pl-8" placeholder="Total to spend" min="1" />
                     </div>
                     <p className="text-xs text-gray-500 mt-1">Available: {currentUser.kopeki} K</p>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Billing Model</label>
                    <select value={model} onChange={e => setModel(e.target.value as any)} className="w-full border rounded p-2">
                        <option value="CPC">Per Click (CPC)</option>
                        <option value="CPM">Per 1000 Views (CPM)</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                    {model === 'CPC' ? 'Max Bid per Click (Kopeki)' : 'Max Bid per 1000 Views (Kopeki)'}
                </label>
                <input type="number" value={bidAmount} onChange={e => setBidAmount(e.target.value)} className="w-full border rounded p-2" placeholder="e.g., 5" min="1" />
                <p className="text-xs text-gray-500 mt-1">
                    {model === 'CPM' ? 'Also known as Cost Per Mille. Enter amount for 1000 views.' : 'Cost per single click.'}
                </p>
            </div>

            <div className="flex justify-end pt-4">
                <button type="submit" disabled={!!success} className="bg-primary text-white font-bold py-2 px-6 rounded-full hover:opacity-90 disabled:opacity-50">
                    Create Campaign
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAdModal;
