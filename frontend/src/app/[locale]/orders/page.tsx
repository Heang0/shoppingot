'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import Link from 'next/link';

export default function CustomerOrders() {
  const user = useAuthStore((state) => state.user);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.token) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/orders/customer', {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (res.ok) setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please login to view your orders</h2>
          <Link href="/login" className="px-6 py-2 bg-[#E84C3D] text-white rounded-md">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My Order History</h1>
          <Link href="/" className="text-[#E84C3D] hover:underline">Back to Home</Link>
        </div>

        {loading ? (
          <p>Loading your orders...</p>
        ) : orders.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
            <h3 className="text-lg text-gray-600 mb-4">You have not placed any orders yet.</h3>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-500">Order ID: {order._id}</div>
                    <div className="text-sm font-medium text-gray-900 mt-1">
                      Store: {order.storeId?.name || 'Unknown Store'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">${order.totalAmount.toFixed(2)}</div>
                    <span className={`inline-flex px-2 mt-1 text-xs font-semibold rounded-full ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
                <div className="px-6 py-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Items:</h4>
                  <ul className="space-y-4">
                    {order.items.map((item: any) => (
                      <li key={item._id} className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-gray-100 rounded-md overflow-hidden">
                          {item.productId?.imageUrl && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={item.productId.imageUrl} alt="" className="h-full w-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-gray-900">{item.productId?.title || 'Unknown Product'}</h5>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
