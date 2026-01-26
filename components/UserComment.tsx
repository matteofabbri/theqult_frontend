
import React from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import type { Comment as CommentType, Post, Board, User } from '../types';
import UserAvatar from './UserAvatar';
import { timeAgo } from '../hooks/useStore';

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
        <div className="text-xs text-gray-500 mb-2">
          <span className="font-semibold text-gray-800">{user.username}</span> commented on 
          <Link to={postLink} className="text-primary hover:underline mx-1">{post.title}</Link>
          in <Link to={`/b/${board.name}`} className="font-bold text-gray-800 hover:underline">b/{board.name}</Link>
          <span className="mx-1">•</span>
          {timeAgo(comment.createdAt)}
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
