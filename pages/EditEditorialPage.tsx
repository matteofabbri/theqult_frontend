import React, { useState, useEffect } from 'react';
import { useData, useAuth } from '../hooks/useStore';
import { useNavigate, useParams } from 'react-router-dom';
import MarkdownEditor from '../components/MarkdownEditor';
import NotFoundPage from './NotFoundPage';

const EditEditorialPage: React.FC = () => {
  const { editorialId } = useParams<{ editorialId: string }>();
  const { editorials, updateEditorial } = useData();
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();

  const editorialToEdit = editorials.find(e => e.id === editorialId);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!currentUser || !isAdmin(currentUser.id)) {
      navigate('/editorials'); // Redirect if not admin
      return;
    }
    if (editorialToEdit) {
      setTitle(editorialToEdit.title);
      setContent(editorialToEdit.content);
    }
  }, [currentUser, isAdmin, navigate, editorialToEdit]);

  if (!editorialToEdit) {
    return <NotFoundPage />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Title is required.");
      return;
    }
    if (editorialId) {
        const success = updateEditorial(editorialId, title, content);
        if (success) {
            navigate(`/editorials`);
        } else {
            alert("Failed to update editorial.");
        }
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">Edit Editorial</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-600 mb-2">Title</label>
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
          <label className="block text-sm font-medium text-gray-600 mb-2">Body</label>
          <MarkdownEditor
            value={content}
            onChange={setContent}
            placeholder="Write your editorial content here..."
          />
        </div>
        <div className="flex justify-end gap-2">
            <button type="button" onClick={() => navigate('/editorials')} className="bg-gray-200 text-gray-700 font-bold py-2 px-8 rounded-full hover:bg-gray-300">Cancel</button>
            <button type="submit" className="bg-primary text-white font-bold py-2 px-8 rounded-full hover:opacity-90">Save Changes</button>
        </div>
      </form>
    </div>
  );
};

export default EditEditorialPage;