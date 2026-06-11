'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Plus, Trash2, Tag, Edit2, X, Check, AlertTriangle } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

interface Category {
  _id: string;
  name: string;
  nameKm?: string;
  slug: string;
  createdAt: string;
}

export default function AdminCategories() {
  const user = useAuthStore((state) => state.user);
  const t = useTranslations('AdminCategories');
  const locale = useLocale();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryNameKm, setNewCategoryNameKm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryNameKm, setEditCategoryNameKm] = useState('');
  const [translating, setTranslating] = useState<string | null>(null);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    categoryId: string | null;
    categoryName: string;
    hasProductsError: string | null;
    loading: boolean;
  }>({
    isOpen: false,
    categoryId: null,
    categoryName: '',
    hasProductsError: null,
    loading: false
  });

  const handleTranslate = async (text: string, from: string, to: string, setter: (val: string) => void, fieldId: string) => {
    if (!text.trim()) return;
    setTranslating(fieldId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/translate?text=${encodeURIComponent(text)}&from=${from}&to=${to}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (res.ok && data.translatedText) {
        setter(data.translatedText);
      } else {
        console.error('Translation failed', data.message);
      }
    } catch (err) {
      console.error('Translation error', err);
    } finally {
      setTranslating(null);
    }
  };

  const handleNewCategoryNameBlur = () => {
    if (newCategoryName.trim() && !newCategoryNameKm.trim()) {
      handleTranslate(newCategoryName, 'en', 'km', setNewCategoryNameKm, 'create-km');
    }
  };

  const handleNewCategoryNameKmBlur = () => {
    if (newCategoryNameKm.trim() && !newCategoryName.trim()) {
      handleTranslate(newCategoryNameKm, 'km', 'en', setNewCategoryName, 'create-en');
    }
  };

  const handleEditCategoryNameBlur = (catId: string) => {
    if (editCategoryName.trim() && !editCategoryNameKm.trim()) {
      handleTranslate(editCategoryName, 'en', 'km', setEditCategoryNameKm, `edit-km-${catId}`);
    }
  };

  const handleEditCategoryNameKmBlur = (catId: string) => {
    if (editCategoryNameKm.trim() && !editCategoryName.trim()) {
      handleTranslate(editCategoryNameKm, 'km', 'en', setEditCategoryName, `edit-en-${catId}`);
    }
  };

  const getCategoryName = (category: Category) =>
    locale === 'km' && category.nameKm ? category.nameKm : category.name;
  const getSecondaryCategoryName = (category: Category) =>
    locale === 'km' ? category.name : category.nameKm;

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories`, {
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories`, {
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories/${id}`, {
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

  const openDeleteModal = (category: Category) => {
    setDeleteModal({
      isOpen: true,
      categoryId: category._id,
      categoryName: getCategoryName(category),
      hasProductsError: null,
      loading: false
    });
  };

  const confirmDeleteCategory = async () => {
    if (!deleteModal.categoryId) return;

    setDeleteModal(prev => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories/${deleteModal.categoryId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      
      if (res.ok) {
        setCategories(categories.filter(c => c._id !== deleteModal.categoryId));
        setDeleteModal({
          isOpen: false,
          categoryId: null,
          categoryName: '',
          hasProductsError: null,
          loading: false
        });
      } else {
        const data = await res.json();
        setDeleteModal(prev => ({
          ...prev,
          loading: false,
          hasProductsError: data.message || t('failed_delete')
        }));
      }
    } catch (err) {
      console.error(err);
      setDeleteModal(prev => ({
        ...prev,
        loading: false,
        hasProductsError: t('failed_delete')
      }));
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
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('create_new')}</label>
            <div className="flex gap-4">
              {newCategoryName && !newCategoryNameKm && (
                <button
                  type="button"
                  onClick={() => handleTranslate(newCategoryName, 'en', 'km', setNewCategoryNameKm, 'create-km')}
                  className="text-xs text-[#E84C3D] hover:underline flex items-center gap-1 font-semibold"
                  disabled={translating === 'create-km'}
                >
                  {translating === 'create-km' ? '...' : '✨ Translate to KM'}
                </button>
              )}
              {newCategoryNameKm && !newCategoryName && (
                <button
                  type="button"
                  onClick={() => handleTranslate(newCategoryNameKm, 'km', 'en', setNewCategoryName, 'create-en')}
                  className="text-xs text-[#E84C3D] hover:underline flex items-center gap-1 font-semibold"
                  disabled={translating === 'create-en'}
                >
                  {translating === 'create-en' ? '...' : '✨ Translate to EN'}
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              required
              placeholder="Name (EN)"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onBlur={handleNewCategoryNameBlur}
              className="flex-1 w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#E84C3D] outline-none"
            />
            <input
              type="text"
              placeholder="ឈ្មោះ (KM)"
              value={newCategoryNameKm}
              onChange={(e) => setNewCategoryNameKm(e.target.value)}
              onBlur={handleNewCategoryNameKmBlur}
              className="flex-1 w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#E84C3D] outline-none"
            />
            <button
              type="submit"
              disabled={submitting || !newCategoryName.trim()}
              className="w-full sm:w-auto bg-[#E84C3D] text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
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
                      <div className="flex-1 space-y-2 max-w-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400 font-medium">Edit Category</span>
                          <div className="flex gap-2">
                            {editCategoryName && !editCategoryNameKm && (
                              <button
                                type="button"
                                onClick={() => handleTranslate(editCategoryName, 'en', 'km', setEditCategoryNameKm, `edit-km-${category._id}`)}
                                className="text-[10px] text-[#E84C3D] hover:underline font-semibold"
                                disabled={translating === `edit-km-${category._id}`}
                              >
                                {translating === `edit-km-${category._id}` ? '...' : '✨ to KM'}
                              </button>
                            )}
                            {editCategoryNameKm && !editCategoryName && (
                              <button
                                type="button"
                                onClick={() => handleTranslate(editCategoryNameKm, 'km', 'en', setEditCategoryName, `edit-en-${category._id}`)}
                                className="text-[10px] text-[#E84C3D] hover:underline font-semibold"
                                disabled={translating === `edit-en-${category._id}`}
                              >
                                {translating === `edit-en-${category._id}` ? '...' : '✨ to EN'}
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            placeholder="Name (EN)"
                            value={editCategoryName}
                            onChange={(e) => setEditCategoryName(e.target.value)}
                            onBlur={() => handleEditCategoryNameBlur(category._id)}
                            className="flex-1 w-full px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#111111] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#E84C3D] outline-none"
                            autoFocus
                          />
                          <input
                            type="text"
                            placeholder="ឈ្មោះ (KM)"
                            value={editCategoryNameKm}
                            onChange={(e) => setEditCategoryNameKm(e.target.value)}
                            onBlur={() => handleEditCategoryNameKmBlur(category._id)}
                            className="flex-1 w-full px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#111111] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#E84C3D] outline-none"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateCategory(category._id)}
                            className="flex-1 sm:flex-none p-1.5 flex items-center justify-center text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors border border-green-200 dark:border-green-800 sm:border-transparent"
                            title={t('save')}
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => setEditingCategory(null)}
                            className="flex-1 sm:flex-none p-1.5 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md transition-colors border border-gray-200 dark:border-gray-700 sm:border-transparent"
                            title={t('cancel')}
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {getCategoryName(category)} <span className="text-gray-500 text-sm font-normal">{getSecondaryCategoryName(category) ? ` / ${getSecondaryCategoryName(category)}` : ''}</span>
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
                          setEditCategoryNameKm(category.nameKm || '');
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title={t('edit')}
                      >
                        <Edit2 size={18} />
                      </button>
                    )}
                    <button
                       onClick={() => openDeleteModal(category)}
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
      {/* Custom Delete Confirmation & Error Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 rounded-3xl max-w-md w-full shadow-2xl p-6 relative overflow-hidden transition-all transform scale-100 duration-300">
            {deleteModal.hasProductsError ? (
              // Warning screen (has products)
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-955/20 text-amber-500 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-200 dark:border-amber-800/30">
                  <AlertTriangle size={28} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {locale === 'km' ? 'មិនអាចលុបប្រភេទបានទេ' : 'Cannot Delete Category'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 px-2 whitespace-pre-wrap leading-relaxed">
                  {deleteModal.hasProductsError}
                </p>
                <button
                  type="button"
                  onClick={() => setDeleteModal({ isOpen: false, categoryId: null, categoryName: '', hasProductsError: null, loading: false })}
                  className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-semibold px-5 py-3 rounded-2xl text-sm transition-colors text-center shadow-md focus:outline-none"
                >
                  {locale === 'km' ? 'បិទ' : 'Okay, I understand'}
                </button>
              </div>
            ) : (
              // Confirmation screen
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-955/20 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-200 dark:border-red-800/30">
                  <Trash2 size={26} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {locale === 'km' ? 'លុបប្រភេទផលិតផល' : 'Delete Category'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  {locale === 'km'
                    ? `តើអ្នកពិតជាចង់លុបប្រភេទ "${deleteModal.categoryName}" នេះមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយបានឡើយ។`
                    : `Are you sure you want to delete the category "${deleteModal.categoryName}"? This action cannot be undone.`}
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={deleteModal.loading}
                    onClick={() => setDeleteModal({ isOpen: false, categoryId: null, categoryName: '', hasProductsError: null, loading: false })}
                    className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 font-semibold px-5 py-3 rounded-2xl text-sm transition-colors disabled:opacity-50"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="button"
                    disabled={deleteModal.loading}
                    onClick={confirmDeleteCategory}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-3 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 disabled:opacity-50"
                  >
                    {deleteModal.loading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      locale === 'km' ? 'លុប' : 'Delete'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
