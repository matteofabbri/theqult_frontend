
import React from 'react';
import { useAuth, useData } from '../hooks/useStore';
import { UpvoteIcon, DownvoteIcon } from './Icons';
import type { Vote } from '../types';

interface VoteButtonsProps {
  entityId: string;
  className?: string;
}

const VoteButtons: React.FC<VoteButtonsProps> = ({ entityId, className }) => {
  const { currentUser } = useAuth();
  const { votes, castVote, posts, comments, boards } = useData();

  // Logic to determine if we can vote anonymously
  const findBoardForEntity = () => {
      const post = posts.find(p => p.id === entityId);
      if (post) return boards.find(b => b.id === post.boardId);
      
      const comment = comments.find(c => c.id === entityId);
      if (comment) {
          const parentPost = posts.find(p => p.id === comment.postId);
          if (parentPost) return boards.find(b => b.id === parentPost.boardId);
      }
      return undefined;
  };

  const board = findBoardForEntity();
  const canVoteAnonymously = board ? (board.allowAnonymousPosts && board.allowAnonymousComments) : false;

  const entityVotes = votes.filter((v: Vote) => v.entityId === entityId);
  const score = entityVotes.reduce((acc, vote) => acc + (vote.type === 'up' ? 1 : -1), 0);
  
  // Determine current user ID (Logged in OR Anonymous ID stored in LS)
  const getEffectiveUserId = () => {
      if (currentUser) return currentUser.id;
      return localStorage.getItem('qult_anon_id') || null;
  };

  const effectiveUserId = getEffectiveUserId();
  const userVote = effectiveUserId ? entityVotes.find((v: Vote) => v.userId === effectiveUserId) : undefined;

  const handleVote = (type: 'up' | 'down') => {
    if (currentUser || canVoteAnonymously) {
      castVote(entityId, type);
    } else {
      // Trigger simple alert for now, could be auth modal
      alert('You need to be logged in to vote, or this board does not allow anonymous voting.');
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <button
        onClick={() => handleVote('up')}
        className={`p-1 rounded-sm hover:bg-gray-200 ${userVote?.type === 'up' ? 'text-primary' : 'text-gray-400 hover:text-green-500'}`}
        aria-label="Upvote"
      >
        <UpvoteIcon className="w-5 h-5" />
      </button>
      <span className="text-sm font-bold text-gray-800 py-1">{score}</span>
      <button
        onClick={() => handleVote('down')}
        className={`p-1 rounded-sm hover:bg-gray-200 ${userVote?.type === 'down' ? 'text-blue-500' : 'text-gray-400 hover:text-red-500'}`}
        aria-label="Downvote"
      >
        <DownvoteIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default VoteButtons;
