
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

      const result = createAd(board.id, title, content, linkUrl, imageUrl, budgetNum, model, bidNum);
      if (result.success) {
          setSuccess('Ad submitted for review!');
          setTimeout(() => onClose(), 2000);
      } else {
          setError(result.message || 'Failed to create ad.');
      }
  };

  if (!currentUser) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 w-full max-w-lg relative border border-gray-200 overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
          <CloseIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Advertise on b/{board.name}</h2>
        <p className="text-sm text-gray-500 mb-6 flex items-center gap-2">
            <WalletIcon className="w-4 h-4" />
            Balance: {currentUser.kopeki?.toLocaleString()} K
        </p>

        {error && <p className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm border border-red-100">{error}</p>}
        {success && <p className="bg-green-50 text-green-700 p-3 rounded mb-4 text-sm border border-green-100">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Ad Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border p-2 rounded" placeholder="Catchy title" required />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Ad Content</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} className="w-full border p-2 rounded" placeholder="Description..." required rows={3} />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Target URL</label>
                <input type="url" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} className="w-full border p-2 rounded" placeholder="https://..." required />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Image (Optional)</label>
                <div className="flex gap-2">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-gray-100 px-4 py-2 rounded text-sm hover:bg-gray-200">Upload Image</button>
                    {imageUrl && <span className="text-green-600 text-xs flex items-center">Image attached</span>}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Pricing Model</label>
                    <select value={model} onChange={e => setModel(e.target.value as any)} className="w-full border p-2 rounded">
                        <option value="CPC">CPC (Per Click)</option>
                        <option value="CPM">CPM (Per 1k Views)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Bid (K)</label>
                    <input type="number" value={bidAmount} onChange={e => setBidAmount(e.target.value)} className="w-full border p-2 rounded" placeholder="e.g. 50" required min="1" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Total Budget (K)</label>
                <input type="number" value={budget} onChange={e => setBudget(e.target.value)} className="w-full border p-2 rounded font-bold" placeholder="e.g. 10000" required min="100" />
                <p className="text-[10px] text-gray-500 mt-1">Budget will be reserved from your balance.</p>
            </div>

            <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:opacity-90 mt-4 transition-opacity">Submit Ad Request</button>
        </form>
      </div>
    </div>
  );
};

export default CreateAdModal;
