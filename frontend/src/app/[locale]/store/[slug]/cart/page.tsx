'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/store/useCartStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import BakongKHQRModal from '@/components/payment/BakongKHQRModal';

export default function CartCheckoutPage({ params }: { params: { slug: string, locale: string } }) {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [store, setStore] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [qrData, setQrData] = useState<{ qrString: string; md5: string; orderId: string } | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'PAID' | 'FAILED'>('PENDING');

  // Guest Checkout State
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestAddress, setGuestAddress] = useState('');
  const [deliveryPartner, setDeliveryPartner] = useState('J&T Express');
  const [themeStyle, setThemeStyle] = useState('default');
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
    
    // Restore pending QR session
    const savedQR = sessionStorage.getItem('pendingCartQR');
    if (savedQR) {
      try {
        const data = JSON.parse(savedQR);
        if (Date.now() - data.timestamp < 300000) { // 5 minutes validity
          setQrData(data);
          setPaymentStatus('PENDING');
          pollPaymentStatus(data.orderId, data.md5);
        } else {
          sessionStorage.removeItem('pendingCartQR');
        }
      } catch (e) {}
    }

    // Fetch store based on slug
    fetch(`http://localhost:5000/api/stores/${params.slug}`)
      .then(res => res.json())
      .then(data => {
        setStoreId(data._id);
        setStore(data);
        const previewTheme = searchParams.get('theme');
        setThemeStyle(previewTheme || data.branding?.themeStyle || 'default');
      })
      .catch(console.error);
  }, [params.slug, searchParams]);

  const handleCheckout = async () => {
    if (!user) {
      if (!guestName || !guestPhone || !guestAddress) {
        alert("Please fill in all guest contact details to proceed.");
        return;
      }
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
        ...( !user && { guestInfo: { name: guestName, phone: guestPhone, address: guestAddress } } )
      };

      const endpoint = user ? 'http://localhost:5000/api/orders' : 'http://localhost:5000/api/orders/guest';
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (user) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(orderData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setQrData(data);
      setPaymentStatus('PENDING');
      sessionStorage.setItem('pendingCartQR', JSON.stringify({ ...data, timestamp: Date.now() }));
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
          sessionStorage.removeItem('pendingCartQR');
          clearCart();
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Polling error', error);
      }
    }, 3000);

    setTimeout(() => {
      clearInterval(interval);
      if (paymentStatus === 'PENDING') {
        setPaymentStatus('FAILED');
        sessionStorage.removeItem('pendingCartQR');
      }
    }, 300000); 
  };

  const handleSimulatePay = async () => {
    // In cart page, qrData from generate-qr has `orderId`
    if (!qrData?.orderId) return;
    try {
      await fetch(`http://localhost:5000/api/orders/${qrData.orderId}/simulate-pay`, {
        method: 'POST',
      });
      // The polling loop will automatically pick up the PAID status on its next tick!
    } catch (err) {
      console.error(err);
    }
  };

  if (!mounted) return null;

  if (items.length === 0 && paymentStatus !== 'PAID') {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] px-4 text-center">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Cart is Empty</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link href={`/${params.locale}`} className="bg-black dark:bg-white text-white dark:text-black font-semibold px-8 py-3 rounded-full hover:scale-105 transition-transform">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative pb-32 lg:pb-12 max-w-7xl mx-auto w-full">
      <div className="px-4 py-4 lg:py-8 lg:px-8">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-6">My Cart</h2>

        <div className="lg:grid lg:grid-cols-3 lg:gap-12 items-start relative">
          {/* Cart Items */}
          <div className="space-y-4 lg:col-span-2">
            {items.map((item) => (
              <div key={item.cartItemId} className={`py-3 flex gap-4 ${themeStyle === 'neo-brutalism' ? 'border-b-[2px] border-black dark:border-white' : themeStyle === 'minimalist' ? 'border-b border-gray-200 dark:border-gray-800' : 'border-b border-gray-100 dark:border-gray-800'} last:border-0`}>
                <div className={`w-20 h-24 bg-gray-50 dark:bg-gray-900 overflow-hidden shrink-0 ${themeStyle === 'neo-brutalism' ? 'rounded-none border-[2px] border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]' : themeStyle === 'minimalist' ? 'rounded-sm' : 'rounded-xl'}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />}
                </div>
                <div className="flex flex-col flex-1 py-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1 pr-2">{item.title}</h4>
                    <button onClick={() => removeItem(item.cartItemId)} className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  
                  {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                    <div className="text-[11px] text-gray-500 mt-1 line-clamp-1">
                      {Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                    </div>
                  )}
                  
                  <div className="mt-auto flex items-center justify-between">
                    <span className="font-semibold text-gray-900 dark:text-white">${(item.price * item.quantity).toFixed(2)}</span>
                    
                    <div className={`flex items-center bg-gray-100 dark:bg-gray-800 px-1 py-1 ${themeStyle === 'neo-brutalism' ? 'rounded-none border border-black dark:border-white' : themeStyle === 'minimalist' ? 'rounded-sm' : 'rounded-full'}`}>
                      <button onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))} className={`w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 shadow-sm text-gray-600 dark:text-gray-300 ${themeStyle === 'neo-brutalism' ? 'rounded-none border border-black dark:border-white' : themeStyle === 'minimalist' ? 'rounded-sm' : 'rounded-full'}`}>-</button>
                      <span className="w-8 text-center text-xs font-bold text-gray-900 dark:text-white">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className={`w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 shadow-sm text-gray-600 dark:text-gray-300 ${themeStyle === 'neo-brutalism' ? 'rounded-none border border-black dark:border-white' : themeStyle === 'minimalist' ? 'rounded-sm' : 'rounded-full'}`}>+</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sticky Checkout Summary */}
          <div className={`fixed bottom-16 sm:fixed sm:bottom-0 lg:sticky lg:top-24 lg:bottom-auto left-0 w-full lg:w-auto bg-white/90 dark:bg-[#111111]/90 lg:bg-gray-50 lg:dark:bg-gray-900 backdrop-blur-md lg:backdrop-blur-none p-4 lg:p-8 pb-safe lg:pb-8 z-40 transition-all ${
            themeStyle === 'neo-brutalism' 
              ? 'border-t-[3px] lg:border-[3px] border-black dark:border-white rounded-none lg:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:lg:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]' 
              : themeStyle === 'minimalist'
              ? 'border-t lg:border border-gray-200 dark:border-gray-800 rounded-none'
              : 'border-t lg:border border-gray-100 dark:border-gray-800 lg:rounded-3xl lg:shadow-sm'
          }`}>
            
            {!user && (
              <div className="mb-6 lg:mb-8 border-b lg:border-none border-gray-200 dark:border-gray-800 pb-4 lg:pb-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Guest Contact Details</h3>
                <div className="space-y-3">
                  {['Full Name', 'Phone Number', 'Delivery Address'].map((placeholder, idx) => {
                    const value = idx === 0 ? guestName : idx === 1 ? guestPhone : guestAddress;
                    const setter = idx === 0 ? setGuestName : idx === 1 ? setGuestPhone : setGuestAddress;
                    return (
                      <input 
                        key={placeholder}
                        type={idx === 1 ? "tel" : "text"} 
                        placeholder={placeholder} 
                        value={value} 
                        onChange={e => setter(e.target.value)} 
                        className={`w-full bg-white dark:bg-[#111111] lg:bg-gray-50 lg:dark:bg-gray-900 px-4 py-2.5 text-sm outline-none transition-all ${
                          themeStyle === 'neo-brutalism' ? 'border-[2px] border-black dark:border-white rounded-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[1px] hover:translate-y-[1px]' :
                          themeStyle === 'minimalist' ? 'border border-gray-300 dark:border-gray-700 rounded-sm focus:border-black dark:focus:border-white' :
                          'border border-gray-200 dark:border-gray-800 rounded-xl focus:border-black dark:focus:border-white'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mb-6 lg:mb-8 border-b lg:border-none border-gray-200 dark:border-gray-800 pb-4 lg:pb-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Delivery Partners</h3>
              <div className="space-y-3">
                {[
                  { id: 'J&T Express', name: 'J&T - ជេអែនធី', logo: '/logo/J&T.webp' },
                  { id: 'VET Express', name: 'VET express - វីរៈប៊ុនថាំ', logo: '/logo/VET.png' },
                  { id: 'Grab', name: 'Grab - គ្រេប', logo: '/logo/Grab.png' },
                ].map((partner) => (
                  <label key={partner.id} className={`flex items-center gap-3 p-3 cursor-pointer transition-all ${
                    themeStyle === 'neo-brutalism' ? `border-[2px] rounded-none ${deliveryPartner === partner.id ? 'border-black dark:border-white bg-gray-50 dark:bg-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] translate-x-[-2px] translate-y-[-2px]' : 'border-black dark:border-white hover:bg-gray-50 dark:hover:bg-gray-900'}` :
                    themeStyle === 'minimalist' ? `border rounded-sm ${deliveryPartner === partner.id ? 'border-black dark:border-white bg-gray-50 dark:bg-[#1a1a1a]' : 'border-gray-200 dark:border-gray-800 hover:border-gray-400'}` :
                    `border rounded-xl ${deliveryPartner === partner.id ? 'border-black dark:border-white bg-gray-50 dark:bg-[#1a1a1a]' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'}`
                  }`}>
                    <input type="radio" name="delivery" value={partner.id} checked={deliveryPartner === partner.id} onChange={(e) => setDeliveryPartner(e.target.value)} className="hidden" />
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${deliveryPartner === partner.id ? 'border-black dark:border-white' : 'border-gray-300 dark:border-gray-700'}`}>
                      {deliveryPartner === partner.id && <div className="w-2 h-2 rounded-full bg-black dark:bg-white" />}
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={partner.logo} alt={partner.name} className="h-8 w-12 object-contain mix-blend-multiply dark:mix-blend-normal bg-white rounded p-1 shrink-0" />
                    <span 
                      className={`text-sm font-medium ${themeStyle === 'neo-brutalism' && deliveryPartner === partner.id ? 'font-bold' : ''} text-gray-900 dark:text-white`}
                      style={{ fontFamily: 'var(--font-kantumruy), sans-serif' }}
                    >
                      {partner.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6 lg:mb-8 border-b lg:border-none border-gray-200 dark:border-gray-800 pb-4 lg:pb-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Payment Method</h3>
              <p className="text-xs text-gray-500 mb-3">Accepted payment methods</p>
              <div className={`flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#1a1a1a] ${
                themeStyle === 'neo-brutalism' ? 'border-[3px] border-black dark:border-white rounded-none shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[5px_5px_0px_0px_rgba(255,255,255,1)]' :
                themeStyle === 'minimalist' ? 'border border-gray-300 dark:border-gray-700 rounded-sm' :
                'border border-black dark:border-white rounded-xl'
              }`}>
                <div className={`w-12 h-12 bg-red-600 flex items-center justify-center shrink-0 ${themeStyle === 'neo-brutalism' ? 'rounded-none border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]' : 'rounded-lg'}`}>
                  <span className="text-white font-black text-xs">KHQR</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">Bakong KHQR</h4>
                    <span className="text-[10px] font-medium px-2 py-0.5 bg-green-100 text-green-700 rounded-full shrink-0 whitespace-nowrap">• Instant Approval</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Payment via Bakong KHQR</p>
                </div>
              </div>
            </div>

            <h3 className="hidden lg:block text-lg font-bold text-gray-900 dark:text-white mb-6">Order Summary</h3>
            <div className="flex justify-between items-end mb-4 px-2 lg:px-0">
              <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">Total Amount</span>
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white">${getTotalPrice().toFixed(2)}</span>
            </div>
            {store?.plan?.planId?.price === 0 ? (
              <div className="w-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 py-4 rounded-2xl text-center text-sm font-semibold shadow-inner mt-4 border border-gray-200 dark:border-gray-700">
                <span className="block mb-1 text-gray-800 dark:text-gray-200">Online Payments Unavailable</span>
                This store is on a Free Plan and cannot accept Bakong KHQR payments. Please contact the merchant directly to order.
              </div>
            ) : (
              <button
                onClick={handleCheckout}
                disabled={loading}
                className={`w-full py-4 text-lg font-bold transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 ${
                  themeStyle === 'neo-brutalism'
                    ? 'bg-white text-black dark:bg-black dark:text-white border-[3px] border-black dark:border-white rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none uppercase tracking-widest'
                    : themeStyle === 'minimalist'
                    ? 'bg-black text-white dark:bg-white dark:text-black rounded-sm tracking-widest uppercase hover:bg-gray-800 dark:hover:bg-gray-200'
                    : 'bg-black dark:bg-white text-white dark:text-black rounded-2xl shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {loading ? 'Processing...' : 'Checkout (KHQR)'}
                {!loading && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* QR Modal Overlay via BakongKHQRModal component */}
      {qrData && (
        <BakongKHQRModal
          qrString={qrData.qrString}
          amount={getTotalPrice()}
          currency="USD"
          merchantName="ShoppingOT Merchant"
          isPaid={paymentStatus === 'PAID'}
          onClose={() => { setQrData(null); sessionStorage.removeItem('pendingCartQR'); }}
          onSuccessClose={() => { setQrData(null); sessionStorage.removeItem('pendingCartQR'); clearCart(); router.push(`/${params.locale}`); }}
          onSimulatePay={handleSimulatePay}
        />
      )}
    </div>
  );
}
