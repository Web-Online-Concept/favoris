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
  const [showMobileCategories, setShowMobileCategories] = useState(false);

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

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setShowMobileCategories(false);
  };

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
      {/* Header Desktop avec bande de fond */}
      <div className="hidden md:block bg-blue-50 border-b border-blue-100 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          {/* Ligne unique avec recherche, titre et admin */}
          <div className="flex items-center justify-between mb-2">
            {/* Barre de recherche à gauche */}
            <div className="w-64 flex items-center h-full">
              <div className="w-full">
                <SearchBar 
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Rechercher..."
                />
              </div>
            </div>
            
            {/* Logo et titre au centre */}
            <div className="flex items-center justify-center gap-3">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 32 32"
                className="w-8 h-8"
              >
                <defs>
                  <linearGradient id="globeGradientDesktop" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor:'#3b82f6',stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor:'#1e40af',stopOpacity:1}} />
                  </linearGradient>
                </defs>
                <circle cx="16" cy="16" r="14" fill="url(#globeGradientDesktop)" opacity="0.1"/>
                <circle cx="16" cy="16" r="14" fill="none" stroke="url(#globeGradientDesktop)" strokeWidth="2"/>
                <ellipse cx="16" cy="16" rx="6" ry="14" fill="none" stroke="#60a5fa" strokeWidth="1.5" opacity="0.8"/>
                <ellipse cx="16" cy="16" rx="11" ry="14" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.6"/>
                <ellipse cx="16" cy="16" rx="14" ry="5" fill="none" stroke="#60a5fa" strokeWidth="1.5" opacity="0.8"/>
                <line x1="2" y1="16" x2="30" y2="16" stroke="#2563eb" strokeWidth="1.5" opacity="0.9"/>
                <ellipse cx="16" cy="16" rx="12" ry="10" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.6"/>
              </svg>
              <h1 className="text-2xl font-bold text-gray-800">
                favoris.pro : Les meilleurs sites pour vos paris sportifs
              </h1>
            </div>
            
            {/* Lien Admin à droite */}
            <div className="w-64 flex items-center justify-end h-full">
              <Link
                href="/admin"
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Admin
              </Link>
            </div>
          </div>
          
          {/* Catégories centrées seules sur leur ligne */}
          <div className="flex justify-center">
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => handleCategoryChange('')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  activeCategory === '' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Toutes
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    activeCategory === category 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Header Mobile */}
      <div className="md:hidden bg-white shadow-md sticky top-0 z-10">
        <div className="px-4 py-4">
          {/* Titre stylisé mobile */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 32 32"
              className="w-8 h-8"
            >
              <defs>
                <linearGradient id="globeGradientMobile" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#3b82f6',stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:'#1e40af',stopOpacity:1}} />
                </linearGradient>
              </defs>
              <circle cx="16" cy="16" r="14" fill="url(#globeGradientMobile)" opacity="0.1"/>
              <circle cx="16" cy="16" r="14" fill="none" stroke="url(#globeGradientMobile)" strokeWidth="2"/>
              <ellipse cx="16" cy="16" rx="6" ry="14" fill="none" stroke="#60a5fa" strokeWidth="1.5" opacity="0.8"/>
              <ellipse cx="16" cy="16" rx="11" ry="14" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.6"/>
              <ellipse cx="16" cy="16" rx="14" ry="5" fill="none" stroke="#60a5fa" strokeWidth="1.5" opacity="0.8"/>
              <line x1="2" y1="16" x2="30" y2="16" stroke="#2563eb" strokeWidth="1.5" opacity="0.9"/>
              <ellipse cx="16" cy="16" rx="12" ry="10" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.6"/>
            </svg>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                favoris
                <span className="text-gray-700 font-bold">.pro</span>
              </h1>
              <p className="text-xs text-gray-500 text-center -mt-1">Paris sportifs</p>
            </div>
          </div>

          {/* Menu déroulant pour mobile */}
          <div className="relative">
            <button
              onClick={() => setShowMobileCategories(!showMobileCategories)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-left flex justify-between items-center"
            >
              <span className="font-medium text-gray-700">
                {activeCategory || 'Toutes les catégories'}
              </span>
              <svg 
                className={`w-5 h-5 transition-transform text-gray-500 ${showMobileCategories ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showMobileCategories && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                <button
                  onClick={() => handleCategoryChange('')}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 ${
                    activeCategory === '' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  Toutes les catégories
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-t border-gray-100 ${
                      activeCategory === category ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        {searchQuery && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {filteredBookmarks.length} résultat{filteredBookmarks.length !== 1 ? 's' : ''} pour &quot;{searchQuery}&quot;
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
                ? `Aucun résultat pour &quot;${searchQuery}&quot;`
                : 'Aucun favori trouvé dans cette catégorie.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}