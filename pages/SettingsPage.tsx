
import React, { useState, useEffect, useRef } from 'react';
import { useAuth, getBannerUrl } from '../hooks/useStore';
import { useNavigate } from 'react-router-dom';
import UserAvatar from '../components/UserAvatar';

const SettingsPage: React.FC = () => {
  const { currentUser, changePassword, updateProfile } = useAuth();
  const navigate = useNavigate();

  // State for password change
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  
  // State for profile settings
  const [iconUrl, setIconUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [bio, setBio] = useState('');
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const iconInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    } else {
        setIconUrl(currentUser.iconUrl || '');
        setBannerUrl(currentUser.bannerUrl || '');
        setBio(currentUser.bio || '');
    }
  }, [currentUser, navigate]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    const result = changePassword(oldPassword, newPassword);
    setPasswordMessage({ type: result.success ? 'success' : 'error', text: result.message });
    if (result.success) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

   const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage({ type: '', text: '' });
    const result = updateProfile({ iconUrl, bannerUrl, bio });
    setProfileMessage({ type: result.success ? 'success' : 'error', text: result.message });
    setTimeout(() => setProfileMessage({ type: '', text: '' }), 4000);
  };
  
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await fileToDataUrl(file);
        setIconUrl(dataUrl);
      } catch (error) {}
    }
  };
  
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await fileToDataUrl(file);
        setBannerUrl(dataUrl);
      } catch (error) {}
    }
  };

  if (!currentUser) return null;

  const previewBannerSrc = getBannerUrl({ id: currentUser.id, bannerUrl: bannerUrl });

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <h1 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">User Settings</h1>
      
      {/* Profile Settings Section */}
      <div className="bg-white p-6 rounded-md border border-gray-200">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Profile Settings</h2>
            <div className="flex items-center gap-2">
                {currentUser.isVerified ? (
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                        Verified
                    </span>
                ) : currentUser.isPendingVerification ? (
                    <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <svg className="w-3 h-3 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path></svg>
                        Verification Pending
                    </span>
                ) : (
                    <button onClick={() => navigate('/verify')} className="text-xs font-bold text-primary hover:underline">
                        Verify Identity
                    </button>
                )}
            </div>
        </div>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
             {profileMessage.text && (
                <p className={`p-3 rounded-md text-sm ${profileMessage.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                {profileMessage.text}
                </p>
            )}
            <div className="flex items-center gap-4">
                <UserAvatar user={{...currentUser, iconUrl}} className="w-16 h-16"/>
                <div className="flex-1">
                    <label className="block text-gray-600 mb-2 text-sm">Profile Icon</label>
                     <div className="flex items-center gap-2">
                        <button type="button" onClick={() => iconInputRef.current?.click()} className="px-4 py-2 text-sm font-semibold bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors">
                        Upload Image
                        </button>
                        {iconUrl && <button type="button" onClick={() => setIconUrl('')} className="text-sm text-red-500 hover:underline">Remove</button>}
                    </div>
                    <input type="file" ref={iconInputRef} onChange={handleIconUpload} accept="image/*" className="hidden" />
                </div>
            </div>
             <div>
                <label className="block text-gray-600 mb-2 text-sm">Banner Image</label>
                <div 
                    className="h-24 w-full rounded-md bg-gray-100 bg-cover bg-center mb-2"
                    style={{ backgroundImage: `url(${previewBannerSrc})` }}
                >
                    {!bannerUrl && <div className="flex items-center justify-center h-full text-sm text-white/80 bg-black/20 font-bold">Banner Preview</div>}
                </div>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={() => bannerInputRef.current?.click()} className="px-4 py-2 text-sm font-semibold bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors">
                        Upload Image
                    </button>
                    {bannerUrl && <button type="button" onClick={() => setBannerUrl('')} className="text-sm text-red-500 hover:underline">Remove</button>}
                </div>
                <input type="file" ref={bannerInputRef} onChange={handleBannerUpload} accept="image/*" className="hidden" />
            </div>
            <div>
                <label className="block text-gray-600 mb-2 text-sm">Bio</label>
                <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px] resize-y"
                    placeholder="Tell us a little about yourself..."
                    maxLength={300}
                />
            </div>
            <div className="flex justify-end pt-4">
                <button type="submit" className="bg-primary text-white font-bold py-2 px-6 rounded-full hover:opacity-90 transition-opacity">
                    Save Profile
                </button>
            </div>
        </form>
      </div>

      {/* Password Section */}
      <div className="bg-white p-6 rounded-md border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {passwordMessage.text && (
            <p className={`p-3 rounded-md text-sm ${passwordMessage.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
              {passwordMessage.text}
            </p>
          )}
          <div>
            <label className="block text-gray-600 mb-2">Old Password</label>
            <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary" required />
          </div>
          <div>
            <label className="block text-gray-600 mb-2">New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary" required />
          </div>
          <div>
            <label className="block text-gray-600 mb-2">Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary" required />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-primary text-white font-bold py-2 px-6 rounded-full hover:opacity-90 transition-opacity">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
