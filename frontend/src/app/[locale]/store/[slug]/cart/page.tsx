'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/store/useCartStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartCheckoutPage({ params }: { params: { slug: string, locale: string } }) {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [qrData, setQrData] = useState<{ qrString: string; md5: string; orderId: string } | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'PAID' | 'FAILED'>('PENDING');

  useEffect(() => {
    // Fetch storeId based on slug
    fetch(`http://localhost:5000/api/stores/${params.slug}`)
      .then(res => res.json())
      .then(data => setStoreId(data._id))
      .catch(console.error);
  }, [params.slug]);

  const handleCheckout = async () => {
    if (!user) {
      alert("Please login as a customer to checkout.");
      router.push('/login');
      return;
    }

    if (!storeId || items.length === 0) return;

    setLoading(true);
    try {
      const orderData = {
        storeId,
        items: items.map(i => ({ 
          productId: i.productId, 
          quantity: i.quantity, 
          price: i.price,
          selectedVariants: i.selectedVariants 
        })),
        totalAmount: getTotalPrice(),
      };

      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setQrData(data);
      setPaymentStatus('PENDING');
      pollPaymentStatus(data.orderId, data.md5);

    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error creating order');
    } finally {
      setLoading(false);
    }
  };

  const pollPaymentStatus = (orderId: string, md5: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/orders/${orderId}/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ md5 }),
        });

        const data = await res.json();
        if (data.status === 'PAID') {
          setPaymentStatus('PAID');
          clearCart();
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Polling error', error);
      }
    }, 3000);

    setTimeout(() => {
      clearInterval(interval);
      if (paymentStatus === 'PENDING') setPaymentStatus('FAILED');
    }, 300000); 
  };

  if (items.length === 0 && paymentStatus !== 'PAID') {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
        <Link href={`/${params.locale}`} className="text-[#E84C3D] hover:underline">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h2>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.cartItemId} className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{item.title}</h4>
                  {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {Object.entries(item.selectedVariants).map(([k, v]) => (
                        <span key={k} className="mr-2 inline-block bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                          {k}: {v}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-gray-500 mt-1">${item.price.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center border rounded-md">
                  <button onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))} className="px-3 py-1 hover:bg-gray-100">-</button>
                  <span className="px-3 border-x">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="px-3 py-1 hover:bg-gray-100">+</button>
                </div>
                <div className="font-bold w-20 text-right">${(item.price * item.quantity).toFixed(2)}</div>
                <button onClick={() => removeItem(item.cartItemId)} className="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t pt-6 flex justify-between items-center">
          <div className="text-xl font-medium text-gray-900">Total</div>
          <div className="text-3xl font-bold text-gray-900">${getTotalPrice().toFixed(2)}</div>
        </div>

        <div className="mt-8">
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-lg text-lg font-semibold hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Processing...' : 'Pay with KHQR Bakong'}
          </button>
        </div>
      </div>

      {/* QR Modal Overlay */}
      {qrData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-sm w-full text-center">
            {paymentStatus === 'PAID' ? (
              <div>
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-500 text-4xl">✓</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h3>
                <p className="text-gray-500 mb-6">Your payment was successful. The merchant will process your order soon.</p>
                <button onClick={() => { setQrData(null); router.push(`/${params.locale}`); }} className="w-full bg-black text-white py-2 rounded-md">
                  Continue Shopping
                </button>
              </div>
            ) : paymentStatus === 'FAILED' ? (
               <div>
                <h3 className="text-xl font-bold text-red-600 mb-2">Payment Timeout</h3>
                <button onClick={() => setQrData(null)} className="w-full bg-gray-200 text-gray-800 py-2 rounded-md">
                  Close
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Scan to Pay with Bakong</h3>
                <p className="text-sm text-gray-500 mb-6">Total: ${getTotalPrice().toFixed(2)}</p>
                <div className="bg-white p-4 rounded-lg inline-block shadow-sm border border-gray-100 mb-6">
                  <QRCodeSVG value={qrData.qrString} size={200} />
                </div>
                <div className="flex items-center justify-center text-sm text-[#E84C3D] mb-6">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#E84C3D]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Waiting for payment confirmation...
                </div>
                <button onClick={() => setQrData(null)} className="w-full text-gray-500 hover:text-gray-700 py-2">
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
