'use client';

import { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle2, XCircle, ArrowLeft, Store } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function OrderTrackingPage() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isKm = params.locale === 'km';
  const orderId = params.orderId as string;

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/orders/${orderId}`);
        if (!res.ok) {
          throw new Error('Order not found');
        }
        const data = await res.json();
        setOrder(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED': return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case 'SHIPPED': return <Truck className="w-6 h-6 text-blue-500" />;
      case 'PROCESSING': return <Package className="w-6 h-6 text-purple-500" />;
      case 'CANCELLED': return <XCircle className="w-6 h-6 text-red-500" />;
      default: return <Package className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DELIVERED': return isKm ? 'បានដឹកជញ្ជូន' : 'Delivered';
      case 'SHIPPED': return isKm ? 'កំពុងដឹកជញ្ជូន' : 'Shipped';
      case 'PROCESSING': return isKm ? 'កំពុងរៀបចំ' : 'Processing';
      case 'CANCELLED': return isKm ? 'បានលុបចោល' : 'Cancelled';
      default: return isKm ? 'កំពុងរង់ចាំ' : 'Pending';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-[#111111] p-8 rounded-2xl shadow-sm text-center max-w-md w-full border border-gray-200 dark:border-gray-800">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {isKm ? 'រកមិនឃើញការបញ្ជាទិញទេ' : 'Order Not Found'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {isKm ? 'សូមពិនិត្យមើលលេខកូដបញ្ជាទិញរបស់អ្នកម្ដងទៀត។' : 'Please check your order ID and try again.'}
          </p>
          <Link
            href={`/${params.locale}/store/${params.slug}`}
            className="inline-block bg-black dark:bg-white text-white dark:text-black font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
          >
            {isKm ? 'ត្រឡប់ទៅហាងវិញ' : 'Return to Store'}
          </Link>
        </div>
      </div>
    );
  }

  const shortId = order._id.substring(0, 10).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-[#111111] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link 
            href={`/${params.locale}/store/${params.slug}`}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
          </Link>
          <span className="font-bold text-gray-900 dark:text-white text-lg truncate flex-1 text-center mr-6">
            {isKm ? 'តាមដានការបញ្ជាទិញ' : 'Order Tracking'}
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 md:py-8 space-y-6">
        {/* Status Banner */}
        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
            {getStatusIcon(order.orderStatus)}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {getStatusText(order.orderStatus)}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-mono text-sm">
            ID: {shortId}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {new Date(order.createdAt).toLocaleString(params.locale === 'km' ? 'km-KH' : 'en-US', {
              dateStyle: 'medium',
              timeStyle: 'short'
            })}
          </p>
        </div>

        {/* Customer & Delivery Info */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              {isKm ? 'ព័ត៌មានអ្នកទទួល' : 'Delivery Information'}
            </h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-white">{isKm ? 'ឈ្មោះ: ' : 'Name: '}</span>
                {order.guestInfo?.name || order.customerId?.name}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-white">{isKm ? 'ទូរស័ព្ទ: ' : 'Phone: '}</span>
                <span className="font-mono">{order.guestInfo?.phone || order.customerId?.phone}</span>
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-1">
                {order.guestInfo?.address || order.customerId?.address}
              </p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              {isKm ? 'ការទូទាត់' : 'Payment & Method'}
            </h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-white">{isKm ? 'វិធីទូទាត់: ' : 'Method: '}</span>
                {order.paymentMethod === 'bakong_app' ? 'Bakong App' : order.paymentMethod === 'CASH' ? 'Cash' : 'Bakong KHQR'}
              </p>
              <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-white">{isKm ? 'ស្ថានភាព: ' : 'Status: '}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                  order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  order.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {order.paymentStatus}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            {isKm ? 'ទំនិញរបស់អ្នក' : 'Order Items'}
          </h3>
          <div className="space-y-4">
            {order.items.map((item: any, idx: number) => (
              <div key={idx} className="flex gap-4">
                <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden border border-gray-200 dark:border-gray-700">
                  {item.productId?.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.productId.imageUrl} alt={item.productId.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Package className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                    {item.productId?.title || 'Unknown Product'}
                  </h4>
                  {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(', ')}
                    </p>
                  )}
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Qty: {item.quantity}</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">${item.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{isKm ? 'សរុប' : 'Subtotal'}</span>
              <span>${order.subtotal?.toFixed(2) || (order.totalAmount - (order.deliveryFee || 0)).toFixed(2)}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{isKm ? 'ថ្លៃដឹកជញ្ជូន' : 'Delivery Fee'}</span>
                <span>${order.deliveryFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-gray-800">
              <span>{isKm ? 'សរុបទាំងអស់' : 'Total'}</span>
              <span>${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
