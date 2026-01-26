
import React, { useState, useEffect } from 'react';
import { useData, useAuth } from '../hooks/useStore';
import { useNavigate, useParams } from 'react-router-dom';
import MarkdownEditor from '../components/MarkdownEditor';
import MediaUploader from '../components/MediaUploader';
import type { MediaItem } from '../types';
import { WalletIcon } from '../components/Icons';

const CreateProfilePostPage: React.FC = () => {
  const { createProfilePost } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isExclusive, setIsExclusive] = useState(false);
  const [price, setPrice] = useState('');

  useEffect(() => {
    if (!currentUser || currentUser.username !== username) {
      navigate('/');
    }
  }, [currentUser, navigate, username]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Title is required.");
      return;
    }
    
    const finalPrice = isExclusive && price ? parseInt(price, 10) : 0;
    
    const newPost = createProfilePost(title, content, media, finalPrice);
    if (newPost && currentUser) {
      navigate(`/u/${currentUser.username}/post/${newPost.id}`);
    } else {
      alert('Failed to create post.');
    }
  };

  if (!currentUser) return null;

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">Create a Post on Your Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-md p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="An interesting title"
                maxLength={300}
                required
            />
        </div>
        
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Body</label>
            <MarkdownEditor
                value={content}
                onChange={setContent}
                placeholder="Text (optional)"
            />
        </div>

        <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Media</label>
             <MediaUploader media={media} onChange={setMedia} />
        </div>

        {/* Exclusive Content Section */}
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
             <label className="flex items-center gap-3 cursor-pointer">
                 <input 
                    type="checkbox" 
                    checked={isExclusive} 
                    onChange={(e) => setIsExclusive(e.target.checked)} 
                    className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                 />
                 <span className="font-semibold text-gray-700">Make this post exclusive (Paid)</span>
             </label>
             
             {isExclusive && (
                 <div className="mt-3 ml-8 animate-fadeIn">
                     <label className="block text-sm text-gray-600 mb-1">Unlock Price (Kopeki)</label>
                     <div className="relative max-w-xs">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                             <WalletIcon className="h-4 w-4 text-gray-400" />
                        </div>
                        <input 
                            type="number" 
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full pl-10 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="e.g. 500"
                            min="1"
                        />
                     </div>
                     <p className="text-xs text-gray-500 mt-1">Users must pay this amount to see the content.</p>
                 </div>
             )}
        </div>

        <div className="flex justify-end pt-4">
            <button type="submit" disabled={!title.trim()} className="bg-primary text-white font-bold py-3 px-8 rounded-full hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">Post</button>
        </div>
      </form>
    </div>
  );
};

export default CreateProfilePostPage;
