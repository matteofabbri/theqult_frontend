
import React, { useMemo, useState } from 'react';
import { useData, useAuth } from '../hooks/useStore';
import PostCard from '../components/PostCard';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import TrendingCarousel from '../components/TrendingCarousel';
import AuthModal from '../components/AuthModal';

const HomePage: React.FC = () => {
  const { posts, boards, subscriptions, editorials } = useData();
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [authModalState, setAuthModalState] = useState<{ isOpen: boolean; view: 'login' | 'signup' }>({ isOpen: false, view: 'login' });

  const feedItems = useMemo(() => {
    // Get the latest editorial
    const latestEditorial = [...editorials]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 1);

    // Get all board posts, sorted by date
    const sortedBoardPosts = [...posts]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return [...latestEditorial, ...sortedBoardPosts];
  }, [editorials, posts]);
  
  const subscribedBoards = useMemo(() => {
    if (!currentUser) return [];
    const subscribedBoardIds = new Set(
      subscriptions
        .filter(s => s.userId === currentUser.id)
        .map(s => s.boardId)
    );
    return boards.filter(b => subscribedBoardIds.has(b.id));
  }, [currentUser, subscriptions, boards]);

  const recentBoards = useMemo(() => {
    return [...boards]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5); // Show top 5 recent
  }, [boards]);

  return (
    <div className="container mx-auto p-2 md:p-4">
      {/* Search Bar spostata in cima, ingrandita e larga quanto tutto lo spazio */}
      <div className="w-full mt-2 mb-6">
        <SearchBar 
          className="w-full shadow-sm" 
          inputClassName="py-4 text-lg" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <TrendingCarousel />
          {feedItems.length > 0 ? (
            feedItems.map(item => {
              const isEditorial = !('boardId' in item);
              return <PostCard key={item.id} post={item} isFullView={isEditorial} />;
            })
          ) : (
            <div className="text-center text-gray-500 p-8 bg-white rounded-md">
              <h2 className="text-xl font-semibold">No posts yet.</h2>
              <p>Be the first to create one!</p>
            </div>
          )}
        </div>
        <aside className="space-y-4">
          
          {currentUser ? (
            <>
              {/* Subscribed Boards Section */}
              <div className="bg-white border border-gray-200 rounded-md p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">My Subscriptions</h3>
                {subscribedBoards.length > 0 ? (
                  <ul className="space-y-2">
                    {subscribedBoards.map(board => (
                      <li key={board.id}>
                        <Link to={`/b/${board.name}`} className="text-primary hover:underline text-lg font-bold">{board.name}</Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">You haven't joined any boards yet. Explore and find communities you love!</p>
                )}
              </div>

              {/* Admin - Recent Boards Section */}
              {isAdmin(currentUser.id) && (
                <div className="bg-white border border-gray-200 rounded-md p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Recently Created Boards</h3>
                  {recentBoards.length > 0 ? (
                    <ul className="space-y-2">
                      {recentBoards.map(board => (
                        <li key={board.id}>
                          <Link to={`/b/${board.name}`} className="text-primary hover:underline">b/{board.name}</Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No boards have been created yet.</p>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Logged Out - Popular Boards Section */}
              <div className="bg-white border border-gray-200 rounded-md p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Popular Boards</h3>
                {recentBoards.length > 0 ? (
                  <ul className="space-y-2">
                    {recentBoards.map(board => (
                      <li key={board.id}>
                        <Link to={`/b/${board.name}`} className="text-primary hover:underline text-lg font-bold">{board.name}</Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No boards available right now.</p>
                )}
              </div>
            </>
          )}

          <div className="bg-white border border-gray-200 rounded-md p-4">
            <h3 className="text-md font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">Information</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="text-gray-600 hover:text-primary hover:underline">Privacy Policy</Link></li>
              <li><Link to="/cookies" className="text-gray-600 hover:text-primary hover:underline">Cookie Policy</Link></li>
              <li><Link to="/contact" className="text-gray-600 hover:text-primary hover:underline">Contact Us</Link></li>
            </ul>
          </div>
        </aside>
      </div>
      
      {authModalState.isOpen && <AuthModal initialView={authModalState.view} onClose={() => setAuthModalState({ isOpen: false, view: 'login' })} />}
    </div>
  );
};

export default HomePage;
