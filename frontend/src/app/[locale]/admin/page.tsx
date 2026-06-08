'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Package, ShoppingCart, DollarSign, TrendingUp, Settings } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const user = useAuthStore((state) => state.user);
  const t = useTranslations('AdminDashboard');
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/analytics`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data);
        }
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchAnalytics();
  }, [user]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="bg-white dark:bg-[#111111] rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('overview_title')}</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {t('welcome_back', { name: user?.name || t('guest') })}
          </p>
        </div>
        <Link href="/admin/settings" className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <Settings size={24} />
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">{t('loading_analytics')}</p>
      ) : analytics ? (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-[#111111] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-xl">
                  <DollarSign className="w-6 h-6" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{t('total_revenue')}</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">${(analytics.totalRevenue || 0).toFixed(2)}</p>
            </div>

            <div className="bg-white dark:bg-[#111111] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-xl">
                  <ShoppingCart className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{t('total_orders')}</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.totalOrders || 0}</p>
            </div>

            <div className="bg-white dark:bg-[#111111] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-500 rounded-xl">
                  <Package className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{t('total_products')}</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.totalProducts || 0}</p>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white dark:bg-[#111111] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{t('revenue_overview') || 'Revenue Overview (Last 7 Days)'}</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.chartData || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E84C3D" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#E84C3D" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="shortDate" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickFormatter={(value: number) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#E84C3D', fontWeight: 'bold' }}
                    labelStyle={{ color: '#374151', fontWeight: '500', marginBottom: '4px' }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#E84C3D" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white dark:bg-[#111111] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('recent_orders')}</h3>
              <Link href="/admin/orders" className="text-sm font-medium text-[#E84C3D] hover:text-red-600 transition-colors">{t('view_all')} &rarr;</Link>
            </div>
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('order_id')}</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('customer')}</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('amount')}</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('payment')}</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('fulfillment')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {analytics.recentOrders?.map((order: any) => (
                  <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-mono">{order._id.substring(0, 8)}...</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{order.customerId?.name || 'Guest'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">${order.totalAmount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {order.paymentStatus === 'PAID' ? (
                        <span className="px-3 py-1 inline-flex text-xs font-semibold rounded-full bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">{t('status_paid')}</span>
                      ) : (
                        <span className="px-3 py-1 inline-flex text-xs font-semibold rounded-full bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">{t('status_pending')}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                       <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                          order.orderStatus === 'DELIVERED' 
                            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : order.orderStatus === 'SHIPPED'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                            : order.orderStatus === 'PROCESSING'
                            ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                            : order.orderStatus === 'CANCELLED'
                            ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                            : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                        }`}>
                          {order.orderStatus === 'DELIVERED' ? t('status_delivered') 
                            : order.orderStatus === 'SHIPPED' ? t('status_shipped')
                            : order.orderStatus === 'PROCESSING' ? t('status_processing')
                            : order.orderStatus === 'CANCELLED' ? t('status_cancelled')
                            : t('status_pending')}
                        </span>
                    </td>
                  </tr>
                ))}
                {(!analytics.recentOrders || analytics.recentOrders.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                      {t('no_recent_orders')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="text-red-500">{t('failed_analytics')}</p>
      )}
    </div>
  );
}
