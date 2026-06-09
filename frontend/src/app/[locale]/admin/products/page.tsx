'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useLocale, useTranslations } from 'next-intl';

interface Product {
  _id: string;
  title: string;
  titleKm?: string;
  price: number;
  stock: number;
  imageUrl: string;
  images?: string[];
  category?: string | { _id: string };
  isBestSeller?: boolean;
}

export default function ManageProducts() {
  const user = useAuthStore((state) => state.user);
  const t = useTranslations('AdminProducts');
  const locale = useLocale();
  const [products, setProducts] = useState<Product[]>([]);
  const [storeId, setStoreId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [storeCategory, setStoreCategory] = useState<string>('General Retail');

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [title, setTitle] = useState('');
  const [titleKm, setTitleKm] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionKm, setDescriptionKm] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<{ name: string, options: string }[]>([]);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const getCategoryName = (category: any) =>
    locale === 'km' && category.nameKm ? category.nameKm : category.name;

  useEffect(() => {
    // 1. Get store id
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stores`, {
      headers: { Authorization: `Bearer ${user?.token}` }
    })
      .then(res => res.json())
      .then(data => {
        const myStore = data.find((s: any) => s.ownerId._id === user?._id || s.ownerId === user?._id);
        if (myStore) {
          setStoreId(myStore._id);
          if (myStore.category) setStoreCategory(myStore.category);
          fetchProducts(myStore._id, currentPage);
        }
      })
      .catch(console.error);

    // 2. Fetch categories
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories`, {
      headers: { Authorization: `Bearer ${user?.token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(console.error);
  }, [user]);

  const fetchProducts = async (sid: string, page: number = 1) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/store/${sid}?page=${page}&limit=10`);
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload?type=product`, {
        method: 'POST',
        body: formData, // No Auth headers for this mock public route
      });
      const data = await res.json();
      if (res.ok) setImageUrl(data.url);
    } catch (err) {
      console.error('Upload error', err);
    }
  };

  const handleExtraUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 3 - images.length;
    if (remainingSlots <= 0) return alert('Max 3 extra images allowed');

    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    for (const file of filesToUpload) {
      const formData = new FormData();
      formData.append('image', file);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload?type=product`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (res.ok) setImages(prev => [...prev, data.url]);
      } catch (err) {
        console.error('Upload error', err);
      }
    }
  };

  const handleCreateOrUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) return alert(t('setup_store_first'));

    try {
      const parsedVariants = variants
        .filter(v => v.name && v.options)
        .map(v => ({
          name: v.name,
          options: v.options.split(',').map(s => s.trim()).filter(Boolean)
        }));

      const payload = {
        storeId,
        categoryId: categoryId || null,
        title,
        titleKm,
        description,
        descriptionKm,
        price: Number(price),
        stock: Number(stock),
        imageUrl,
        images,
        isBestSeller,
        variants: parsedVariants
      };

      const url = editingProduct
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/${editingProduct._id}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products`;

      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowForm(false);
        setEditingProduct(null);
        setTitle(''); setTitleKm(''); setDescription(''); setDescriptionKm(''); setPrice(''); setStock(''); setImageUrl(''); setImages([]); setCategoryId(''); setVariants([]); setIsBestSeller(false);
        fetchProducts(storeId, currentPage);
      } else {
        const data = await res.json();
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirm_delete'))) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (storeId) fetchProducts(storeId, currentPage);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFlag = async (productId: string, flag: 'isBestSeller', currentValue: boolean) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          [flag]: !currentValue
        }),
      });

      if (res.ok && storeId) {
        fetchProducts(storeId, currentPage);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = async (product: any) => {
    // We need to fetch the full product details to get variants and description
    try {
      // Actually, since products in the list might not have all fields populated in some setups,
      // let's use what we have, but ensure we have all fields.
      setEditingProduct(product);
      setTitle(product.title || '');
      setTitleKm(product.titleKm || '');
      setDescription(product.description || '');
      setDescriptionKm(product.descriptionKm || '');
      setPrice((product.price || 0).toString());
      setStock((product.stock || 0).toString());
      setImageUrl(product.imageUrl || '');
      setImages(product.images || []);
      setIsBestSeller(product.isBestSeller || false);
      const productCategory = typeof product.category === 'object' ? product.category?._id : product.category;
      setCategoryId(productCategory ? String(productCategory) : '');

      if (product.variants && product.variants.length > 0) {
        setVariants(product.variants.map((v: any) => ({
          name: v.name,
          options: Array.isArray(v.options) ? v.options.join(', ') : v.options
        })));
      } else {
        setVariants([]);
      }

      setShowForm(true);
      document.getElementById('dashboard-main')?.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleForm = () => {
    if (!showForm) {
      // Clear form when opening for a new product
      setEditingProduct(null);
      setTitle(''); setTitleKm(''); setDescription(''); setDescriptionKm(''); setPrice(''); setStock(''); setImageUrl(''); setImages([]); setCategoryId(''); setIsBestSeller(false);

      if (storeCategory === 'Clothing') {
        setVariants([
          { name: 'Size', options: 'S, M, L, XL' },
          { name: 'Color', options: 'Black, White, Red, Blue' }
        ]);
      } else if (storeCategory === 'Food & Beverage') {
        setVariants([
          { name: 'Size', options: 'Small, Medium, Large' },
          { name: 'Add-ons', options: 'Extra Cheese, No Onion' }
        ]);
      } else if (storeCategory === 'Electronics') {
        setVariants([
          { name: 'Storage', options: '64GB, 128GB, 256GB' },
          { name: 'Color', options: 'Black, Silver, Gold' }
        ]);
      } else if (storeCategory === 'Supplements') {
        setVariants([
          { name: 'Flavor (រសជាតិ)', options: 'Vanilla, Chocolate, Strawberry, Unflavored' },
          { name: 'Size (ទំហំ/ទម្ងន់)', options: '30 Servings, 60 Servings, 1KG, 2KG' }
        ]);
      } else {
        setVariants([]);
      }
    } else {
      setEditingProduct(null);
    }
    setShowForm(!showForm);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('title')}</h2>
        <button
          onClick={handleToggleForm}
          className="bg-[#E84C3D] text-white px-5 py-2.5 rounded-lg font-medium shadow-sm hover:bg-red-600 transition-colors"
        >
          {showForm ? t('cancel') : t('add_product')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateOrUpdateProduct} className="bg-white dark:bg-[#111111] p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{editingProduct ? t('edit_product') : t('create_product')}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('product_title')} (EN)</label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#E84C3D] focus:border-[#E84C3D] dark:text-white transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('product_title')} (KM)</label>
              <input type="text" value={titleKm} onChange={e => setTitleKm(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#E84C3D] focus:border-[#E84C3D] dark:text-white transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('price')}</label>
              <input type="number" step="0.01" required value={price} onChange={e => setPrice(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#E84C3D] focus:border-[#E84C3D] dark:text-white transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('stock')}</label>
              <input type="number" required value={stock} onChange={e => setStock(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#E84C3D] focus:border-[#E84C3D] dark:text-white transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('custom_category')}</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#E84C3D] focus:border-[#E84C3D] dark:text-white transition-colors">
                <option value="">{t('no_category')}</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{getCategoryName(cat)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('image_upload')} (Main)</label>
              <div className="flex gap-4 items-center">
                <input type="file" accept="image/*" onChange={handleUpload} className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 dark:file:bg-red-900/20 dark:file:text-red-400" />
                {imageUrl && (
                  <div className="w-12 h-12 shrink-0 rounded overflow-hidden border border-gray-200 dark:border-gray-700 relative group">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImageUrl('')} className="absolute top-0 right-0 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('gallery_images')}</label>
              <div className="flex flex-col gap-2">
                <input type="file" multiple accept="image/*" onChange={handleExtraUpload} disabled={images.length >= 3} className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-400 disabled:opacity-50" />
                {images.length > 0 && (
                  <div className="flex gap-2">
                    {images.map((img, i) => (
                      <div key={i} className="w-12 h-12 shrink-0 rounded overflow-hidden border border-gray-200 dark:border-gray-700 relative group">
                        <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-0 right-0 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('flags')}</label>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={isBestSeller} onChange={(e) => setIsBestSeller(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-[#E84C3D] focus:ring-[#E84C3D]" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('best_seller')}</span>
                </label>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('description')} (EN)</label>
              <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#E84C3D] focus:border-[#E84C3D] dark:text-white transition-colors"></textarea>
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('description')} (KM)</label>
              <textarea rows={3} value={descriptionKm} onChange={e => setDescriptionKm(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#E84C3D] focus:border-[#E84C3D] dark:text-white transition-colors"></textarea>
            </div>

            <div className="col-span-1 md:col-span-2 border-t border-gray-100 dark:border-gray-800 pt-6 mt-2">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white">{t('variants_optional')}</label>
                <button type="button" onClick={() => setVariants([...variants, { name: '', options: '' }])} className="text-sm text-[#E84C3D] font-medium hover:text-red-600">
                  {t('add_variant')}
                </button>
              </div>
              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <div key={index} className="flex gap-4 items-start bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('variant_name')}</label>
                      <input type="text" value={variant.name} onChange={e => { const newV = [...variants]; newV[index].name = e.target.value; setVariants(newV); }} className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#E84C3D] text-sm dark:text-white" />
                    </div>
                    <div className="flex-[2]">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('variant_options')}</label>
                      <input type="text" value={variant.options} onChange={e => { const newV = [...variants]; newV[index].options = e.target.value; setVariants(newV); }} className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#E84C3D] text-sm dark:text-white" />
                    </div>
                    <button type="button" onClick={() => { const newV = variants.filter((_, i) => i !== index); setVariants(newV); }} className="mt-6 text-gray-400 hover:text-red-500 p-2">
                      ✕
                    </button>
                  </div>
                ))}
                {variants.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">{t('no_variants')}</p>
                )}
              </div>
            </div>
          </div>
          <button type="submit" className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
            {t('save_product')}
          </button>
        </form>
      )}

      <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('product')}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('custom_category')}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('price')}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('stock')}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{locale === 'km' ? 'លក់ដាច់បំផុត' : 'Best Seller'}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {products.map((product) => {
              const productCategoryObj = categories.find(c => c._id === (typeof product.category === 'object' ? product.category?._id : product.category));
              return (
              <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="h-full w-full object-cover" src={product.imageUrl} alt="" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {locale === 'km' && product.titleKm ? product.titleKm : product.title}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {productCategoryObj ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                      {getCategoryName(productCategoryObj)}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic text-xs">{t('no_category')}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 font-medium">${product.price.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 10 ? 'bg-green-100 text-green-700' : product.stock > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleFlag(product._id, 'isBestSeller', product.isBestSeller || false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      product.isBestSeller
                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {product.isBestSeller ? (locale === 'km' ? 'បាទ/ចាស' : 'Yes') : (locale === 'km' ? 'ទេ' : 'No')}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleEdit(product)} className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors">{t('edit')}</button>
                    <button onClick={() => handleDelete(product._id)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors">{t('delete')}</button>
                  </div>
                </td>
              </tr>
            );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  {t('no_products')}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-[#111111]">
            <button
              onClick={() => {
                const newPage = Math.max(1, currentPage - 1);
                setCurrentPage(newPage);
                if (storeId) fetchProducts(storeId, newPage);
              }}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {t('previous')}
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t('page')} <span className="font-semibold text-gray-900 dark:text-white">{currentPage}</span> {t('of')} <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span>
            </span>
            <button
              onClick={() => {
                const newPage = Math.min(totalPages, currentPage + 1);
                setCurrentPage(newPage);
                if (storeId) fetchProducts(storeId, newPage);
              }}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {t('next')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
