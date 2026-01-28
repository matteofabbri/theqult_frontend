
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth, useData } from '../hooks/useStore';
import UserAvatar from '../components/UserAvatar';
import { MessageIcon, TrashIcon, ImageFileIcon, CloseIcon, UserPlusIcon } from '../components/Icons';
import type { User, Message, MediaItem } from '../types';
import MessageComponent from '../components/Message';
import BoardIcon from '../components/BoardIcon';

const MessagesPage: React.FC = () => {
    const { username: activeUsername } = useParams();
    const navigate = useNavigate();
    const { currentUser, getUserById, getUserByUsername, moveConversationToJunk, moveConversationToInbox } = useAuth();
    const { messages, sendMessage, markConversationAsRead, boards, inviteUserToBoard } = useData();
    const [activeTab, setActiveTab] = useState<'inbox' | 'junk'>('inbox');
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [attachedMedia, setAttachedMedia] = useState<MediaItem[]>([]);
    const [isSendingInvite, setIsSendingInvite] = useState(false);
    const [selectedInviteBoardId, setSelectedInviteBoardId] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { if (!currentUser) navigate('/'); }, [currentUser, navigate]);

    const conversations = useMemo(() => {
        if (!currentUser) return new Map<string, any>();
        const convos = new Map<string, any>();
        messages.forEach(msg => {
            const otherId = msg.senderId === currentUser.id ? msg.recipientId : msg.senderId;
            if (!convos.has(otherId)) {
                const user = getUserById(otherId);
                if (user) convos.set(otherId, { user, messages: [], unreadCount: 0 });
            }
            const convo = convos.get(otherId);
            if (convo) {
                convo.messages.push(msg);
                if (!msg.readAt && msg.recipientId === currentUser.id) convo.unreadCount++;
            }
        });
        return convos;
    }, [messages, currentUser, getUserById]);

    const activeUser = useMemo(() => activeUsername ? getUserByUsername(activeUsername) : undefined, [activeUsername, getUserByUsername]);
    const activeConversation = activeUser ? conversations.get(activeUser.id) : undefined;

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if ((newMessage.trim() || attachedMedia.length > 0) && activeUser) {
            sendMessage(activeUser.id, newMessage.trim(), attachedMedia);
            setNewMessage(''); setAttachedMedia([]);
        }
    };

    if (!currentUser) return null;

    return (
        <div className="container mx-auto h-[calc(100vh-8rem)]">
            <div className="flex h-full bg-white border border-gray-200 rounded-md">
                <main className="w-full flex flex-col">
                    {activeConversation ? (
                        <>
                            <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-white">
                                <div className="flex items-center gap-3">
                                    <UserAvatar user={activeConversation.user} className="w-8 h-8"/>
                                    <h2 className="font-bold text-lg">{activeConversation.user.username}</h2>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {activeConversation.messages.map((msg: Message) => (
                                    <MessageComponent key={msg.id} message={msg} author={getUserById(msg.senderId)} isCurrentUser={msg.senderId === currentUser.id} />
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="p-3 border-t border-gray-200 bg-white">
                                <form onSubmit={handleSendMessage} className="flex gap-2">
                                    <textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} className="flex-1 bg-gray-100 rounded-lg p-3 resize-none outline-none focus:ring-2 focus:ring-primary" placeholder="Message..." rows={1} />
                                    <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg font-bold">Send</button>
                                </form>
                            </div>
                        </>
                    ) : <div className="flex-1 flex flex-col items-center justify-center text-gray-500">Select a conversation</div>}
                </main>
            </div>
        </div>
    );
};

export default MessagesPage;
