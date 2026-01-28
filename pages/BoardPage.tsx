
import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData, useAuth, getBannerUrl } from '../hooks/useStore';
import PostCard from '../components/PostCard';
import NotFoundPage from './NotFoundPage';
import SearchBar from '../components/SearchBar';
import { SettingsIcon, CheckIcon, CreatePostIcon } from '../components/Icons';
import BoardIcon from '../components/BoardIcon';
import AuthModal from '../components/AuthModal';
import CreatePostModal from '../components/CreatePostModal';
import AdUnit from '../components/AdUnit';

const BoardPage: React.FC = () => {
  const { boardName } = useParams<{ boardName: string }>();
  const { posts, getBoardByName, isSubscribed, subscribe, unsubscribe, isBoardAdmin, unlockBoard, isBoardUnlocked, getActiveAdsForBoard } = useData();
  const { currentUser, isAdmin } = useAuth();
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isCreatePostModalOpen, setCreatePostModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const board = boardName ? getBoardByName(boardName) : undefined;
  const activeAds = useMemo(() => board ? getActiveAdsForBoard(board.id) : [], [board, getActiveAdsForBoard]);

  if (!board) return <NotFoundPage />;

  const isLocked = !isBoardUnlocked(board.id);

  const handleUnlock = (e: React.FormEvent) => {
      e.preventDefault();
      if (!unlockBoard(board.id, passwordInput)) setPasswordError('Incorrect password.');
  };

  if (isLocked) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center -mt-24">
             <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center border border-gray-200">
                 <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">🔒</div>
                 <h1 className="text-2xl font-bold text-gray-900 mb-2">Private Board</h1>
                 {board.isInviteOnly ? (
                    <p className="text-gray-600 mb-6">b/{board.name} is invite-only.</p>
                 ) : (
                    <form onSubmit={handleUnlock}>
                         <p className="text-gray-600 mb-4">b/{board.name} is password protected.</p>
                         <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Password" className="w-full p-3 border border-gray-300 rounded-md mb-2 outline-none focus:ring-2 focus:ring-primary" />
                         {passwordError && <p className="text-red-500 text-sm mb-3">{passwordError}</p>}
                         <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-md hover:opacity-90">Unlock</button>
                    </form>
                 )}
                 <Link to="/" className="block mt-4 text-gray-500 hover:underline text-sm">Go Back Home</Link>
             </div>
        </div>
      )
  }

  const boardPosts = posts.filter(post => post.boardId === board.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const isCurrentUserSubscribed = isSubscribed(board.id);
  const isCurrentUserBoardAdmin = currentUser ? isBoardAdmin(currentUser.id, board.id) : false;

  const handleSubscription = () => {
    if (!currentUser) return setAuthModalOpen(true);
    isCurrentUserSubscribed ? unsubscribe(board.id) : subscribe(board.id);
  };

  const handleCreatePost = () => {
    (currentUser || board.allowAnonymousPosts) ? setCreatePostModalOpen(true) : setAuthModalOpen(true);
  };

  return (
    <div className="-mt-24">
      <div className="h-80 bg-gray-300 bg-cover bg-center" style={{ backgroundImage: `url(${getBannerUrl(board)})` }} />
      <div className="bg-white pt-14 pb-2 shadow-sm">
        <div className="container mx-auto flex justify-between items-end px-2 md:px-4">
            <div className="flex items-end -mt-10">
                <BoardIcon board={board} className="w-20 h-20 border-4 border-white" />
                <div className="ml-4 pb-1">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold text-gray-900">{board.name}</h1>
                        <button onClick={handleSubscription} className={`font-bold py-2 px-4 rounded-full transition-colors text-sm flex items-center gap-1.5 ${isCurrentUserSubscribed ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`}>
                            {isCurrentUserSubscribed ? <><CheckIcon className="w-4 h-4" />Joined</> : 'Join'}
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 font-semibold">b/{board.name}</p>
                </div>
            </div>
            <div className="pb-1">
              <button onClick={handleCreatePost} className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-5 rounded-full hover:bg-green-700 shadow-sm text-sm">
                <CreatePostIcon className="w-5 h-5" />
                <span>Create Post</span>
              </button>
            </div>
        </div>
      </div>

      <div className="container mx-auto mt-4 p-2 md:p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-4">
              <SearchBar />
              {boardPosts.length > 0 ? boardPosts.map(post => <PostCard key={post.id} post={post} />) : (
                  <div className="text-center text-gray-500 p-8 bg-white rounded-md border border-gray-200">
                    <h2 className="text-xl font-semibold">No posts in this board yet.</h2>
                  </div>
              )}
            </div>
            <aside className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-md">
                <div className="p-4 border-b border-gray-200"><h3 className="font-bold text-gray-800">About b/{board.name}</h3></div>
                <div className="p-4 space-y-4"><p className="text-sm text-gray-600">{board.description || 'No description.'}</p></div>
                {currentUser && (isAdmin(currentUser.id) || isCurrentUserBoardAdmin) && (
                    <div className="p-4 border-t border-gray-200">
                        <Link to={`/b/${board.name}/settings`} className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-full text-sm hover:bg-gray-300">
                            <SettingsIcon className="w-4 h-4" /> Board Settings
                        </Link>
                    </div>
                )}
              </div>
            </aside>
        </div>
      </div>
      {isAuthModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
      {isCreatePostModalOpen && <CreatePostModal boardId={board.id} onClose={() => setCreatePostModalOpen(false)} />}
    </div>
  );
};

export default BoardPage;
