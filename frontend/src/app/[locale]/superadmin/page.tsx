'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';

export default function SuperadminDashboard() {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState({ totalStores: 0, activeSubscriptions: 0, monthlyRevenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/superadmin/dashboard`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        const data = await res.json();
        if (res.ok) setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchStats();
  }, [user?.token]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>
      
      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading statistics...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#111111] p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md">
            <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Stores</div>
            <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.totalStores}</div>
          </div>
          
          <div className="bg-white dark:bg-[#111111] p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md">
            <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">Active Subscriptions</div>
            <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.activeSubscriptions}</div>
          </div>

          <div className="bg-white dark:bg-[#111111] p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md">
            <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">Monthly Revenue</div>
            <div className="mt-2 text-3xl font-bold text-[#E84C3D]">${stats.monthlyRevenue.toFixed(2)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
