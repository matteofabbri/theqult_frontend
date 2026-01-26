
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth, useData } from '../hooks/useStore';
import UserAvatar from '../components/UserAvatar';
import { MessageIcon, TrashIcon, ImageFileIcon, WalletIcon, CloseIcon, UserPlusIcon } from '../components/Icons';
import type { User, Message, MediaItem } from '../types';
import MessageComponent from '../components/Message';
import BoardIcon from '../components/BoardIcon';

interface Conversation {
  user: User;
  messages: Message[];
  unreadCount: number;
}

const MessagesPage: React.FC = () => {
    const { username: activeUsername } = useParams();
    const navigate = useNavigate();
    const { currentUser, getUserById, getUserByUsername, moveConversationToJunk, moveConversationToInbox } = useAuth();
    const { messages, sendMessage, markConversationAsRead, boards, inviteUserToBoard } = useData();
    const [activeTab, setActiveTab] = useState<'inbox' | 'junk'>('inbox');
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // Modal State
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    // Media & Money State
    const [attachedMedia, setAttachedMedia] = useState<MediaItem[]>([]);
    const [isSendingMoney, setIsSendingMoney] = useState(false);
    const [kopekiAmount, setKopekiAmount] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Invite State
    const [isSendingInvite, setIsSendingInvite] = useState(false);
    const [selectedInviteBoardId, setSelectedInviteBoardId] = useState('');

    useEffect(() => {
        if (!currentUser) {
            navigate('/');
        }
    }, [currentUser, navigate]);

    const conversations = useMemo(() => {
        if (!currentUser) return new Map<string, Conversation>();
        const convos = new Map<string, Conversation>();
        
        messages.forEach(msg => {
            const otherUserId = msg.senderId === currentUser.id ? msg.recipientId : msg.senderId;
            
            if (!convos.has(otherUserId)) {
                const otherUser = getUserById(otherUserId);
                if (otherUser) {
                    convos.set(otherUserId, { user: otherUser, messages: [], unreadCount: 0 });
                }
            }
            
            const convo = convos.get(otherUserId);
            if (convo) {
                convo.messages.push(msg);
                if (!msg.readAt && msg.recipientId === currentUser.id) {
                    convo.unreadCount++;
                }
            }
        });

        convos.forEach(convo => {
            convo.messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        });
        
        return convos;
    }, [messages, currentUser, getUserById]);

    const { inboxConversations, junkConversations } = useMemo(() => {
        const inbox: Conversation[] = [];
        const junk: Conversation[] = [];
        const junkSenders = new Set(currentUser?.junkSenders || []);

        Array.from(conversations.values()).forEach((convo: Conversation) => {
            if (junkSenders.has(convo.user.id)) {
                junk.push(convo);
            } else {
                inbox.push(convo);
            }
        });

        const sortByLastMessage = (a: Conversation, b: Conversation) => 
            new Date(b.messages[b.messages.length - 1].createdAt).getTime() - 
            new Date(a.messages[a.messages.length - 1].createdAt).getTime();

        return {
            inboxConversations: inbox.sort(sortByLastMessage),
            junkConversations: junk.sort(sortByLastMessage),
        };

    }, [conversations, currentUser]);
    
    const activeUser = useMemo(() => activeUsername ? getUserByUsername(activeUsername) : undefined, [activeUsername, getUserByUsername]);
    const activeConversation = activeUser ? conversations.get(activeUser.id) : undefined;

    // Filter boards where current user is admin
    const adminBoards = useMemo(() => {
        if (!currentUser) return [];
        return boards.filter(b => b.adminIds.includes(currentUser.id));
    }, [boards, currentUser]);

    useEffect(() => {
        if (activeUser) {
            markConversationAsRead(activeUser.id);
        }
    }, [activeUser, markConversationAsRead]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeConversation?.messages, attachedMedia, kopekiAmount]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        
        const fileReaders: Promise<MediaItem | null>[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            let type: 'image' | 'video' | 'audio' | null = null;
            if (file.type.startsWith('image/')) type = 'image';
            else if (file.type.startsWith('video/')) type = 'video';
            else if (file.type.startsWith('audio/')) type = 'audio';

            if (type) {
                const p = new Promise<MediaItem | null>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve({ id: crypto.randomUUID(), type: type!, url: reader.result as string });
                    reader.onerror = () => resolve(null); // Resolve null on error to avoid breaking Promise.all
                    reader.readAsDataURL(file);
                });
                fileReaders.push(p);
            }
        }

        const results = await Promise.all(fileReaders);
        const newItems = results.filter((item): item is MediaItem => item !== null);
        
        setAttachedMedia(prev => [...prev, ...newItems]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeMedia = (id: string) => {
        setAttachedMedia(prev => prev.filter(m => m.id !== id));
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        const amountNum = kopekiAmount ? parseInt(kopekiAmount, 10) : undefined;

        if ((newMessage.trim() || attachedMedia.length > 0 || (amountNum && amountNum > 0)) && activeUser) {
            const result = sendMessage(activeUser.id, newMessage.trim(), attachedMedia, amountNum);
            
            if (result.success) {
                setNewMessage('');
                setAttachedMedia([]);
                setKopekiAmount('');
                setIsSendingMoney(false);
            } else if (result.error) {
                alert(result.error);
            }
        }
    };

    const handleInviteSubmit = () => {
        if (selectedInviteBoardId && activeUser) {
            const result = inviteUserToBoard(selectedInviteBoardId, activeUser.username);
            if (result.success) {
                setIsSendingInvite(false);
                setSelectedInviteBoardId('');
            } else {
                alert(result.message);
            }
        }
    };

    const handleDeleteClick = () => {
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (activeConversation) {
            moveConversationToJunk(activeConversation.user.id);
            setDeleteModalOpen(false);
        }
    };
    
    if (!currentUser) return null;

    const ConversationListItem: React.FC<{ convo: Conversation }> = ({ convo }) => {
        const lastMessage = convo.messages[convo.messages.length - 1];
        let preview = lastMessage.content;
        if (!preview) {
             if (lastMessage.kopekiAmount) preview = `Sent ${lastMessage.kopekiAmount} Kopeki`;
             else if (lastMessage.media?.length) preview = 'Sent an attachment';
             else if (lastMessage.type === 'board_invite') preview = 'Sent an invitation';
        }

        return (
            <Link
                to={`/messages/${convo.user.username}`}
                className={`w-full text-left p-3 flex items-center gap-3 hover:bg-gray-100 rounded-lg ${activeUser?.id === convo.user.id ? 'bg-gray-100' : ''}`}
            >
                <UserAvatar user={convo.user} className="w-10 h-10" />
                <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                        <p className="font-semibold text-gray-800 truncate">{convo.user.username}</p>
                        {convo.unreadCount > 0 && <span className="text-xs bg-primary text-white font-bold rounded-full px-2 py-0.5">{convo.unreadCount}</span>}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{lastMessage.senderId === currentUser.id ? 'You: ' : ''}{preview}</p>
                </div>
            </Link>
        )
    };

    const conversationList = activeTab === 'inbox' ? inboxConversations : junkConversations;

    return (
        <div className="container mx-auto h-[calc(100vh-8rem)]">
            <div className="flex h-full bg-white border border-gray-200 rounded-md">
                {/* Sidebar */}
                <aside className="w-1/3 border-r border-gray-200 flex flex-col hidden md:flex">
                    <div className="p-2 border-b border-gray-200">
                        <div className="flex bg-gray-100 rounded-md p-1">
                            <button onClick={() => setActiveTab('inbox')} className={`w-1/2 p-2 text-sm font-semibold rounded-md ${activeTab === 'inbox' ? 'bg-white shadow' : 'text-gray-600'}`}>Inbox</button>
                            <button onClick={() => setActiveTab('junk')} className={`w-1/2 p-2 text-sm font-semibold rounded-md ${activeTab === 'junk' ? 'bg-white shadow' : 'text-gray-600'}`}>Junk</button>
                        </div>
                    </div>
                    <div className="overflow-y-auto p-2 space-y-1">
                        {conversationList.length > 0 ? (
                           conversationList.map(convo => <ConversationListItem key={convo.user.id} convo={convo} />)
                        ) : (
                            <div className="text-center text-gray-500 p-8">
                                <p className="font-semibold">No messages in {activeTab}</p>
                                <p className="text-sm">Your conversations will appear here.</p>
                            </div>
                        )}
                    </div>
                </aside>
                {/* Main Content */}
                <main className="w-full md:w-2/3 flex flex-col">
                    {activeConversation ? (
                        <>
                            {/* Header */}
                            <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10">
                                <div className="flex items-center gap-3">
                                    <Link to="/messages" className="md:hidden text-gray-500 hover:text-primary pr-2">
                                        &larr; Back
                                    </Link>
                                    <Link to={`/u/${activeConversation.user.username}`}>
                                        <UserAvatar user={activeConversation.user} className="w-8 h-8"/>
                                    </Link>
                                    <h2 className="font-bold text-lg">{activeConversation.user.username}</h2>
                                </div>
                                {activeTab === 'inbox' ? (
                                    <button onClick={handleDeleteClick} title="Move to Junk" className="text-gray-500 hover:text-red-500 p-2 rounded-full hover:bg-gray-100">
                                        <TrashIcon className="w-5 h-5"/>
                                    </button>
                                ) : (
                                    <button onClick={() => moveConversationToInbox(activeConversation.user.id)} title="Move to Inbox" className="text-gray-500 hover:text-green-500 p-2 rounded-full hover:bg-gray-100">
                                        <MessageIcon className="w-5 h-5"/>
                                    </button>
                                )}
                            </div>
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {activeConversation.messages.map(msg => (
                                    <MessageComponent key={msg.id} message={msg} author={getUserById(msg.senderId)} isCurrentUser={msg.senderId === currentUser.id} />
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            {/* Attachments Preview */}
                            {(attachedMedia.length > 0 || kopekiAmount) && (
                                <div className="p-2 border-t border-gray-200 bg-gray-50 flex gap-2 overflow-x-auto items-center">
                                    {kopekiAmount && (
                                        <div className="relative bg-yellow-100 border border-yellow-300 rounded-md p-2 flex items-center gap-2 min-w-fit">
                                            <WalletIcon className="w-4 h-4 text-yellow-600"/>
                                            <span className="text-sm font-bold text-yellow-800">{parseInt(kopekiAmount).toLocaleString()} K</span>
                                            <button onClick={() => { setKopekiAmount(''); setIsSendingMoney(false); }} className="ml-2 text-gray-500 hover:text-red-500">
                                                <CloseIcon className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    )}
                                    {attachedMedia.map(m => (
                                        <div key={m.id} className="relative w-16 h-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0 border border-gray-300">
                                            {m.type === 'image' && <img src={m.url} className="w-full h-full object-cover" alt="preview"/>}
                                            {m.type === 'video' && <video src={m.url} className="w-full h-full object-cover"/>}
                                            {m.type === 'audio' && <div className="w-full h-full flex items-center justify-center">🎵</div>}
                                            <button 
                                                onClick={() => removeMedia(m.id)}
                                                className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-md hover:bg-red-600"
                                            >
                                                <CloseIcon className="w-3 h-3"/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {/* Input */}
                            <div className="p-3 border-t border-gray-200 bg-white">
                                <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                                    <input 
                                        type="file" 
                                        multiple 
                                        accept="image/*,video/*,audio/*" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        onChange={handleFileChange} 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors"
                                        title="Attach Media"
                                    >
                                        <ImageFileIcon className="w-6 h-6"/>
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setIsSendingMoney(true)}
                                        className={`p-2 rounded-full transition-colors ${isSendingMoney || kopekiAmount ? 'text-yellow-600 bg-yellow-100' : 'text-gray-500 hover:bg-gray-100'}`}
                                        title="Send Kopeki"
                                    >
                                        <WalletIcon className="w-6 h-6"/>
                                    </button>
                                    {adminBoards.length > 0 && (
                                        <button 
                                            type="button"
                                            onClick={() => setIsSendingInvite(true)}
                                            className={`p-2 rounded-full transition-colors ${isSendingInvite ? 'text-blue-600 bg-blue-100' : 'text-gray-500 hover:bg-gray-100'}`}
                                            title="Invite to Board"
                                        >
                                            <UserPlusIcon className="w-6 h-6"/>
                                        </button>
                                    )}
                                    
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder={`Message ${activeConversation.user.username}...`}
                                        className="flex-1 bg-gray-100 border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary max-h-32 min-h-[44px]"
                                        rows={1}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                    />
                                    <button 
                                        type="submit" 
                                        className="bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed h-11" 
                                        disabled={!newMessage.trim() && attachedMedia.length === 0 && !kopekiAmount}
                                    >
                                        Send
                                    </button>
                                </form>
                            </div>

                            {/* Money Modal */}
                            {isSendingMoney && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm relative overflow-hidden animate-fadeIn">
                                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                                <WalletIcon className="w-5 h-5 text-yellow-600" />
                                                Send Kopeki
                                            </h3>
                                            <button onClick={() => setIsSendingMoney(false)} className="text-gray-400 hover:text-gray-700 bg-white p-1 rounded-full shadow-sm border border-gray-200">
                                                <CloseIcon className="w-4 h-4"/>
                                            </button>
                                        </div>
                                        
                                        <div className="p-6">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Amount to Send</label>
                                            <div className="relative mb-4">
                                                <input 
                                                    type="number" 
                                                    value={kopekiAmount}
                                                    onChange={(e) => setKopekiAmount(e.target.value)}
                                                    className="w-full border-2 border-gray-200 rounded-lg p-4 text-3xl font-bold text-gray-800 text-center focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder-gray-300"
                                                    placeholder="0"
                                                    min="1"
                                                    autoFocus
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">KOPEKI</span>
                                            </div>
                                            
                                            <div className="flex justify-between items-center bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                                                <span className="text-sm text-yellow-800">Your Balance:</span>
                                                <span className="font-bold text-yellow-900">{currentUser.kopeki.toLocaleString()} K</span>
                                            </div>
                                        </div>

                                        <div className="p-6 pt-0">
                                            <button 
                                                onClick={() => setIsSendingMoney(false)} 
                                                className="w-full bg-primary text-white text-lg font-bold py-3 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-transform active:scale-95"
                                                disabled={!kopekiAmount || parseInt(kopekiAmount) <= 0 || parseInt(kopekiAmount) > currentUser.kopeki}
                                            >
                                                Attach Amount
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Invite Modal */}
                            {isSendingInvite && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm relative overflow-hidden animate-fadeIn">
                                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                                <UserPlusIcon className="w-5 h-5 text-blue-600" />
                                                Invite {activeConversation.user.username}
                                            </h3>
                                            <button onClick={() => setIsSendingInvite(false)} className="text-gray-400 hover:text-gray-700 bg-white p-1 rounded-full shadow-sm border border-gray-200">
                                                <CloseIcon className="w-4 h-4"/>
                                            </button>
                                        </div>
                                        
                                        <div className="p-4 max-h-60 overflow-y-auto">
                                            <p className="text-sm text-gray-600 mb-2 px-2">Select a board to invite to:</p>
                                            <div className="space-y-2">
                                                {adminBoards.length > 0 ? (
                                                    adminBoards.map(board => (
                                                        <div 
                                                            key={board.id} 
                                                            onClick={() => setSelectedInviteBoardId(board.id)}
                                                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${selectedInviteBoardId === board.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                                                        >
                                                            <BoardIcon board={board} className="w-8 h-8" />
                                                            <span className="font-bold text-gray-800 text-sm">{board.name}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center text-gray-500 py-4 text-sm">
                                                        You do not manage any boards.
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-6 pt-2">
                                            <button 
                                                onClick={handleInviteSubmit} 
                                                className="w-full bg-blue-600 text-white text-lg font-bold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-transform active:scale-95"
                                                disabled={!selectedInviteBoardId}
                                            >
                                                Send Invitation
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500">
                            <MessageIcon className="w-16 h-16 text-gray-300 mb-4"/>
                            <h2 className="text-xl font-semibold">Your Messages</h2>
                            <p>Send messages, media, and Kopeki to other users.</p>
                        </div>
                    )}
                </main>
            </div>

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm relative border border-gray-200 shadow-xl">
                        <button onClick={() => setDeleteModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
                            <CloseIcon className="w-5 h-5" />
                        </button>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Conversation?</h3>
                        <p className="text-sm text-gray-600 mb-6">Are you sure you want to move this conversation to Junk? You will no longer receive notifications for it.</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-md transition-colors">Cancel</button>
                            <button onClick={handleConfirmDelete} className="px-4 py-2 text-sm font-bold bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessagesPage;
