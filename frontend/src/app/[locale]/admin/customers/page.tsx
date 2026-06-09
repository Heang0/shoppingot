'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useTranslations, useLocale } from 'next-intl';
import { Users } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  isGuest: boolean;
  totalOrders: number;
  totalSpent: number;
  joinedAt: string;
}

export default function AdminCustomersPage() {
  const user = useAuthStore((state) => state.user);
  const locale = useLocale();
  const isKm = locale === 'km';
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        // First get the store ID for this admin
        const storeRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stores`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        const stores = await storeRes.json();
        
        if (stores && stores.length > 0) {
          const storeId = stores[0]._id;
          const customersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stores/${storeId}/customers`, {
            headers: { Authorization: `Bearer ${user?.token}` }
          });
          const data = await customersRes.json();
          if (customersRes.ok) setCustomers(data);
        }
      } catch (err) {
        console.error('Error fetching customers:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchCustomers();
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">{isKm ? 'កំពុងទាញយកទិន្នន័យអតិថិជន...' : 'Loading customers...'}</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center bg-white dark:bg-[#111111] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isKm ? 'អតិថិជនទាំងអស់' : 'All Customers'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isKm ? 'អ្នកដែលបានទិញទំនិញពីហាងរបស់អ្នក' : 'People who have purchased from your store'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-gray-900 dark:text-white">{customers.length}</div>
          <div className="text-sm text-gray-500 uppercase tracking-widest font-bold">
            {isKm ? 'សរុប' : 'Total'}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111111] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-[#1a1a1a] border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs">
                  {isKm ? 'ឈ្មោះអតិថិជន' : 'Customer'}
                </th>
                <th className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs">
                  {isKm ? 'ទំនាក់ទំនង' : 'Contact'}
                </th>
                <th className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs text-center">
                  {isKm ? 'ចំនួនបញ្ជាទិញ' : 'Orders'}
                </th>
                <th className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs text-right">
                  {isKm ? 'ទឹកប្រាក់សរុប' : 'Total Spent'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold uppercase shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          {c.name}
                          {c.isGuest && (
                            <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] rounded uppercase tracking-widest font-bold">
                              Guest
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {isKm ? 'តាំងពី ' : 'Since '}
                          {new Date(c.joinedAt).toLocaleDateString(isKm ? 'km-KH' : 'en-US')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900 dark:text-white font-medium">{c.phone || '-'}</div>
                    <div className="text-xs text-gray-500">{c.email || ''}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-full font-bold">
                      {c.totalOrders}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-[#E1232E] font-bold text-base">
                      ${c.totalSpent.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <Users size={32} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    {isKm ? 'មិនទាន់មានអតិថិជននៅឡើយទេ' : 'No customers found yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
