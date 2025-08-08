'use client';

import { useState, useEffect } from 'react';

export default function BookmarkForm({ bookmark, onSubmit, onCancel, existingCategories = [] }) {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category: '',
    logoUrl: '',
    order: 0,
  });
  const [useNewCategory, setUseNewCategory] = useState(false);

  useEffect(() => {
    if (bookmark) {
      setFormData(bookmark);
      // Vérifier si la catégorie existe déjà
      setUseNewCategory(!existingCategories.includes(bookmark.category));
    }
  }, [bookmark, existingCategories]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
      <div>
        <label className="block text-sm font-medium text-gray-700">Titre</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">URL</label>
        <input
          type="url"
          required
          value={formData.url}
          onChange={(e) => setFormData({...formData, url: e.target.value})}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
          rows="3"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Catégorie</label>
        
        <div className="mt-1 space-y-2">
          {existingCategories.length > 0 && (
            <div className="flex items-center">
              <input
                type="radio"
                id="existing"
                name="categoryType"
                checked={!useNewCategory}
                onChange={() => setUseNewCategory(false)}
                className="mr-2"
              />
              <label htmlFor="existing" className="text-sm">Catégorie existante</label>
            </div>
          )}
          
          {!useNewCategory && existingCategories.length > 0 && (
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
              required
            >
              <option value="">Sélectionner une catégorie</option>
              {existingCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}

          <div className="flex items-center">
            <input
              type="radio"
              id="new"
              name="categoryType"
              checked={useNewCategory || existingCategories.length === 0}
              onChange={() => setUseNewCategory(true)}
              className="mr-2"
            />
            <label htmlFor="new" className="text-sm">Nouvelle catégorie</label>
          </div>

          {(useNewCategory || existingCategories.length === 0) && (
            <input
              type="text"
              required
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
              placeholder="ex: Paris Sportifs, Pronostics..."
            />
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">URL du logo (optionnel)</label>
        <input
          type="url"
          value={formData.logoUrl}
          onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
          placeholder="Laissez vide pour utiliser le favicon automatiquement"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Ordre d'affichage</label>
        <input
          type="number"
          value={formData.order}
          onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
          placeholder="0"
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          {bookmark ? 'Mettre à jour' : 'Ajouter'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}