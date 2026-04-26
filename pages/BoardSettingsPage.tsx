
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData, useAuth } from '../hooks/useStore';
import NotFoundPage from './NotFoundPage';
import BoardIcon from '../components/BoardIcon';
import { CheckIcon, CloseIcon, MessageIcon } from '../components/Icons';

const BoardSettingsPage: React.FC = () => {
  const { boardName } = useParams<{ boardName: string }>();
  const { getBoardByName, appointModerator, isBoardAdmin, appointAdmin, updateBoard, inviteUserToBoard, removeUserFromBoard, ads, approveAd, rejectAd } = useData();
  const { currentUser, isAdmin, getUserById, users } = useAuth();
  const navigate = useNavigate();

  const board = boardName ? getBoardByName(boardName) : undefined;
  
  // State for appearance
  const [iconUrl, setIconUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [description, setDescription] = useState('');
  const [appearanceMessage, setAppearanceMessage] = useState({ type: '', text: '' });
  const iconInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [previewBannerSrc, setPreviewBannerSrc] = useState('');

  // State for moderation
  const [modUsername, setModUsername] = useState('');
  const [modMessage, setModMessage] = useState({ type: '', text: '' });
  const [modSuggestions, setModSuggestions] = useState<string[]>([]);
  
  // State for administration
  const [adminUsername, setAdminUsername] = useState('');
  const [adminMessage, setAdminMessage] = useState({ type: '', text: '' });
  const [adminSuggestions, setAdminSuggestions] = useState<string[]>([]);

  // State for security/privacy
  const [accessType, setAccessType] = useState<'public' | 'password' | 'invite' | 'paid'>('public');
  const [newPassword, setNewPassword] = useState('');
  const [entryFee, setEntryFee] = useState('');
  const [allowAnonymousComments, setAllowAnonymousComments] = useState(false);
  const [allowAnonymousPosts, setAllowAnonymousPosts] = useState(false);
  const [securityMessage, setSecurityMessage] = useState({ type: '', text: '' });
  
  // State for invites
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteMessage, setInviteMessage] = useState({ type: '', text: '' });
  const [inviteSuggestions, setInviteSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (!currentUser) {
        navigate('/');
        return;
    }
    if (board) {
        const canManage = isAdmin(currentUser.id) || isBoardAdmin(currentUser.id, board.id);
        if (!canManage) {
            navigate(`/b/${board.name}`);
        }
        setIconUrl(board.iconUrl || '');
        setBannerUrl(board.bannerUrl || '');
        setDescription(board.description || '');
        setAllowAnonymousComments(board.allowAnonymousComments);
        setAllowAnonymousPosts(board.allowAnonymousPosts || false);
        
        if (board.isInviteOnly) {
            setAccessType('invite');
        } else if (board.password) {
            setAccessType('password');
            setNewPassword(board.password);
        } else if (board.entryFee && board.entryFee > 0) {
            setAccessType('paid');
            setEntryFee(board.entryFee.toString());
        } else {
            setAccessType('public');
        }
    }
  }, [currentUser, board, isAdmin, isBoardAdmin, navigate]);
  
  const defaultBannerUrl = board ? `https://picsum.photos/seed/${board.id}/1000/200` : '';
  
  useEffect(() => {
    if (bannerUrl) {
      const img = new Image();
      img.src = bannerUrl;
      img.onload = () => setPreviewBannerSrc(bannerUrl);
      img.onerror = () => setPreviewBannerSrc(defaultBannerUrl);
    } else {
      setPreviewBannerSrc(defaultBannerUrl);
    }
  }, [bannerUrl, defaultBannerUrl]);


  if (!board) {
    return <NotFoundPage />;
  }

  const boardAdmins = board.adminIds.map(id => getUserById(id)).filter(Boolean) as { id: string, username: string }[];
  const boardModerators = board.moderatorIds.map(id => getUserById(id)).filter(Boolean) as { id: string, username: string }[];
  const allowedUsers = (board.allowedUserIds || []).map(id => getUserById(id)).filter(Boolean) as { id: string, username: string }[];
  const boardAds = ads.filter(ad => ad.boardId === board.id && (ad.status === 'pending' || ad.status === 'active'));

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setAppearanceMessage({ type: 'error', text: 'Please select a valid image file.' });
        return;
      }
      try {
        const dataUrl = await fileToDataUrl(file);
        setIconUrl(dataUrl);
        setAppearanceMessage({ type: '', text: '' });
      } catch (error) {
        setAppearanceMessage({ type: 'error', text: 'Failed to read image file.' });
      }
    }
  };
  
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setAppearanceMessage({ type: 'error', text: 'Please select a valid image file.' });
        return;
      }
      try {
        const dataUrl = await fileToDataUrl(file);
        setBannerUrl(dataUrl);
        setAppearanceMessage({ type: '', text: '' });
      } catch (error) {
        setAppearanceMessage({ type: 'error', text: 'Failed to read image file.' });
      }
    }
  };
  
  const handleAppearanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppearanceMessage({ type: '', text: '' });
    const result = updateBoard(board.id, { iconUrl, bannerUrl, description });
    setAppearanceMessage({ type: result.success ? 'success' : 'error', text: result.message });
    setTimeout(() => setAppearanceMessage({ type: '', text: '' }), 4000);
  };

  const handleSecuritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityMessage({ type: '', text: '' });
    
    let updateData: any = {
        allowAnonymousComments,
        allowAnonymousPosts
    };
    
    if (accessType === 'public') {
        updateData = { ...updateData, password: '', isInviteOnly: false, entryFee: 0 };
    } else if (accessType === 'password') {
        if (!newPassword) {
             setSecurityMessage({ type: 'error', text: 'Password cannot be empty.' });
             return;
        }
        updateData = { ...updateData, password: newPassword, isInviteOnly: false, entryFee: 0 };
    } else if (accessType === 'invite') {
        updateData = { ...updateData, password: '', isInviteOnly: true, entryFee: 0 };
    } else if (accessType === 'paid') {
        const fee = parseInt(entryFee, 10);
        if (isNaN(fee) || fee <= 0) {
            setSecurityMessage({ type: 'error', text: 'Invalid entry fee.' });
            return;
        }
        updateData = { ...updateData, password: '', isInviteOnly: false, entryFee: fee };
    }

    const result = updateBoard(board.id, updateData);
    setSecurityMessage({ type: result.success ? 'success' : 'error', text: result.message });
    setTimeout(() => setSecurityMessage({ type: '', text: '' }), 4000);
  }

  const handleUserSearchChange = (value: string, setter: (v: string) => void, suggestionsSetter: (v: string[]) => void) => {
    setter(value);
    if (value.length > 0) {
      const filteredUsers = users
        .filter(u => u.username.toLowerCase().startsWith(value.toLowerCase()))
        .map(u => u.username)
        .slice(0, 5);
      suggestionsSetter(filteredUsers);
    } else {
      suggestionsSetter([]);
    }
  };

  const handleAppointAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUsername.trim()) return;
    const result = appointAdmin(board.id, adminUsername);
    setAdminMessage({ type: result.success ? 'success' : 'error', text: result.message });
    if(result.success) setAdminUsername('');
    setAdminSuggestions([]);
    setTimeout(() => setAdminMessage({type: '', text: ''}), 3000);
  };

  const handleAppointModerator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modUsername.trim()) return;
    const result = appointModerator(board.id, modUsername);
    setModMessage({ type: result.success ? 'success' : 'error', text: result.message });
    if (result.success) setModUsername('');
    setModSuggestions([]);
    setTimeout(() => setModMessage({ type: '', text: '' }), 3000);
  };

  const handleInviteUser = (e: React.FormEvent) => {
      e.preventDefault();
      if (!inviteUsername.trim()) return;
      const result = inviteUserToBoard(board.id, inviteUsername);
      setInviteMessage({ type: result.success ? 'success' : 'error', text: result.message });
      if (result.success) {
          setInviteUsername('');
          setInviteMessage({ type: 'success', text: `Messaggio d'invito inviato a ${inviteUsername}!` });
      }
      setInviteSuggestions([]);
      setTimeout(() => setInviteMessage({ type: '', text: '' }), 4000);
  };

  const handleRemoveUser = (userId: string) => {
      if (window.confirm('Revocare l\'accesso a questo utente?')) {
          removeUserFromBoard(board.id, userId);
      }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <Link to={`/b/${board.name}`} className="text-gray-500 hover:text-gray-900 mb-6 inline-block font-medium">&larr; Torna alla Board</Link>
      <div className="flex items-center gap-4 mb-8">
          <BoardIcon board={board} className="w-16 h-16"/>
          <h1 className="text-3xl font-bold text-gray-900">Impostazioni: b/{board.name}</h1>
      </div>

      <div className="space-y-8">
        
        {/* SECTION 1: APPEARANCE */}
        <div className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Aspetto</h2>
            <form onSubmit={handleAppearanceSubmit} className="space-y-4">
                 {appearanceMessage.text && (
                    <p className={`p-3 rounded-md text-sm ${appearanceMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {appearanceMessage.text}
                    </p>
                )}
                
                <div className="flex gap-6 items-start">
                    <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Icona</label>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                                {iconUrl ? <img src={iconUrl} alt="icon" className="w-full h-full object-cover"/> : <BoardIcon board={board} className="w-full h-full"/>}
                            </div>
                             <div>
                                <button type="button" onClick={() => iconInputRef.current?.click()} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-semibold transition-colors">Carica</button>
                                <input type="file" ref={iconInputRef} onChange={handleIconUpload} accept="image/*" className="hidden"/>
                            </div>
                        </div>
                    </div>
                     <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Banner</label>
                         <div 
                            className="h-20 w-full bg-gray-100 rounded-md bg-cover bg-center border border-gray-200 mb-2"
                            style={{ backgroundImage: `url(${previewBannerSrc})` }}
                         ></div>
                         <div>
                            <button type="button" onClick={() => bannerInputRef.current?.click()} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-semibold transition-colors">Carica Banner</button>
                             <input type="file" ref={bannerInputRef} onChange={handleBannerUpload} accept="image/*" className="hidden"/>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Descrizione</label>
                    <textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                        rows={3}
                        placeholder="Di cosa tratta questa community?"
                    />
                </div>
                
                <div className="flex justify-end">
                    <button type="submit" className="bg-primary text-white font-bold py-2 px-6 rounded-md hover:opacity-90 transition-opacity">Salva Aspetto</button>
                </div>
            </form>
        </div>

        {/* SECTION 2: ACCESS & SECURITY */}
        <div className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
             <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Accesso e Permessi</h2>
             <form onSubmit={handleSecuritySubmit} className="space-y-6">
                {securityMessage.text && (
                    <p className={`p-3 rounded-md text-sm ${securityMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {securityMessage.text}
                    </p>
                )}

                <div className="grid grid-cols-2 gap-4">
                    {['public', 'password', 'invite', 'paid'].map((type) => (
                         <label key={type} className={`border rounded-lg p-3 cursor-pointer hover:bg-gray-50 ${accessType === type ? 'border-primary ring-1 ring-primary bg-blue-50' : 'border-gray-200'}`}>
                            <div className="flex items-center gap-2 mb-1">
                                <input 
                                    type="radio" 
                                    name="accessType" 
                                    value={type} 
                                    checked={accessType === type} 
                                    onChange={(e) => setAccessType(e.target.value as any)}
                                    className="accent-primary"
                                />
                                <span className="font-bold text-gray-800 capitalize">{type === 'invite' ? 'Solo Invito' : type === 'paid' ? 'Premium' : type}</span>
                            </div>
                            <p className="text-[10px] text-gray-500 pl-6 leading-tight">
                                {type === 'public' && 'Chiunque può visualizzare e postare.'}
                                {type === 'password' && 'Richiede una chiave per visualizzare i post.'}
                                {type === 'invite' && 'Solo gli utenti invitati tramite PM possono entrare.'}
                                {type === 'paid' && 'Richiede il pagamento di Kopeki per l\'accesso.'}
                            </p>
                         </label>
                    ))}
                </div>

                {accessType === 'password' && (
                    <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                        <label className="block text-sm font-bold text-yellow-800 mb-1">Imposta Password</label>
                        <input 
                            type="text" 
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                            className="w-full border border-yellow-300 rounded p-2"
                            placeholder="Inserisci la password della board"
                        />
                    </div>
                )}

                {accessType === 'paid' && (
                     <div className="bg-green-50 p-4 rounded-md border border-green-200">
                        <label className="block text-sm font-bold text-green-800 mb-1">Fee di ingresso (Kopeki)</label>
                        <input 
                            type="number" 
                            value={entryFee} 
                            onChange={(e) => setEntryFee(e.target.value)} 
                            className="w-full border border-green-300 rounded p-2"
                            placeholder="es. 500"
                            min="1"
                        />
                    </div>
                )}
                
                <div className="border-t border-gray-100 pt-4 space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={allowAnonymousPosts} onChange={e => setAllowAnonymousPosts(e.target.checked)} className="w-5 h-5 accent-primary" disabled={accessType !== 'public'} />
                        <div>
                             <span className={`block font-semibold text-sm ${accessType !== 'public' ? 'text-gray-400' : 'text-gray-700'}`}>Consenti Post Anonimi</span>
                             <span className="text-xs text-gray-500">Solo per board pubbliche.</span>
                        </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={allowAnonymousComments} onChange={e => setAllowAnonymousComments(e.target.checked)} className="w-5 h-5 accent-primary" disabled={accessType !== 'public'} />
                         <div>
                             <span className={`block font-semibold text-sm ${accessType !== 'public' ? 'text-gray-400' : 'text-gray-700'}`}>Consenti Commenti Anonimi</span>
                             <span className="text-xs text-gray-500">Solo per board pubbliche.</span>
                        </div>
                    </label>
                </div>

                <div className="flex justify-end">
                    <button type="submit" className="bg-primary text-white font-bold py-2 px-6 rounded-md hover:opacity-90 transition-opacity">Aggiorna Sicurezza</button>
                </div>
             </form>

             {/* Invite Management */}
             {(accessType === 'invite' || accessType === 'paid') && (
                 <div className="mt-8 border-t border-gray-100 pt-6">
                     <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                        <MessageIcon className="w-5 h-5 text-primary" /> Invia Inviti
                     </h3>
                     <p className="text-xs text-gray-500 mb-4">Cerca un utente per inviargli un messaggio privato d'invito.</p>
                     
                     <form onSubmit={handleInviteUser} className="flex gap-2 mb-4 relative">
                        <input
                            type="text"
                            value={inviteUsername}
                            onChange={(e) => handleUserSearchChange(e.target.value, setInviteUsername, setInviteSuggestions)}
                            placeholder="Username da invitare..."
                            className="flex-1 border border-gray-300 rounded-md p-2"
                        />
                        <button type="submit" className="bg-gray-900 text-white font-bold px-4 rounded-md">Invia PM</button>
                         {inviteSuggestions.length > 0 && (
                            <ul className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                                {inviteSuggestions.map(s => (
                                    <li key={s} onClick={() => { setInviteUsername(s); setInviteSuggestions([]); }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        )}
                     </form>
                     {inviteMessage.text && (
                        <p className={`mb-3 text-xs font-bold ${inviteMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                            {inviteMessage.text}
                        </p>
                    )}

                     <div className="mt-6">
                        <h4 className="text-sm font-bold text-gray-700 mb-2">Utenti con Accesso ({allowedUsers.length})</h4>
                        <div className="bg-gray-50 rounded-md border border-gray-200 max-h-60 overflow-y-auto">
                            {allowedUsers.length > 0 ? (
                                <ul className="divide-y divide-gray-200">
                                    {allowedUsers.map(u => (
                                        <li key={u.id} className="p-3 flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center font-bold text-white text-xs">
                                                    {u.username[0].toUpperCase()}
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">{u.username}</span>
                                            </div>
                                            {u.id !== board.creatorId && (
                                                <button onClick={() => handleRemoveUser(u.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors" title="Rimuovi accesso">
                                                    <CloseIcon className="w-4 h-4"/>
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="p-4 text-center text-gray-500 text-sm">Nessun utente aggiunto oltre al creatore.</p>
                            )}
                        </div>
                     </div>
                 </div>
             )}
        </div>

        {/* SECTION 3: ROLES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Amministratori</h2>
                <form onSubmit={handleAppointAdmin} className="relative mb-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={adminUsername}
                            onChange={(e) => handleUserSearchChange(e.target.value, setAdminUsername, setAdminSuggestions)}
                            placeholder="Aggiungi admin..."
                            className="flex-1 border border-gray-300 rounded-md p-2 text-sm"
                        />
                        <button type="submit" className="bg-gray-800 text-white font-bold px-3 rounded-md text-sm">Add</button>
                    </div>
                    {adminSuggestions.length > 0 && (
                        <ul className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1">
                            {adminSuggestions.map(s => (
                                <li key={s} onClick={() => { setAdminUsername(s); setAdminSuggestions([]); }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">
                                    {s}
                                </li>
                            ))}
                        </ul>
                    )}
                    {adminMessage.text && <p className={`mt-2 text-xs ${adminMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{adminMessage.text}</p>}
                </form>
                <div className="space-y-2">
                    {boardAdmins.map(admin => (
                        <div key={admin.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100">
                             <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                             <span className="text-sm font-medium text-gray-700">{admin.username}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Moderatori</h2>
                <form onSubmit={handleAppointModerator} className="relative mb-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={modUsername}
                            onChange={(e) => handleUserSearchChange(e.target.value, setModUsername, setModSuggestions)}
                            placeholder="Aggiungi mod..."
                            className="flex-1 border border-gray-300 rounded-md p-2 text-sm"
                        />
                        <button type="submit" className="bg-gray-800 text-white font-bold px-3 rounded-md text-sm">Add</button>
                    </div>
                    {modSuggestions.length > 0 && (
                        <ul className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1">
                            {modSuggestions.map(s => (
                                <li key={s} onClick={() => { setModUsername(s); setModSuggestions([]); }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">
                                    {s}
                                </li>
                            ))}
                        </ul>
                    )}
                     {modMessage.text && <p className={`mt-2 text-xs ${modMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{modMessage.text}</p>}
                </form>
                <div className="space-y-2">
                    {boardModerators.length > 0 ? boardModerators.map(mod => (
                        <div key={mod.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100">
                             <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                             <span className="text-sm font-medium text-gray-700">{mod.username}</span>
                        </div>
                    )) : <p className="text-sm text-gray-400 italic">Nessun moderatore nominato.</p>}
                </div>
            </div>
        </div>

        {/* SECTION 4: ADVERTISEMENTS */}
        <div className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
             <h2 className="text-xl font-bold text-gray-800 mb-4">Richieste Pubblicitarie</h2>
             {boardAds.length > 0 ? (
                 <div className="space-y-4">
                     {boardAds.map(ad => (
                         <div key={ad.id} className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start">
                             {ad.imageUrl && <img src={ad.imageUrl} alt="ad" className="w-20 h-20 object-cover rounded bg-gray-100 flex-shrink-0" />}
                             <div className="flex-1">
                                 <div className="flex justify-between items-start">
                                     <h4 className="font-bold text-gray-900">{ad.title}</h4>
                                     <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${ad.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{ad.status}</span>
                                 </div>
                                 <p className="text-xs text-gray-600 mb-2">{ad.content}</p>
                                 <div className="flex gap-4 text-[10px] font-bold text-gray-400">
                                     <span>Budget: {ad.budget} K</span>
                                     <span>Modello: {ad.model}</span>
                                     <span>Viste: {ad.views}</span>
                                     <span>Click: {ad.clicks}</span>
                                 </div>
                             </div>
                             <div className="flex flex-col gap-2 min-w-[100px]">
                                 {ad.status === 'pending' && (
                                     <>
                                        <button onClick={() => approveAd(ad.id)} className="bg-green-600 text-white text-xs font-bold py-1.5 px-3 rounded-full hover:bg-green-700 shadow-sm transition-all">Approva</button>
                                        <button onClick={() => rejectAd(ad.id)} className="bg-red-50 text-red-600 text-xs font-bold py-1.5 px-3 rounded-full hover:bg-red-100 transition-all">Rifiuta</button>
                                     </>
                                 )}
                                 {ad.status === 'active' && (
                                     <button onClick={() => rejectAd(ad.id)} className="border border-red-200 text-red-600 text-xs font-bold py-1.5 px-3 rounded-full hover:bg-red-50 transition-all">Ferma Ad</button>
                                 )}
                             </div>
                         </div>
                     ))}
                 </div>
             ) : (
                 <p className="text-gray-400 text-sm italic py-4 text-center border-2 border-dashed border-gray-100 rounded-xl">Nessuna richiesta pubblicitaria per questa board.</p>
             )}
        </div>

      </div>
    </div>
  );
};

export default BoardSettingsPage;
