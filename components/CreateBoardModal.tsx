
import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../hooks/useStore';
import { CloseIcon, ChevronRightIcon, ChevronLeftIcon, CheckIcon } from './Icons';
import { useNavigate } from 'react-router-dom';


interface CreateBoardModalProps {
  onClose: () => void;
}

const CreateBoardModal: React.FC<CreateBoardModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { createBoard } = useData();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');

  // Step 1: Basics
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Step 2: Visuals
  const [iconUrl, setIconUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const iconInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Step 3: Permissions
  const [accessType, setAccessType] = useState<'public' | 'password' | 'invite' | 'paid'>('public');
  const [password, setPassword] = useState('');
  const [entryFee, setEntryFee] = useState('');
  const [allowAnonymousComments, setAllowAnonymousComments] = useState(true);
  const [allowAnonymousPosts, setAllowAnonymousPosts] = useState(true);

  // Logic to disable anonymous options if not public
  const isNotPublic = accessType !== 'public';

  useEffect(() => {
      if (isNotPublic) {
          setAllowAnonymousComments(false);
          setAllowAnonymousPosts(false);
      }
  }, [isNotPublic]);

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file.');
            return;
        }
        try {
            const dataUrl = await fileToDataUrl(file);
            setter(dataUrl);
            setError('');
        } catch (err) {
            setError('Failed to read image file.');
        }
    }
  };

  const handleNext = (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      setError('');

      if (step === 1) {
          if (!name.trim()) {
              setError('Board name is required.');
              return;
          }
      }
      setStep(prev => prev + 1);
  };

  const handleBack = () => {
      setError('');
      setStep(prev => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    let isInviteOnly = false;
    let finalPassword = undefined;
    let finalEntryFee = undefined;

    if (accessType === 'invite') {
        isInviteOnly = true;
    } else if (accessType === 'password') {
        if (!password) {
            setError('Password is required for password-protected boards.');
            return;
        }
        finalPassword = password;
    } else if (accessType === 'paid') {
        const fee = parseInt(entryFee, 10);
        if (isNaN(fee) || fee <= 0) {
            setError('Please enter a valid entry fee.');
            return;
        }
        finalEntryFee = fee;
    }

    const { success, message } = createBoard(
        name.trim(), 
        description.trim(), 
        allowAnonymousComments, 
        allowAnonymousPosts, 
        finalPassword, 
        isInviteOnly, 
        finalEntryFee,
        iconUrl,
        bannerUrl
    );

    if (success) {
      navigate(`/b/${name.trim()}`);
      onClose();
    } else {
      setError(message);
    }
  };

  const renderStepIndicator = () => (
      <div className="flex items-center justify-center space-x-2 mb-6">
          {[1, 2, 3].map(i => (
              <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-primary' : i < step ? 'w-2 bg-primary' : 'w-2 bg-gray-200'}`} />
          ))}
      </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md relative border border-gray-200 max-h-[90vh] overflow-y-auto shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
          <CloseIcon className="w-6 h-6" />
        </button>
        
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">Create a Board</h2>
        <p className="text-center text-gray-500 text-sm mb-4">Step {step} of 3</p>
        
        {renderStepIndicator()}
        
        {error && <p className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}

        <form onSubmit={step === 3 ? handleSubmit : handleNext}>
            
            {/* STEP 1: BASICS */}
            {step === 1 && (
                <div className="space-y-4 animate-fadeIn">
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2" htmlFor="boardName">Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            id="boardName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="e.g., programming"
                            autoFocus
                        />
                        <p className="text-xs text-gray-500 mt-1">This will be the URL: /b/{name || '...'}</p>
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2" htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary h-32 resize-none"
                            placeholder="What is this community about?"
                        />
                    </div>
                </div>
            )}

            {/* STEP 2: VISUALS */}
            {step === 2 && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="text-center">
                        <h3 className="font-bold text-gray-800">Add Visuals</h3>
                        <p className="text-sm text-gray-500">Make your board stand out. You can skip this.</p>
                    </div>

                    <div className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                        <div className={`w-16 h-16 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden border ${!iconUrl ? 'flex items-center justify-center text-gray-400' : ''}`}>
                            {iconUrl ? <img src={iconUrl} alt="Icon" className="w-full h-full object-cover" /> : <span>Icon</span>}
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Board Icon</label>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => iconInputRef.current?.click()} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded transition-colors">Upload</button>
                                {iconUrl && <button type="button" onClick={() => setIconUrl('')} className="text-xs text-red-500 hover:text-red-700 px-2">Remove</button>}
                            </div>
                            <input type="file" ref={iconInputRef} onChange={(e) => handleImageUpload(e, setIconUrl)} accept="image/*" className="hidden" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Banner Image</label>
                        <div 
                            className="h-24 w-full rounded-md bg-gray-100 bg-cover bg-center border border-gray-200 flex items-center justify-center text-gray-400 text-sm cursor-pointer hover:bg-gray-200 transition-colors relative group"
                            style={{ backgroundImage: bannerUrl ? `url(${bannerUrl})` : 'none' }}
                            onClick={() => bannerInputRef.current?.click()}
                        >
                            {!bannerUrl && <span>Click to upload banner</span>}
                            {bannerUrl && (
                                <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center text-white text-xs font-bold rounded-md">Change</div>
                            )}
                        </div>
                        <div className="flex justify-end">
                             {bannerUrl && <button type="button" onClick={() => setBannerUrl('')} className="text-xs text-red-500 hover:text-red-700">Remove Banner</button>}
                        </div>
                        <input type="file" ref={bannerInputRef} onChange={(e) => handleImageUpload(e, setBannerUrl)} accept="image/*" className="hidden" />
                    </div>
                </div>
            )}

            {/* STEP 3: ACCESS */}
            {step === 3 && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="text-center">
                        <h3 className="font-bold text-gray-800">Privacy & Access</h3>
                        <p className="text-sm text-gray-500">Who can see and post on this board?</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { id: 'public', label: 'Public', desc: 'Anyone can view' },
                            { id: 'password', label: 'Password', desc: 'Requires key' },
                            { id: 'invite', label: 'Invite', desc: 'Private list' },
                            { id: 'paid', label: 'Paid', desc: 'Fee to enter' }
                        ].map(opt => (
                            <label key={opt.id} className={`border rounded-lg p-3 cursor-pointer transition-all ${accessType === opt.id ? 'border-primary bg-orange-50 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'}`}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-semibold text-sm text-gray-800">{opt.label}</span>
                                    <input type="radio" name="accessType" checked={accessType === opt.id} onChange={() => setAccessType(opt.id as any)} className="accent-primary" />
                                </div>
                                <span className="text-xs text-gray-500">{opt.desc}</span>
                            </label>
                        ))}
                    </div>

                    {accessType === 'password' && (
                        <div className="animate-fadeIn">
                            <label className="block text-gray-700 text-sm font-bold mb-1">Set Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-primary focus:border-primary" placeholder="Secret key" />
                        </div>
                    )}

                    {accessType === 'paid' && (
                        <div className="animate-fadeIn">
                            <label className="block text-gray-700 text-sm font-bold mb-1">Entry Fee (Kopeki)</label>
                            <input type="number" value={entryFee} onChange={(e) => setEntryFee(e.target.value)} className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-primary focus:border-primary" placeholder="e.g. 100" min="1" />
                        </div>
                    )}

                    <div className="border-t border-gray-100 pt-4 space-y-3">
                        <label className={`flex items-center ${isNotPublic ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                            <div className={`w-5 h-5 border rounded flex items-center justify-center ${allowAnonymousPosts ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                                {allowAnonymousPosts && <CheckIcon className="w-3 h-3 text-white" />}
                            </div>
                            <input type="checkbox" checked={allowAnonymousPosts} onChange={(e) => setAllowAnonymousPosts(e.target.checked)} className="hidden" disabled={isNotPublic} />
                            <span className="ml-3 text-sm text-gray-700">Allow anonymous posts</span>
                        </label>
                        
                        <label className={`flex items-center ${isNotPublic ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                            <div className={`w-5 h-5 border rounded flex items-center justify-center ${allowAnonymousComments ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                                {allowAnonymousComments && <CheckIcon className="w-3 h-3 text-white" />}
                            </div>
                            <input type="checkbox" checked={allowAnonymousComments} onChange={(e) => setAllowAnonymousComments(e.target.checked)} className="hidden" disabled={isNotPublic} />
                            <span className="ml-3 text-sm text-gray-700">Allow anonymous comments</span>
                        </label>
                        {isNotPublic && <p className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">Anonymous interactions are only available for public boards.</p>}
                    </div>
                </div>
            )}

            {/* ACTIONS */}
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
                {step > 1 ? (
                    <button type="button" onClick={handleBack} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 flex items-center gap-1">
                        <ChevronLeftIcon className="w-4 h-4" /> Back
                    </button>
                ) : (
                    <div></div> // Spacer
                )}

                <button 
                    type="submit" 
                    className={`px-6 py-2 rounded-full font-bold text-white transition-all shadow-md flex items-center gap-2 ${step === 3 ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:opacity-90'}`}
                >
                    {step === 3 ? (
                        <>Create Board <CheckIcon className="w-4 h-4" /></>
                    ) : (
                        <>Next <ChevronRightIcon className="w-4 h-4" /></>
                    )}
                </button>
            </div>
        </form>
      </div>
      <style>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CreateBoardModal;
