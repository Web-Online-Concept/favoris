'use client';

import { useState, useEffect } from 'react';
import BookmarkCard from '@/components/BookmarkCard';
import BookmarkIcon from '@/components/BookmarkIcon';
import BookmarkList from '@/components/BookmarkList';
import ViewModeSelector from '@/components/ViewModeSelector';
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
  const [collapsedCategories, setCollapsedCategories] = useState(() => {
    // Charger l'état des catégories repliées depuis localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('collapsedCategories');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  // État pour le mode d'affichage
  const [viewMode, setViewMode] = useState(() => {
    // Vérifier d'abord localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bookmarkViewMode');
      if (saved) return saved;
    }
    // Sinon, utiliser les valeurs par défaut selon l'appareil
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'icons'; // Mobile par défaut
    }
    return 'cards'; // Desktop par défaut
  });

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
      
      // Extract unique categories en préservant l'ordre
      const uniqueCategories = [];
      data.bookmarks.forEach(bookmark => {
        if (!uniqueCategories.includes(bookmark.category)) {
          uniqueCategories.push(bookmark.category);
        }
      });
      setCategories(uniqueCategories);
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

  // Créer un array ordonné des catégories basé sur l'ordre des bookmarks
  const orderedCategories = [];
  filteredBookmarks.forEach(bookmark => {
    if (!orderedCategories.includes(bookmark.category)) {
      orderedCategories.push(bookmark.category);
    }
  });

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setShowMobileCategories(false);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('bookmarkViewMode', mode);
  };

  const toggleCategory = (category) => {
    setCollapsedCategories(prev => {
      const newCollapsed = prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category];
      
      // Sauvegarder dans localStorage
      localStorage.setItem('collapsedCategories', JSON.stringify(newCollapsed));
      return newCollapsed;
    });
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
      <div className="hidden md:block bg-blue-50 border-b border-blue-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          {/* Flex avec colonnes fixes */}
          <div className="flex items-center justify-between mb-2">
            {/* Colonne gauche - largeur fixe */}
            <div className="w-64">
              <SearchBar 
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Rechercher..."
                compact={true}
              />
            </div>
            
            {/* Colonne centre - flexible */}
            <div className="flex-1 flex items-center justify-center gap-3">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 32 32"
                className="w-8 h-8 flex-shrink-0"
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
              <h1 className="text-2xl font-bold text-gray-800 whitespace-nowrap">
                favoris.pro : Les meilleurs sites pour vos paris sportifs
              </h1>
            </div>
            
            {/* Colonne droite - largeur fixe */}
            <div className="w-64 flex items-center justify-end gap-4">
              <ViewModeSelector viewMode={viewMode} onChange={handleViewModeChange} />
              <Link
                href="/admin"
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Admin
              </Link>
            </div>
          </div>
          
          {/* Catégories centrées */}
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
      <div className="md:hidden bg-white shadow-md sticky top-0 z-50">
        <div className="px-4 py-4">
          {/* Titre stylisé mobile */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
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
            <ViewModeSelector viewMode={viewMode} onChange={handleViewModeChange} />
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

        {orderedCategories.map((category) => (
          <div key={category} className="mb-8">
            {/* Titre de catégorie cliquable avec bande design sur desktop */}
            <div className="mb-6">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full md:bg-gradient-to-r md:from-blue-600 md:via-blue-500 md:to-indigo-600 md:p-4 md:rounded-xl md:shadow-lg md:relative md:overflow-hidden group hover:md:shadow-xl transition-all text-left cursor-pointer hover:md:scale-[1.02]"
              >
                {/* Effet de brillance */}
                <div className="hidden md:block md:absolute md:inset-0 md:bg-gradient-to-r md:from-transparent md:via-white md:to-transparent md:opacity-10 md:-skew-x-12"></div>
                {/* Motif décoratif */}
                <div className="hidden md:block md:absolute md:top-0 md:right-0 md:w-32 md:h-32 md:bg-white md:opacity-5 md:rounded-full md:-mr-16 md:-mt-16"></div>
                <div className="hidden md:block md:absolute md:bottom-0 md:left-0 md:w-24 md:h-24 md:bg-white md:opacity-5 md:rounded-full md:-ml-12 md:-mb-12"></div>
                <div className="flex items-center justify-between md:justify-center md:relative md:z-10">
                  <h2 className="text-2xl font-bold text-gray-800 md:text-white">
                    {category}
                  </h2>
                  <svg 
                    className={`w-6 h-6 text-gray-600 md:text-white md:absolute md:right-4 transition-transform ${
                      collapsedCategories.includes(category) ? '' : 'rotate-180'
                    }`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
            </div>
            
            {/* Contenu avec animation de repli/dépli */}
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
              collapsedCategories.includes(category) ? 'max-h-0' : 'max-h-[5000px]'
            }`}>
              {/* Vue Cartes - MODIFIÉ POUR 4 COLONNES */}
              {viewMode === 'cards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {groupedBookmarks[category].map((bookmark) => (
                    <BookmarkCard 
                      key={bookmark.id} 
                      bookmark={bookmark}
                      isAdmin={false}
                    />
                  ))}
                </div>
              )}
              
              {/* Vue Liste */}
              {viewMode === 'list' && (
                <div className="bg-white rounded-lg shadow-md divide-y divide-gray-100">
                  {groupedBookmarks[category].map((bookmark) => (
                    <BookmarkList 
                      key={bookmark.id} 
                      bookmark={bookmark}
                    />
                  ))}
                </div>
              )}
              
              {/* Vue Icônes */}
              {viewMode === 'icons' && (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                  {groupedBookmarks[category].map((bookmark) => (
                    <BookmarkIcon 
                      key={bookmark.id} 
                      bookmark={bookmark}
                    />
                  ))}
                </div>
              )}
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