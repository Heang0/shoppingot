'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Package, Clock, CheckCircle2, Truck, XCircle, AlertCircle } from 'lucide-react';

export default function StoreProfilePage({ params }: { params: { slug: string, locale: string } }) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchStoreAndOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch Store ID by slug
        const storeRes = await fetch(`http://localhost:5000/api/stores/${params.slug}`);
        if (!storeRes.ok) throw new Error('Store not found');
        const storeData = await storeRes.json();
        setStoreId(storeData._id);

        // 2. Fetch Customer Orders
        const ordersRes = await fetch('http://localhost:5000/api/orders/customer', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        if (!ordersRes.ok) throw new Error('Failed to load orders');
        const ordersData = await ordersRes.json();

        // 3. Filter orders specifically for THIS store
        const storeOrders = ordersData.filter((order: any) => 
          order.storeId && order.storeId._id === storeData._id
        );
        
        setOrders(storeOrders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreAndOrders();
  }, [params.slug, user]);

  const handleLogout = () => {
    logout();
    router.push(`/${params.locale}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'SHIPPED': return <Truck className="w-5 h-5 text-blue-500" />;
      case 'PROCESSING': return <Package className="w-5 h-5 text-purple-500" />;
      case 'CANCELLED': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800/30';
      case 'SHIPPED': return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800/30';
      case 'PROCESSING': return 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800/30';
      case 'CANCELLED': return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800/30';
      default: return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/30';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center py-20 min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Not Logged In</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">Please sign in to view your profile and order history for this store.</p>
        <Link href="/login" className="bg-black dark:bg-white text-white dark:text-black font-semibold px-8 py-3 rounded-full hover:scale-105 transition-transform shadow-md">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 space-y-8 pb-32">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-6 pb-6 border-b border-gray-100 dark:border-gray-900">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-xl font-bold text-gray-900 dark:text-white shrink-0 overflow-hidden border-2 border-white dark:border-[#111111] shadow-sm">
            {user.profilePic ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user.name?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
            <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 font-medium transition-colors border border-red-100 dark:border-red-900/30 w-full sm:w-auto justify-center"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      {/* Order History */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">Order History</h2>
        
        {orders.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-900">
            <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No Orders Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">You haven't placed any orders at this store.</p>
            <Link href={`/${params.locale}`} className="inline-block bg-black dark:bg-white text-white dark:text-black font-semibold px-6 py-2.5 rounded-full hover:scale-105 transition-transform text-sm">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 sm:p-5 flex flex-col h-full border border-gray-100 dark:border-gray-800/50 hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
                {/* Order Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono tracking-wider block mb-1">
                      ORDER #{order._id.substring(0, 8).toUpperCase()}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${getStatusColor(order.orderStatus)}`}>
                    {getStatusIcon(order.orderStatus)}
                    <span className="text-xs font-bold uppercase tracking-wider">{order.orderStatus}</span>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="w-16 h-20 shrink-0 bg-white dark:bg-black rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800">
                      {item.productId?.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.productId.imageUrl} alt="Product" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400 text-xs">IMG</div>
                      )}
                    </div>
                  ))}
                  {order.items.length === 0 && <div className="text-sm text-gray-500">No items</div>}
                </div>

                {/* Order Footer */}
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Payment Status</p>
                    <p className={`text-sm font-semibold ${order.paymentStatus === 'PAID' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                      {order.paymentStatus}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Total Amount</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">${order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
