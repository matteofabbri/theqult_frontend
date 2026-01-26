import React, { useState, useEffect } from 'react';
import { useData, useAuth } from '../hooks/useStore';
import { useNavigate, useParams } from 'react-router-dom';
import MarkdownEditor from '../components/MarkdownEditor';
import NotFoundPage from './NotFoundPage';

const EditPostPage: React.FC = () => {
  const { postId } = useParams<{ postId: string; boardName: string }>();
  const { posts, boards, updatePost } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const postToEdit = posts.find(p => p.id === postId);
  const board = postToEdit ? boards.find(b => b.id === postToEdit.boardId) : undefined;
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/'); // Redirect if not logged in
    }
    if (postToEdit) {
      if (postToEdit.authorId !== currentUser?.id) {
         navigate(`/b/${board?.name}/post/${postToEdit.id}`); // Redirect if not author
      }
      setTitle(postToEdit.title);
      setContent(postToEdit.content);
    }
  }, [currentUser, navigate, postToEdit, board]);

  if (!postToEdit || !board) {
    return <NotFoundPage />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Title is required.");
      return;
    }
    if (postId) {
        const success = updatePost(postId, title, content);
        if (success) {
            navigate(`/b/${board.name}/post/${postId}`);
        } else {
            alert("Failed to update post.");
        }
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">Edit Post</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="board-select" className="block text-sm font-medium text-gray-600 mb-2">Board</label>
          <select
            id="board-select"
            value={board.id}
            disabled
            className="w-full max-w-xs bg-gray-100 border border-gray-300 rounded-md p-3 text-gray-500 focus:outline-none cursor-not-allowed"
          >
              <option key={board.id} value={board.id}>
                b/{board.name}
              </option>
          </select>
        </div>
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
             <button type="button" onClick={() => navigate(`/b/${board.name}/post/${postId}`)} className="bg-gray-200 text-gray-700 font-bold py-2 px-8 rounded-full hover:bg-gray-300">Cancel</button>
            <button type="submit" className="bg-primary text-white font-bold py-2 px-8 rounded-full hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed">Save Changes</button>
        </div>
      </form>
    </div>
  );
};

export default EditPostPage;