
import React, { useState } from 'react';
import { useData } from '../hooks/useStore';
import { CloseIcon } from './Icons';
import MarkdownEditor from './MarkdownEditor';
import MediaUploader from './MediaUploader';
import type { MediaItem } from '../types';
import { useNavigate } from 'react-router-dom';

interface CreatePostModalProps {
  boardId: string;
  onClose: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ boardId, onClose }) => {
  const { createPost, boards } = useData();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [error, setError] = useState('');

  const board = boards.find(b => b.id === boardId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    
    const newPost = createPost(title, content, boardId, media);
    if (newPost) {
        onClose();
        if (board) {
            navigate(`/b/${board.name}/post/${newPost.id}`);
        }
    } else {
        setError('Failed to create post. You may not have permission.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl relative border border-gray-200 max-h-[90vh] flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Create Post in b/{board?.name}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors">
                <CloseIcon className="w-6 h-6" />
            </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                    {error}
                </div>
            )}
            
            <form id="create-post-form" onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="post-title" className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                    <input
                        type="text"
                        id="post-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary text-lg font-medium"
                        placeholder="An interesting title"
                        maxLength={300}
                        autoFocus
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Body</label>
                    <MarkdownEditor
                        value={content}
                        onChange={setContent}
                        placeholder="Text (optional)"
                        heightClassName="h-48"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Media</label>
                    <MediaUploader media={media} onChange={setMedia} />
                </div>
            </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-lg">
            <button 
                type="button" 
                onClick={onClose} 
                className="px-5 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
            >
                Cancel
            </button>
            <button 
                type="submit" 
                form="create-post-form"
                disabled={!title.trim()} 
                className="px-8 py-2 text-sm font-bold bg-primary text-white rounded-full hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-sm"
            >
                Post
            </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
