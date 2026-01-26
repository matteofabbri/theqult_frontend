
import React, { useEffect } from 'react';
import type { Advertisement } from '../types';
import { useData } from '../hooks/useStore';

interface AdUnitProps {
  ad: Advertisement;
  placement: 'banner' | 'sidebar';
}

const AdUnit: React.FC<AdUnitProps> = ({ ad, placement }) => {
  const { trackAdImpression, trackAdClick } = useData();

  useEffect(() => {
    // Basic impression tracking on mount
    trackAdImpression(ad.id);
  }, [ad.id, trackAdImpression]);

  const handleClick = () => {
    trackAdClick(ad.id);
  };

  if (placement === 'banner') {
    return (
      <div className="bg-white border border-gray-200 rounded-md p-2 mb-4 flex items-center justify-between shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 bg-gray-200 text-[10px] text-gray-500 px-1 rounded-bl">Sponsored</div>
        <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" onClick={handleClick} className="flex items-center gap-4 w-full h-20">
             {ad.imageUrl && (
                 <img src={ad.imageUrl} alt={ad.title} className="h-full w-24 object-cover rounded bg-gray-100 flex-shrink-0" />
             )}
             <div className="flex-1 overflow-hidden">
                 <h4 className="font-bold text-gray-900 truncate">{ad.title}</h4>
                 <p className="text-sm text-gray-600 line-clamp-2">{ad.content}</p>
             </div>
             <div className="px-4">
                 <span className="text-primary font-semibold text-sm group-hover:underline">Open</span>
             </div>
        </a>
      </div>
    );
  }

  // Sidebar Placement
  return (
    <div className="bg-white border border-gray-200 rounded-md p-3 mb-4 shadow-sm relative overflow-hidden group">
        <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Advertisement</span>
        </div>
        <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" onClick={handleClick} className="block">
             {ad.imageUrl && (
                 <img src={ad.imageUrl} alt={ad.title} className="w-full h-32 object-cover rounded mb-2 bg-gray-100" />
             )}
             <h4 className="font-bold text-gray-900 leading-tight mb-1 group-hover:text-primary">{ad.title}</h4>
             <p className="text-sm text-gray-600 line-clamp-3">{ad.content}</p>
        </a>
    </div>
  );
};

export default AdUnit;
