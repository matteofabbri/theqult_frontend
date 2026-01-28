
import React, { useState, useEffect } from 'react';
import { useData, useAuth } from '../hooks/useStore';
import { useNavigate, useParams } from 'react-router-dom';
import MarkdownEditor from '../components/MarkdownEditor';
import MediaUploader from '../components/MediaUploader';
import type { MediaItem } from '../types';

const CreateProfilePostPage: React.FC = () => {
  const { createProfilePost } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);

  useEffect(() => {
    if (!currentUser || currentUser.username !== username) {
      navigate('/');
    }
  }, [currentUser, navigate, username]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const newPost = createProfilePost(title, content, media);
    if (newPost && currentUser) navigate(`/u/${currentUser.username}/post/${newPost.id}`);
  };

  if (!currentUser) return null;

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">Create Profile Post</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-white border border-gray-300 rounded-md p-3 text-gray-900 outline-none focus:ring-2 focus:ring-primary" placeholder="An interesting title" maxLength={300} required />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Body</label>
            <MarkdownEditor value={content} onChange={setContent} placeholder="Text (optional)" />
        </div>
        <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Media</label>
             <MediaUploader media={media} onChange={setMedia} />
        </div>
        <div className="flex justify-end pt-4">
            <button type="submit" disabled={!title.trim()} className="bg-primary text-white font-bold py-3 px-8 rounded-full hover:opacity-90 disabled:bg-gray-300">Post</button>
        </div>
      </form>
    </div>
  );
};

export default CreateProfilePostPage;
