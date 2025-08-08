'use client';

import { useState, useEffect } from 'react';
import BookmarkCard from '@/components/BookmarkCard';
import CategoryFilter from '@/components/CategoryFilter';
import SearchBar from '@/components/SearchBar';
import Link from 'next/link';

export default function Home() {
  const [bookmarks, setBookmarks] = useState([]);
  const [allBookmarks, setAllBookmarks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      performSearch(searchQuery);
    } else {
      setBookmarks(allBookmarks);
    }
  }, [searchQuery, allBookmarks]);

  const fetchBookmarks = async () => {
    try {
      const res = await fetch('/api/bookmarks');
      const data = await res.json();
      setBookmarks(data.bookmarks);
      setAllBookmarks(data.bookmarks);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(data.bookmarks.map(b => b.category))];
      setCategories(uniqueCategories.sort());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      setLoading(false);
    }
  };

  const performSearch = async (query) => {
    try {
      const res = await fetch(`/api/bookmarks?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      setBookmarks(data.bookmarks);
    } catch (error) {
      console.error('Error searching bookmarks:', error);
    }
  };

  const filteredBookmarks = activeCategory 
    ? bookmarks.filter(b => b.category === activeCategory)
    : bookmarks;

  const groupedBookmarks = filteredBookmarks.reduce((acc, bookmark) => {
    if (!acc[bookmark.category]) {
      acc[bookmark.category] = [];
    }
    acc[bookmark.category].push(bookmark);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des favoris...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">favoris.pro : Les meilleurs sites pour vos paris sportifs</h1>
          <Link
            href="/admin"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Admin
          </Link>
        </div>

        <SearchBar 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Rechercher dans les favoris..."
        />
        
        <CategoryFilter 
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {searchQuery && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {filteredBookmarks.length} résultat{filteredBookmarks.length !== 1 ? 's' : ''} pour "{searchQuery}"
            </p>
          </div>
        )}

        {Object.entries(groupedBookmarks)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([category, categoryBookmarks]) => (
            <div key={category} className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryBookmarks.map((bookmark) => (
                  <BookmarkCard 
                    key={bookmark.id} 
                    bookmark={bookmark}
                    isAdmin={false}
                  />
                ))}
              </div>
            </div>
          ))}

        {filteredBookmarks.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">
              {searchQuery 
                ? `Aucun résultat pour "${searchQuery}"`
                : 'Aucun favori trouvé dans cette catégorie.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}