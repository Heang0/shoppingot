'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useTranslations, useLocale } from 'next-intl';

export default function OrderTracking() {
  const user = useAuthStore((state) => state.user);
  const t = useTranslations('AdminOrders');
  const locale = useLocale();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    fetchOrders(currentPage);
  }, [user, currentPage]);

  const fetchOrders = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders/store?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}` 
        },
        body: JSON.stringify({ orderStatus: newStatus })
      });
      if (res.ok) {
        setOrders(orders.map(order => order._id === orderId ? { ...order, orderStatus: newStatus } : order));
      } else {
        const data = await res.json();
        alert(data.message || t('failed_update'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('title')}</h2>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">{t('loading')}</p>
      ) : (
        <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('order_id')}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('customer')}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('items')}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('total_amount')}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('payment')}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('fulfillment')}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {orders.map((order) => (
                <tr key={order._id} onClick={() => setSelectedOrder(order)} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-mono">{order._id.substring(0, 8)}...</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {order.isGuest ? order.guestInfo?.name || t('guest') : order.customerId?.name || 'Unknown User'}
                    <div className="text-xs text-gray-500 dark:text-gray-400">{order.isGuest ? order.guestInfo?.phone : order.customerId?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {order.items.length} {t('items')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">${order.totalAmount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {order.paymentStatus === 'PAID' ? (
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50">
                        {t('status_paid')}
                      </span>
                    ) : (
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/50">
                        {t('status_pending')}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={order.orderStatus || 'PENDING'}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold border focus:outline-none focus:ring-2 focus:ring-[#E84C3D] transition-colors ${
                        order.orderStatus === 'DELIVERED' 
                          ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50'
                          : order.orderStatus === 'SHIPPED'
                          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50'
                          : order.orderStatus === 'PROCESSING'
                          ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/50'
                          : order.orderStatus === 'CANCELLED'
                          ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50'
                          : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800/50'
                      }`}
                    >
                      <option value="PENDING">{t('status_pending')}</option>
                      <option value="PROCESSING">{t('status_processing')}</option>
                      <option value="SHIPPED">{t('status_shipped')}</option>
                      <option value="DELIVERED">{t('status_delivered')}</option>
                      <option value="CANCELLED">{t('status_cancelled')}</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    {t('no_orders')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-[#111111]">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {t('previous')}
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t('page')} <span className="font-semibold text-gray-900 dark:text-white">{currentPage}</span> {t('of')} <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span>
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {t('next')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111111] rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white/90 dark:bg-[#111111]/90 backdrop-blur-md px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center z-10">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('order_details')}</h3>
              <div className="flex gap-3">
                <button 
                  onClick={() => window.print()}
                  className="bg-[#E84C3D] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                  Print Label
                </button>
                <button
                  onClick={() => {
                    const storeSlug = selectedOrder?.storeId?.slug || 'unknown';
                    const link = `${window.location.origin}/${locale}/store/${storeSlug}/orders/${selectedOrder._id}`;
                    navigator.clipboard.writeText(link);
                    alert(t('link_copied') || 'Tracking link copied to clipboard!');
                  }}
                  className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                  Share Link
                </button>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-black dark:hover:text-white transition-colors bg-gray-100 dark:bg-gray-800 rounded-full p-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">{t('customer_info')}</h4>
                  {selectedOrder.isGuest ? (
                    <div className="text-sm space-y-1">
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedOrder.guestInfo?.name}</p>
                      <p className="text-gray-600 dark:text-gray-400 font-mono">{selectedOrder.guestInfo?.phone}</p>
                    </div>
                  ) : (
                    <div className="text-sm space-y-1">
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedOrder.guestInfo?.name || selectedOrder.customerId?.name}</p>
                      <p className="text-gray-600 dark:text-gray-400 font-mono">{selectedOrder.guestInfo?.phone}</p>
                      <p className="text-gray-500 dark:text-gray-500 text-xs">{selectedOrder.customerId?.email}</p>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">{t('delivery')}</h4>
                  <div className="text-sm space-y-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedOrder.deliveryPartner || 'J&T Express'}</p>
                    <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-2 rounded-lg mt-2 leading-relaxed">
                      {selectedOrder.guestInfo?.address || 'No address provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">{t('order_items')}</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item: any) => (
                    <div key={item._id} className="flex justify-between items-start p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                      <div className="flex gap-3">
                        {item.productId?.imageUrl && (
                          <div className="w-12 h-12 shrink-0 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={item.productId.imageUrl.replace('/upload/', '/upload/w_300,c_limit,q_auto/')} 
                              alt="Product" 
                              className="w-full h-full object-cover" 
                              loading="lazy" 
                            />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {item.quantity}x {item.productId?.title || t('unknown_item')}
                          </p>
                          {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {Object.entries(item.selectedVariants).map(([k, v]) => (
                                <span key={k} className="text-[11px] font-medium bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded">
                                  {k}: {v as string}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total & Status */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800">
                <span className="font-semibold text-gray-500">{t('total_paid_khqr')}</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">${selectedOrder.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Print Layout (Shipping Label - 4x6 / 100x150mm) */}
      {selectedOrder && (
        <div className="hidden print:block fixed inset-0 bg-white z-[9999] text-black font-sans" style={{ width: '100mm', margin: '0 auto', padding: '5mm', boxSizing: 'border-box' }}>
          <style>{`
            @media print {
              @page {
                size: 100mm 150mm; /* Standard 4x6 shipping label */
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
          `}</style>

          <div className="border-2 border-black h-full flex flex-col p-2">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-black pb-2 mb-2">
              <div>
                <div className="font-bold text-lg uppercase tracking-wider">
                  {selectedOrder.deliveryPartner || 'STANDARD'}
                </div>
                {selectedOrder.storeId && (
                  <div className="text-[10px] mt-1 text-gray-700 font-medium">
                    SENDER: {selectedOrder.storeId.name}
                    {selectedOrder.storeId.contact?.phone && <><br/>TEL: {selectedOrder.storeId.contact.phone}</>}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="font-mono text-sm tracking-widest font-bold bg-black text-white px-2 py-1 inline-block mb-1">
                  {selectedOrder._id.substring(0, 12).toUpperCase()}
                </div>
                <div className="text-[10px] font-bold">ORDER ID</div>
                <div className="text-[10px] mt-1">{new Date(selectedOrder.createdAt).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Ship To */}
            <div className="border-b-2 border-black pb-2 mb-2">
              <div className="text-xs font-bold tracking-widest mb-1">SHIP TO:</div>
              {selectedOrder.isGuest ? (
                <div>
                  <div className="font-bold text-xl leading-tight">{selectedOrder.guestInfo?.name}</div>
                  <div className="text-sm font-medium mt-1">{selectedOrder.guestInfo?.phone}</div>
                  <div className="text-sm mt-1 whitespace-pre-line leading-snug">{selectedOrder.guestInfo?.address}</div>
                </div>
              ) : (
                <div>
                  <div className="font-bold text-xl leading-tight">{selectedOrder.customerId?.name}</div>
                  <div className="text-sm mt-1">{selectedOrder.customerId?.email}</div>
                  <div className="text-sm mt-1 italic text-gray-700">See system for address</div>
                </div>
              )}
            </div>

            {/* Delivery Note */}
            {selectedOrder.deliveryNote && (
              <div className="border-b-2 border-black pb-2 mb-2">
                <div className="text-xs font-bold tracking-widest mb-1">NOTE:</div>
                <div className="text-sm font-bold uppercase">{selectedOrder.deliveryNote}</div>
              </div>
            )}

            {/* Order Items */}
            <div className="flex-1">
              <div className="text-xs font-bold tracking-widest border-b border-black pb-1 mb-1">ITEMS ({selectedOrder.items.length}):</div>
              <table className="w-full text-xs">
                <tbody>
                  {selectedOrder.items.map((item: any, idx: number) => (
                    <tr key={idx} className="border-b border-gray-300">
                      <td className="py-1 font-bold">
                        {item.quantity}x
                      </td>
                      <td className="py-1 pl-2">
                        {item.productId?.title || 'Unknown Item'}
                        {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                          <span className="text-[10px] text-gray-600 ml-1">
                            ({Object.values(item.selectedVariants).join(', ')})
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-2 border-t-2 border-black text-center">
              <div className="text-xs font-bold tracking-widest uppercase">
                Thank you for shopping with us!
              </div>
              <div className="text-[10px] text-gray-600 mt-1">
                Please include this label clearly on the package.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
