
import React, { useMemo, useCallback, useRef } from 'react';
import { useData, useAuth } from '../hooks/useStore';
import type { Post, ProfilePost } from '../types';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';
import UserAvatar from './UserAvatar';

const TrendingCarousel: React.FC = () => {
  const { posts, profilePosts, votes, boards } = useData();
  const { getUserById } = useAuth();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const getPostScore = useCallback((postId: string) => {
    return votes
      .filter(v => v.entityId === postId)
      .reduce((acc, vote) => acc + (vote.type === 'up' ? 1 : -1), 0);
  }, [votes]);

  const trendingPosts = useMemo(() => {
    const allPosts: (Post | ProfilePost)[] = [...posts, ...profilePosts];
    
    return allPosts
      .map(post => ({ post, score: getPostScore(post.id) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10) // Fetch more posts for a scrolling view
      .map(item => item.post);
  }, [posts, profilePosts, getPostScore]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
        const scrollAmount = scrollContainerRef.current.offsetWidth * 0.8;
        scrollContainerRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    }
  };

  if (trendingPosts.length === 0) {
    return null;
  }

  const getBackgroundImage = (post: Post | ProfilePost) => {
    if (post.media && post.media.length > 0 && post.media[0].type === 'image') {
        return post.media[0].url;
    }
    // Fallback if no media or media is video/audio
    const match = post.content.match(/<img src="([^"]+)"/); // Legacy check
    return match ? match[1] : `https://picsum.photos/seed/${post.id}/800/400`;
  };

  return (
    <div className="relative group">
        <div 
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto pb-2 scroll-smooth scrollbar-hide"
        >
        {trendingPosts.map((post) => {
            const author = post.authorId ? getUserById(post.authorId) : undefined;
            const isBoardPost = 'boardId' in post;
            const board = isBoardPost ? boards.find(b => b.id === (post as Post).boardId) : undefined;
            const postLink = isBoardPost && board 
                ? `/b/${board.name}/post/${post.id}` 
                : (author ? `/u/${author.username}/post/${post.id}` : '#');

            return (
            <Link to={postLink} key={post.id} className="block w-72 h-80 flex-shrink-0 relative rounded-md overflow-hidden bg-white border border-gray-200 shadow-sm">
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-300 ease-in-out group-hover:scale-105"
                    style={{ backgroundImage: `url(${getBackgroundImage(post)})` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                </div>
                <div className="relative p-3 flex flex-col justify-end h-full text-white">
                    <h3 className="text-md font-bold mb-1 line-clamp-2 leading-tight">
                        {post.title}
                    </h3>
                    <div className="text-xs opacity-90 flex items-center">
                        <UserAvatar user={author} className="w-4 h-4 mr-1.5" />
                        <span>u/{author?.username || 'anonymous'}</span>
                    </div>
                </div>
            </Link>
            );
        })}
        </div>

        <button onClick={() => scroll('left')} className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-sm text-gray-700 p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none border border-gray-200 hover:bg-white">
            <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <button onClick={() => scroll('right')} className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 bg-white/80 backdrop-blur-sm text-gray-700 p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none border border-gray-200 hover:bg-white">
            <ChevronRightIcon className="w-6 h-6" />
        </button>

        <style>{`
            .scrollbar-hide::-webkit-scrollbar {
                display: none;
            }
            .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }
            .line-clamp-2 {
                overflow: hidden;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 2;
            }
        `}</style>
    </div>
  );
};

export default TrendingCarousel;
