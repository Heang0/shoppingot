'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';

interface Product {
  _id: string;
  title: string;
  price: number;
  stock: number;
  imageUrl: string;
}

export default function ManageProducts() {
  const user = useAuthStore((state) => state.user);
  const [products, setProducts] = useState<Product[]>([]);
  const [storeId, setStoreId] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [storeCategory, setStoreCategory] = useState<string>('General Retail');
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [variants, setVariants] = useState<{name: string, options: string}[]>([]);

  useEffect(() => {
    // 1. Get store id
    fetch('http://localhost:5000/api/stores', {
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
    fetch('http://localhost:5000/api/categories', {
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
      const res = await fetch(`http://localhost:5000/api/products/store/${sid}?page=${page}&limit=10`);
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
      const res = await fetch('http://localhost:5000/api/upload?type=product', {
        method: 'POST',
        body: formData, // No Auth headers for this mock public route
      });
      const data = await res.json();
      if (res.ok) setImageUrl(data.url);
    } catch (err) {
      console.error('Upload error', err);
    }
  };

  const handleCreateOrUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) return alert('You must set up a store first.');

    try {
      const parsedVariants = variants
        .filter(v => v.name && v.options)
        .map(v => ({
          name: v.name,
          options: v.options.split(',').map(s => s.trim()).filter(Boolean)
        }));

      const payload = {
        storeId,
        categoryId: categoryId || undefined,
        title,
        description,
        price: Number(price),
        stock: Number(stock),
        imageUrl,
        variants: parsedVariants
      };

      const url = editingProduct 
        ? `http://localhost:5000/api/products/${editingProduct._id}` 
        : 'http://localhost:5000/api/products';
        
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
        setTitle(''); setDescription(''); setPrice(''); setStock(''); setImageUrl(''); setCategoryId(''); setVariants([]);
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
    if (!confirm('Are you sure?')) return;
    try {
      await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (storeId) fetchProducts(storeId, currentPage);
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
      setDescription(product.description || '');
      setPrice((product.price || 0).toString());
      setStock((product.stock || 0).toString());
      setImageUrl(product.imageUrl || '');
      setCategoryId(product.categoryId || '');
      
      if (product.variants && product.variants.length > 0) {
        setVariants(product.variants.map((v: any) => ({
          name: v.name,
          options: Array.isArray(v.options) ? v.options.join(', ') : v.options
        })));
      } else {
        setVariants([]);
      }
      
      setShowForm(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleForm = () => {
    if (!showForm) {
      // Clear form when opening for a new product
      setEditingProduct(null);
      setTitle(''); setDescription(''); setPrice(''); setStock(''); setImageUrl(''); setCategoryId('');
      
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
      } else if (storeCategory === 'Supplements (អាហារបំប៉ន់)') {
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
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Products</h2>
        <button 
          onClick={handleToggleForm}
          className="bg-[#E84C3D] text-white px-5 py-2.5 rounded-lg font-medium shadow-sm hover:bg-red-600 transition-colors"
        >
          {showForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateOrUpdateProduct} className="bg-white dark:bg-[#111111] p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{editingProduct ? 'Edit Product' : 'Create New Product'}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#E84C3D] focus:border-[#E84C3D] dark:text-white transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (USD)</label>
              <input type="number" step="0.01" required value={price} onChange={e => setPrice(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#E84C3D] focus:border-[#E84C3D] dark:text-white transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock</label>
              <input type="number" required value={stock} onChange={e => setStock(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#E84C3D] focus:border-[#E84C3D] dark:text-white transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Custom Category</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#E84C3D] focus:border-[#E84C3D] dark:text-white transition-colors">
                <option value="">No Category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image Upload</label>
              <div className="flex gap-4 items-center">
                <input type="file" accept="image/*" onChange={handleUpload} className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 dark:file:bg-red-900/20 dark:file:text-red-400" />
                {imageUrl && (
                  <div className="w-12 h-12 shrink-0 rounded overflow-hidden border border-gray-200 dark:border-gray-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#E84C3D] focus:border-[#E84C3D] dark:text-white transition-colors"></textarea>
            </div>
            
            <div className="col-span-1 md:col-span-2 border-t border-gray-100 dark:border-gray-800 pt-6 mt-2">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white">Product Variants (Optional)</label>
                <button type="button" onClick={() => setVariants([...variants, { name: '', options: '' }])} className="text-sm text-[#E84C3D] font-medium hover:text-red-600">
                  + Add Variant
                </button>
              </div>
              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <div key={index} className="flex gap-4 items-start bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Variant Name (e.g. Size)</label>
                      <input type="text" value={variant.name} onChange={e => { const newV = [...variants]; newV[index].name = e.target.value; setVariants(newV); }} className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#E84C3D] text-sm dark:text-white" />
                    </div>
                    <div className="flex-[2]">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Options (Comma separated, e.g. S, M, L)</label>
                      <input type="text" value={variant.options} onChange={e => { const newV = [...variants]; newV[index].options = e.target.value; setVariants(newV); }} className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#E84C3D] text-sm dark:text-white" />
                    </div>
                    <button type="button" onClick={() => { const newV = variants.filter((_, i) => i !== index); setVariants(newV); }} className="mt-6 text-gray-400 hover:text-red-500 p-2">
                      ✕
                    </button>
                  </div>
                ))}
                {variants.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">No variants added. Product will be sold as a single standard item.</p>
                )}
              </div>
            </div>
          </div>
          <button type="submit" className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
            Save Product
          </button>
        </form>
      )}

      <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {products.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="h-full w-full object-cover" src={product.imageUrl} alt="" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{product.title}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 font-medium">${product.price.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{product.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleEdit(product)} className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors">Edit</button>
                    <button onClick={() => handleDelete(product._id)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  No products found. Create one to get started.
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
              Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page <span className="font-semibold text-gray-900 dark:text-white">{currentPage}</span> of <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span>
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
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
