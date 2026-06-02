'use client';

import { useState, useEffect, useMemo } from 'react';
import { useCartStore } from '@/lib/store/useCartStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import BakongKHQRModal from '@/components/payment/BakongKHQRModal';
import { ChevronLeft } from 'lucide-react';

export default function CheckoutPage({ params }: { params: { slug: string, locale: string } }) {
  const { items, getTotalPrice, clearCart, _hasHydrated } = useCartStore();
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [store, setStore] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [qrData, setQrData] = useState<{ qrString: string; md5: string; orderId: string } | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'PAID' | 'FAILED'>('PENDING');

  // Checkout State
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestAddress, setGuestAddress] = useState('');
  const [deliveryPartner, setDeliveryPartner] = useState('J&T Express');
  const [deliveryNote, setDeliveryNote] = useState('');
  
  const [themeStyle, setThemeStyle] = useState('default');
  const searchParams = useSearchParams();
  const isKm = params.locale === 'km';
  
  const text = {
    checkout: isKm ? 'ការទូទាត់' : 'Checkout',
    fillGuest: isKm ? 'សូមបំពេញព័ត៌មានទំនាក់ទំនងភ្ញៀវទាំងអស់ ដើម្បីបន្ត។' : 'Please fill in all guest contact details to proceed.',
    createOrderError: isKm ? 'មានបញ្ហាក្នុងការបង្កើតការបញ្ជាទិញ' : 'Error creating order',
    guestDetails: isKm ? 'ព័ត៌មានទំនាក់ទំនងភ្ញៀវ / Shipping Address' : 'Shipping Address',
    fullName: isKm ? 'ឈ្មោះពេញ / Full Name' : 'Full Name',
    phoneNumber: isKm ? 'លេខទូរស័ព្ទ / Phone Number' : 'Phone Number',
    deliveryAddress: isKm ? 'អាសយដ្ឋានដឹកជញ្ជូន / Address' : 'Address',
    deliveryPartners: isKm ? 'ជម្រើសដឹកជញ្ជូន / Select Delivery' : 'Select Delivery',
    deliveryNote: isKm ? 'ចំណាំពីការដឹកជញ្ជូន / Delivery Note' : 'Delivery Note',
    deliveryNotePlaceholder: isKm ? 'ឧទាហរណ៍: ផ្ទះជាន់ផ្ទាល់ដី ជាដើម' : 'Ex: At the ground floor, etc.',
    paymentMethod: isKm ? 'វិធីសាស្ត្រទូទាត់ / Payment Method' : 'Payment Method',
    acceptedPaymentMethods: isKm ? 'វិធីសាស្ត្រទូទាត់ដែលទទួលយក' : 'Accepted payment methods',
    instantApproval: isKm ? 'អនុម័តភ្លាមៗ' : 'Instant Approval',
    bakongPayment: isKm ? 'ទូទាត់តាម Bakong KHQR' : 'Payment via Bakong KHQR',
    totalProduct: isKm ? 'សរុបតម្លៃទំនិញ / Total Product' : 'Total Product',
    discount: isKm ? 'បញ្ចុះតម្លៃ / Discount' : 'Discount',
    totalAfterDiscount: isKm ? 'សរុបក្រោយបញ្ចុះតម្លៃ / Total After Discount' : 'Total After Discount',
    deliveryFee: isKm ? 'ថ្លៃដឹកជញ្ជូន / Delivery Fee' : 'Delivery Fee',
    grandTotal: isKm ? 'សរុបទាំងអស់ / Grand Total' : 'Grand Total',
    onlinePaymentsUnavailable: isKm ? 'មិនអាចទូទាត់តាមអនឡាញបានទេ' : 'Online Payments Unavailable',
    freePlanMessage: isKm
      ? 'ហាងនេះកំពុងប្រើគម្រោងឥតគិតថ្លៃ ហើយមិនអាចទទួលការទូទាត់ Bakong KHQR បានទេ។'
      : 'This store is on a Free Plan and cannot accept Bakong KHQR payments.',
    processing: isKm ? 'កំពុងដំណើរការ...' : 'Processing...',
    checkoutBtn: isKm ? 'បញ្ជាទិញ (KHQR)' : 'Checkout (KHQR)',
  };

  const deliveryOptions = [
    { id: 'J&T Express', name: isKm ? 'ក្រុមហ៊ុន J&T Express' : 'J&T Express', logo: '/logo/J&T.webp', desc: isKm ? 'សម្រាប់ឥវ៉ាន់តាមខេត្ត - Delivery to Provinces' : 'Delivery to Provinces', fee: 1.50 },
    { id: 'VET Express', name: isKm ? 'វីរៈប៊ុនថាំអិចប្រេស - VET' : 'VET Express', logo: '/logo/VET.png', desc: isKm ? 'សម្រាប់ឥវ៉ាន់តាមខេត្ត - Delivery to Provinces' : 'Delivery to Provinces', fee: 1.50 },
    { id: 'Grab', name: isKm ? 'គ្រេប - Grab' : 'Grab', logo: '/logo/Grab.png', desc: isKm ? 'សម្រាប់ឥវ៉ាន់ក្នុងក្រុង - Delivery in City' : 'Delivery in City', fee: 2.00 },
  ];

  const currentDeliveryFee = useMemo(() => {
    return deliveryOptions.find(d => d.id === deliveryPartner)?.fee || 0;
  }, [deliveryPartner]);

  const totalProduct = getTotalPrice();
  const discount = 0; // For future implementation
  const totalAfterDiscount = totalProduct - discount;
  const grandTotal = totalAfterDiscount + currentDeliveryFee;

  useEffect(() => {
    setMounted(true);
    
    // If no items and no active payment, redirect back to cart
    if (_hasHydrated && items.length === 0 && !sessionStorage.getItem('pendingCartQR')) {
      router.push(`/${params.locale}/cart`);
      return;
    }

    const savedQR = sessionStorage.getItem('pendingCartQR');
    if (savedQR) {
      try {
        const data = JSON.parse(savedQR);
        if (Date.now() - data.timestamp < 300000) {
          setQrData(data);
          setPaymentStatus('PENDING');
          pollPaymentStatus(data.orderId, data.md5);
        } else {
          sessionStorage.removeItem('pendingCartQR');
        }
      } catch (e) {}
    }

    fetch(`http://localhost:5000/api/stores/${params.slug}`)
      .then(res => res.json())
      .then(data => {
        setStoreId(data._id);
        setStore(data);
        const previewTheme = searchParams.get('theme');
        setThemeStyle(previewTheme || data.branding?.themeStyle || 'default');
      })
      .catch(console.error);
  }, [params.slug, searchParams, items.length, router, params.locale]);

  const handleCheckout = async () => {
    if (!user && (!guestName || !guestPhone || !guestAddress)) {
      alert(text.fillGuest);
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
        totalAmount: grandTotal,
        subtotal: totalProduct,
        deliveryPartner,
        deliveryFee: currentDeliveryFee,
        deliveryNote,
        ...( !user && { guestInfo: { name: guestName, phone: guestPhone, address: guestAddress } } )
      };

      const endpoint = user ? 'http://localhost:5000/api/orders' : 'http://localhost:5000/api/orders/guest';
      const headers: any = { 'Content-Type': 'application/json' };
      if (user) headers['Authorization'] = `Bearer ${user.token}`;

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
      alert(err.message || text.createOrderError);
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
    if (!qrData?.orderId) return;
    try {
      await fetch(`http://localhost:5000/api/orders/${qrData.orderId}/simulate-pay`, { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
  };

  if (!mounted || items.length === 0) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-[#111111]">


      <div className="max-w-6xl mx-auto w-full px-4 py-8 pb-32 lg:grid lg:grid-cols-12 lg:gap-12 items-start">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-24 order-1 lg:order-1">
          {/* Summarized Items */}
          <div className="space-y-4">
            {items.map((item) => (
            <div key={item.cartItemId} className="flex gap-4 pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
              <div className={`w-16 h-16 bg-gray-50 dark:bg-gray-900 overflow-hidden shrink-0 ${themeStyle === 'neo-brutalism' ? 'rounded-none border-[2px] border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : themeStyle === 'minimalist' ? 'rounded-sm border border-gray-200 dark:border-gray-800' : 'rounded-lg border border-gray-100 dark:border-gray-800'}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {item.imageUrl && <img src={item.imageUrl.replace('/upload/', '/upload/w_200,c_limit,q_auto/')} alt={item.title} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-0.5">{isKm && item.titleKm ? item.titleKm : item.title}</h4>
                <div className="text-gray-500 text-xs mb-1.5">
                  ${item.price.toFixed(2)} x {item.quantity}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Total :</span>
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            </div>
            ))}
          </div>

          {/* Calculation Summary */}
          <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-xl space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{text.totalProduct}</span>
              <span className="font-semibold text-gray-900 dark:text-white">${totalProduct.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{text.discount}</span>
              <span className="font-semibold text-red-500">-${discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm pt-3 border-t border-gray-200 dark:border-gray-800">
              <span className="text-gray-500 font-medium">{text.totalAfterDiscount}</span>
              <span className="font-semibold text-gray-900 dark:text-white">${totalAfterDiscount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{text.deliveryFee}</span>
              <span className="font-semibold text-gray-900 dark:text-white">${currentDeliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base pt-3 border-t border-black/10 dark:border-white/10">
              <span className="text-gray-900 dark:text-white font-bold">{text.grandTotal}</span>
              <span className="font-black text-gray-900 dark:text-white">${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-7 space-y-8 mt-8 lg:mt-0 order-2 lg:order-2">
          {/* Guest Details */}
        {!user && (
          <div className="mb-8 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{text.guestDetails}</h3>
            <div className="space-y-4">
              <input type="text" placeholder={text.fullName} value={guestName} onChange={e => setGuestName(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900 px-4 py-3 text-sm rounded-lg outline-none border border-transparent focus:border-black dark:focus:border-white transition-all" />
              <input type="tel" placeholder={text.phoneNumber} value={guestPhone} onChange={e => setGuestPhone(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900 px-4 py-3 text-sm rounded-lg outline-none border border-transparent focus:border-black dark:focus:border-white transition-all" />
              <textarea placeholder={text.deliveryAddress} value={guestAddress} onChange={e => setGuestAddress(e.target.value)} rows={3}
                className="w-full bg-gray-50 dark:bg-gray-900 px-4 py-3 text-sm rounded-lg outline-none border border-transparent focus:border-black dark:focus:border-white transition-all resize-none" />
            </div>
          </div>
        )}

        {/* Delivery Options */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">{text.deliveryPartners}</h3>
          <div className="space-y-3">
            {deliveryOptions.map((partner) => (
              <label key={partner.id} className={`flex items-center gap-3 p-3 cursor-pointer transition-all ${
                themeStyle === 'neo-brutalism' ? `border-[2px] rounded-none ${deliveryPartner === partner.id ? 'border-black dark:border-white bg-gray-50 dark:bg-[#1a1a1a] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-x-[2px] -translate-y-[2px]' : 'border-black dark:border-white'}` :
                themeStyle === 'minimalist' ? `border rounded-sm ${deliveryPartner === partner.id ? 'border-black dark:border-white' : 'border-gray-200 dark:border-gray-800'}` :
                `border rounded-xl ${deliveryPartner === partner.id ? 'border-black dark:border-white bg-gray-50 dark:bg-[#1a1a1a]' : 'border-gray-200 dark:border-gray-800'}`
              }`}>
                <input type="radio" name="delivery" value={partner.id} checked={deliveryPartner === partner.id} onChange={(e) => setDeliveryPartner(e.target.value)} className="hidden" />
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${deliveryPartner === partner.id ? 'border-black dark:border-white' : 'border-gray-300 dark:border-gray-700'}`}>
                  {deliveryPartner === partner.id && <div className="w-2 h-2 rounded-full bg-black dark:bg-white" />}
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={partner.logo} alt={partner.name} className="h-8 w-12 object-contain mix-blend-multiply dark:mix-blend-normal bg-white rounded p-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1" style={{ fontFamily: 'var(--font-kantumruy), sans-serif' }}>{partner.name}</span>
                  <span className="text-xs text-gray-500 line-clamp-1 mt-0.5">{partner.desc}</span>
                </div>
                <span className="text-sm font-bold text-green-600 dark:text-green-400 shrink-0">${partner.fee.toFixed(2)}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Delivery Note */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{text.deliveryNote}</h3>
          <input type="text" placeholder={text.deliveryNotePlaceholder} value={deliveryNote} onChange={e => setDeliveryNote(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-900 px-4 py-3 text-sm rounded-lg outline-none border border-gray-200 dark:border-gray-800 focus:border-black dark:focus:border-white transition-all" />
        </div>

        {/* Payment Options */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{text.paymentMethod}</h3>
          <p className="text-xs text-gray-500 mb-3">{text.acceptedPaymentMethods}</p>
          <div className={`flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#1a1a1a] ${
            themeStyle === 'neo-brutalism' ? 'border-[3px] border-black dark:border-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' :
            themeStyle === 'minimalist' ? 'border border-gray-200 dark:border-gray-700 rounded-sm' :
            'border border-black dark:border-white rounded-xl'
          }`}>
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-black text-xs">KHQR</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Bakong KHQR</h4>
                <span className="text-[10px] font-medium px-2 py-0.5 bg-green-100 text-green-700 rounded-full">• {text.instantApproval}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{text.bakongPayment}</p>
            </div>
          </div>
        </div>

        {/* Checkout Button */}
        {(store as any)?.plan?.planId?.price === 0 ? (
          <div className="w-full bg-gray-100 dark:bg-gray-800 text-gray-500 py-4 rounded-xl text-center text-sm font-semibold">
            <span className="block mb-1 text-gray-800 dark:text-gray-200">{text.onlinePaymentsUnavailable}</span>
            {text.freePlanMessage}
          </div>
        ) : (
          <button onClick={handleCheckout} disabled={loading}
            className="w-full py-4 text-lg font-bold bg-black dark:bg-white text-white dark:text-black rounded-xl shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? text.processing : text.checkoutBtn}
          </button>
        )}
        </div>
      </div>

      {/* QR Modal */}
      {qrData && (
        <BakongKHQRModal
          qrString={qrData!.qrString}
          amount={grandTotal}
          currency="USD"
          merchantName={store?.name || "ShoppingOT Merchant"}
          isPaid={paymentStatus === 'PAID'}
          locale={params.locale}
          onClose={() => { setQrData(null); sessionStorage.removeItem('pendingCartQR'); }}
          onSuccessClose={() => { setQrData(null); sessionStorage.removeItem('pendingCartQR'); clearCart(); router.push(`/${params.locale}`); }}
          onSimulatePay={handleSimulatePay}
        />
      )}
    </div>
  );
}
