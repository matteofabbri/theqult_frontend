
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Post, Editorial } from '../types';
import { useAuth, useData, getFlagUrl, timeAgo } from '../hooks/useStore';
import { CommentIcon, ThumbsDownIcon, HeartIcon, ReportIcon, GiftIcon } from './Icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import UserAvatar from './UserAvatar';
import ReportModal from './ReportModal';
import PostMedia from './PostMedia';
import AwardModal from './AwardModal';
import AuthModal from './AuthModal';
import { AVAILABLE_AWARDS } from './Awards';

interface PostCardProps {
  post: Post | Editorial;
  isFullView?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, isFullView = false }) => {
  const { getUserById, currentUser, isAdmin } = useAuth();
  const { boards, comments, isModerator, deletePost, isBoardAdmin, votes, castVote, deleteEditorial, awards } = useData();
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const [isAwardModalOpen, setAwardModalOpen] = useState(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  const author = post.authorId ? getUserById(post.authorId) : undefined;
  
  const isPost = 'boardId' in post;
  const board = isPost ? boards.find(b => b.id === (post as Post).boardId) : undefined;
  const commentCount = isPost ? comments.filter(c => c.postId === post.id).length : 0;
  
  const canModerate = currentUser && (
    isPost && board 
      ? (isAdmin(currentUser.id) || isBoardAdmin(currentUser.id, board.id) || isModerator(currentUser.id, board.id))
      : isAdmin(currentUser.id)
  );

  const entityVotes = votes.filter((v) => v.entityId === post.id);
  const score = entityVotes.reduce((acc, vote) => acc + (vote.type === 'up' ? 1 : -1), 0);
  const userVote = currentUser ? entityVotes.find((v) => v.userId === currentUser.id) : undefined;

  const postAwards = awards.filter(a => a.entityId === post.id);
  const groupedAwards = postAwards.reduce((acc, award) => {
      acc[award.typeId] = (acc[award.typeId] || 0) + 1;
      return acc;
  }, {} as Record<string, number>);

  const handleVote = (type: 'up' | 'down') => {
    if (currentUser) castVote(post.id, type); else setAuthModalOpen(true);
  };

  const handleGiveAward = () => {
      if (currentUser) setAwardModalOpen(true); else setAuthModalOpen(true);
  };

  const handleDelete = () => {
    if (window.confirm('Delete this?')) {
        if (isPost) deletePost(post.id); else deleteEditorial(post.id);
    }
  }

  const targetLink = isPost ? (board ? `/b/${board.name}/post/${post.id}` : '#') : '/editorials';

  return (
    <article className="bg-white border border-gray-200 rounded-md hover:border-gray-300 transition-colors duration-200">
      <div className="p-3 overflow-hidden relative">
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <button onClick={() => setReportModalOpen(true)} className="p-1 rounded-sm text-gray-400 hover:text-yellow-500">
            <ReportIcon className="w-4 h-4" />
          </button>
          <button onClick={() => handleVote('down')} className={`p-1 rounded-sm transition-colors ${userVote?.type === 'down' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'}`}>
            <ThumbsDownIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center text-sm text-gray-500 mb-2 pr-8">
          {author?.countryCode && <img src={getFlagUrl(author.countryCode)} alt={author.countryCode} className="w-5 h-auto rounded-sm shadow-sm mr-2" />}
          <UserAvatar user={author} className="w-5 h-5 mr-2" />
          {isPost && board && (
            <>
              <Link to={`/b/${board.name}`} className="font-bold text-gray-800 hover:underline">b/{board.name}</Link>
              <span className="mx-1">•</span>
            </>
          )}
          <span>Posted by {author ? <Link to={`/u/${author.username}`} className="hover:underline">u/{author.username}</Link> : 'u/anonymous'}</span>
          <span className="mx-1">•</span>
          <span>{timeAgo(post.createdAt)}</span>
        </div>
        
        {isPost && Object.keys(groupedAwards).length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
                {Object.entries(groupedAwards).map(([awardId, count]) => {
                    const awardDef = AVAILABLE_AWARDS.find(a => a.id === awardId);
                    if (!awardDef) return null;
                    return (
                        <div key={awardId} className="flex items-center bg-gray-100 rounded-full px-2 py-0.5 border border-gray-200" title={awardDef.label}>
                            <div className={`w-4 h-4 mr-1 ${awardDef.color}`}><awardDef.icon /></div>
                            {(count as number) > 1 && <span className="text-xs font-bold text-gray-600">{count as number}</span>}
                        </div>
                    );
                })}
            </div>
        )}

        <Link to={targetLink}>
          <h2 className="text-xl font-semibold text-gray-800 mb-1 hover:text-primary transition-colors pr-8">{post.title}</h2>
        </Link>
        
        <div className={`mt-1 prose max-w-none prose-p:my-2 ${!isFullView ? 'max-h-32 overflow-hidden mask-gradient' : ''}`}>
             <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{post.content}</ReactMarkdown>
        </div>
        
        {post.media && post.media.length > 0 && <PostMedia media={post.media} postLink={!isFullView && isPost ? targetLink : undefined} />}

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
          {isPost && (
            <Link to={targetLink} className="flex items-center gap-2 text-gray-500 hover:bg-gray-100 px-3 py-1 rounded-md text-sm font-semibold w-fit">
                <CommentIcon className="w-4 h-4" /><span>{commentCount} Comments</span>
            </Link>
          )}
          {isPost && author && (!currentUser || currentUser.id !== author.id) && (
              <button onClick={handleGiveAward} className="flex items-center gap-2 text-gray-500 hover:bg-gray-100 hover:text-yellow-600 px-3 py-1 rounded-md text-sm font-semibold w-fit transition-colors">
                  <GiftIcon className="w-4 h-4" /><span className="hidden sm:inline">Award</span>
              </button>
          )}
          {!isPost && canModerate && <Link to={`/editorials/${post.id}/edit`} className="text-sm font-semibold text-blue-500 hover:bg-blue-50 px-3 py-1 rounded-md">Edit</Link>}
          {canModerate && <button onClick={handleDelete} className="text-sm font-semibold text-red-500 hover:bg-red-50 px-3 py-1 rounded-md">Delete</button>}
        </div>
      </div>
      {isReportModalOpen && <ReportModal entityId={post.id} entityType="post" onClose={() => setReportModalOpen(false)} />}
      {isAwardModalOpen && post.authorId && <AwardModal entityId={post.id} entityType="post" receiverId={post.authorId} onClose={() => setAwardModalOpen(false)} />}
      {isAuthModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
       <style>{`.mask-gradient { mask-image: linear-gradient(to bottom, black 60%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%); }`}</style>
    </article>
  );
};

export default PostCard;
