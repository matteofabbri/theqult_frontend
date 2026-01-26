
import React, { useMemo } from 'react';
import type { Message as MessageType, User } from '../types';
import UserAvatar from './UserAvatar';
import PostMedia from './PostMedia';
import { WalletIcon, LockIcon, CheckIcon, CloseIcon } from './Icons';
import { mockDecrypt, useData } from '../hooks/useStore';

interface MessageProps {
    message: MessageType;
    author: User | undefined;
    isCurrentUser: boolean;
}

const Message: React.FC<MessageProps> = ({ message, author, isCurrentUser }) => {
    const { respondToBoardInvite } = useData();
    const alignment = isCurrentUser ? 'justify-end' : 'justify-start';
    const isNotification = message.type === 'notification';
    const bubbleColor = isNotification 
        ? 'bg-blue-50 border border-blue-200 text-blue-900' 
        : isCurrentUser 
            ? 'bg-primary text-white' 
            : 'bg-gray-200 text-gray-800';
    
    const hasMedia = message.media && message.media.length > 0;
    const hasKopeki = message.kopekiAmount && message.kopekiAmount > 0;
    const isInvite = message.type === 'board_invite';

    const displayContent = useMemo(() => {
        if (message.isEncrypted && message.content) {
            return mockDecrypt(message.content);
        }
        return message.content;
    }, [message.content, message.isEncrypted]);

    const handleAccept = () => {
        if (!isCurrentUser) { // Only the recipient (who sees this as 'not current user' message in their view typically, but actually 'isCurrentUser' prop indicates who SENT it. 
            // Wait, in MessagesPage: isCurrentUser={msg.senderId === currentUser.id}.
            // If I am the recipient, isCurrentUser is false.
            respondToBoardInvite(message.id, 'accept');
        }
    };

    const handleReject = () => {
        if (!isCurrentUser) {
            respondToBoardInvite(message.id, 'reject');
        }
    };

    return (
        <div className={`flex items-end gap-2 ${alignment}`}>
            {!isCurrentUser && !isNotification && <UserAvatar user={author} className="w-6 h-6 mb-1" />}
            <div className={`rounded-lg max-w-sm md:max-w-md overflow-hidden ${bubbleColor} ${hasMedia || isInvite ? 'p-1' : 'px-3 py-2'} ${isNotification ? 'w-full max-w-none text-center text-sm py-1' : ''}`}>
                
                {/* Notification Banner */}
                {isNotification && (
                    <div className="flex items-center justify-center gap-2">
                        <span className="font-semibold">🔔 Notification:</span>
                        <span>{displayContent}</span>
                    </div>
                )}

                {/* Board Invite Card */}
                {!isNotification && isInvite && message.metadata && (
                    <div className="bg-white rounded p-3 text-gray-800 shadow-sm border border-gray-200 m-1">
                        <p className="font-bold text-sm mb-1">Invitation</p>
                        <p className="text-sm mb-3">You have been invited to join <span className="font-bold text-primary">b/{message.metadata.boardName}</span></p>
                        
                        {!isCurrentUser && message.metadata.inviteStatus === 'pending' && (
                            <div className="flex gap-2">
                                <button onClick={handleAccept} className="flex-1 bg-green-600 text-white text-xs font-bold py-2 rounded hover:bg-green-700 flex items-center justify-center gap-1">
                                    <CheckIcon className="w-3 h-3" /> Accept
                                </button>
                                <button onClick={handleReject} className="flex-1 bg-red-100 text-red-600 text-xs font-bold py-2 rounded hover:bg-red-200 flex items-center justify-center gap-1">
                                    <CloseIcon className="w-3 h-3" /> Decline
                                </button>
                            </div>
                        )}
                        {message.metadata.inviteStatus === 'accepted' && (
                            <div className="bg-green-50 text-green-700 text-xs font-bold py-2 rounded text-center border border-green-200">
                                ✅ Invitation Accepted
                            </div>
                        )}
                        {message.metadata.inviteStatus === 'rejected' && (
                            <div className="bg-gray-100 text-gray-500 text-xs font-bold py-2 rounded text-center border border-gray-200">
                                ❌ Invitation Declined
                            </div>
                        )}
                        {isCurrentUser && (
                            <div className="text-xs text-gray-500 text-center italic mt-2">
                                You sent an invitation. Status: {message.metadata.inviteStatus}
                            </div>
                        )}
                    </div>
                )}

                {/* Kopeki Transfer */}
                {!isNotification && hasKopeki && (
                     <div className={`flex items-center justify-between ${hasMedia ? 'px-2 py-1' : 'mb-1'}`}>
                         <div className="flex items-center gap-2">
                             <WalletIcon className="w-5 h-5" />
                             <span className="font-bold text-lg">{message.kopekiAmount?.toLocaleString()} K</span>
                         </div>
                     </div>
                )}

                {/* Media */}
                {!isNotification && hasMedia && (
                    <div className="mb-1">
                        <PostMedia media={message.media!} compact={true} />
                    </div>
                )}

                {/* Text Content (if not special type) */}
                {!isNotification && !isInvite && displayContent && (
                    <div className={`flex items-end gap-2 ${hasMedia ? 'px-2 pb-2 pt-1' : ''}`}>
                        <p className="text-sm" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                            {displayContent}
                        </p>
                        {message.isEncrypted && (
                            <div className="mb-0.5" title="End-to-End Encrypted">
                                <LockIcon className={`w-3 h-3 ${isCurrentUser ? 'text-white/70' : 'text-gray-500'}`} />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Message;