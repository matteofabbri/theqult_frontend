
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth, useData, timeAgo } from '../hooks/useStore';
import UserAvatar from '../components/UserAvatar';
import { MessageIcon, TrashIcon, CloseIcon } from '../components/Icons';
import type { User, Message as MessageType, MediaItem } from '../types';
import MessageComponent from '../components/Message';
import MediaUploader from '../components/MediaUploader';

// Added explicit interface for conversation data to fix type inference issues
interface ConversationData {
    user: User;
    messages: MessageType[];
    lastMessage: MessageType;
    unreadCount: number;
}

const MessagesPage: React.FC = () => {
    const { username: activeUsername } = useParams();
    const navigate = useNavigate();
    const { currentUser, getUserById, getUserByUsername } = useAuth();
    const { messages, sendMessage, markConversationAsRead } = useData();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [newMessage, setNewMessage] = useState('');
    const [attachedMedia, setAttachedMedia] = useState<MediaItem[]>([]);

    useEffect(() => { 
        if (!currentUser) navigate('/'); 
    }, [currentUser, navigate]);

    // Identifica l'utente attivo dall'URL
    const activeUser = useMemo(() => 
        activeUsername ? getUserByUsername(activeUsername) : undefined, 
    [activeUsername, getUserByUsername]);

    // Mappa tutte le conversazioni esistenti basate sui messaggi nel database
    const conversations = useMemo(() => {
        if (!currentUser) return new Map<string, ConversationData>();
        const convos = new Map<string, ConversationData>();
        
        // Ordiniamo i messaggi per data per trovare l'ultimo messaggio di ogni conversazione
        const sortedMessages = [...messages].sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        sortedMessages.forEach(msg => {
            const otherId = msg.senderId === currentUser.id ? msg.recipientId : msg.senderId;
            if (!convos.has(otherId)) {
                const user = getUserById(otherId);
                if (user) convos.set(otherId, { user, messages: [], lastMessage: msg, unreadCount: 0 });
            }
            const convo = convos.get(otherId);
            if (convo) {
                convo.messages.push(msg);
                convo.lastMessage = msg;
                if (!msg.readAt && msg.recipientId === currentUser.id) convo.unreadCount++;
            }
        });

        // Se abbiamo un utente attivo nell'URL ma non abbiamo ancora messaggi con lui, 
        // lo aggiungiamo forzatamente alla mappa così appare nella sidebar
        if (activeUser && activeUser.id !== currentUser.id && !convos.has(activeUser.id)) {
            convos.set(activeUser.id, {
                user: activeUser,
                messages: [],
                // Creiamo un placeholder per lastMessage per permettere l'ordinamento in cima
                lastMessage: { 
                    id: 'temp', 
                    createdAt: new Date().toISOString(), 
                    content: '', 
                    senderId: '', 
                    recipientId: '' 
                } as any,
                unreadCount: 0
            });
        }

        return convos;
    }, [messages, currentUser, getUserById, activeUser]);

    // Converte la mappa in un array ordinato per l'ultimo messaggio (più recenti in alto)
    const sortedConvoList = useMemo(() => {
        return Array.from(conversations.values()).sort((a: ConversationData, b: ConversationData) => 
            new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
        );
    }, [conversations]);

    // Determina la conversazione attiva
    const activeConversation = useMemo(() => {
        if (!activeUser) return undefined;
        return conversations.get(activeUser.id);
    }, [activeUser, conversations]);

    // Effetto per segnare come letti i messaggi quando si entra in una chat
    useEffect(() => {
        if (activeUser && currentUser) {
            markConversationAsRead(activeUser.id);
        }
    }, [activeUser, currentUser, messages.length, markConversationAsRead]);

    // Auto-scroll alla fine della chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeConversation?.messages.length]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if ((newMessage.trim() || attachedMedia.length > 0) && activeUser) {
            sendMessage(activeUser.id, newMessage.trim(), attachedMedia);
            setNewMessage(''); 
            setAttachedMedia([]);
        }
    };

    if (!currentUser) return null;

    return (
        <div className="container mx-auto px-4 h-[calc(100vh-7rem)] mb-4">
            <div className="flex h-full bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                
                {/* Sidebar - Lista Conversazioni */}
                <aside className="w-full md:w-80 border-r border-gray-100 flex flex-col bg-gray-50/30 shrink-0">
                    <div className="p-4 border-b border-gray-100 bg-white">
                        <h2 className="font-black text-xl text-gray-900 tracking-tight">Messaggi</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {sortedConvoList.length > 0 ? (
                            <div className="divide-y divide-gray-50">
                                {sortedConvoList.map((convo) => (
                                    <Link 
                                        key={convo.user.id} 
                                        to={`/messages/${convo.user.username}`}
                                        className={`flex items-center gap-3 p-4 transition-colors hover:bg-white ${activeUser?.id === convo.user.id ? 'bg-white border-l-4 border-primary' : 'border-l-4 border-transparent'}`}
                                    >
                                        <UserAvatar user={convo.user} className="w-12 h-12 shadow-sm" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline">
                                                <h3 className={`font-bold truncate ${convo.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                                                    {convo.user.username}
                                                </h3>
                                                <span className="text-[10px] text-gray-400 font-medium">
                                                    {convo.messages.length > 0 ? timeAgo(convo.lastMessage.createdAt) : 'Ora'}
                                                </span>
                                            </div>
                                            <p className={`text-xs truncate ${convo.unreadCount > 0 ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                                                {convo.messages.length > 0 ? (
                                                    <>
                                                        {convo.lastMessage.senderId === currentUser.id && 'Tu: '}
                                                        {convo.lastMessage.content || (convo.lastMessage.media ? '📎 Media' : 'Messaggio vuoto')}
                                                    </>
                                                ) : (
                                                    <span className="text-primary font-bold italic">Nuova conversazione</span>
                                                )}
                                            </p>
                                        </div>
                                        {convo.unreadCount > 0 && (
                                            <div className="w-2.5 h-2.5 bg-primary rounded-full shadow-sm shadow-primary/40"></div>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-400">
                                <MessageIcon className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                <p className="text-sm font-medium">Nessuna conversazione</p>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Chat Area */}
                <main className={`flex-1 flex flex-col bg-white ${!activeUser ? 'hidden md:flex' : 'flex'}`}>
                    {activeConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => navigate('/messages')} 
                                        className="md:hidden p-2 -ml-2 text-gray-400 hover:text-gray-700"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                    <Link to={`/u/${activeConversation.user.username}`} className="flex items-center gap-3 group">
                                        <UserAvatar user={activeConversation.user} className="w-10 h-10 group-hover:ring-2 ring-primary/20 transition-all" />
                                        <div>
                                            <h2 className="font-bold text-gray-900 leading-tight">u/{activeConversation.user.username}</h2>
                                            <p className="text-[10px] text-green-500 font-black uppercase tracking-widest">E2EE Attiva</p>
                                        </div>
                                    </Link>
                                </div>
                            </div>

                            {/* Chat History */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50">
                                {activeConversation.messages.length > 0 ? (
                                    activeConversation.messages.map((msg: MessageType) => (
                                        <MessageComponent 
                                            key={msg.id} 
                                            message={msg} 
                                            author={getUserById(msg.senderId)} 
                                            isCurrentUser={msg.senderId === currentUser.id} 
                                        />
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                        <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-4">
                                            <MessageIcon className="w-10 h-10 text-primary opacity-40" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">Inizia una conversazione sicura</h3>
                                        <p className="text-sm text-gray-500 max-w-xs mx-auto">Tutti i messaggi con u/{activeConversation.user.username} sono protetti da crittografia end-to-end.</p>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className="p-4 border-t border-gray-100 bg-white">
                                <form onSubmit={handleSendMessage} className="relative flex flex-col gap-3">
                                    {attachedMedia.length > 0 && (
                                        <div className="mb-2">
                                            <MediaUploader media={attachedMedia} onChange={setAttachedMedia} />
                                        </div>
                                    )}
                                    <div className="flex gap-2 items-end">
                                        <div className="flex-1 bg-gray-100 rounded-2xl p-1 overflow-hidden focus-within:ring-2 ring-primary/20 focus-within:bg-white transition-all">
                                            <textarea 
                                                value={newMessage} 
                                                onChange={e => setNewMessage(e.target.value)} 
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSendMessage(e);
                                                    }
                                                }}
                                                className="w-full bg-transparent p-3 resize-none outline-none text-sm font-medium" 
                                                placeholder={`Scrivi un messaggio sicuro a u/${activeConversation.user.username}...`} 
                                                rows={1} 
                                            />
                                            <div className="px-2 pb-2">
                                                <MediaUploader media={attachedMedia} onChange={setAttachedMedia} />
                                            </div>
                                        </div>
                                        <button 
                                            type="submit" 
                                            disabled={!newMessage.trim() && attachedMedia.length === 0}
                                            className="bg-primary text-white p-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-orange-600 active:scale-95 transition-all disabled:grayscale disabled:opacity-50 disabled:scale-100"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 -rotate-90" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                            </svg>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                                <MessageIcon className="w-12 h-12 text-gray-200" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-1">I tuoi Messaggi</h2>
                            <p className="text-sm max-w-xs">Seleziona una conversazione dalla lista a sinistra o visita il profilo di un utente per scrivergli in modo sicuro.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default MessagesPage;
