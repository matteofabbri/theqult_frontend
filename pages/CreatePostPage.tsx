
import React, { useState, useEffect, useMemo } from 'react';
import { useData, useAuth } from '../hooks/useStore';
import { useNavigate, useLocation } from 'react-router-dom';
import MarkdownEditor from '../components/MarkdownEditor';
import MediaUploader from '../components/MediaUploader';
import type { MediaItem } from '../types';

const CreatePostPage: React.FC = () => {
  const { boards, createPost } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedBoardId, setSelectedBoardId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  
  const stateBoardId = location.state?.boardId;

  const availableBoards = useMemo(() => {
    if (currentUser) {
      return boards;
    }
    // If not logged in, return only boards that allow anonymous posts
    return boards.filter(b => b.allowAnonymousPosts);
  }, [boards, currentUser]);

  useEffect(() => {
    // Only redirect if no boards available (e.g. not logged in AND no anon boards exist)
    if (!currentUser && availableBoards.length === 0) {
      navigate('/');
      return;
    }

    if (stateBoardId && availableBoards.some(b => b.id === stateBoardId)) {
      setSelectedBoardId(stateBoardId);
    } else if (availableBoards.length > 0) {
        // If we don't have a state board ID, or the one requested isn't allowed,
        // default to the first available one (preventing selection of invalid board)
        if (!selectedBoardId || !availableBoards.some(b => b.id === selectedBoardId)) {
             setSelectedBoardId(availableBoards[0].id);
        }
    }
  }, [currentUser, navigate, availableBoards, stateBoardId, selectedBoardId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedBoardId) {
      alert("Title and board are required.");
      return;
    }
    const newPost = createPost(title, content, selectedBoardId, media);
    if (newPost) {
        const board = boards.find(b => b.id === newPost.boardId);
        if (board) {
            navigate(`/b/${board.name}/post/${newPost.id}`);
        } else {
            navigate('/');
        }
    } else {
        alert('Failed to create post. You may not have permission.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">Create a Post</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="board-select" className="block text-sm font-medium text-gray-700 mb-2">Choose a Board</label>
          <select
            id="board-select"
            value={selectedBoardId}
            onChange={(e) => setSelectedBoardId(e.target.value)}
            className="w-full max-w-xs bg-white border border-gray-300 rounded-md p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
            required
          >
            {availableBoards.length === 0 && <option value="">No boards available</option>}
            {availableBoards.map(board => (
              <option key={board.id} value={board.id}>
                b/{board.name}
              </option>
            ))}
          </select>
          {!currentUser && (
              <p className="text-xs text-gray-500 mt-1">Showing only boards that allow anonymous posting.</p>
          )}
        </div>
        
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

        <div className="flex justify-end pt-4">
            <button type="submit" disabled={!title.trim() || !selectedBoardId} className="bg-primary text-white font-bold py-3 px-8 rounded-full hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">Post</button>
        </div>
      </form>
    </div>
  );
};

export default CreatePostPage;
