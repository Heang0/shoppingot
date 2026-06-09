'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useBaseDomain } from '@/lib/hooks/useBaseDomain';

interface Store {
  _id: string;
  name: string;
  slug: string;
  ownerId: { name: string; email: string };
  plan: {
    planId: { name: string; price: number };
    expiresAt: string;
    isActive: boolean;
  };
  customDomain?: string;
  isActive: boolean;
}

export default function StoresManagement() {
  const user = useAuthStore((state) => state.user);
  const baseDomain = useBaseDomain();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<{ id: string; domain: string; name: string } | null>(null);
  const [domainInput, setDomainInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stores`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (res.ok) setStores(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStore = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/superadmin/stores/${id}/toggle`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (res.ok) {
        fetchStores(); // Refresh list
      } else {
        alert('Failed to toggle store status');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
  };

  const handleSaveDomain = async () => {
    if (!selectedStore) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/superadmin/stores/${selectedStore.id}/domain`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}` 
        },
        body: JSON.stringify({ customDomain: domainInput })
      });
      if (res.ok) {
        fetchStores();
        setIsDomainModalOpen(false);
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to update domain');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Stores & Subscriptions</h2>
      </div>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading stores...</p>
      ) : (
        <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Store Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Custom Domain</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Plan</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expiry</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {stores.map((store) => (
                <tr key={store._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                    {store.name}
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                      {baseDomain.includes('vercel.app') ? `https://shoppingot.vercel.app/store/${store.slug}` : `http://${store.slug}${baseDomain}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 font-medium">
                    {store.ownerId?.name}
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">{store.ownerId?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {store.customDomain ? (
                      <span className="text-blue-600 dark:text-blue-400 font-medium">{store.customDomain}</span>
                    ) : (
                      <span className="text-gray-400 italic">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {store.plan?.planId?.name || 'No Plan'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {store.plan?.expiresAt ? new Date(store.plan.expiresAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {store.plan?.isActive ? (
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50">
                        Active
                      </span>
                    ) : (
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50">
                        Expired/None
                      </span>
                    )}
                    {!store.isActive && (
                      <span className="ml-2 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/50">
                        Suspended
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                    <button
                      onClick={() => {
                        setSelectedStore({ id: store._id, domain: store.customDomain || '', name: store.name });
                        setDomainInput(store.customDomain || '');
                        setIsDomainModalOpen(true);
                      }}
                      className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors font-semibold"
                    >
                      Edit Domain
                    </button>
                    <button
                      onClick={() => toggleStore(store._id)}
                      className={`${store.isActive ? 'text-red-500 hover:text-red-700 dark:hover:text-red-400' : 'text-green-500 hover:text-green-700 dark:hover:text-green-400'} transition-colors font-semibold`}
                    >
                      {store.isActive ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
              {stores.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No stores registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isDomainModalOpen && selectedStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-white dark:bg-[#111111] p-6 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Edit Custom Domain</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Setting custom domain for <strong>{selectedStore.name}</strong>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Domain Name</label>
                <input
                  type="text"
                  placeholder="e.g. www.brand.com"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#E84C3D] outline-none"
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Leave empty to remove the custom domain.</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsDomainModalOpen(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDomain}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-[#E84C3D] hover:bg-[#c0392b] rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Domain'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
