
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ProfilePost } from '../types';
import { useAuth, useData, getFlagUrl, timeAgo } from '../hooks/useStore';
import { CommentIcon, ThumbsDownIcon, HeartIcon, ReportIcon, WalletIcon } from './Icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import UserAvatar from './UserAvatar';
import ReportModal from './ReportModal';
import PostMedia from './PostMedia';
import AuthModal from './AuthModal';

interface ProfilePostCardProps {
  post: ProfilePost;
  isFullView?: boolean;
}

const ProfilePostCard: React.FC<ProfilePostCardProps> = ({ post, isFullView = false }) => {
  const { getUserById, currentUser } = useAuth();
  const { comments, deleteProfilePost, votes, castVote, unlockProfilePost } = useData();
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [unlockError, setUnlockError] = useState('');

  const author = getUserById(post.authorId);
  const commentCount = comments.filter(c => c.postId === post.id).length;
  const canModerate = currentUser && currentUser.id === post.authorId;
  const entityVotes = votes.filter((v) => v.entityId === post.id);
  const score = entityVotes.reduce((acc, vote) => acc + (vote.type === 'up' ? 1 : -1), 0);
  const userVote = currentUser ? entityVotes.find((v) => v.userId === currentUser.id) : undefined;

  const isLocked = !!(post.price && post.price > 0 && currentUser?.id !== post.authorId && !post.unlockedUserIds?.includes(currentUser?.id || ''));

  const handleVote = (type: 'up' | 'down') => { if (currentUser) castVote(post.id, type); else setAuthModalOpen(true); };
  const handleDelete = () => { if (window.confirm('Delete this?')) deleteProfilePost(post.id); };
  const handleUnlock = () => {
      if (!currentUser) return setAuthModalOpen(true);
      const result = unlockProfilePost(post.id);
      if (!result.success) { setUnlockError(result.message); setTimeout(() => setUnlockError(''), 3000); }
  }

  const postLink = author ? `/u/${author.username}/post/${post.id}` : '#';

  return (
    <article className="bg-white border border-gray-200 rounded-md hover:border-gray-300 transition-colors duration-200">
      <div className="p-3 overflow-hidden relative">
         <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
            <button onClick={() => setReportModalOpen(true)} className="p-1 rounded-sm text-gray-400 hover:text-yellow-500"><ReportIcon className="w-4 h-4" /></button>
            {!isLocked && <button onClick={() => handleVote('down')} className={`p-1 rounded-sm transition-colors ${userVote?.type === 'down' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'}`}><ThumbsDownIcon className="w-4 h-4" /></button>}
         </div>

        <div className="flex items-center text-sm text-gray-500 mb-2 pr-8">
          {author?.countryCode && <img src={getFlagUrl(author.countryCode)} alt={author.countryCode} className="w-5 h-auto rounded-sm shadow-sm mr-2" />}
          <UserAvatar user={author} className="w-5 h-5 mr-2" />
          <span>Posted by {author ? <Link to={`/u/${author.username}`} className="hover:underline text-gray-800 font-bold">u/{author.username}</Link> : 'u/unknown'}</span>
          <span className="mx-1">•</span>
          <span>{timeAgo(post.createdAt)}</span>
          {post.price && post.price > 0 && <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><WalletIcon className="w-3 h-3" />{post.price} K</span>}
        </div>
        
        <Link to={postLink}><h2 className="text-xl font-semibold text-gray-800 mb-1 hover:text-primary transition-colors pr-8">{post.title}</h2></Link>
        
        {isLocked ? (
             <div className="mt-4 p-8 bg-gray-100 rounded-lg border border-gray-200 flex flex-col items-center justify-center text-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-orange-50 opacity-50"></div>
                 <div className="relative z-10">
                     <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-yellow-500"><svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div>
                     <h3 className="text-lg font-bold text-gray-800 mb-1">Exclusive Content</h3>
                     <p className="text-gray-600 mb-4 text-sm">Unlock this post to see the full content and media.</p>
                     <button onClick={handleUnlock} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-full shadow-md flex items-center gap-2 transition-transform active:scale-95 mx-auto"><span>Unlock for {post.price} K</span></button>
                     {unlockError && <p className="text-red-500 text-xs mt-2 font-semibold">{unlockError}</p>}
                     {!currentUser && <p className="text-xs text-gray-500 mt-3">You must be logged in to unlock.</p>}
                 </div>
             </div>
        ) : (
            <>
                <div className={`mt-1 prose max-w-none prose-p:my-2 ${!isFullView ? 'max-h-32 overflow-hidden mask-gradient' : ''}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{post.content}</ReactMarkdown>
                </div>
                {post.media && post.media.length > 0 && <PostMedia media={post.media} postLink={!isFullView ? postLink : undefined} />}
            </>
        )}
        
        {!isLocked && (
            <div className="mt-3 flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                <button 
                    onClick={() => handleVote('up')} 
                    className={`p-1 rounded-sm transition-colors ${userVote?.type === 'up' ? 'text-red-600 bg-red-50' : 'text-gray-500 hover:text-red-600 hover:bg-red-50'}`}
                >
                    <HeartIcon className={`w-4 h-4 ${userVote?.type === 'up' ? 'fill-current' : ''}`} />
                </button>
                <span className={`text-sm font-semibold ${userVote?.type === 'up' ? 'text-red-600' : 'text-gray-600'}`}>{score}</span>
            </div>
            <Link to={postLink} className="flex items-center gap-2 text-gray-500 hover:bg-gray-100 px-3 py-1 rounded-md text-sm font-semibold w-fit">
                <CommentIcon className="w-4 h-4" /><span>{commentCount} Comments</span>
            </Link>
            {canModerate && <Link to={`${postLink}/edit`} className="text-sm font-semibold text-blue-500 hover:bg-blue-50 px-3 py-1 rounded-md">Edit</Link>}
            {canModerate && <button onClick={handleDelete} className="text-sm font-semibold text-red-500 hover:bg-red-50 px-3 py-1 rounded-md">Delete</button>}
            </div>
        )}
      </div>
      {isReportModalOpen && <ReportModal entityId={post.id} entityType="post" onClose={() => setReportModalOpen(false)} />}
      {isAuthModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
       <style>{`.mask-gradient { mask-image: linear-gradient(to bottom, black 60%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%); }`}</style>
    </article>
  );
};

export default ProfilePostCard;
