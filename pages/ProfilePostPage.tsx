
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData, useAuth, getFlagUrl, timeAgo, getBannerUrl } from '../hooks/useStore';
import NotFoundPage from './NotFoundPage';
import Comment from '../components/Comment';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ThumbsDownIcon, HeartIcon, ReportIcon, WalletIcon, GiftIcon, CheckIcon } from '../components/Icons';
import UserAvatar from '../components/UserAvatar';
import MarkdownEditor from '../components/MarkdownEditor';
import ReportModal from '../components/ReportModal';
import PostMedia from '../components/PostMedia';
import AuthModal from '../components/AuthModal';
import AwardModal from '../components/AwardModal';
import { AVAILABLE_AWARDS } from '../components/Awards';
import MediaUploader from '../components/MediaUploader';
import type { MediaItem } from '../types';

const ProfilePostPage: React.FC = () => {
  const { postId, username } = useParams<{ postId: string, username: string }>();
  const { profilePosts, comments, addComment, deleteProfilePost, votes, castVote, unlockProfilePost, awards, isFollowing, followUser, unfollowUser } = useData();
  const { getUserById, currentUser, getUserByUsername } = useAuth();
  const [commentContent, setCommentContent] = useState('');
  const [commentMedia, setCommentMedia] = useState<MediaItem[]>([]);
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isAwardModalOpen, setAwardModalOpen] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const navigate = useNavigate();

  const post = profilePosts.find(p => p.id === postId);
  const userProfile = username ? getUserByUsername(username) : undefined;

  if (!post || !userProfile || post.authorId !== userProfile.id) return <NotFoundPage />;

  const isLocked = post.price && post.price > 0 && currentUser?.id !== post.authorId && !post.unlockedUserIds?.includes(currentUser?.id || '');
  const isEditorEmpty = (html: string) => { const d = document.createElement('div'); d.innerHTML = html; return (d.textContent || d.innerText || "").trim() === ''; };

  const author = getUserById(post.authorId);
  const postComments = comments.filter(c => c.postId === post.id).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const isAuthor = currentUser?.id === post.authorId;
  const canComment = !!currentUser;

  const entityVotes = votes.filter((v) => v.entityId === post.id);
  const score = entityVotes.reduce((acc, vote) => acc + (vote.type === 'up' ? 1 : -1), 0);
  const userVote = currentUser ? entityVotes.find((v) => v.userId === currentUser.id) : undefined;

  const postAwards = awards.filter(a => a.entityId === post.id);
  const groupedAwards = postAwards.reduce((acc, award) => { acc[award.typeId] = (acc[award.typeId] || 0) + 1; return acc; }, {} as Record<string, number>);

  const isCurrentUserFollowing = author ? isFollowing(author.id) : false;

  const handleVote = (type: 'up' | 'down') => { if (currentUser) castVote(post.id, type); else setAuthModalOpen(true); };
  const handleGiveAward = () => { if (currentUser) setAwardModalOpen(true); else setAuthModalOpen(true); };
  const handleDeletePost = () => { if (window.confirm('Delete post?')) { deleteProfilePost(post.id); navigate(`/u/${author?.username || ''}`); } };
  const handleUnlock = () => {
      if (!currentUser) return setAuthModalOpen(true);
      const result = unlockProfilePost(post.id);
      if (!result.success) { setUnlockError(result.message); setTimeout(() => setUnlockError(''), 3000); }
  }
  
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!isEditorEmpty(commentContent) || commentMedia.length > 0) {
        addComment(commentContent, post.id, null, commentMedia); setCommentContent(''); setCommentMedia([]);
    }
  }

  const handleFollow = () => {
    if (!currentUser) return setAuthModalOpen(true);
    if (!author) return;
    if (isCurrentUserFollowing) unfollowUser(author.id);
    else followUser(author.id);
  };

  return (
    <div className="-mt-24">
      {/* Banner */}
      <div 
        className="h-80 bg-gray-300 bg-cover bg-center" 
        style={{ backgroundImage: `url(${getBannerUrl(author)})` }}
      />
      
      {/* Header Info */}
      <div className="bg-white pt-14 pb-2 shadow-sm">
        <div className="container mx-auto flex items-center px-2 md:px-4">
            <div className="flex items-end -mt-10">
                <Link to={`/u/${author?.username}`}>
                    <UserAvatar user={author} className="w-20 h-20 border-4 border-white bg-white hover:brightness-95 transition-all" />
                </Link>
                <div className="ml-4 pb-1">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold text-gray-900">
                            <Link to={`/u/${author?.username}`} className="hover:underline">{author?.username}</Link>
                        </h1>
                        {!isAuthor && (
                            <button 
                                onClick={handleFollow} 
                                className={`font-bold py-2 px-4 rounded-full transition-colors text-sm flex items-center gap-1.5 ${
                                    isCurrentUserFollowing 
                                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                                    : 'bg-primary text-white hover:opacity-90'
                                }`}
                            >
                                {isCurrentUserFollowing ? 'Following' : 'Follow'}
                            </button>
                        )}
                    </div>
                    <Link to={`/u/${author?.username}`} className="text-sm text-gray-500 font-semibold hover:underline">u/{author?.username}</Link>
                </div>
            </div>
        </div>
      </div>

      <div className="container mx-auto mt-4 p-2 md:p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-4">
                <div className="bg-white border border-gray-200 rounded-md">
                    <div className="p-4 relative">
                        <div className="absolute top-3 right-3 flex items-center gap-2">
                        <button onClick={() => setReportModalOpen(true)} className="p-1 rounded-sm text-gray-400 hover:text-yellow-500"><ReportIcon className="w-5 h-5" /></button>
                        {!isLocked && <button onClick={() => handleVote('down')} className={`p-1 rounded-sm transition-colors ${userVote?.type === 'down' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'}`}><ThumbsDownIcon className="w-5 h-5" /></button>}
                        </div>
                        
                        <div className="flex items-center text-xs text-gray-500 mb-2 pr-10">
                        {author?.countryCode && <img src={getFlagUrl(author.countryCode)} alt={author.countryCode} className="w-5 h-auto rounded-sm shadow-sm mr-2" />}
                        <UserAvatar user={author} className="w-5 h-5 mr-2" />
                        <span>Posted by {author ? <Link to={`/u/${author.username}`} className="hover:underline font-bold text-gray-800">u/{author.username}</Link> : 'u/unknown'}</span>
                        <span className="mx-1">•</span>
                        <span>{timeAgo(post.createdAt)}</span>
                        {post.price && post.price > 0 && <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><WalletIcon className="w-3 h-3" />{post.price} K</span>}
                        </div>
                        
                        {Object.keys(groupedAwards).length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                                {Object.entries(groupedAwards).map(([awardId, count]) => {
                                    const awardDef = AVAILABLE_AWARDS.find(a => a.id === awardId); if (!awardDef) return null;
                                    return <div key={awardId} className="flex items-center bg-gray-100 rounded-full px-2 py-0.5 border border-gray-200"><div className={`w-4 h-4 mr-1 ${awardDef.color}`}><awardDef.icon /></div>{(count as number) > 1 && <span className="text-xs font-bold text-gray-600">{count as number}</span>}</div>;
                                })}
                            </div>
                        )}

                        <h1 className="text-2xl font-bold text-gray-900 mb-4 pr-10">{post.title}</h1>
                        
                        {isLocked ? (
                            <div className="mt-4 p-12 bg-gray-100 rounded-lg border border-gray-200 flex flex-col items-center justify-center text-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-orange-50 opacity-50"></div>
                                <div className="relative z-10">
                                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-yellow-500"><svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">Exclusive Content</h3>
                                    <p className="text-gray-600 mb-6">Unlock this post to view the content and join the discussion.</p>
                                    <button onClick={handleUnlock} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-full shadow-lg flex items-center gap-2 transition-transform active:scale-95 text-lg mx-auto"><span>Unlock for {post.price} K</span></button>
                                    {unlockError && <p className="text-red-500 text-sm mt-3 font-semibold">{unlockError}</p>}
                                    {!currentUser && <p className="text-sm text-gray-500 mt-4">You must be logged in to unlock.</p>}
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="prose max-w-none prose-img:rounded-lg prose-video:rounded-lg prose-a:text-primary hover:prose-a:text-orange-400"><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{post.content}</ReactMarkdown></div>
                                {post.media && post.media.length > 0 && <PostMedia media={post.media} />}
                                <div className="mt-4 flex items-center gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <button 
                                            onClick={() => handleVote('up')} 
                                            className={`p-1 rounded-sm transition-colors ${userVote?.type === 'up' ? 'text-red-600 bg-red-50' : 'text-gray-500 hover:text-red-600 hover:bg-red-50'}`}
                                        >
                                            <HeartIcon className={`w-5 h-5 ${userVote?.type === 'up' ? 'fill-current' : ''}`} />
                                        </button>
                                        <span className={`text-sm font-semibold ${userVote?.type === 'up' ? 'text-red-600' : 'text-gray-700'}`}>{score}</span>
                                    </div>
                                    {!isLocked && author && (!currentUser || currentUser.id !== author.id) && <button onClick={handleGiveAward} className="flex items-center gap-2 text-gray-500 hover:bg-gray-100 hover:text-yellow-600 px-3 py-1 rounded-md text-xs font-semibold w-fit transition-colors"><GiftIcon className="w-5 h-5" /><span className="hidden sm:inline">Award</span></button>}
                                    {isAuthor && <Link to={`/u/${author?.username}/post/${post.id}/edit`} className="text-xs font-semibold text-blue-500 hover:bg-blue-50 px-3 py-1 rounded-md">Edit Post</Link>}
                                    {isAuthor && <button onClick={handleDeletePost} className="text-xs font-semibold text-red-500 hover:bg-red-50 px-3 py-1 rounded-md">Delete Post</button>}
                                </div>
                            </>
                        )}
                    </div>
                    
                    {!isLocked && (
                        <div className="p-4 border-t border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">{postComments.length} Comments</h3>
                            {canComment && (
                                <form onSubmit={handleCommentSubmit} className="mb-6">
                                    <p className="text-xs text-gray-500 mb-1">Comment as <span className="text-primary">{currentUser.username}</span></p>
                                    <MarkdownEditor value={commentContent} onChange={setCommentContent} placeholder="What are your thoughts?" heightClassName="h-40" />
                                    <div className="mt-2"><MediaUploader media={commentMedia} onChange={setCommentMedia} /></div>
                                    <div className="flex justify-end mt-2"><button type="submit" disabled={isEditorEmpty(commentContent) && commentMedia.length === 0} className="bg-primary text-white font-bold py-2 px-6 rounded-full hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">Comment</button></div>
                                </form>
                            )}
                            <div className="space-y-6">{postComments.map(comment => <Comment key={comment.id} comment={comment} allComments={postComments} boardId={''} />)}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-md">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="font-bold text-gray-800">About u/{author?.username}</h3>
                    </div>
                    <div className="p-4">
                        {author?.bio && <p className="text-sm text-gray-600 mb-4">{author.bio}</p>}
                        <div className="text-xs text-gray-500 space-y-2">
                            <div className="flex justify-between">
                                <span>Joined</span>
                                <span className="font-semibold">{author ? new Date(author.createdAt).toLocaleDateString() : 'Unknown'}</span>
                            </div>
                        </div>
                        <Link 
                            to={`/u/${author?.username}`}
                            className="block w-full text-center mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 rounded-full transition-colors text-sm"
                        >
                            View Full Profile
                        </Link>
                    </div>
                </div>
            </aside>

        </div>
      </div>

      {isReportModalOpen && <ReportModal entityId={post.id} entityType="post" onClose={() => setReportModalOpen(false)} />}
      {isAuthModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
      {isAwardModalOpen && post.authorId && <AwardModal entityId={post.id} entityType="post" receiverId={post.authorId} onClose={() => setAwardModalOpen(false)} />}
    </div>
  );
};

export default ProfilePostPage;
