'use client';

import { useState, useEffect } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import BookmarkCard from '@/components/BookmarkCard';
import BookmarkForm from '@/components/BookmarkForm';
import CategoryFilter from '@/components/CategoryFilter';
import Link from 'next/link';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [bookmarks, setBookmarks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      fetchBookmarks();
    }
  }, [session]);

  const fetchBookmarks = async () => {
    try {
      const res = await fetch('/api/bookmarks');
      const data = await res.json();
      setBookmarks(data.bookmarks);
      
      const uniqueCategories = [...new Set(data.bookmarks.map(b => b.category))];
      setCategories(uniqueCategories.sort());
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await signIn('credentials', { 
      password, 
      redirect: false 
    });
    setLoading(false);
    
    if (result?.error) {
      alert('Mot de passe incorrect');
    }
    setPassword('');
  };

  const handleSubmit = async (formData) => {
    try {
      const method = editingBookmark ? 'PUT' : 'POST';
      const url = editingBookmark 
        ? `/api/bookmarks?id=${editingBookmark.id}`
        : '/api/bookmarks';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchBookmarks();
        setShowForm(false);
        setEditingBookmark(null);
      } else {
        const error = await res.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving bookmark:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce favori ?')) {
      try {
        const res = await fetch(`/api/bookmarks?id=${id}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          fetchBookmarks();
        } else {
          const error = await res.json();
          alert(`Erreur: ${error.error}`);
        }
      } catch (error) {
        console.error('Error deleting bookmark:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full">
          <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Connexion Admin</h2>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="w-full p-3 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
            <Link 
              href="/" 
              className="block text-center mt-4 text-sm text-gray-600 hover:text-gray-800"
            >
              Retour aux favoris
            </Link>
          </form>
        </div>
      </div>
    );
  }

  const filteredBookmarks = activeCategory 
    ? bookmarks.filter(b => b.category === activeCategory)
    : bookmarks;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Administration des Favoris</h1>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setShowForm(true);
                setEditingBookmark(null);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              + Ajouter un favori
            </button>
            <Link
              href="/"
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Voir le site
            </Link>
            <Link
              href="/admin/categories"
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Gérer les catégories
            </Link>
            <button
              onClick={() => signOut()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {showForm && (
          <div className="mb-8 max-w-2xl">
            <BookmarkForm
              bookmark={editingBookmark}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingBookmark(null);
              }}
              existingCategories={categories}
            />
          </div>
        )}

        <CategoryFilter 
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              isAdmin={true}
              onEdit={(bookmark) => {
                setEditingBookmark(bookmark);
                setShowForm(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {filteredBookmarks.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">Aucun favori trouvé dans cette catégorie.</p>
          </div>
        )}
      </div>
    </div>
  );
}