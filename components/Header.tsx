
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useStore';
import AuthModal from './AuthModal';
import CreateBoardModal from './CreateBoardModal';
import { SettingsIcon, NewspaperIcon, MessageIcon, PlusIcon } from './Icons';
import UserAvatar from './UserAvatar';

const MapIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
);

const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [authModalState, setAuthModalState] = useState<{ isOpen: boolean; view: 'login' | 'signup' }>({ isOpen: false, view: 'login' });
  const [isCreateBoardModalOpen, setCreateBoardModalOpen] = useState(false);

  const handleCreateBoard = () => {
      if (currentUser) {
          setCreateBoardModalOpen(true);
      } else {
          setAuthModalState({ isOpen: true, view: 'login' });
      }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-bold text-primary">
              <span className="text-gray-800">The_</span>Qult
            </Link>
            <nav className="hidden md:flex items-center gap-6">
                <Link to="/editorials" className="font-semibold text-gray-700 hover:text-primary transition-colors flex items-center gap-1.5">
                <NewspaperIcon className="w-5 h-5" />
                <span>Editorials</span>
                </Link>
                <Link to="/map" className="font-semibold text-gray-700 hover:text-primary transition-colors flex items-center gap-1.5">
                <MapIcon className="w-5 h-5" />
                <span>World Map</span>
                </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            
            <button
                onClick={handleCreateBoard}
                className="hidden md:flex items-center gap-1 bg-primary text-white font-bold py-2 px-4 rounded-full hover:opacity-90 transition-opacity text-sm shadow-sm"
            >
                <PlusIcon className="w-4 h-4" />
                <span>Create Board</span>
            </button>

            {currentUser && (
                <Link
                    to="/messages"
                    className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors p-2 rounded-md hover:bg-gray-100"
                    aria-label="Messages"
                    title="Messages"
                >
                    <MessageIcon className="w-6 h-6" />
                </Link>
            )}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <UserAvatar user={currentUser} className="w-8 h-8 hidden sm:block" />
                <Link to={`/u/${currentUser.username}`} className="font-semibold text-gray-700 hidden sm:block hover:underline">{currentUser.username}</Link>
                <Link to="/settings" title="User Settings" aria-label="User Settings" className="p-2 rounded-full text-gray-600 hover:bg-gray-200 hover:text-primary transition-colors">
                    <SettingsIcon className="w-5 h-5" />
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-semibold bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAuthModalState({ isOpen: true, view: 'login' })}
                  className="px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => setAuthModalState({ isOpen: true, view: 'signup' })}
                  className="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-full hover:opacity-90 transition-opacity"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      {authModalState.isOpen && <AuthModal initialView={authModalState.view} onClose={() => setAuthModalState({ isOpen: false, view: 'login' })} />}
      {isCreateBoardModalOpen && <CreateBoardModal onClose={() => setCreateBoardModalOpen(false)} />}
    </>
  );
};

export default Header;
