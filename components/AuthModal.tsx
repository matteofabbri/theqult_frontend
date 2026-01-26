
import React, { useState } from 'react';
import { useAuth } from '../hooks/useStore';
import { CloseIcon } from './Icons';

interface AuthModalProps {
  onClose: () => void;
  initialView?: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, initialView = 'login' }) => {
  const [view, setView] = useState<'login' | 'signup' | 'forgot'>(initialView);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [forgotUsername, setForgotUsername] = useState('');
  const [message, setMessage] = useState('');
  const { login, register, getUserByUsername } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (view === 'login') {
      const success = login(username, password);
      if (success) {
        onClose();
      } else {
        setError('Invalid username or password.');
      }
    } else if (view === 'signup') {
      const { success, message } = register(username, password);
      if (success) {
        onClose();
      } else {
        setError(message);
      }
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = getUserByUsername(forgotUsername);
    if (user?.password) {
        console.log(`Password recovery for ${user.username}: your password is "${user.password}"`);
    }
    setMessage(`If an account with username "${forgotUsername}" exists, a password recovery link has been sent to the associated email address.`);
    setTimeout(() => {
        switchView('login');
    }, 5000);
  };

  const switchView = (newView: 'login' | 'signup' | 'forgot') => {
    setView(newView);
    setError('');
    setMessage('');
    setPassword('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md relative border border-gray-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
          <CloseIcon className="w-6 h-6" />
        </button>
        
        {view === 'forgot' ? (
            <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Reset Password</h2>
                {message ? (
                    <p className="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded-md mb-4 text-sm">{message}</p>
                ) : (
                    <p className="text-sm text-center text-gray-600 mb-4">Enter your username to receive password recovery instructions.</p>
                )}
                <form onSubmit={handleForgotSubmit}>
                  <div className="mb-4">
                    <label className="block text-gray-600 mb-2" htmlFor="forgot-username">Username</label>
                    <input
                      type="text" id="forgot-username" value={forgotUsername}
                      onChange={(e) => setForgotUsername(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <button type="submit" disabled={!!message} className="w-full bg-primary text-white font-bold py-3 rounded-md hover:opacity-90 transition-opacity disabled:bg-gray-400">
                    Send Instructions
                  </button>
                </form>
                <p className="text-center text-gray-500 mt-6">
                    Remember your password?
                    <button onClick={() => switchView('login')} className="text-primary font-semibold ml-2 hover:underline">
                        Back to Log In
                    </button>
                </p>
            </>
        ) : (
            <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{view === 'login' ? 'Log In' : 'Sign Up'}</h2>
                <form onSubmit={handleSubmit}>
                    {error && <p className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
                    <div className="mb-4">
                        <label className="block text-gray-600 mb-2" htmlFor="username">Username</label>
                        <input
                        type="text" id="username" value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                        />
                    </div>
                    <div className={view === 'login' ? 'mb-2' : 'mb-6'}>
                        <label className="block text-gray-600 mb-2" htmlFor="password">Password</label>
                        <input
                        type="password" id="password" value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                        />
                    </div>
                    {view === 'login' && (
                        <div className="flex justify-end mb-4">
                            <button type="button" onClick={() => switchView('forgot')} className="text-sm text-primary hover:underline">
                                Forgot Password?
                            </button>
                        </div>
                    )}
                    <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-md hover:opacity-90 transition-opacity">
                        {view === 'login' ? 'Log In' : 'Sign Up'}
                    </button>
                </form>
                <p className="text-center text-gray-500 mt-6">
                    {view === 'login' ? "Don't have an account?" : 'Already have an account?'}
                    <button onClick={() => switchView(view === 'login' ? 'signup' : 'login')} className="text-primary font-semibold ml-2 hover:underline">
                        {view === 'login' ? 'Sign Up' : 'Log In'}
                    </button>
                </p>
            </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
