
import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import HomePage from '../pages/HomePage';
import BoardPage from '../pages/BoardPage';
import PostPage from '../pages/PostPage';
import CreatePostPage from '../pages/CreatePostPage';
import EditPostPage from '../pages/EditPostPage';
import UserProfilePage from '../pages/UserProfilePage';
import SettingsPage from '../pages/SettingsPage';
import NotFoundPage from '../pages/NotFoundPage';
import SearchPage from '../pages/SearchPage';
import BoardSettingsPage from '../pages/BoardSettingsPage';
import CreateProfilePostPage from '../pages/CreateProfilePostPage';
import ProfilePostPage from '../pages/ProfilePostPage';
import EditProfilePostPage from '../pages/EditProfilePostPage';
import MessagesPage from '../pages/MessagesPage';
import EditorialsPage from '../pages/EditorialsPage';
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage';
import CookiePolicyPage from '../pages/CookiePolicyPage';
import ContactPage from '../pages/ContactPage';
import MapPage from '../pages/MapPage';
import BannedPage from '../pages/BannedPage';

const CountryGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkCountry = async () => {
      try {
        // 1. Check if language is Hebrew
        const isHebrew = navigator.languages.some(lang => lang.toLowerCase().startsWith('he'));
        if (isHebrew && location.pathname !== '/banned') {
          sessionStorage.setItem('detected_banned_region', 'HE');
          navigate('/banned', { replace: true });
          setIsChecking(false);
          return;
        }

        // 2. Cache the check result to avoid extra API calls
        const cachedCountry = sessionStorage.getItem('user_country_code');
        if (cachedCountry) {
          if ((cachedCountry === 'RU' || cachedCountry === 'IL') && location.pathname !== '/banned') {
            sessionStorage.setItem('detected_banned_region', cachedCountry);
            navigate('/banned', { replace: true });
          }
          setIsChecking(false);
          return;
        }

        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const countryCode = data.country_code;
        
        sessionStorage.setItem('user_country_code', countryCode);

        if ((countryCode === 'RU' || countryCode === 'IL') && location.pathname !== '/banned') {
          sessionStorage.setItem('detected_banned_region', countryCode);
          navigate('/banned', { replace: true });
        }
      } catch (error) {
        console.error('Country check failed:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkCountry();
  }, [navigate, location.pathname]);

  if (isChecking) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <CountryGuard>
        <Header />
        <main className="pt-24 bg-gray-100 min-h-screen">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/b/:boardName" element={<BoardPage />} />
            <Route path="/b/:boardName/settings" element={<BoardSettingsPage />} />
            <Route path="/b/:boardName/post/:postId" element={<PostPage />} />
            <Route path="/b/:boardName/post/:postId/edit" element={<EditPostPage />} />
            <Route path="/submit" element={<CreatePostPage />} />
            <Route path="/u/:username" element={<UserProfilePage />} />
            <Route path="/u/:username/submit" element={<CreateProfilePostPage />} />
            <Route path="/u/:username/post/:postId" element={<ProfilePostPage />} />
            <Route path="/u/:username/post/:postId/edit" element={<EditProfilePostPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/editorials" element={<EditorialsPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/messages/:username" element={<MessagesPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/banned" element={<BannedPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/cookies" element={<CookiePolicyPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </CountryGuard>
    </HashRouter>
  );
}

export default App;
