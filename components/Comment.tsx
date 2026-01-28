
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Comment as CommentType, MediaItem } from '../types';
import { useAuth, useData, getFlagUrl, timeAgo } from '../hooks/useStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ThumbsDownIcon, HeartIcon, ReportIcon } from './Icons';
import UserAvatar from './UserAvatar';
import MarkdownEditor from './MarkdownEditor';
import ReportModal from './ReportModal';
import AuthModal from './AuthModal';
import PostMedia from './PostMedia';
import MediaUploader from './MediaUploader';

interface CommentProps {
  comment: CommentType;
  allComments: CommentType[];
  boardId: string;
}

const Comment: React.FC<CommentProps> = ({ comment, allComments, boardId }) => {
  const { getUserById, currentUser, isAdmin } = useAuth();
  const { addComment, isModerator, deleteComment, isBoardAdmin, votes, castVote } = useData();
  const author = comment.authorId ? getUserById(comment.authorId) : undefined;
  const [replying, setReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replyMedia, setReplyMedia] = useState<MediaItem[]>([]);
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  const parentComment = comment.parentId ? allComments.find(c => c.id === comment.parentId) : null;
  const parentAuthor = parentComment && parentComment.authorId ? getUserById(parentComment.authorId) : null;
  const canModerate = currentUser && (isAdmin(currentUser.id) || isBoardAdmin(currentUser.id, boardId) || isModerator(currentUser.id, boardId));

  const entityVotes = votes.filter((v) => v.entityId === comment.id);
  const score = entityVotes.reduce((acc, vote) => acc + (vote.type === 'up' ? 1 : -1), 0);
  const userVote = currentUser ? entityVotes.find((v) => v.userId === currentUser.id) : undefined;
  
  const handleVote = (type: 'up' | 'down') => { if (currentUser) castVote(comment.id, type); else setAuthModalOpen(true); };
  const handleDelete = () => { if (window.confirm('Delete comment?')) deleteComment(comment.id); };
  
  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyContent.trim() || replyMedia.length > 0) {
        addComment(replyContent, comment.postId, comment.id, replyMedia);
        setReplyContent(''); setReplyMedia([]); setReplying(false);
    }
  };

  const handleScrollToParent = (e: React.MouseEvent) => {
      e.preventDefault();
      const el = document.getElementById(`comment-${parentComment?.id}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <>
      <div className="flex items-start gap-3 transition-all duration-300" id={`comment-${comment.id}`}>
        {author?.countryCode && <img src={getFlagUrl(author.countryCode)} alt={author.countryCode} className="w-5 h-auto mt-2.5 rounded-sm shadow-sm" />}
        <UserAvatar user={author} className="w-8 h-8 mt-1" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="text-xs text-gray-500 mb-1 flex items-center flex-wrap gap-2">
              {author ? <Link to={`/u/${author.username}`} className="font-semibold text-gray-800 hover:underline">{author.username}</Link> : <span className="font-semibold text-gray-800">anonymous</span>}
              <span className="mx-1">•</span>
              <span>{timeAgo(comment.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setReportModalOpen(true)} className="p-1 -mt-1 rounded-sm text-gray-400 hover:text-yellow-500"><ReportIcon className="w-4 h-4" /></button>
              <button onClick={() => handleVote('down')} className={`p-1 -mt-1 rounded-sm transition-colors ${userVote?.type === 'down' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'}`}><ThumbsDownIcon className="w-4 h-4" /></button>
            </div>
          </div>

          {parentComment && (
            <div className="mb-2">
                <button onClick={handleScrollToParent} className="group flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-orange-50 border border-gray-200 px-2.5 py-1 rounded-md transition-colors w-fit">
                    <span className="text-gray-400 group-hover:text-primary">↳</span><span>In response to</span><span className="font-bold text-gray-800 group-hover:text-primary">{parentAuthor ? parentAuthor.username : 'anonymous'}</span>
                </button>
            </div>
          )}

          <div className="prose prose-sm max-w-none prose-p:my-2 prose-img:rounded-lg prose-video:rounded-lg break-words">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{comment.content}</ReactMarkdown>
          </div>
          
          {comment.media && comment.media.length > 0 && <div className="mt-2 mb-2 w-full max-w-md"><PostMedia media={comment.media} compact={true} /></div>}

          <div className="mt-2 flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => handleVote('up')} 
                    className={`p-1 rounded-sm transition-colors ${userVote?.type === 'up' ? 'text-red-600 bg-red-50' : 'text-gray-500 hover:text-red-600 hover:bg-red-50'}`}
                  >
                      <HeartIcon className={`w-4 h-4 ${userVote?.type === 'up' ? 'fill-current' : ''}`} />
                  </button>
                  <span className={`text-xs font-semibold ${userVote?.type === 'up' ? 'text-red-600' : 'text-gray-600'}`}>{score}</span>
              </div>
              <button onClick={() => setReplying(!replying)} className="text-xs font-semibold text-gray-500 hover:text-gray-800">Reply</button>
              {canModerate && <button onClick={handleDelete} className="text-xs font-semibold text-red-500 hover:text-red-700">Delete</button>}
          </div>

          {replying && (
                <form onSubmit={handleReplySubmit} className="mt-2">
                  <MarkdownEditor value={replyContent} onChange={setReplyContent} placeholder={`Replying to ${author?.username || 'anonymous'}`} heightClassName="h-32" />
                  <div className="mt-2"><MediaUploader media={replyMedia} onChange={setReplyMedia} /></div>
                  <div className="flex justify-end gap-2 mt-2">
                      <button type="button" onClick={() => setReplying(false)} className="px-3 py-1 text-xs font-semibold text-gray-600 rounded-full hover:bg-gray-200">Cancel</button>
                      <button type="submit" className="px-3 py-1 text-xs font-semibold bg-primary text-white rounded-full hover:opacity-90">Reply</button>
                  </div>
                </form>
          )}
        </div>
      </div>
      {isReportModalOpen && <ReportModal entityId={comment.id} entityType="comment" onClose={() => setReportModalOpen(false)} />}
      {isAuthModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
    </>
  );
};

export default Comment;
