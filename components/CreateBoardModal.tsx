
import React, { useState } from 'react';
import { useData, useAuth } from '../hooks/useStore';
import { CloseIcon, LockIcon, UsersIcon, WalletIcon, CheckIcon } from './Icons';
import { useNavigate } from 'react-router-dom';

interface CreateBoardModalProps {
  onClose: () => void;
}

const CreateBoardModal: React.FC<CreateBoardModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { createBoard } = useData();
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [accessType, setAccessType] = useState<'public' | 'password' | 'invite' | 'paid'>('public');
  const [password, setPassword] = useState('');
  const [entryFee, setEntryFee] = useState('100');
  const [allowAnonymousComments, setAllowAnonymousComments] = useState(true);
  const [allowAnonymousPosts, setAllowAnonymousPosts] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
        setError('Il nome della board è obbligatorio.');
        return;
    }

    if (accessType === 'password' && !password) {
        setError('La password è obbligatoria per le board protette.');
        return;
    }

    const feeNum = parseInt(entryFee, 10);
    if (accessType === 'paid' && (isNaN(feeNum) || feeNum <= 0)) {
        setError('Inserisci un prezzo di ingresso valido in Kopeki.');
        return;
    }

    const { success, message, board } = createBoard(
        name.trim(), 
        description.trim(), 
        allowAnonymousComments, 
        allowAnonymousPosts, 
        accessType === 'password' ? password : undefined, 
        accessType === 'invite',
        undefined, // iconUrl
        undefined, // bannerUrl
        accessType === 'paid' ? feeNum : 0
    );

    if (success && board) {
      navigate(`/b/${board.name}`);
      onClose();
    } else {
      setError(message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl relative border border-gray-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Crea una Community</h2>
            <p className="text-sm text-gray-500 font-medium">Configura il tuo spazio in un unico passaggio.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold animate-in fade-in slide-in-from-top-1">
                    {error}
                </div>
            )}

            <form id="create-board-form" onSubmit={handleSubmit} className="space-y-8">
                {/* Info Base */}
                <section className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                        <span className="w-4 h-px bg-gray-200"></span> Informazioni Base
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Nome Board</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">b/</span>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={e => setName(e.target.value.replace(/\s+/g, '_').toLowerCase())} 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 pl-8 text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-bold transition-all" 
                                    placeholder="nome_community" 
                                    required 
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Descrizione</label>
                            <textarea 
                                value={description} 
                                onChange={e => setDescription(e.target.value)} 
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none transition-all" 
                                placeholder="Di cosa tratta questa community?"
                                rows={3}
                            />
                        </div>
                    </div>
                </section>

                {/* Privacy & Accesso */}
                <section className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                        <span className="w-4 h-px bg-gray-200"></span> Privacy e Accesso
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                            { id: 'public', label: 'Pubblica', desc: 'Visibile a chiunque.', icon: <UsersIcon className="w-4 h-4" /> },
                            { id: 'password', label: 'Password', desc: 'Accesso con chiave segreta.', icon: <LockIcon className="w-4 h-4" /> },
                            { id: 'invite', label: 'Solo Invito', desc: 'Gli admin inviano PM di invito.', icon: <UsersIcon className="w-4 h-4" /> },
                            { id: 'paid', label: 'Premium', desc: 'Si paga in Kopeki per entrare.', icon: <WalletIcon className="w-4 h-4" /> }
                        ].map((type) => (
                            <label key={type.id} className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${accessType === type.id ? 'bg-primary/5 border-primary ring-1 ring-primary' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
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
                                    </div>
                                    <p className="text-[10px] text-gray-500 font-bold leading-tight">{type.desc}</p>
                                </div>
                            </label>
                        ))}
                    </div>

                    {accessType === 'password' && (
                        <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200 animate-in zoom-in-95 mt-2">
                            <label className="block text-xs font-black text-yellow-800 uppercase mb-2">Imposta Password Board</label>
                            <input 
                                type="text" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                className="w-full bg-white border border-yellow-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-600 outline-none" 
                                placeholder="Chiave segreta..." 
                            />
                        </div>
                    )}

                    {accessType === 'paid' && (
                        <div className="p-4 bg-green-50 rounded-xl border border-green-200 animate-in zoom-in-95 mt-2">
                            <label className="block text-xs font-black text-green-800 uppercase mb-2">Prezzo di Ingresso (Kopeki)</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={entryFee} 
                                    onChange={e => setEntryFee(e.target.value)} 
                                    className="w-full bg-white border border-green-300 rounded-lg p-2.5 pl-8 text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none font-bold" 
                                    min="1"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 font-bold text-xs">K</span>
                            </div>
                        </div>
                    )}
                </section>

                {/* Regole Community */}
                <section className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                        <span className="w-4 h-px bg-gray-200"></span> Regole della Community
                    </h3>
                    <div className="space-y-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <label className="flex items-center justify-between cursor-pointer group">
                            <div className="flex-1">
                                <span className="block text-sm font-bold text-gray-700">Consenti Post Anonimi</span>
                                <span className="text-[10px] text-gray-400">Gli utenti possono postare senza mostrare il nome.</span>
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
                                <span className="block text-sm font-bold text-gray-700">Consenti Commenti Anonimi</span>
                                <span className="text-[10px] text-gray-400">Abilita identità nascoste nei thread.</span>
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
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors">Annulla</button>
            <button 
                type="submit" 
                form="create-board-form"
                className="bg-primary text-white font-black py-2.5 px-10 rounded-full hover:bg-orange-600 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:grayscale"
                disabled={!name.trim()}
            >
                Crea Board
            </button>
        </div>
      </div>
    </div>
  );
};

export default CreateBoardModal;
