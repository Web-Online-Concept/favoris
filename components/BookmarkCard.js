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
      className={`bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow ${!isAdmin ? 'cursor-pointer' : ''}`}
      onClick={handleCardClick}
    >
      <div className="flex items-start gap-3">
        <img 
          src={bookmark.logoUrl || '/default-favicon.png'} 
          alt={bookmark.title}
          className="w-12 h-12 rounded"
          onError={(e) => {
            e.target.src = '/default-favicon.png';
          }}
        />
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-blue-600">
            {bookmark.title}
          </h3>
          {bookmark.description && (
            <p className="text-gray-600 text-sm mt-1">{bookmark.description}</p>
          )}
          <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-xs text-gray-700 mt-2">
            {bookmark.category}
          </span>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(bookmark);
              }}
              className="text-blue-600 hover:text-blue-800 p-1"
            >
              ✏️
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(bookmark.id);
              }}
              className="text-red-600 hover:text-red-800 p-1"
            >
              🗑️
            </button>
          </div>
        )}
      </div>
    </div>
  );
}