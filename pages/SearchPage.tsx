
import React, { useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useData, useAuth } from '../hooks/useStore';
import PostCard from '../components/PostCard';
import ProfilePostCard from '../components/ProfilePostCard';
import SearchBar from '../components/SearchBar';
import AuthModal from '../components/AuthModal';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q')?.toLowerCase() || '';

  const { posts, boards, profilePosts, subscriptions } = useData();
  const { users, currentUser, isAdmin } = useAuth();
  
  const [authModalState, setAuthModalState] = useState<{ isOpen: boolean; view: 'login' | 'signup' }>({ isOpen: false, view: 'login' });

  const filteredPosts = query ? posts.filter(post => 
    post.title.toLowerCase().includes(query) || post.content.toLowerCase().includes(query)
  ) : [];

  const filteredProfilePosts = query ? profilePosts.filter(post =>
    post.title.toLowerCase().includes(query) || post.content.toLowerCase().includes(query)
  ) : [];

  const filteredBoards = query ? boards.filter(board => 
    board.name.toLowerCase().includes(query) || board.description.toLowerCase().includes(query)
  ) : [];

  const filteredUsers = query ? users.filter(user => 
    user.username.toLowerCase().includes(query)
  ) : [];
  
  const hasResults = filteredPosts.length > 0 || filteredBoards.length > 0 || filteredUsers.length > 0 || filteredProfilePosts.length > 0;

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
      <div className="w-full mt-2 mb-6">
        <SearchBar 
          className="w-full shadow-sm" 
          inputClassName="py-4 text-lg" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
            {query ? (
                <>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Search results for: <span className="text-primary">{searchParams.get('q')}</span>
                    </h1>
                    {!hasResults ? (
                        <div className="text-center text-gray-500 p-8 bg-white rounded-md border border-gray-200">
                            <h2 className="text-xl font-semibold">No results found.</h2>
                            <p>Try searching for something else.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {filteredPosts.length > 0 && (
                                <section>
                                    <h2 className="text-xl font-semibold border-b border-gray-200 pb-2 mb-4">Posts in Boards</h2>
                                    <div className="space-y-4">
                                        {filteredPosts.map(post => <PostCard key={post.id} post={post} />)}
                                    </div>
                                </section>
                            )}

                            {filteredProfilePosts.length > 0 && (
                                <section>
                                    <h2 className="text-xl font-semibold border-b border-gray-200 pb-2 mb-4">Profile Posts</h2>
                                    <div className="space-y-4">
                                        {filteredProfilePosts.map(post => <ProfilePostCard key={post.id} post={post} />)}
                                    </div>
                                </section>
                            )}
                            
                            {filteredBoards.length > 0 && (
                                <section>
                                    <h2 className="text-xl font-semibold border-b border-gray-200 pb-2 mb-4">Boards</h2>
                                    <div className="bg-white border border-gray-200 rounded-md p-4">
                                        <ul className="space-y-3">
                                            {filteredBoards.map(board => (
                                                <li key={board.id}>
                                                    <Link to={`/b/${board.name}`} className="text-primary font-semibold hover:underline">b/{board.name}</Link>
                                                    <p className="text-sm text-gray-600 mt-1">{board.description}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </section>
                            )}

                            {filteredUsers.length > 0 && (
                                <section>
                                    <h2 className="text-xl font-semibold border-b border-gray-200 pb-2 mb-4">Users</h2>
                                    <div className="bg-white border border-gray-200 rounded-md p-4">
                                        <ul className="space-y-2">
                                            {filteredUsers.map(user => (
                                                <li key={user.id}>
                                                    <Link to={`/u/${user.username}`} className="text-primary font-semibold hover:underline">u/{user.username}</Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </section>
                            )}
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center text-gray-500 p-8 bg-white rounded-md">
                    <h2 className="text-xl font-semibold">Please enter a search term.</h2>
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
                        <Link to={`/b/${board.name}`} className="text-primary hover:underline">b/{board.name}</Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">You haven't joined any boards yet.</p>
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
                        <Link to={`/b/${board.name}`} className="text-primary hover:underline">b/{board.name}</Link>
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

export default SearchPage;
