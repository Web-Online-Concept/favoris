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
      <div className="container mx-auto px-4 py-8">
        {/* Header avec logo et titre centré sur mobile */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2 md:gap-3 flex-1 md:flex-initial justify-center md:justify-start">
            {/* Logo SVG inline */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 32 32"
              className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0"
            >
              {/* Dégradé pour un effet plus moderne */}
              <defs>
                <linearGradient id="globeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#3b82f6',stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:'#1e40af',stopOpacity:1}} />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#60a5fa',stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:'#2563eb',stopOpacity:1}} />
                </linearGradient>
              </defs>
              
              {/* Cercle principal avec dégradé */}
              <circle cx="16" cy="16" r="14" fill="url(#globeGradient)" opacity="0.1"/>
              <circle cx="16" cy="16" r="14" fill="none" stroke="url(#globeGradient)" strokeWidth="2"/>
              
              {/* Méridiens verticaux */}
              <ellipse cx="16" cy="16" rx="6" ry="14" fill="none" stroke="url(#lineGradient)" strokeWidth="1.5" opacity="0.8"/>
              <ellipse cx="16" cy="16" rx="11" ry="14" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.6"/>
              
              {/* Parallèles horizontaux */}
              <ellipse cx="16" cy="16" rx="14" ry="5" fill="none" stroke="url(#lineGradient)" strokeWidth="1.5" opacity="0.8"/>
              <line x1="2" y1="16" x2="30" y2="16" stroke="#2563eb" strokeWidth="1.5" opacity="0.9"/>
              <ellipse cx="16" cy="16" rx="12" ry="10" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.6"/>
              
              {/* Effet de brillance amélioré */}
              <ellipse cx="11" cy="8" rx="6" ry="4" fill="#93c5fd" opacity="0.3"/>
              <ellipse cx="13" cy="9" rx="3" ry="2" fill="#dbeafe" opacity="0.5"/>
            </svg>
            
            <h1 className="text-lg md:text-3xl font-bold text-gray-900">
              <span className="hidden md:inline">favoris.pro : Les meilleurs sites pour vos paris sportifs</span>
              <span className="md:hidden">favoris.pro</span>
            </h1>
          </div>
          
          {/* Lien Admin caché sur mobile */}
          <Link
            href="/admin"
            className="text-sm text-gray-500 hover:text-gray-700 hidden md:block"
          >
            Admin
          </Link>
        </div>

        {/* Barre de recherche cachée sur mobile */}
        <div className="hidden md:block">
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Rechercher dans les favoris..."
          />
        </div>
        
        {/* Filtres de catégories - Desktop */}
        <div className="hidden md:block">
          <CategoryFilter 
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>

        {/* Menu déroulant pour mobile */}
        <div className="md:hidden mb-6">
          <div className="relative">
            <button
              onClick={() => setShowMobileCategories(!showMobileCategories)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm text-left flex justify-between items-center"
            >
              <span className="font-medium">
                {activeCategory || 'Toutes les catégories'}
              </span>
              <svg 
                className={`w-5 h-5 transition-transform ${showMobileCategories ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showMobileCategories && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg">
                <button
                  onClick={() => handleCategoryChange('')}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 ${
                    activeCategory === '' ? 'bg-blue-50 text-blue-600 font-medium' : ''
                  }`}
                >
                  Toutes les catégories
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-t border-gray-100 ${
                      activeCategory === category ? 'bg-blue-50 text-blue-600 font-medium' : ''
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

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