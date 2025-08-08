'use client';

export default function BookmarkList({ bookmark }) {
  return (
    <div className="py-2 hover:bg-gray-50 transition-colors">
      <a 
        href={bookmark.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-3"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={bookmark.logoUrl || '/default-favicon.png'} 
          alt={bookmark.title}
          className="w-6 h-6 rounded flex-shrink-0"
          onError={(e) => {
            e.target.src = '/default-favicon.png';
          }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-blue-600 hover:text-blue-800 truncate">
            {bookmark.title}
          </h3>
          {bookmark.description && (
            <p className="text-xs text-gray-500 truncate">{bookmark.description}</p>
          )}
        </div>
        <span className="text-xs text-gray-400 flex-shrink-0">
          {bookmark.category}
        </span>
      </a>
    </div>
  );
}