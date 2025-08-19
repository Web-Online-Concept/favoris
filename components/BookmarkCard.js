'use client';

export default function BookmarkCard({ bookmark, isAdmin, onEdit, onDelete }) {
  const handleCardClick = (e) => {
    // Ne pas ouvrir le lien si on clique sur les boutons admin
    if (e.target.closest('button')) {
      e.preventDefault();
      return;
    }
    
    if (!isAdmin) {
      window.open(bookmark.url, '_blank');
    }
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-3 hover:shadow-lg transition-shadow ${!isAdmin ? 'cursor-pointer' : ''}`}
      onClick={handleCardClick}
    >
      <div className="flex items-start gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={bookmark.logoUrl || '/default-favicon.png'} 
          alt={bookmark.title}
          className="w-10 h-10 rounded"
          onError={(e) => {
            e.target.src = '/default-favicon.png';
          }}
        />
        <div className="flex-1">
          <h3 className="font-semibold text-base text-blue-600">
            {bookmark.title}
          </h3>
          {bookmark.description && (
            <p className="text-gray-600 text-xs mt-1 line-clamp-2">{bookmark.description}</p>
          )}
        </div>
        {isAdmin && (
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(bookmark);
              }}
              className="text-blue-600 hover:text-blue-800 p-1 text-sm"
            >
              ✏️
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(bookmark.id);
              }}
              className="text-red-600 hover:text-red-800 p-1 text-sm"
            >
              🗑️
            </button>
          </div>
        )}
      </div>
    </div>
  );
}