
import React, { useState, useEffect } from 'react';
import { useData, useAuth } from '../hooks/useStore';
import { useNavigate } from 'react-router-dom';
import MarkdownEditor from '../components/MarkdownEditor';
import MediaUploader from '../components/MediaUploader';
import type { MediaItem } from '../types';

const CreateEditorialPostPage: React.FC = () => {
  const { createEditorial } = useData();
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);

  useEffect(() => {
    if (!currentUser || !isAdmin(currentUser.id)) {
      navigate('/editorials');
    }
  }, [currentUser, isAdmin, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Title is required.");
      return;
    }
    
    const newEditorial = createEditorial(title, content, media);
    if (newEditorial) {
        navigate(`/editorials`);
    } else {
        alert("Failed to create editorial post.");
    }
  };

  if (!currentUser || !isAdmin(currentUser.id)) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">Create New Editorial</h1>
      <p className="text-sm text-gray-500 mb-6">You are posting to the main editorials section.</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-md p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="A compelling title for the editorial"
            maxLength={300}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Body</label>
          <MarkdownEditor
            value={content}
            onChange={setContent}
            placeholder="Write your editorial content here..."
          />
        </div>
        
        <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Media</label>
             <MediaUploader media={media} onChange={setMedia} />
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" className="bg-primary text-white font-bold py-3 px-8 rounded-full hover:opacity-90 transition-colors">Post Editorial</button>
        </div>
      </form>
    </div>
  );
};

export default CreateEditorialPostPage;
