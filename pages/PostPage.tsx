
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData, useAuth, getFlagUrl, getBannerUrl } from '../hooks/useStore';
import NotFoundPage from './NotFoundPage';
import Comment from '../components/Comment';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ThumbsDownIcon, HeartIcon, CheckIcon, SettingsIcon, ReportIcon, CreatePostIcon } from '../components/Icons';
import UserAvatar from '../components/UserAvatar';
import MarkdownEditor from '../components/MarkdownEditor';
import BoardIcon from '../components/BoardIcon';
import AuthModal from '../components/AuthModal';
import CreateBoardModal from '../components/CreateBoardModal';
import ReportModal from '../components/ReportModal';
import PostMedia from '../components/PostMedia';
import CreatePostModal from '../components/CreatePostModal';
import MediaUploader from '../components/MediaUploader';
import type { MediaItem } from '../types';

const PostPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const { posts, comments, addComment, deletePost, isModerator, isBoardAdmin, votes, castVote, boards, isSubscribed, subscribe, unsubscribe } = useData();
  const { getUserById, currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [commentContent, setCommentContent] = useState('');
  const [commentMedia, setCommentMedia] = useState<MediaItem[]>([]);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isCreateBoardModalOpen, setCreateBoardModalOpen] = useState(false);
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const [isCreatePostModalOpen, setCreatePostModalOpen] = useState(false);

  const post = posts.find(p => p.id === postId);
  const board = post ? boards.find(b => b.id === post.boardId) : undefined;

  if (!post || !board) {
    return <NotFoundPage />;
  }
  
  const isEditorEmpty = (html: string): boolean => {
    if (!html) return true;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || "";
    return text.trim() === '';
  };
  
  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  const author = post.authorId ? getUserById(post.authorId) : undefined;
  const postComments = comments.filter(c => c.postId === post.id);
  const sortedComments = [...postComments].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const isAuthor = currentUser?.id === post.authorId;
  const canModerate = currentUser && (isAdmin(currentUser.id) || isBoardAdmin(currentUser.id, board.id) || isModerator(currentUser.id, board.id));
  const canComment = (currentUser || board.allowAnonymousComments) && (board.name !== 'editorials' || (currentUser ? isAdmin(currentUser.id) : false));

  const entityVotes = votes.filter((v) => v.entityId === post.id);
  const score = entityVotes.reduce((acc, vote) => acc + (vote.type === 'up' ? 1 : -1), 0);
  const userVote = currentUser ? entityVotes.find((v) => v.userId === currentUser.id) : undefined;

  const isCurrentUserSubscribed = isSubscribed(board.id);

  const handleSubscription = () => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    if (isCurrentUserSubscribed) {
        unsubscribe(board.id);
    } else {
        subscribe(board.id);
    }
  };
  
  const handleVote = (type: 'up' | 'down') => {
    if (currentUser) {
      castVote(post.id, type);
    } else {
      setAuthModalOpen(true);
    }
  };

  const handleDeletePost = () => {
    if (window.confirm('Are you sure you want to delete this post? This cannot be undone.')) {
        deletePost(post.id);
        navigate(`/b/${board?.name || ''}`);
    }
  }
  
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!isEditorEmpty(commentContent) || commentMedia.length > 0) {
        addComment(commentContent, post.id, null, commentMedia);
        setCommentContent('');
        setCommentMedia([]);
    }
  }

  const handleCreateBoard = () => {
    if (currentUser) {
      setCreateBoardModalOpen(true);
    } else {
      setAuthModalOpen(true);
    }
  };

  const handleCreatePost = () => {
    if (currentUser || (board && board.allowAnonymousPosts)) {
      setCreatePostModalOpen(true);
    } else {
      setAuthModalOpen(true);
    }
  };

  return (
    <div className="-mt-24">
      <div 
        className="h-80 bg-gray-300 bg-cover bg-center" 
        style={{ backgroundImage: `url(${getBannerUrl(board)})` }}
      />
      <div className="bg-white pt-14 pb-2 shadow-sm">
        <div className="container mx-auto flex items-center px-2 md:px-4">
            <div className="flex items-end -mt-10">
                <Link to={`/b/${board.name}`}>
                    <BoardIcon board={board} className="w-20 h-20 border-4 border-white hover:brightness-95 transition-all" />
                </Link>
                <div className="ml-4 pb-1">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold text-gray-900">
                            <Link to={`/b/${board.name}`} className="hover:underline">{board.name}</Link>
                        </h1>
                        <button 
                            onClick={handleSubscription} 
                            className={`font-bold py-2 px-4 rounded-full transition-colors text-sm flex items-center gap-1.5 ${
                                isCurrentUserSubscribed 
                                ? 'bg-green-600 text-white hover:bg-green-500' 
                                : 'bg-blue-600 text-white hover:bg-blue-500'
                            }`}
                        >
                            {isCurrentUserSubscribed ? <><CheckIcon className="w-4 h-4" /><span>Joined</span></> : 'Join'}
                        </button>
                    </div>
                    <Link to={`/b/${board.name}`} className="text-sm text-gray-500 font-semibold hover:underline">b/{board.name}</Link>
                </div>
            </div>
            
             <div className="pb-1 ml-auto">
              <button
                onClick={handleCreatePost}
                className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-5 rounded-full hover:bg-green-700 transition-colors text-sm shadow-sm"
              >
                <CreatePostIcon className="w-5 h-5" />
                <span>Create Post</span>
              </button>
            </div>
        </div>
      </div>
      <div className="container mx-auto mt-4 p-2 md:p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-white border border-gray-200 rounded-md">
                <div className="p-4 relative">
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <button
                      onClick={() => setReportModalOpen(true)}
                      className="p-1 rounded-sm text-gray-400 hover:text-yellow-500"
                      aria-label="Report content"
                      title="Report content"
                    >
                      <ReportIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleVote('down')}
                      className={`p-1 rounded-sm transition-colors ${userVote?.type === 'down' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'}`}
                      aria-label="Downvote"
                    >
                      <ThumbsDownIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mb-2 pr-10">
                    {author?.countryCode && (
                        <img 
                            src={getFlagUrl(author.countryCode)} 
                            alt={author.countryCode} 
                            className="w-5 h-auto rounded-sm shadow-sm mr-2" 
                            title={author.countryCode}
                        />
                    )}
                    <UserAvatar user={author} className="w-5 h-5 mr-2" />
                    <span>Posted by {author ? <Link to={`/u/${author.username}`} className="hover:underline">u/{author.username}</Link> : 'u/anonymous'}</span>
                    <span className="mx-1">•</span>
                    <span>{timeAgo(post.createdAt)}</span>
                  </div>

                  <h1 className="text-2xl font-bold text-gray-900 mb-4 pr-10">{post.title}</h1>
                  <div className="prose max-w-none prose-img:rounded-lg prose-video:rounded-lg prose-a:text-primary hover:prose-a:text-orange-400">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{post.content}</ReactMarkdown>
                  </div>

                  {post.media && post.media.length > 0 && (
                      <PostMedia media={post.media} />
                  )}

                  <div className="mt-4 flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => handleVote('up')} 
                            className={`p-1 rounded-sm transition-colors ${userVote?.type === 'up' ? 'text-red-600 bg-red-50' : 'text-gray-500 hover:text-red-600 hover:bg-red-50'}`} 
                            aria-label="Upvote"
                          >
                              <HeartIcon className={`w-5 h-5 ${userVote?.type === 'up' ? 'fill-current' : ''}`} />
                          </button>
                          <span className={`text-sm font-semibold ${userVote?.type === 'up' ? 'text-red-600' : 'text-gray-700'}`}>{score}</span>
                      </div>
                      
                        {isAuthor && (
                              <Link to={`/b/${board?.name}/post/${post.id}/edit`} className="text-xs font-semibold text-blue-500 hover:bg-blue-50 px-3 py-1 rounded-md">
                                Edit Post
                              </Link>
                        )}
                        {canModerate && (
                            <button onClick={handleDeletePost} className="text-xs font-semibold text-red-500 hover:bg-red-50 px-3 py-1 rounded-md">
                                Delete Post
                            </button>
                        )}
                  </div>
                </div>
                <div className="p-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{postComments.length} Comments</h3>
                  {canComment && (
                       <form onSubmit={handleCommentSubmit} className="mb-6">
                          {currentUser ? (
                            <p className="text-xs text-gray-500 mb-1">Comment as <span className="text-primary">{currentUser.username}</span></p>
                          ) : (
                            <p className="text-xs text-gray-500 mb-1">Commenting as Anonymous</p>
                          )}
                          <MarkdownEditor
                              value={commentContent}
                              onChange={setCommentContent}
                              placeholder="What are your thoughts?"
                              heightClassName="h-40"
                          />
                          <div className="mt-2">
                              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Attach Media</label>
                              <MediaUploader media={commentMedia} onChange={setCommentMedia} />
                          </div>
                          <div className="flex justify-end mt-2">
                              <button type="submit" disabled={isEditorEmpty(commentContent) && commentMedia.length === 0} className="bg-primary text-white font-bold py-2 px-6 rounded-full hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                                  Comment
                              </button>
                          </div>
                       </form>
                  )}
                 
                  <div className="space-y-6">
                      {sortedComments.map(comment => (
                          <Comment key={comment.id} comment={comment} allComments={postComments} boardId={post.boardId} />
                      ))}
                  </div>
                </div>
              </div>
            </div>
            <aside className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-md overflow-hidden shadow-sm">
                  <div className="p-4">
                     <div className="space-y-2">
                        <button onClick={handleCreatePost} className="w-full bg-primary text-white font-bold py-2 rounded-full hover:opacity-90 transition-opacity shadow-sm">Create Post</button>
                        <button onClick={handleCreateBoard} className="w-full bg-white border border-primary text-primary font-bold py-2 rounded-full hover:bg-gray-50 transition-colors shadow-sm">Create Board</button>
                     </div>
                  </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-md sticky top-24">
                <div className="p-4 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800">About b/{board.name}</h3>
                </div>
                <div className="p-4 space-y-4">
                    <p className="text-sm text-gray-600">{board.description || 'No description provided.'}</p>
                    
                    <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Permissions</h4>
                        <div className="space-y-3">
                            {board.allowAnonymousPosts ? (
                                <div className="flex items-center justify-between p-2.5 bg-green-100 border border-green-300 rounded-md shadow-sm">
                                    <span className="text-sm font-bold text-green-900">Anonymous Posts</span>
                                    <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
                                        <CheckIcon className="w-3 h-3" /> Allowed
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-md opacity-80">
                                    <span className="text-sm font-medium text-gray-500">Anonymous Posts</span>
                                    <span className="bg-gray-200 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
                                        Disabled
                                    </span>
                                </div>
                            )}

                            {board.allowAnonymousComments ? (
                                <div className="flex items-center justify-between p-2.5 bg-green-100 border border-green-300 rounded-md shadow-sm">
                                    <span className="text-sm font-bold text-green-900">Anonymous Comments</span>
                                    <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
                                        <CheckIcon className="w-3 h-3" /> Allowed
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-md opacity-80">
                                    <span className="text-sm font-medium text-gray-500">Anonymous Comments</span>
                                    <span className="bg-gray-200 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
                                        Disabled
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {currentUser && (isAdmin(currentUser.id) || isBoardAdmin(currentUser.id, board.id)) && (
                    <div className="p-4 border-t border-gray-200">
                        <Link 
                            to={`/b/${board.name}/settings`}
                            className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-full hover:bg-gray-300 transition-colors text-sm"
                        >
                            <SettingsIcon className="w-4 h-4" />
                            <span>Board Settings</span>
                        </Link>
                    </div>
                )}
              </div>
            </aside>
        </div>
      </div>
      {isAuthModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
      {isCreateBoardModalOpen && <CreateBoardModal onClose={() => setCreateBoardModalOpen(false)} />}
      {isReportModalOpen && (
          <ReportModal 
              entityId={post.id} 
              entityType="post" 
              onClose={() => setReportModalOpen(false)} 
          />
      )}
      {isCreatePostModalOpen && <CreatePostModal boardId={board.id} onClose={() => setCreatePostModalOpen(false)} />}
    </div>
  );
};

export default PostPage;
