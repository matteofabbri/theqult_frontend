
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useStore';
import AuthModal from './AuthModal';
import CreateBoardModal from './CreateBoardModal';
import { SettingsIcon, NewspaperIcon, MessageIcon, PlusIcon } from './Icons';
import UserAvatar from './UserAvatar';

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
            <Link to="/editorials" className="font-semibold text-gray-700 hover:text-primary transition-colors hidden sm:flex items-center gap-1.5">
              <NewspaperIcon className="w-5 h-5" />
              <span>Editorials</span>
            </Link>
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
