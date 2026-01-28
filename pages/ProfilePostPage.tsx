
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData, useAuth, getFlagUrl, timeAgo, getBannerUrl } from '../hooks/useStore';
import NotFoundPage from './NotFoundPage';
import Comment from '../components/Comment';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ThumbsDownIcon, HeartIcon, ReportIcon } from '../components/Icons';
import UserAvatar from '../components/UserAvatar';
import MarkdownEditor from '../components/MarkdownEditor';
import ReportModal from '../components/ReportModal';
import PostMedia from '../components/PostMedia';
import AuthModal from '../components/AuthModal';
import MediaUploader from '../components/MediaUploader';
import type { MediaItem } from '../types';

const ProfilePostPage: React.FC = () => {
  const { postId, username } = useParams<{ postId: string, username: string }>();
  const { profilePosts, comments, addComment, deleteProfilePost, votes, castVote, isFollowing, followUser, unfollowUser } = useData();
  const { getUserById, currentUser, getUserByUsername } = useAuth();
  const [commentContent, setCommentContent] = useState('');
  const [commentMedia, setCommentMedia] = useState<MediaItem[]>([]);
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  const post = profilePosts.find(p => p.id === postId);
  const userProfile = username ? getUserByUsername(username) : undefined;

  if (!post || !userProfile || post.authorId !== userProfile.id) return <NotFoundPage />;

  const isEditorEmpty = (html: string) => { const d = document.createElement('div'); d.innerHTML = html; return (d.textContent || d.innerText || "").trim() === ''; };
  const author = getUserById(post.authorId);
  const postComments = comments.filter(c => c.postId === post.id).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const isAuthor = currentUser?.id === post.authorId;
  const canComment = !!currentUser;

  const entityVotes = votes.filter((v) => v.entityId === post.id);
  const score = entityVotes.reduce((acc, vote) => acc + (vote.type === 'up' ? 1 : -1), 0);
  const userVote = currentUser ? entityVotes.find((v) => v.userId === currentUser.id) : undefined;
  const isCurrentUserFollowing = author ? isFollowing(author.id) : false;

  const handleVote = (type: 'up' | 'down') => { if (currentUser) castVote(post.id, type); else setAuthModalOpen(true); };
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!isEditorEmpty(commentContent) || commentMedia.length > 0) {
        addComment(commentContent, post.id, null, commentMedia); setCommentContent(''); setCommentMedia([]);
    }
  }

  return (
    <div className="-mt-24">
      <div className="h-80 bg-gray-300 bg-cover bg-center" style={{ backgroundImage: `url(${getBannerUrl(author)})` }} />
      <div className="bg-white pt-14 pb-2 shadow-sm">
        <div className="container mx-auto flex items-center px-2 md:px-4">
            <div className="flex items-end -mt-10">
                <Link to={`/u/${author?.username}`}><UserAvatar user={author} className="w-20 h-20 border-4 border-white bg-white" /></Link>
                <div className="ml-4 pb-1">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold text-gray-900"><Link to={`/u/${author?.username}`} className="hover:underline">{author?.username}</Link></h1>
                        {!isAuthor && (
                            <button onClick={() => isCurrentUserFollowing ? unfollowUser(author!.id) : followUser(author!.id)} className={`font-bold py-2 px-4 rounded-full text-sm ${isCurrentUserFollowing ? 'bg-gray-200' : 'bg-primary text-white'}`}>
                                {isCurrentUserFollowing ? 'Following' : 'Follow'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="container mx-auto mt-4 p-2 md:p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-4">
                <div className="bg-white border border-gray-200 rounded-md p-4 relative">
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                        <button onClick={() => setReportModalOpen(true)} className="p-1 text-gray-400 hover:text-yellow-500"><ReportIcon className="w-5 h-5" /></button>
                        <button onClick={() => handleVote('down')} className={`p-1 rounded-sm ${userVote?.type === 'down' ? 'text-blue-600' : 'text-gray-400'}`}><ThumbsDownIcon className="w-5 h-5" /></button>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                        {author?.countryCode && <img src={getFlagUrl(author.countryCode)} className="w-5 h-auto mr-2" />}
                        <UserAvatar user={author} className="w-5 h-5 mr-2" />
                        <span>Posted by <Link to={`/u/${author?.username}`} className="hover:underline font-bold">u/{author?.username}</Link></span>
                        <span className="mx-1">•</span>
                        <span>{timeAgo(post.createdAt)}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>
                    <div className="prose max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{post.content}</ReactMarkdown></div>
                    {post.media && <PostMedia media={post.media} />}
                    <div className="mt-4 flex items-center gap-4">
                        <button onClick={() => handleVote('up')} className={`p-1 ${userVote?.type === 'up' ? 'text-red-600' : 'text-gray-500'}`}><HeartIcon className="w-5 h-5" /></button>
                        <span className="text-sm font-semibold">{score}</span>
                    </div>
                    <div className="p-4 border-t border-gray-200 mt-6">
                        <h3 className="text-lg font-semibold mb-4">{postComments.length} Comments</h3>
                        {canComment && (
                            <form onSubmit={handleCommentSubmit} className="mb-6">
                                <MarkdownEditor value={commentContent} onChange={setCommentContent} placeholder="Thoughts?" heightClassName="h-40" />
                                <div className="mt-2"><MediaUploader media={commentMedia} onChange={setCommentMedia} /></div>
                                <div className="flex justify-end mt-2"><button type="submit" className="bg-primary text-white font-bold py-2 px-6 rounded-full">Comment</button></div>
                            </form>
                        )}
                        <div className="space-y-6">{postComments.map(comment => <Comment key={comment.id} comment={comment} allComments={postComments} boardId={''} />)}</div>
                    </div>
                </div>
            </div>
        </div>
      </div>
      {isReportModalOpen && <ReportModal entityId={post.id} entityType="post" onClose={() => setReportModalOpen(false)} />}
      {isAuthModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
    </div>
  );
};

export default ProfilePostPage;
