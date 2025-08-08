'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CategoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [categoryOrder, setCategoryOrder] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/admin');
      return;
    }
    fetchCategories();
    loadCategoryOrder();
  }, [session, status, router]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data.categories);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setLoading(false);
    }
  };

  const loadCategoryOrder = () => {
    const saved = localStorage.getItem('categoryOrder');
    if (saved) {
      setCategoryOrder(JSON.parse(saved));
    }
  };

  const saveCategoryOrder = (newOrder) => {
    setCategoryOrder(newOrder);
    localStorage.setItem('categoryOrder', JSON.stringify(newOrder));
  };

  const moveCategory = (index, direction) => {
    const newOrder = [...categoryOrder];
    const temp = newOrder[index];
    
    if (direction === 'up' && index > 0) {
      newOrder[index] = newOrder[index - 1];
      newOrder[index - 1] = temp;
    } else if (direction === 'down' && index < newOrder.length - 1) {
      newOrder[index] = newOrder[index + 1];
      newOrder[index + 1] = temp;
    }
    
    saveCategoryOrder(newOrder);
  };

  const handleRename = async (oldName) => {
    if (!newName || newName === oldName) {
      setEditingCategory(null);
      setNewName('');
      return;
    }

    try {
      const res = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldName, newName }),
      });

      if (res.ok) {
        // Mettre à jour l'ordre des catégories
        const updatedOrder = categoryOrder.map(cat => 
          cat === oldName ? newName : cat
        );
        saveCategoryOrder(updatedOrder);
        
        fetchCategories();
        setEditingCategory(null);
        setNewName('');
      }
    } catch (error) {
      console.error('Error renaming category:', error);
      alert('Erreur lors du renommage');
    }
  };

  const handleDelete = async (category) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category}" et tous ses favoris ?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/categories?category=${encodeURIComponent(category)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Retirer de l'ordre des catégories
        const updatedOrder = categoryOrder.filter(cat => cat !== category);
        saveCategoryOrder(updatedOrder);
        
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Erreur lors de la suppression');
    }
  };

  // Organiser les catégories selon l'ordre sauvegardé
  const orderedCategories = [
    ...categoryOrder.filter(cat => categories.includes(cat)),
    ...categories.filter(cat => !categoryOrder.includes(cat))
  ];

  // Sauvegarder l'ordre si de nouvelles catégories apparaissent
  useEffect(() => {
    if (orderedCategories.length > 0 && orderedCategories.length !== categoryOrder.length) {
      saveCategoryOrder(orderedCategories);
    }
  }, [orderedCategories.length, categoryOrder.length]);

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gestion des Catégories</h1>
          <div className="flex gap-4">
            <Link
              href="/admin"
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Retour Admin
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-6">
            Gérez l&apos;ordre, renommez ou supprimez vos catégories. L&apos;ordre défini ici sera utilisé sur le site.
          </p>

          <div className="space-y-3">
            {orderedCategories.map((category, index) => (
              <div
                key={category}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveCategory(index, 'up')}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveCategory(index, 'down')}
                      disabled={index === orderedCategories.length - 1}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ▼
                    </button>
                  </div>

                  {editingCategory === category ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleRename(category);
                      }}
                      className="flex gap-2 flex-1"
                    >
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="flex-1 px-3 py-1 border rounded"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="text-green-600 hover:text-green-700"
                      >
                        ✓
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(null);
                          setNewName('');
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        ✗
                      </button>
                    </form>
                  ) : (
                    <span className="font-medium text-lg">{category}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingCategory(category);
                      setNewName(category);
                    }}
                    className="text-blue-600 hover:text-blue-700 p-2"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(category)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {orderedCategories.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              Aucune catégorie trouvée. Ajoutez des favoris pour créer des catégories.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}