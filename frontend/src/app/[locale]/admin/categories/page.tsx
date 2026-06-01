'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Plus, Trash2, Tag, Edit2, X, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Category {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export default function AdminCategories() {
  const user = useAuthStore((state) => state.user);
  const t = useTranslations('AdminCategories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryNameKm, setNewCategoryNameKm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryNameKm, setEditCategoryNameKm] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/categories', {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchCategories();
  }, [user]);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch('http://localhost:5000/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({ name: newCategoryName, nameKm: newCategoryNameKm })
      });
      
      if (res.ok) {
        setNewCategoryName('');
        setNewCategoryNameKm('');
        fetchCategories();
      } else {
        const data = await res.json();
        setErrorMsg(data.message || t('failed_create'));
      }
    } catch (err: any) {
      setErrorMsg(err.message || t('failed_create'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editCategoryName.trim()) return;

    try {
      const res = await fetch(`http://localhost:5000/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({ name: editCategoryName, nameKm: editCategoryNameKm })
      });
      
      if (res.ok) {
        setEditingCategory(null);
        setEditCategoryName('');
        setEditCategoryNameKm('');
        fetchCategories();
      } else {
        const data = await res.json();
        alert(data.message || t('failed_update'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm(t('confirm_delete'))) return;

    try {
      const res = await fetch(`http://localhost:5000/api/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      
      if (res.ok) {
        setCategories(categories.filter(c => c._id !== id));
      } else {
        const data = await res.json();
        alert(data.message || t('failed_delete'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('title')}</h2>
      </div>

      <div className="bg-white dark:bg-[#111111] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
        {errorMsg && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg font-medium border border-red-200 dark:border-red-800/50">
            {errorMsg}
          </div>
        )}
        <form onSubmit={handleCreateCategory} className="mb-8">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('create_new')}</label>
          <div className="flex gap-4">
            <input
              type="text"
              required
              placeholder="Name (EN)"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#E84C3D] outline-none"
            />
            <input
              type="text"
              placeholder="ឈ្មោះ (KM)"
              value={newCategoryNameKm}
              onChange={(e) => setNewCategoryNameKm(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#E84C3D] outline-none"
            />
            <button
              type="submit"
              disabled={submitting || !newCategoryName.trim()}
              className="bg-[#E84C3D] text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              <Plus size={20} />
              {submitting ? t('adding') : t('add')}
            </button>
          </div>
        </form>

        <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('existing')}</h3>
          
          {loading ? (
            <p className="text-gray-500 dark:text-gray-400">{t('loading')}</p>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">{t('no_categories')}</h3>
              <p className="text-gray-500 dark:text-gray-400">{t('no_categories_desc')}</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {categories.map((category) => (
                <div key={category._id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-[#E84C3D] shrink-0">
                      <Tag size={20} />
                    </div>
                    {editingCategory?._id === category._id ? (
                      <div className="flex-1 flex gap-2 max-w-sm">
                        <input
                          type="text"
                          placeholder="Name (EN)"
                          value={editCategoryName}
                          onChange={(e) => setEditCategoryName(e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#111111] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#E84C3D] outline-none"
                          autoFocus
                        />
                        <input
                          type="text"
                          placeholder="ឈ្មោះ (KM)"
                          value={editCategoryNameKm}
                          onChange={(e) => setEditCategoryNameKm(e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#111111] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#E84C3D] outline-none"
                        />
                        <button
                          onClick={() => handleUpdateCategory(category._id)}
                          className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
                          title={t('save')}
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => setEditingCategory(null)}
                          className="p-1.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md transition-colors"
                          title={t('cancel')}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {category.name} <span className="text-gray-500 text-sm font-normal">{(category as any).nameKm ? ` / ${(category as any).nameKm}` : ''}</span>
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">/{category.slug}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {editingCategory?._id !== category._id && (
                      <button
                        onClick={() => {
                          setEditingCategory(category);
                          setEditCategoryName(category.name);
                          setEditCategoryNameKm((category as any).nameKm || '');
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title={t('edit')}
                      >
                        <Edit2 size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteCategory(category._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title={t('delete')}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
