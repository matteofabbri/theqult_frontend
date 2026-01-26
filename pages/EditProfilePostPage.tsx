import React, { useState, useEffect } from 'react';
import { useData, useAuth } from '../hooks/useStore';
import { useNavigate, useParams } from 'react-router-dom';
import MarkdownEditor from '../components/MarkdownEditor';
import NotFoundPage from './NotFoundPage';

const EditProfilePostPage: React.FC = () => {
  const { postId, username } = useParams<{ postId: string; username: string }>();
  const { profilePosts, updateProfilePost } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const postToEdit = profilePosts.find(p => p.id === postId);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/'); 
    }
    if (postToEdit) {
      if (postToEdit.authorId !== currentUser?.id || currentUser?.username !== username) {
         navigate(`/u/${username}/post/${postToEdit.id}`);
      }
      setTitle(postToEdit.title);
      setContent(postToEdit.content);
    }
  }, [currentUser, navigate, postToEdit, username]);

  if (!postToEdit) {
    return <NotFoundPage />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Title is required.");
      return;
    }
    if (postId) {
        const success = updateProfilePost(postId, title, content);
        if (success) {
            navigate(`/u/${username}/post/${postId}`);
        } else {
            alert("Failed to update post.");
        }
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">Edit Profile Post</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-600 mb-2">Title</label>
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
          <label className="block text-sm font-medium text-gray-600 mb-2">Body</label>
          <MarkdownEditor
            value={content}
            onChange={setContent}
            placeholder="Text (optional)"
          />
        </div>
        <div className="flex justify-end gap-2">
             <button type="button" onClick={() => navigate(`/u/${username}/post/${postId}`)} className="bg-gray-200 text-gray-700 font-bold py-2 px-8 rounded-full hover:bg-gray-300">Cancel</button>
            <button type="submit" className="bg-primary text-white font-bold py-2 px-8 rounded-full hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed">Save Changes</button>
        </div>
      </form>
    </div>
  );
};

export default EditProfilePostPage;