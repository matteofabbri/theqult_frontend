
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ProfilePost } from '../types';
import { useAuth, useData, getFlagUrl, timeAgo, getCountryCodeForId } from '../hooks/useStore';
import { CommentIcon, ThumbsDownIcon, HeartIcon, ReportIcon, GiftIcon, WalletIcon } from './Icons';
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
  const { comments, deleteProfilePost, votes, castVote } = useData();
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  const author = getUserById(post.authorId);
  const commentCount = comments.filter(c => c.postId === post.id).length;
  const canModerate = currentUser && currentUser.id === post.authorId;
  const entityVotes = votes.filter((v) => v.entityId === post.id);
  const score = entityVotes.reduce((acc, vote) => acc + (vote.type === 'up' ? 1 : -1), 0);
  const userVote = currentUser ? entityVotes.find((v) => v.userId === currentUser.id) : undefined;

  const handleVote = (type: 'up' | 'down') => { if (currentUser) castVote(post.id, type); else setAuthModalOpen(true); };
  const handleDelete = () => { if (window.confirm('Delete this?')) deleteProfilePost(post.id); };

  const postLink = author ? `/u/${author.username}/post/${post.id}` : '#';

  return (
    <article className="bg-white border border-gray-200 rounded-md hover:border-gray-300 transition-colors duration-200">
      <div className="p-3 overflow-hidden relative">
         <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
            <button onClick={() => setReportModalOpen(true)} className="p-1 rounded-sm text-gray-400 hover:text-yellow-500"><ReportIcon className="w-4 h-4" /></button>
            <button onClick={() => handleVote('down')} className={`p-1 rounded-sm transition-colors ${userVote?.type === 'down' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'}`}><ThumbsDownIcon className="w-4 h-4" /></button>
         </div>

        <div className="flex items-center text-sm text-gray-500 mb-2 pr-8">
          <UserAvatar user={author} className="w-5 h-5 mr-2" />
          <div className="flex items-center gap-1.5 font-medium">
            <img 
              src={getFlagUrl(post.countryCode || getCountryCodeForId(post.id))} 
              alt="location" 
              className="w-4 h-3 object-cover rounded-[1px] shadow-sm ring-1 ring-black/5" 
            />
            <span>Posted by {author ? <Link to={`/u/${author.username}`} className="hover:underline text-gray-800 font-bold">u/{author.username}</Link> : 'u/unknown'}</span>
          </div>
          <span className="mx-1.5 opacity-30">•</span>
          <span>{timeAgo(post.createdAt)}</span>
        </div>
        
        <Link to={postLink}><h2 className="text-xl font-semibold text-gray-800 mb-1 hover:text-primary transition-colors pr-8">{post.title}</h2></Link>
        
        <div className={`mt-1 prose max-w-none prose-p:my-2 ${!isFullView ? 'max-h-32 overflow-hidden mask-gradient' : ''}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{post.content}</ReactMarkdown>
        </div>
        {post.media && post.media.length > 0 && <PostMedia media={post.media} postLink={!isFullView ? postLink : undefined} />}
        
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
      </div>
      {isReportModalOpen && <ReportModal entityId={post.id} entityType="post" onClose={() => setReportModalOpen(false)} />}
      {isAuthModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
       <style>{`.mask-gradient { mask-image: linear-gradient(to bottom, black 60%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%); }`}</style>
    </article>
  );
};

export default ProfilePostCard;
