
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData, useAuth, getBannerUrl } from '../hooks/useStore';
import PostCard from '../components/PostCard';
import NotFoundPage from './NotFoundPage';
import SearchBar from '../components/SearchBar';
import { SettingsIcon, CheckIcon, CloseIcon, CreatePostIcon, WalletIcon } from '../components/Icons';
import BoardIcon from '../components/BoardIcon';
import AuthModal from '../components/AuthModal';
import CreatePostModal from '../components/CreatePostModal';
import AdUnit from '../components/AdUnit';

const BoardPage: React.FC = () => {
  const { boardName } = useParams<{ boardName: string }>();
  const { posts, getBoardByName, isSubscribed, subscribe, unsubscribe, isBoardAdmin, unlockBoard, isBoardUnlocked, payBoardEntryFee, getActiveAdsForBoard } = useData();
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isCreatePostModalOpen, setCreatePostModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [paymentError, setPaymentError] = useState('');
  
  const board = boardName ? getBoardByName(boardName) : undefined;

  // Ads logic
  const activeAds = useMemo(() => board ? getActiveAdsForBoard(board.id) : [], [board, getActiveAdsForBoard]);
  
  const bannerAd = activeAds.length > 0 ? activeAds[0] : null; // Pick first for banner
  const sidebarAd = activeAds.length > 1 ? activeAds[1] : (activeAds.length > 0 && Math.random() > 0.5 ? activeAds[0] : null); // Pick second for sidebar or reuse first randomly

  if (!board) {
    return <NotFoundPage />;
  }

  const isLocked = !isBoardUnlocked(board.id);

  const handleUnlock = (e: React.FormEvent) => {
      e.preventDefault();
      if (unlockBoard(board.id, passwordInput)) {
          setPasswordError('');
          setPasswordInput('');
      } else {
          setPasswordError('Incorrect password.');
      }
  };
  
  const handlePayment = () => {
      setPaymentError('');
      if (!currentUser) {
          setAuthModalOpen(true);
          return;
      }
      const result = payBoardEntryFee(board.id);
      if (!result.success) {
          setPaymentError(result.message);
      }
  }

  if (isLocked) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center -mt-24">
             <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center border border-gray-200">
                 <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                     <span className="text-2xl">🔒</span>
                 </div>
                 <h1 className="text-2xl font-bold text-gray-900 mb-2">Private Board</h1>
                 
                 {board.isInviteOnly ? (
                    <>
                        <p className="text-gray-600 mb-6">b/{board.name} is invite-only.</p>
                        <p className="text-sm text-gray-500 mb-6">You must be invited by an administrator to view this board.</p>
                        {!currentUser && (
                            <button onClick={() => setAuthModalOpen(true)} className="bg-primary text-white font-bold py-2 px-4 rounded-full hover:opacity-90 mb-4">Log In to Check Access</button>
                        )}
                    </>
                 ) : board.entryFee && board.entryFee > 0 ? (
                    <>
                        <p className="text-gray-600 mb-4">b/{board.name} requires an entry fee.</p>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                            <p className="text-sm text-gray-700 font-semibold mb-1">Entry Fee</p>
                            <p className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
                                {board.entryFee} <span className="text-sm font-normal text-gray-600">Kopeki</span>
                            </p>
                        </div>
                        
                        {currentUser ? (
                             <div className="mb-6">
                                <p className="text-xs text-gray-500 mb-2">Your Balance: {currentUser.kopeki.toLocaleString()} Kopeki</p>
                                {paymentError && <p className="text-red-500 text-sm mb-2">{paymentError}</p>}
                                <button onClick={handlePayment} className="w-full bg-primary text-white font-bold py-3 rounded-md hover:opacity-90 flex items-center justify-center gap-2">
                                    <WalletIcon className="w-5 h-5" />
                                    <span>Pay & Enter</span>
                                </button>
                                {currentUser.kopeki < board.entryFee && (
                                    <Link to="/wallet/deposit" className="block mt-2 text-xs text-primary hover:underline">Buy more Kopeki</Link>
                                )}
                             </div>
                        ) : (
                            <button onClick={() => setAuthModalOpen(true)} className="w-full bg-primary text-white font-bold py-3 rounded-md hover:opacity-90 mb-4">Log In to Pay</button>
                        )}
                    </>
                 ) : (
                    <>
                         <p className="text-gray-600 mb-6">b/{board.name} is password protected.</p>
                         <form onSubmit={handleUnlock}>
                             <input 
                                type="password" 
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                placeholder="Enter Password"
                                className="w-full p-3 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-primary"
                             />
                             {passwordError && <p className="text-red-500 text-sm mb-3">{passwordError}</p>}
                             <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-md hover:opacity-90">
                                 Unlock Board
                             </button>
                         </form>
                    </>
                 )}
                 
                 <Link to="/" className="block mt-4 text-gray-500 hover:underline text-sm">Go Back Home</Link>
             </div>
              {isAuthModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
        </div>
      )
  }

  const boardPosts = posts
    .filter(post => post.boardId === board.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
  const isCurrentUserSubscribed = isSubscribed(board.id);
  const isCurrentUserBoardAdmin = currentUser ? isBoardAdmin(currentUser.id, board.id) : false;

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

  const handleCreatePost = () => {
    // Check allowAnonymousPosts directly.
    if (currentUser || (board && board.allowAnonymousPosts)) {
      setCreatePostModalOpen(true);
    } else {
      setAuthModalOpen(true);
    }
  };

  const hasPaidEntry = board.entryFee && board.entryFee > 0;
  const canCreatePost = currentUser || (board && board.allowAnonymousPosts);

  return (
    <div className="-mt-24">
      <div 
        className="h-80 bg-gray-300 bg-cover bg-center" 
        style={{ backgroundImage: `url(${getBannerUrl(board)})` }}
      />
      <div className="bg-white pt-14 pb-2 shadow-sm">
        <div className="container mx-auto flex justify-between items-end px-2 md:px-4">
            <div className="flex items-end -mt-10">
                <BoardIcon board={board} className="w-20 h-20 border-4 border-white" />
                <div className="ml-4 pb-1">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold text-gray-900">{board.name}</h1>
                        <button 
                            onClick={handleSubscription} 
                            className={`font-bold py-2 px-4 rounded-full transition-colors text-sm flex items-center gap-1.5 ${
                                isCurrentUserSubscribed 
                                ? 'bg-green-600 text-white hover:bg-green-500' 
                                : 'bg-blue-600 text-white hover:bg-blue-500'
                            }`}
                        >
                            {isCurrentUserSubscribed ? (
                                <>
                                    <CheckIcon className="w-4 h-4" />
                                    <span>Joined</span>
                                </>
                            ) : (
                                'Join'
                            )}
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 font-semibold">b/{board.name}</p>
                </div>
            </div>
            <div className="pb-1">
              {canCreatePost && (
                  <button
                    onClick={handleCreatePost}
                    className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-5 rounded-full hover:bg-green-700 transition-colors text-sm shadow-sm"
                  >
                    <CreatePostIcon className="w-5 h-5" />
                    <span>Create Post</span>
                  </button>
              )}
            </div>
        </div>
      </div>

      <div className="container mx-auto mt-4 p-2 md:p-4">
        
        {/* Banner Ad Placement */}
        {bannerAd && (
            <div className="mb-4">
                <AdUnit ad={bannerAd} placement="banner" />
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-4">
              <SearchBar />
              {boardPosts.length > 0 ? (
                  boardPosts.map(post => <PostCard key={post.id} post={post} />)
              ) : (
                  <div className="text-center text-gray-500 p-8 bg-white rounded-md border border-gray-200">
                  <h2 className="text-xl font-semibold">No posts in this board yet.</h2>
                  <p>Why not create the first one?</p>
                  </div>
              )}
            </div>
            <aside className="space-y-4">
              
              {/* Sidebar Ad Placement */}
              {sidebarAd && (
                  <AdUnit ad={sidebarAd} placement="sidebar" />
              )}

              <div className="bg-white border border-gray-200 rounded-md">
                <div className="p-4 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800">About b/{board.name}</h3>
                </div>
                <div className="p-4 space-y-4">
                    <p className="text-sm text-gray-600">{board.description || 'No description provided.'}</p>
                    
                    <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Permissions</h4>
                        <div className="space-y-3">
                             {board.isInviteOnly && (
                                <div className="flex items-center gap-2 bg-yellow-50 p-2 rounded border border-yellow-200">
                                    <span className="text-yellow-800 font-bold text-xs uppercase tracking-wide">Invite Only</span>
                                </div>
                            )}
                             {board.password && !board.isInviteOnly && (
                                <div className="flex items-center gap-2 bg-yellow-50 p-2 rounded border border-yellow-200">
                                    <span className="text-yellow-800 font-bold text-xs uppercase tracking-wide">Password Protected</span>
                                </div>
                            )}
                            {hasPaidEntry && (
                                <div className="flex items-center gap-2 bg-green-50 p-2 rounded border border-green-200">
                                    <WalletIcon className="w-4 h-4 text-green-600"/>
                                    <span className="text-green-800 font-bold text-xs uppercase tracking-wide">Entry Fee: {board.entryFee} K</span>
                                </div>
                            )}
                            
                             {/* Anonymous Posts */}
                            {board.allowAnonymousPosts && !board.isInviteOnly && !hasPaidEntry ? (
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

                            {/* Anonymous Comments */}
                            {board.allowAnonymousComments && !board.isInviteOnly && !hasPaidEntry ? (
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

                {currentUser && (isAdmin(currentUser.id) || isCurrentUserBoardAdmin) && (
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
      {isCreatePostModalOpen && <CreatePostModal boardId={board.id} onClose={() => setCreatePostModalOpen(false)} />}
    </div>
  );
};

export default BoardPage;
