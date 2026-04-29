
import React from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import type { Comment as CommentType, Post, Board, User } from '../types';
import UserAvatar from './UserAvatar';
import { timeAgo, getFlagUrl, getCountryCodeForId } from '../hooks/useStore';

interface UserCommentProps {
  comment: CommentType;
  post: Post | undefined;
  board: Board | undefined;
  user: User;
}

const UserComment: React.FC<UserCommentProps> = ({ comment, post, board, user }) => {
  const postLink = board && post ? `/b/${board.name}/post/${post.id}` : '#';
  if (!post || !board) return null;

  return (
    <div className="p-3 bg-white border border-gray-200 rounded-md flex items-start gap-3">
      <UserAvatar user={user} className="w-8 h-8" />
      <div className="flex-1">
        <div className="text-xs text-gray-500 mb-2 flex items-center gap-1.5 overflow-hidden">
          <img 
            src={getFlagUrl(comment.countryCode || getCountryCodeForId(comment.id))} 
            alt="location" 
            className="w-3.5 h-2.5 object-cover rounded-[1px] shadow-sm ring-1 ring-black/5" 
          />
          <span className="flex-1 truncate">
            <span className="font-semibold text-gray-800">{user.username}</span> commented on 
            <Link to={postLink} className="text-primary hover:underline mx-1">{post.title}</Link>
            in <Link to={`/b/${board.name}`} className="font-bold text-gray-800 hover:underline">b/{board.name}</Link>
          </span>
          <span className="mx-1 shrink-0 opacity-30">•</span>
          <span className="shrink-0">{timeAgo(comment.createdAt)}</span>
        </div>
        <div className="prose prose-sm max-w-none prose-p:my-1 text-sm text-gray-600 border-l-4 border-gray-200 pl-3">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{comment.content}</ReactMarkdown>
        </div>
        <Link to={`${postLink}#comment-${comment.id}`} className="text-xs font-semibold text-gray-500 hover:text-primary mt-2 inline-block">
          View Context
        </Link>
      </div>
    </div>
  );
};

export default UserComment;
