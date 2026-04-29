
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Post, Editorial } from '../types';
import { useAuth, useData, timeAgo, getFlagUrl, getCountryCodeForId } from '../hooks/useStore';
import { CommentIcon, HeartIcon } from './Icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import UserAvatar from './UserAvatar';
import ReportModal from './ReportModal';
import PostMedia from './PostMedia';
import AuthModal from './AuthModal';

interface PostCardProps {
  post: Post | Editorial;
  isFullView?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, isFullView = false }) => {
  const { getUserById, currentUser, isAdmin } = useAuth();
  const { boards, comments, isModerator, isBoardAdmin, votes, castVote } = useData();
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  const isPost = 'boardId' in post;
  const author = post.authorId ? getUserById(post.authorId) : undefined;
  const board = isPost ? boards.find(b => b.id === (post as Post).boardId) : undefined;
  const commentCount = comments.filter(c => c.postId === post.id).length;
  
  const score = votes.filter((v) => v.entityId === post.id).reduce((acc, vote) => acc + (vote.type === 'up' ? 1 : -1), 0);
  const userVote = currentUser ? votes.find((v) => v.entityId === post.id && v.userId === currentUser.id) : undefined;

  const handleVote = (type: 'up' | 'down') => currentUser ? castVote(post.id, type) : setAuthModalOpen(true);
  const targetLink = isPost ? (board ? `/b/${board.name}/post/${post.id}` : '#') : '/editorials';

  return (
    <article className="bg-white border border-gray-200 rounded-md hover:border-gray-300 w-full overflow-hidden shadow-sm transition-shadow hover:shadow-md">
      <div className="p-4 md:p-5 relative">
        <div className="flex items-center text-sm text-gray-500 mb-3 pr-8 font-medium">
          <UserAvatar user={author} className="w-6 h-6 mr-2" />
          {board ? (
            <Link to={`/b/${board.name}`} className="font-bold hover:underline text-primary">b/{board.name}</Link>
          ) : (
            <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-black uppercase tracking-tight">Editorial</span>
          )}
          <span className="mx-1.5 opacity-30">•</span>
          <div className="flex items-center gap-1.5">
            <img 
              src={getFlagUrl(post.countryCode || getCountryCodeForId(post.id))} 
              alt="location" 
              className="w-4 h-3 object-cover rounded-[1px] shadow-sm ring-1 ring-black/5" 
            />
            <span className="text-gray-800">{author ? <Link to={`/u/${author.username}`} className="hover:underline font-bold">u/{author.username}</Link> : 'u/anonymous'}</span>
          </div>
          <span className="mx-1.5 opacity-30">•</span>
          <span className="text-gray-400">{timeAgo(post.createdAt)}</span>
        </div>
        <Link to={targetLink}>
          <h2 className="text-2xl font-bold text-gray-900 hover:text-primary mb-3 leading-tight tracking-tight">
            {post.title}
          </h2>
        </Link>
        <div className={`mt-2 prose prose-gray max-w-none ${!isFullView ? 'max-h-60 overflow-hidden mask-gradient text-base leading-relaxed' : 'text-lg leading-relaxed'}`}>
             <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{post.content}</ReactMarkdown>
        </div>
        {post.media && <div className="mt-4"><PostMedia media={post.media} postLink={!isFullView ? targetLink : undefined} /></div>}
        <div className="mt-5 flex items-center gap-6 border-t border-gray-50 pt-4">
            <div className="flex items-center gap-2">
                <button onClick={() => handleVote('up')} className={`p-1.5 rounded-full transition-colors ${userVote?.type === 'up' ? 'text-red-600 bg-red-50' : 'text-gray-500 hover:text-red-600 hover:bg-gray-50'}`}><HeartIcon className={`w-5 h-5 ${userVote?.type === 'up' ? 'fill-current' : ''}`} /></button>
                <span className="text-base font-bold text-gray-700">{score}</span>
            </div>
            <Link to={targetLink} className="flex items-center gap-2 text-gray-500 text-sm font-bold hover:text-primary transition-colors group"><CommentIcon className="w-5 h-5 group-hover:scale-110 transition-transform" /><span>{commentCount} Comments</span></Link>
        </div>
      </div>
      {isReportModalOpen && <ReportModal entityId={post.id} entityType="post" onClose={() => setReportModalOpen(false)} />}
      {isAuthModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
      <style>{`.mask-gradient { mask-image: linear-gradient(to bottom, black 70%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, black 70%, transparent 100%); }`}</style>
    </article>
  );
};

export default PostCard;
