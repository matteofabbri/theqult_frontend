
import React, { useState } from 'react';
import { useData } from '../hooks/useStore';
import { CloseIcon, LockIcon, UsersIcon, CheckIcon } from './Icons';
import { useNavigate } from 'react-router-dom';

interface CreateBoardModalProps {
  onClose: () => void;
}

const CreateBoardModal: React.FC<CreateBoardModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { createBoard } = useData();
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [accessType, setAccessType] = useState<'public' | 'password' | 'invite'>('public');
  const [password, setPassword] = useState('');
  const [allowAnonymousComments, setAllowAnonymousComments] = useState(true);
  const [allowAnonymousPosts, setAllowAnonymousPosts] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
        setError('Board name is required.');
        return;
    }

    if (accessType === 'password' && !password) {
        setError('Password is required for password-protected boards.');
        return;
    }

    const { success, message } = createBoard(
        name.trim(), 
        description.trim(), 
        allowAnonymousComments, 
        allowAnonymousPosts, 
        accessType === 'password' ? password : undefined, 
        accessType === 'invite'
    );

    if (success) {
      navigate(`/b/${name.trim()}`);
      onClose();
    } else {
      setError(message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg relative border border-gray-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Create a Community</h2>
            <p className="text-sm text-gray-500">Build your corner of the qult.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold animate-in fade-in slide-in-from-top-1 duration-200">
                    {error}
                </div>
            )}

            <form id="create-board-form" onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info Section */}
                <section className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Basic Information</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Name</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">b/</span>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={e => setName(e.target.value.replace(/\s+/g, '_').toLowerCase())} 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 pl-8 text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-bold transition-all" 
                                    placeholder="community_name" 
                                    required 
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1.5 ml-1">Names cannot have spaces. Underscores are encouraged.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Description</label>
                            <textarea 
                                value={description} 
                                onChange={e => setDescription(e.target.value)} 
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none transition-all" 
                                placeholder="What's this community about?"
                                rows={3}
                            />
                        </div>
                    </div>
                </section>

                {/* Access & Privacy Section */}
                <section className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Privacy & Access</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {[
                            { id: 'public', label: 'Public', desc: 'Anyone can view and post.', icon: <UsersIcon className="w-4 h-4" /> },
                            { id: 'password', label: 'Password', desc: 'Protected by a secret key.', icon: <LockIcon className="w-4 h-4" /> },
                            { id: 'invite', label: 'Invite Only', desc: 'Manual approval required.', icon: <UsersIcon className="w-4 h-4" /> }
                        ].map((type) => (
                            <label key={type.id} className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${accessType === type.id ? 'bg-primary/5 border-primary ring-1 ring-primary' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                                <input 
                                    type="radio" 
                                    name="accessType" 
                                    checked={accessType === type.id} 
                                    onChange={() => setAccessType(type.id as any)} 
                                    className="accent-primary w-4 h-4" 
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-black text-gray-900">{type.label}</span>
                                        <div className="text-gray-400">{type.icon}</div>
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium">{type.desc}</p>
                                </div>
                            </label>
                        ))}
                    </div>

                    {accessType === 'password' && (
                        <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200 animate-in zoom-in-95 duration-200 mt-3">
                            <label className="block text-xs font-black text-yellow-800 uppercase mb-2">Set Board Password</label>
                            <input 
                                type="text" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                className="w-full bg-white border border-yellow-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-600 outline-none" 
                                placeholder="Enter secret password..." 
                            />
                        </div>
                    )}
                </section>

                {/* Community Rules Section */}
                <section className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Community Rules</h3>
                    <div className="space-y-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <label className="flex items-center justify-between cursor-pointer group">
                            <div className="flex-1">
                                <span className="block text-sm font-bold text-gray-700 group-hover:text-primary transition-colors">Allow Anonymous Posts</span>
                                <span className="text-[10px] text-gray-400">Users can post without showing their username.</span>
                            </div>
                            <input 
                                type="checkbox" 
                                checked={allowAnonymousPosts} 
                                onChange={e => setAllowAnonymousPosts(e.target.checked)} 
                                className="w-5 h-5 accent-primary rounded cursor-pointer"
                            />
                        </label>
                        <div className="h-px bg-gray-200/50" />
                        <label className="flex items-center justify-between cursor-pointer group">
                            <div className="flex-1">
                                <span className="block text-sm font-bold text-gray-700 group-hover:text-primary transition-colors">Allow Anonymous Comments</span>
                                <span className="text-[10px] text-gray-400">Enable guests or hidden identities in threads.</span>
                            </div>
                            <input 
                                type="checkbox" 
                                checked={allowAnonymousComments} 
                                onChange={e => setAllowAnonymousComments(e.target.checked)} 
                                className="w-5 h-5 accent-primary rounded cursor-pointer"
                            />
                        </label>
                    </div>
                </section>
            </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
            <button 
                type="button" 
                onClick={onClose} 
                className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors"
            >
                Cancel
            </button>
            <button 
                type="submit" 
                form="create-board-form"
                className="bg-primary text-white font-black py-2.5 px-10 rounded-full hover:bg-orange-600 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50 disabled:grayscale"
                disabled={!name.trim()}
            >
                Create Board
            </button>
        </div>
      </div>
    </div>
  );
};

export default CreateBoardModal;
