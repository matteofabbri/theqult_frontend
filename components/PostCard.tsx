
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Post, Editorial } from '../types';
import { useAuth, useData, getFlagUrl, timeAgo } from '../hooks/useStore';
import { CommentIcon, ThumbsDownIcon, HeartIcon, ReportIcon } from './Icons';
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
  const { boards, comments, isModerator, deletePost, isBoardAdmin, votes, castVote, deleteEditorial } = useData();
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  const author = post.authorId ? getUserById(post.authorId) : undefined;
  const isPost = 'boardId' in post;
  const board = isPost ? boards.find(b => b.id === (post as Post).boardId) : undefined;
  const commentCount = isPost ? comments.filter(c => c.postId === post.id).length : 0;
  
  const canModerate = currentUser && (isPost && board ? (isAdmin(currentUser.id) || isBoardAdmin(currentUser.id, board.id) || isModerator(currentUser.id, board.id)) : isAdmin(currentUser.id));
  const entityVotes = votes.filter((v) => v.entityId === post.id);
  const score = entityVotes.reduce((acc, vote) => acc + (vote.type === 'up' ? 1 : -1), 0);
  const userVote = currentUser ? entityVotes.find((v) => v.userId === currentUser.id) : undefined;

  const handleVote = (type: 'up' | 'down') => currentUser ? castVote(post.id, type) : setAuthModalOpen(true);
  const targetLink = isPost ? (board ? `/b/${board.name}/post/${post.id}` : '#') : '/editorials';

  return (
    <article className="bg-white border border-gray-200 rounded-md hover:border-gray-300">
      <div className="p-3 overflow-hidden relative">
        <div className="flex items-center text-sm text-gray-500 mb-2 pr-8">
          <UserAvatar user={author} className="w-5 h-5 mr-2" />
          {isPost && board && <><Link to={`/b/${board.name}`} className="font-bold hover:underline">b/{board.name}</Link><span className="mx-1">•</span></>}
          <span>{author ? <Link to={`/u/${author.username}`} className="hover:underline">u/{author.username}</Link> : 'u/anonymous'}</span>
          <span className="mx-1">•</span>
          <span>{timeAgo(post.createdAt)}</span>
        </div>
        <Link to={targetLink}><h2 className="text-xl font-semibold text-gray-800 hover:text-primary">{post.title}</h2></Link>
        <div className={`mt-1 prose max-w-none ${!isFullView ? 'max-h-32 overflow-hidden mask-gradient' : ''}`}>
             <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{post.content}</ReactMarkdown>
        </div>
        {post.media && <PostMedia media={post.media} postLink={!isFullView && isPost ? targetLink : undefined} />}
        <div className="mt-3 flex items-center gap-4">
            <button onClick={() => handleVote('up')} className={`p-1 ${userVote?.type === 'up' ? 'text-red-600' : 'text-gray-500'}`}><HeartIcon className="w-4 h-4" /></button>
            <span className="text-sm font-semibold">{score}</span>
            {isPost && <Link to={targetLink} className="flex items-center gap-2 text-gray-500 text-sm font-semibold"><CommentIcon className="w-4 h-4" />{commentCount} Comments</Link>}
        </div>
      </div>
      {isReportModalOpen && <ReportModal entityId={post.id} entityType="post" onClose={() => setReportModalOpen(false)} />}
      {isAuthModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
    </article>
  );
};

export default PostCard;
