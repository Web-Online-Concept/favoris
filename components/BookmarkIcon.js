'use client';

import { useState } from 'react';

export default function BookmarkIcon({ bookmark }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = () => {
    window.open(bookmark.url, '_blank');
  };

  return (
    <div className="relative group">
      <button
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={bookmark.logoUrl || '/default-favicon.png'} 
          alt={bookmark.title}
          className="w-12 h-12 rounded"
          onError={(e) => {
            e.target.src = '/default-favicon.png';
          }}
        />
      </button>
      
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap">
          {bookmark.title}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        </div>
      )}
    </div>
  );
}