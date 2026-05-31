'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useBaseDomain } from '@/lib/hooks/useBaseDomain';

export default function StoreSetup() {
  const user = useAuthStore((state) => state.user);
  const baseDomain = useBaseDomain();
  
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [bakongId, setBakongId] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [category, setCategory] = useState('General Retail');
  const [message, setMessage] = useState('');
  const [existingStoreId, setExistingStoreId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.token) {
      fetch('http://localhost:5000/api/stores', {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      .then(res => res.json())
      .then(data => {
        const myStore = data.find((s: any) => s.ownerId._id === user._id || s.ownerId === user._id);
        if (myStore) {
          setExistingStoreId(myStore._id);
          setName(myStore.name);
          setSlug(myStore.slug);
          if (myStore.category) setCategory(myStore.category);
          if (myStore.paymentSettings) {
            setBakongId(myStore.paymentSettings.bakongId || '');
            setCurrency(myStore.paymentSettings.currency || 'USD');
          }
        }
      })
      .catch(console.error);
    }
  }, [user]);

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      let storeId = existingStoreId;

      if (existingStoreId) {
        // Update existing store
        const res = await fetch(`http://localhost:5000/api/stores/${existingStoreId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`
          },
          body: JSON.stringify({ name, slug, category }),
        });
        if (!res.ok) throw new Error((await res.json()).message);
      } else {
        // Create new store
        const res = await fetch('http://localhost:5000/api/stores', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`
          },
          body: JSON.stringify({ name, slug, category }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        storeId = data._id;
        setExistingStoreId(storeId);
      }

      // Update Bakong Settings
      if (bakongId && storeId) {
        await fetch(`http://localhost:5000/api/stores/${storeId}/payment-settings`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`
          },
          body: JSON.stringify({ bakongId, currency }),
        });
      }

      setMessage('Store setup successful!');
    } catch (err: any) {
      setMessage(err.message || 'Error setting up store');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Store Setup</h2>
      
      {message && (
        <div className={`p-4 rounded-xl ${message.includes('successful') ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSaveStore} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Store Details</h3>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-[#E84C3D] focus:border-[#E84C3D] dark:text-white transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store URL Slug</label>
              <div className="flex shadow-sm rounded-lg overflow-hidden">
                <input type="text" required value={slug} onChange={e => setSlug(e.target.value)} className="flex-1 min-w-0 w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 border-r-0 rounded-none rounded-l-lg focus:ring-2 focus:ring-[#E84C3D] focus:border-[#E84C3D] dark:text-white transition-colors" />
                <span className="inline-flex items-center px-4 rounded-r-lg border border-l-0 border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                  {baseDomain}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-[#E84C3D] focus:border-[#E84C3D] dark:text-white transition-colors">
                <option value="Clothing">Clothing</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Electronics">Electronics</option>
                <option value="Supplements (អាហារបំប៉ន់)">Supplements (អាហារបំប៉ន់)</option>
                <option value="General Retail">General Retail</option>
                <option value="Other">Other</option>
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">This helps us customize your product templates.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Settings (KHQR)</h3>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bakong ID</label>
              <input type="text" required value={bakongId} onChange={e => setBakongId(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-[#E84C3D] focus:border-[#E84C3D] dark:text-white transition-colors" placeholder="example@bkrt" />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Must end with @bkrt or @wing, etc.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-[#E84C3D] focus:border-[#E84C3D] dark:text-white transition-colors">
                <option value="USD">USD</option>
                <option value="KHR">KHR</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <button type="submit" className="w-full bg-[#E84C3D] text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-red-600 hover:shadow-lg transition-all">
            {existingStoreId ? 'Update Store Settings' : 'Save Store Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
