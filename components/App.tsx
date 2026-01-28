
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
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
import EditorialsPage from '../pages/EditorialsPage';
import CreateEditorialPostPage from '../pages/CreateEditorialPostPage';
import EditEditorialPage from '../pages/EditEditorialPage';
import CreateProfilePostPage from '../pages/CreateProfilePostPage';
import ProfilePostPage from '../pages/ProfilePostPage';
import EditProfilePostPage from '../pages/EditProfilePostPage';
import MessagesPage from '../pages/MessagesPage';
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage';
import CookiePolicyPage from '../pages/CookiePolicyPage';
import ContactPage from '../pages/ContactPage';
import AdminAdsPage from '../pages/AdminAdsPage';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Header />
      <main className="pt-24 bg-gray-100">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/editorials" element={<EditorialsPage />} />
          <Route path="/editorials/submit" element={<CreateEditorialPostPage />} />
          <Route path="/editorials/:editorialId/edit" element={<EditEditorialPage />} />
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
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/messages/:username" element={<MessagesPage />} />
          <Route path="/admin/ads" element={<AdminAdsPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/cookies" element={<CookiePolicyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </HashRouter>
  );
}

export default App;
