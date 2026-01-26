
import React, { useState, useEffect, useRef } from 'react';
import { useAuth, getBannerUrl } from '../hooks/useStore';
import { useNavigate, Link } from 'react-router-dom';
import UserAvatar from '../components/UserAvatar';
import { WalletIcon, CheckIcon, LockIcon, PendingIcon } from '../components/Icons';
import PaymentMethodsModal from '../components/PaymentMethodsModal';

const SettingsPage: React.FC = () => {
  const { currentUser, changePassword, updateProfile } = useAuth();
  const navigate = useNavigate();

  // Modals State
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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
        
        // Auto-approve demo for pending verification
        if (currentUser.isPendingVerification && !currentUser.isVerified) {
            const timer = setTimeout(() => {
                updateProfile({ isPendingVerification: false, isVerified: true });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }
  }, [currentUser, navigate, updateProfile]);

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

  const handleVerify = () => {
      navigate('/verify');
  }
  
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
      if (!file.type.startsWith('image/')) {
        setProfileMessage({ type: 'error', text: 'Please select a valid image file.' });
        return;
      }
      try {
        const dataUrl = await fileToDataUrl(file);
        setIconUrl(dataUrl);
        setProfileMessage({ type: '', text: '' });
      } catch (error) {
        setProfileMessage({ type: 'error', text: 'Failed to read image file.' });
      }
    }
  };
  
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setProfileMessage({ type: 'error', text: 'Please select a valid image file.' });
        return;
      }
      try {
        const dataUrl = await fileToDataUrl(file);
        setBannerUrl(dataUrl);
        setProfileMessage({ type: '', text: '' });
      } catch (error) {
        setProfileMessage({ type: 'error', text: 'Failed to read image file.' });
      }
    }
  };

  if (!currentUser) {
      return null;
  }

  // Construct preview object for getBannerUrl
  const previewBannerSrc = getBannerUrl({ id: currentUser.id, bannerUrl: bannerUrl });

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <h1 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">User Settings</h1>
      
      {/* Profile Settings Section */}
      <div className="bg-white p-6 rounded-md border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Settings</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
             {profileMessage.text && (
                <p className={`p-3 rounded-md text-sm ${profileMessage.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                {profileMessage.text}
                </p>
            )}
            <div className="flex items-center gap-4">
                <UserAvatar user={{...currentUser, iconUrl}} className="w-16 h-16"/>
                <div className="flex-1">
                    <label className="block text-gray-600 mb-2 text-sm" htmlFor="icon-upload">Profile Icon</label>
                     <div className="flex items-center gap-2">
                        <button type="button" onClick={() => iconInputRef.current?.click()} className="px-4 py-2 text-sm font-semibold bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors">
                        Upload Image
                        </button>
                        {iconUrl && <button type="button" onClick={() => setIconUrl('')} className="text-sm text-red-500 hover:underline">Remove</button>}
                    </div>
                    <input
                        type="file"
                        id="icon-upload"
                        ref={iconInputRef}
                        onChange={handleIconUpload}
                        accept="image/*"
                        className="hidden"
                    />
                </div>
            </div>
             <div>
                <label className="block text-gray-600 mb-2 text-sm" htmlFor="banner-upload">Banner Image</label>
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
                <input
                    type="file"
                    id="banner-upload"
                    ref={bannerInputRef}
                    onChange={handleBannerUpload}
                    accept="image/*"
                    className="hidden"
                />
            </div>
            <div>
                <label className="block text-gray-600 mb-2 text-sm" htmlFor="bio">Bio</label>
                <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px] resize-y"
                    placeholder="Tell us a little about yourself..."
                    maxLength={300}
                />
                <p className="text-xs text-gray-500 mt-1 text-right">{bio.length}/300</p>
            </div>
            
            <div className="flex justify-end pt-4">
                <button type="submit" className="bg-primary text-white font-bold py-2 px-6 rounded-full hover:opacity-90 transition-opacity">
                    Save Profile
                </button>
            </div>
        </form>
      </div>

      {/* Wallet Management Section (Kopeki) */}
       <div className="bg-white p-8 rounded-md border border-gray-200 text-center relative overflow-hidden">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <WalletIcon className="w-8 h-8 text-primary"/>
                <h2 className="text-2xl font-bold text-gray-900">Kopeki</h2>
            </div>
            {currentUser.isVerified && (
                <Link to="/settings/transactions" className="text-sm font-semibold text-primary hover:underline">
                    View History
                </Link>
            )}
        </div>
        
        <div className="mb-10">
            <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1">Current Balance</p>
            {currentUser.isVerified ? (
                <>
                    <div className="text-6xl font-extrabold text-gray-900 mb-2">
                        {currentUser.kopeki.toLocaleString()}
                    </div>
                    <div className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-bold">KOPEKI</div>
                </>
            ) : currentUser.isPendingVerification ? (
                <>
                    <div className="text-6xl font-extrabold text-gray-300 mb-2 blur-sm select-none">
                        0
                    </div>
                    <div className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-bold">REVIEW IN PROGRESS</div>
                </>
            ) : (
                <>
                    <div className="text-6xl font-extrabold text-gray-300 mb-2 blur-sm select-none">
                        0
                    </div>
                    <div className="inline-block bg-gray-200 text-gray-500 text-xs px-2 py-1 rounded font-bold">LOCKED</div>
                </>
            )}
        </div>

        <div className="space-y-4 max-w-md mx-auto relative z-10">
             {/* Deposit Button */}
             {currentUser.isVerified ? (
                 <Link 
                    to="/wallet/deposit"
                    className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold text-xl py-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                 >
                     <span>Deposit Funds</span>
                 </Link>
             ) : (
                <button 
                    disabled 
                    className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-400 font-bold text-xl py-4 rounded-xl cursor-not-allowed"
                >
                    <span>Deposit Funds (Locked)</span>
                </button>
             )}

             {/* Verification Button/Status */}
             {currentUser.isVerified ? (
                <div className="w-full flex items-center justify-center gap-2 bg-gray-100 text-green-600 font-bold text-xl py-4 rounded-xl border border-gray-200">
                    <CheckIcon className="w-6 h-6" />
                    <span>Verified</span>
                </div>
             ) : currentUser.isPendingVerification ? (
                <div className="w-full flex items-center justify-center gap-2 bg-yellow-100 text-yellow-700 font-bold text-xl py-4 rounded-xl border border-yellow-200 animate-pulse">
                    <PendingIcon className="w-6 h-6" />
                    <span>Verification Pending</span>
                </div>
             ) : (
                <button 
                    onClick={handleVerify}
                    className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xl py-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                >
                    <CheckIcon className="w-6 h-6" />
                    <span>Get Verified</span>
                </button>
             )}
        </div>
        
        {/* Unverified Overlay Message */}
        {!currentUser.isVerified && (
             <div className={`mt-6 p-4 rounded-md border text-sm ${currentUser.isPendingVerification ? 'bg-yellow-50 text-yellow-800 border-yellow-200' : 'bg-orange-50 text-orange-800 border-orange-200'}`}>
                 {currentUser.isPendingVerification ? (
                     <>
                        <PendingIcon className="w-4 h-4 inline-block mr-1 mb-0.5" />
                        Your identity verification is currently under review. Please wait while we process your documents.
                     </>
                 ) : (
                     <>
                        <LockIcon className="w-4 h-4 inline-block mr-1 mb-0.5" />
                        Your wallet is currently <strong>hidden and locked</strong>. You must verify your identity to deposit funds and see your balance.
                     </>
                 )}
             </div>
        )}
        
        {currentUser.isVerified && (
            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center gap-6 text-sm">
                 <button 
                    onClick={() => setShowPaymentModal(true)}
                    className="text-gray-500 hover:text-gray-800 font-medium"
                 >
                     Manage Cards ({currentUser.savedCards?.length || 0})
                 </button>
                 <Link 
                    to="/wallet/withdraw"
                    className="text-gray-500 hover:text-gray-800 font-medium"
                 >
                     Withdraw Funds
                 </Link>
            </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-md border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {passwordMessage.text && (
            <p className={`p-3 rounded-md text-sm ${passwordMessage.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
              {passwordMessage.text}
            </p>
          )}
          <div>
            <label className="block text-gray-600 mb-2" htmlFor="old-password">Old Password</label>
            <input
              type="password"
              id="old-password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-2" htmlFor="new-password">New Password</label>
            <input
              type="password"
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-2" htmlFor="confirm-password">Confirm New Password</label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-primary text-white font-bold py-2 px-6 rounded-full hover:opacity-90 transition-opacity">
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {showPaymentModal && <PaymentMethodsModal onClose={() => setShowPaymentModal(false)} />}
    </div>
  );
};

export default SettingsPage;
