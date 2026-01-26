
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from './Icons';
import type { MediaItem } from '../types';

interface PostMediaProps {
  media: MediaItem[];
  postLink?: string; // If provided, clicking navigates to this link (Preview Mode)
  compact?: boolean; // Use compact layout (e.g. for messages)
}

const PostMedia: React.FC<PostMediaProps> = ({ media, postLink, compact = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!media || media.length === 0) return null;

  // CSS classes based on mode
  const containerMargin = compact ? 'mt-1' : 'mt-4';
  const splitViewHeight = compact ? 'h-[200px]' : 'h-[400px]';
  const carouselHeight = compact ? 'h-[300px]' : 'h-[500px]';
  const singleMediaMaxHeight = compact ? 'max-h-[300px]' : 'max-h-[600px]';

  // Helper to render non-interactive previews (for Single Item Preview & Split View)
  const renderPreviewContent = (item: MediaItem) => {
      if (item.type === 'image') {
          return <img src={item.url} alt="media preview" className="w-full h-full object-cover" />;
      }
      if (item.type === 'video') {
          return (
            <div className="w-full h-full relative">
                <video src={item.url} className="w-full h-full object-cover pointer-events-none" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center border-2 border-white">
                        <div className="ml-1 w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent"></div>
                    </div>
                </div>
            </div>
          );
      }
      if (item.type === 'audio') {
          return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-4">
                <div className="bg-orange-100 p-6 rounded-full mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
                </div>
                <p className="text-gray-500 font-medium">Audio Clip</p>
            </div>
          );
      }
      return null;
  };

  // Helper to render the Split View UI (Visuals only)
  const renderSplitViewUI = () => {
      const firstItem = media[0];
      return (
        <div className="flex h-full w-full">
            {/* Left Side (75%) */}
            <div className="w-[75%] h-full bg-gray-100 relative border-r border-gray-200 overflow-hidden">
                {renderPreviewContent(firstItem)}
                {!postLink && <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>}
            </div>

            {/* Right Side (25%) */}
            <div className="w-[25%] h-full bg-gray-50 flex flex-col items-center justify-center text-center p-2 hover:bg-gray-100 transition-colors">
                <span className={`${compact ? 'text-xl' : 'text-3xl md:text-4xl'} font-bold text-gray-800 mb-1`}>{media.length}</span>
                <span className="text-[10px] md:text-xs text-gray-500 font-semibold uppercase tracking-wider">Total</span>
                <span className={`mt-2 ${compact ? 'text-[10px] px-2' : 'text-xs px-3'} text-primary font-bold bg-primary/10 py-1 rounded-full`}>View All</span>
            </div>
        </div>
      );
  };


  // --- PREVIEW MODE (Navigation) ---
  if (postLink) {
      // If we are in a feed, we want to click to navigate.
      // We render non-interactive previews for Video/Audio so clicks go to the Link.
      
      const isSingle = media.length === 1;
      
      return (
        <Link 
            to={postLink} 
            className={`block ${containerMargin} rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all ${isSingle ? `max-h-[500px] flex justify-center bg-black/5` : 'h-[400px]'}`}
        >
            {isSingle ? (
                 media[0].type === 'image' ? (
                     <img src={media[0].url} alt="post content" className="max-w-full max-h-[500px] object-contain" />
                 ) : (
                     // For Video/Audio in preview, use the visual placeholder logic so clicking navigates instead of playing
                     <div className="w-full h-full min-h-[300px]">
                        {renderPreviewContent(media[0])}
                     </div>
                 )
            ) : (
                renderSplitViewUI()
            )}
        </Link>
      );
  }


  // --- DETAIL / INTERACTIVE MODE ---

  // 1. Single Item View (Interactive)
  if (media.length === 1) {
    const item = media[0];
    return (
      <div className={`${containerMargin} rounded-lg overflow-hidden bg-black/5 border border-gray-200 flex justify-center`}>
        {item.type === 'image' && <img src={item.url} alt="post content" className={`max-w-full ${singleMediaMaxHeight} object-contain`} />}
        {item.type === 'video' && <video src={item.url} controls className={`max-w-full ${singleMediaMaxHeight}`} />}
        {item.type === 'audio' && <audio src={item.url} controls className="w-full p-4" />}
      </div>
    );
  }

  // 2. Split View (Collapsed, Click to Expand)
  if (!isExpanded) {
      return (
          <div 
            className={`${containerMargin} ${splitViewHeight} border border-gray-200 rounded-lg overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-all`}
            onClick={() => setIsExpanded(true)}
            title="Click to view all media"
          >
              {renderSplitViewUI()}
          </div>
      )
  }

  // 3. Full Carousel View (Expanded)
  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };
  
  const currentItem = media[currentIndex];

  return (
    <div className={`${containerMargin} relative bg-black rounded-lg border border-gray-800 overflow-hidden group ${carouselHeight}`}>
       
       {/* Close / Collapse Button */}
       <button 
         onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
         className="absolute top-4 right-4 z-20 bg-black/50 text-white p-2 rounded-full hover:bg-black/80 transition-colors"
         title="Close Gallery"
       >
           <CloseIcon className="w-6 h-6" />
       </button>

       {/* Main Content Area */}
       <div className="w-full h-full flex items-center justify-center bg-black">
            {currentItem?.type === 'image' && (
                <img src={currentItem.url} alt={`slide ${currentIndex}`} className="w-full h-full object-contain" />
            )}
            {currentItem?.type === 'video' && (
                <video src={currentItem.url} controls className="w-full h-full object-contain" />
            )}
            {currentItem?.type === 'audio' && (
                <div className="w-full p-12 bg-gray-900 flex items-center justify-center h-full">
                        <audio src={currentItem.url} controls className="w-full max-w-md" />
                </div>
            )}
       </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors"
      >
        <ChevronLeftIcon className="w-8 h-8" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors"
      >
        <ChevronRightIcon className="w-8 h-8" />
      </button>

      {/* Indicators / Counter */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center pointer-events-none">
          <div className="bg-black/60 px-4 py-1 rounded-full text-white text-sm font-medium backdrop-blur-sm">
              {currentIndex + 1} / {media.length}
          </div>
      </div>
    </div>
  );
};

export default PostMedia;
