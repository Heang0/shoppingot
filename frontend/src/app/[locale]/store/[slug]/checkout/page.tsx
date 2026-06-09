'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useCartStore } from '@/lib/store/useCartStore';
import { useCustomerAuthStore } from '@/lib/store/useCustomerAuthStore';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import BakongKHQRModal from '@/components/payment/BakongKHQRModal';
import { ChevronLeft } from 'lucide-react';
import Select from 'react-select';

export default function CheckoutPage({ params }: { params: { slug: string, locale: string } }) {
  const { items, getTotalPrice, clearCart, _hasHydrated } = useCartStore();
  const user = useCustomerAuthStore((state) => state.customerInfo);
  const setCustomerInfo = useCustomerAuthStore((state) => state.setCustomerInfo);
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [store, setStore] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [qrData, setQrData] = useState<{ qrString: string; md5: string; orderId: string; totalAmount: number; currency: string; deepLink?: string } | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'IDLE' | 'PENDING' | 'PAID' | 'FAILED'>('IDLE');
  const [paymentMethod, setPaymentMethod] = useState<'KHQR' | 'bakong_app'>('KHQR');

  // Checkout State
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestAddress, setGuestAddress] = useState('');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempPhone, setTempPhone] = useState('');
  
  // Geo Data State
  const [geoData, setGeoData] = useState<any[]>([]);
  const [tempProvince, setTempProvince] = useState<any>(null);
  const [tempDistrict, setTempDistrict] = useState<any>(null);
  const [tempCommune, setTempCommune] = useState<any>(null);
  const [tempStreet, setTempStreet] = useState('');
  const [deliveryPartner, setDeliveryPartner] = useState('J&T Express');
  const [deliveryNote, setDeliveryNote] = useState('');

  // Promo State
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);

  const [themeStyle, setThemeStyle] = useState('default');
  const [primaryColor, setPrimaryColor] = useState('#000000');
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
    bakongApp: isKm ? 'ទូទាត់តាមរយៈកម្មវិធីបាគង' : 'Pay via Bakong App',
    bakongAppDesc: isKm ? 'ចុចដើម្បីបើកកម្មវិធីបាគងដោយផ្ទាល់' : 'Tap to pay directly with Bakong',
    mobileOnly: isKm ? 'សម្រាប់តែទូរស័ព្ទដៃ' : 'Mobile Only',
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
    { id: 'J&T Express', name: isKm ? 'ក្រុមហ៊ុន J&T Express' : 'J&T Express', logo: '/logo/J&T.webp', desc: isKm ? 'សម្រាប់ឥវ៉ាន់តាមខេត្ត - Delivery to Provinces' : 'Delivery to Provinces', fee: 0 },
    { id: 'VET Express', name: isKm ? 'វីរៈប៊ុនថាំអិចប្រេស - VET' : 'VET Express', logo: '/logo/VET.png', desc: isKm ? 'សម្រាប់ឥវ៉ាន់តាមខេត្ត - Delivery to Provinces' : 'Delivery to Provinces', fee: 0 },
    { id: 'Grab', name: isKm ? 'គ្រេប - Grab' : 'Grab', logo: '/logo/Grab.png', desc: isKm ? 'សម្រាប់ឥវ៉ាន់ក្នុងក្រុង - Delivery in City' : 'Delivery in City', fee: 0 },
  ];

  const totalProduct = getTotalPrice();

  const currentDeliveryFee = useMemo(() => {
    let fee = deliveryOptions.find(d => d.id === deliveryPartner)?.fee || 0;
    if (store?.deliverySettings?.isFreeDeliveryEnabled && store?.deliverySettings?.freeDeliveryThreshold > 0) {
      if (totalProduct >= store.deliverySettings.freeDeliveryThreshold) {
        fee = 0;
      }
    }
    return fee;
  }, [deliveryPartner, store, totalProduct]);

  const discount = discountAmount;
  const totalAfterDiscount = totalProduct - discount;
  const grandTotal = totalAfterDiscount + currentDeliveryFee;

  useEffect(() => {
    setMounted(true);

    // Removed redirect to prevent Next.js URL rewrite leak. We'll handle empty state in render.

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
      } catch (e) { }
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stores/${params.slug}`)
      .then(res => res.json())
      .then(data => {
        setStoreId(data._id);
        setStore(data);
        const previewTheme = searchParams.get('theme');
        const previewColor = searchParams.get('color');
        setThemeStyle(previewTheme || data.branding?.themeStyle || 'default');
        setPrimaryColor(previewColor || data.branding?.primaryColor || '#000000');
      })
      .catch(console.error);

    // Fetch Cambodia Geo Data
    fetch('/data/cambodia_geo.json')
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(console.error);
  }, [params.slug, searchParams, items.length, router, params.locale]);

  useEffect(() => {
    // If the cart total changes, we should re-validate or remove the promo if it drops below minPurchase
  }, [totalProduct]);

  useEffect(() => {
    if (user) {
      if (user.addresses && user.addresses.length > 0) {
        const defaultAddr = user.addresses.find((a: any) => a.isDefault) || user.addresses[0];
        if (!guestAddress) {
          setGuestName(defaultAddr.recipientName);
          setGuestPhone(defaultAddr.phoneNumber);
          setGuestAddress(defaultAddr.addressString);
        }
      } else {
        if (!guestName) setGuestName(user.name || '');
        if (!guestPhone) setGuestPhone(user.phone || '');
        if (!guestAddress) setGuestAddress(user.address || '');
      }
    }
  }, [user]);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setApplyingPromo(true);
    setPromoError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/promos/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId,
          code: promoInput,
          orderValue: totalProduct,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setAppliedPromo(data.code);
      setDiscountAmount(data.discountAmount);
    } catch (err: any) {
      setPromoError(err.message);
      setAppliedPromo(null);
      setDiscountAmount(0);
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleCheckout = async () => {
    if (!guestName || !guestPhone || !guestAddress) {
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
        promoCode: appliedPromo,
        guestInfo: { name: guestName, phone: guestPhone, address: guestAddress },
        paymentMethod
      };

      // Auto-saving is handled when they create the address from the modal.
      const endpoint = user ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders` : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders/guest`;
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

  const pollIntervalRef = useRef<any>(null);

  const clearPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const pollPaymentStatus = (orderId: string, md5: string) => {
    clearPolling();
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders/${orderId}/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ md5 }),
        });
        const data = await res.json();
        if (data.status === 'PAID') {
          setPaymentStatus('PAID');
          clearPolling();
          // Do NOT clear cart or sessionStorage here — that would redirect away
          // before the success modal is visible. Cleanup is done in onSuccessClose.
        }
      } catch (error) {
        console.error('Polling error', error);
      }
    }, 3000);

    setTimeout(() => {
      clearPolling();
      setPaymentStatus((current) => {
        if (current === 'PENDING') {
          sessionStorage.removeItem('pendingCartQR');
          return 'FAILED';
        }
        return current;
      });
    }, 300000);
  };

  const handleSimulatePay = async () => {
    if (!qrData?.orderId) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders/${qrData.orderId}/simulate-pay`, { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
  };

  if (!mounted) return null;

  if (_hasHydrated && items.length === 0 && !sessionStorage.getItem('pendingCartQR')) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] px-4 text-center bg-white dark:bg-[#111111]">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{isKm ? 'កន្ត្រករបស់អ្នកទទេ' : 'Your cart is empty'}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">{isKm ? 'អ្នកមិនទាន់មានទំនិញក្នុងកន្ត្រកនៅឡើយទេដើម្បីធ្វើការទូទាត់។' : 'You have no items in your cart to checkout.'}</p>
        <Link
          href={`/${params.locale}`}
          className="text-white font-semibold px-8 py-3 rounded-full hover:scale-105 transition-transform"
          style={{ backgroundColor: primaryColor || '#000' }}
        >
          {isKm ? 'ត្រលប់ទៅទិញទំនិញវិញ' : 'Return to Shopping'}
        </Link>
      </div>
    );
  }

  const provinceOptions = geoData.map((p: any) => ({ value: p, label: isKm ? p.name_km : p.name_en }));
  const districtOptions = tempProvince ? tempProvince.districts.map((d: any) => ({ value: d, label: isKm ? d.name_km : d.name_en })) : [];
  const communeOptions = tempDistrict ? tempDistrict.communes.map((c: any) => ({ value: c, label: isKm ? c.name_km : c.name_en })) : [];

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

          {/* Promo Code Input */}
          <div className={`p-5 space-y-3 ${themeStyle === 'neo-brutalism' ? 'border-[3px] border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-[#111111]' :
            themeStyle === 'minimalist' ? 'border border-gray-200 dark:border-gray-800 rounded-sm bg-gray-50/50 dark:bg-[#1a1a1a]/50' :
              'bg-gray-50 dark:bg-gray-900 rounded-xl'
            }`}>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{isKm ? 'លេខកូដបញ្ចុះតម្លៃ' : 'Promo Code'}</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={isKm ? 'បញ្ចូលលេខកូដ...' : 'Enter code'}
                value={promoInput}
                onChange={e => setPromoInput(e.target.value)}
                disabled={applyingPromo || !!appliedPromo}
                className={`flex-1 px-4 py-2.5 text-sm outline-none transition-all uppercase ${themeStyle === 'neo-brutalism' ? 'border-[2px] border-black dark:border-white bg-gray-50 dark:bg-[#1a1a1a] focus:ring-0 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' :
                  themeStyle === 'minimalist' ? 'border border-gray-200 dark:border-gray-800 rounded-sm bg-transparent focus:border-black dark:focus:border-white' :
                    'bg-white dark:bg-[#111111] rounded-lg border border-gray-200 dark:border-gray-800 focus:border-black dark:focus:border-white'
                  }`}
              />
              {appliedPromo ? (
                <button
                  onClick={() => { setAppliedPromo(null); setDiscountAmount(0); setPromoInput(''); setPromoError(''); }}
                  className="px-4 py-2.5 bg-red-100 text-red-600 rounded-lg text-sm font-bold hover:bg-red-200 transition-colors"
                >
                  {isKm ? 'ដកចេញ' : 'Remove'}
                </button>
              ) : (
                <button
                  onClick={handleApplyPromo}
                  disabled={applyingPromo || !promoInput.trim()}
                  className={`px-6 py-2.5 text-sm font-bold transition-all disabled:opacity-50 ${themeStyle === 'neo-brutalism' ? 'border-[2px] border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none bg-black text-white dark:bg-white dark:text-black uppercase' :
                    themeStyle === 'minimalist' ? 'border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black rounded-sm hover:opacity-90 uppercase tracking-wider' :
                      'bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-90'
                    }`}
                >
                  {applyingPromo ? '...' : (isKm ? 'អនុវត្ត' : 'Apply')}
                </button>
              )}
            </div>
            {promoError && <p className="text-xs text-red-500 font-medium">{promoError}</p>}
            {appliedPromo && <p className="text-xs text-green-500 font-medium">{isKm ? `លេខកូដបញ្ចុះតម្លៃ '${appliedPromo}' បានអនុវត្តដោយជោគជ័យ!` : `Promo code '${appliedPromo}' applied successfully!`}</p>}
          </div>

          {/* Calculation Summary */}
          <div className={`p-5 space-y-3 ${themeStyle === 'neo-brutalism' ? 'border-[3px] border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-[#111111]' :
            themeStyle === 'minimalist' ? 'border border-gray-200 dark:border-gray-800 rounded-sm bg-gray-50/50 dark:bg-[#1a1a1a]/50' :
              'bg-gray-50 dark:bg-gray-900 rounded-xl'
            }`}>
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
          <div className={`mb-8 p-5 ${themeStyle === 'neo-brutalism' ? 'border-[3px] border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-[#111111]' :
            themeStyle === 'minimalist' ? 'border border-gray-200 dark:border-gray-800 rounded-sm bg-gray-50/50 dark:bg-[#1a1a1a]/50' :
              'border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm'
            }`}>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{text.guestDetails}</h3>

            {user ? (
              <div className="space-y-4">
                {user?.addresses && user.addresses.length > 1 && (
                  <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-900 dark:text-gray-300 mb-2">{isKm ? 'ជ្រើសរើសអាសយដ្ឋាន' : 'Select Address'}</label>
                    <select 
                      className={`w-full p-3 text-sm ${themeStyle === 'neo-brutalism' ? 'border-[2px] border-black' : 'border border-gray-200 rounded-lg'} bg-white dark:bg-gray-900`}
                      onChange={(e) => {
                        const addr = user?.addresses?.find((a: any) => a._id === e.target.value);
                        if (addr) {
                          setGuestName(addr.recipientName);
                          setGuestPhone(addr.phoneNumber);
                          setGuestAddress(addr.addressString);
                        }
                      }}
                      value={user?.addresses?.find((a: any) => a.addressString === guestAddress)?._id || ''}
                    >
                      <option value="" disabled>{isKm ? 'ជ្រើសរើសអាសយដ្ឋាន...' : 'Select an address...'}</option>
                      {user?.addresses?.map((addr: any) => (
                        <option key={addr._id} value={addr._id}>{addr.recipientName} - {addr.addressString}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div className={`p-4 bg-gray-50 dark:bg-[#1a1a1a] ${themeStyle === 'neo-brutalism' ? 'border-[2px] border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : themeStyle === 'minimalist' ? 'border border-gray-200 dark:border-gray-800 rounded-sm' : 'rounded-lg border border-gray-200 dark:border-gray-800'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{guestName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-mono mt-0.5">{guestPhone}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">{guestAddress || (isKm ? 'សូមបញ្ចូលអាសយដ្ឋានដឹកជញ្ជូន' : 'Please provide a shipping address')}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setTempName(user?.name || '');
                    setTempPhone(user?.phone || '');
                    setTempProvince(null);
                    setTempDistrict(null);
                    setTempCommune(null);
                    setTempStreet('');
                    setIsAddressModalOpen(true);
                  }}
                  className={`w-full py-2.5 text-sm font-semibold transition-all ${themeStyle === 'neo-brutalism' ? 'border-[2px] border-black dark:border-white bg-white dark:bg-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' :
                    themeStyle === 'minimalist' ? 'border border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white' :
                      'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg'
                    }`}
                >
                  {isKm ? 'បញ្ចូលអាសយដ្ឋានថ្មី' : 'Add New Address'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <input type="text" placeholder={text.fullName} value={guestName} onChange={e => setGuestName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 px-4 py-3 text-sm rounded-lg outline-none border border-transparent focus:border-black dark:focus:border-white transition-all" />
                <input type="tel" placeholder={text.phoneNumber} value={guestPhone} onChange={e => setGuestPhone(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 px-4 py-3 text-sm rounded-lg outline-none border border-transparent focus:border-black dark:focus:border-white transition-all" />
                <textarea placeholder={text.deliveryAddress} value={guestAddress} onChange={e => setGuestAddress(e.target.value)} rows={3}
                  className="w-full bg-gray-50 dark:bg-gray-900 px-4 py-3 text-sm rounded-lg outline-none border border-transparent focus:border-black dark:focus:border-white transition-all resize-none" />
              </div>
            )}
          </div>

          {/* Delivery Options */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">{text.deliveryPartners}</h3>
              {store?.deliverySettings?.isFreeDeliveryEnabled && store?.deliverySettings?.freeDeliveryThreshold > 0 && (
                <span className={`text-xs font-bold px-2 py-1 ${totalProduct >= store.deliverySettings.freeDeliveryThreshold
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  } ${themeStyle === 'neo-brutalism' ? 'border-[2px] border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'rounded-full'}`}>
                  {totalProduct >= store.deliverySettings.freeDeliveryThreshold
                    ? (isKm ? 'អ្នកទទួលបានការដឹកជញ្ជូនឥតគិតថ្លៃ!' : 'You get free delivery!')
                    : (isKm
                      ? `ទិញបន្ថែម $${(store.deliverySettings.freeDeliveryThreshold - totalProduct).toFixed(2)} ទៀតដើម្បីបានដឹកជញ្ជូនឥតគិតថ្លៃ`
                      : `Buy $${(store.deliverySettings.freeDeliveryThreshold - totalProduct).toFixed(2)} more for Free Delivery`)}
                </span>
              )}
            </div>
            <div className="space-y-3">
              {deliveryOptions.map((partner) => (
                <label key={partner.id} className={`flex items-center gap-3 p-3 cursor-pointer transition-all ${themeStyle === 'neo-brutalism' ? `border-[2px] rounded-none ${deliveryPartner === partner.id ? 'border-black dark:border-white bg-gray-50 dark:bg-[#1a1a1a] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-x-[2px] -translate-y-[2px]' : 'border-black dark:border-white'}` :
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
                  <span className="text-sm font-bold text-green-600 dark:text-green-400 shrink-0">
                    {(store?.deliverySettings?.isFreeDeliveryEnabled && store?.deliverySettings?.freeDeliveryThreshold > 0 && totalProduct >= store.deliverySettings.freeDeliveryThreshold)
                      ? <span className="text-green-500 uppercase">FREE</span>
                      : `$${partner.fee.toFixed(2)}`}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Delivery Note */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{text.deliveryNote}</h3>
            <input type="text" placeholder={text.deliveryNotePlaceholder} value={deliveryNote} onChange={e => setDeliveryNote(e.target.value)}
              className={`w-full px-4 py-3 text-sm outline-none transition-all ${themeStyle === 'neo-brutalism' ? 'border-[3px] border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-gray-50 dark:bg-[#111111] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' :
                themeStyle === 'minimalist' ? 'border border-gray-200 dark:border-gray-800 rounded-sm bg-transparent focus:border-black dark:focus:border-white' :
                  'bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 focus:border-black dark:focus:border-white'
                }`} />
          </div>

          {/* Payment Options */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{text.paymentMethod}</h3>
            <p className="text-xs text-gray-500 mb-3">{text.acceptedPaymentMethods}</p>
            <div className="space-y-3">
              {/* Option 1: KHQR */}
              <label className={`flex items-start gap-3 p-4 cursor-pointer transition-all ${themeStyle === 'neo-brutalism' ? `border-[3px] rounded-none ${paymentMethod === 'KHQR' ? 'border-black dark:border-white bg-gray-50 dark:bg-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'border-black dark:border-white'}` :
                themeStyle === 'minimalist' ? `border rounded-sm ${paymentMethod === 'KHQR' ? 'border-black dark:border-white' : 'border-gray-200 dark:border-gray-700'}` :
                  `border rounded-xl ${paymentMethod === 'KHQR' ? 'border-black dark:border-white bg-gray-50 dark:bg-[#1a1a1a]' : 'border-gray-200 dark:border-gray-800'}`
                }`}>
                <input type="radio" checked={paymentMethod === 'KHQR'} onChange={() => setPaymentMethod('KHQR')} className="hidden" />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-2 ${paymentMethod === 'KHQR' ? 'border-black dark:border-white' : 'border-gray-300 dark:border-gray-600'}`}>
                  {paymentMethod === 'KHQR' && <div className="w-2.5 h-2.5 rounded-full bg-black dark:bg-white"></div>}
                </div>
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shrink-0 p-1.5">
                  <img src="/logo/KHQR Logo.png" alt="KHQR" className="w-full h-full object-contain brightness-0 invert" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">Bakong KHQR</h4>
                    <span className="text-[10px] font-medium px-2 py-0.5 bg-green-100 text-green-700 rounded-full">• {text.instantApproval}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{text.bakongPayment}</p>
                </div>
              </label>

            </div>
          </div>

          {/* Checkout Button */}
          {(store as any)?.plan?.planId?.price === 0 ? (
            <div className="w-full bg-gray-100 dark:bg-gray-800 text-gray-500 py-4 rounded-xl text-center text-sm font-semibold">
              <span className="block mb-1 text-gray-800 dark:text-gray-200">{text.onlinePaymentsUnavailable}</span>
              {text.freePlanMessage}
            </div>
          ) : (
            <button
              onClick={handleCheckout}
              disabled={loading || paymentStatus === 'PENDING'}
              className={`w-full py-4 text-lg font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${themeStyle === 'neo-brutalism' ? 'border-[3px] border-black dark:border-white rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none uppercase tracking-widest' :
                themeStyle === 'minimalist' ? 'rounded-sm tracking-widest uppercase hover:opacity-90' :
                  'rounded-xl shadow-xl hover:scale-[1.01] active:scale-[0.99]'
                }`}
              style={{ backgroundColor: primaryColor || '#000' }}
            >
              {loading ? text.processing : text.checkoutBtn}
            </button>
          )}
        </div>
      </div>

      {/* QR Modal */}
      {qrData && (
        <BakongKHQRModal
          qrString={qrData.qrString}
          amount={qrData.totalAmount}
          currency={qrData.currency}
          merchantName={store?.name || "ShoppingOT Merchant"}
          isPaid={paymentStatus === 'PAID'}
          locale={params.locale}
          onClose={() => { clearPolling(); setQrData(null); sessionStorage.removeItem('pendingCartQR'); }}
          onSuccessClose={() => { clearPolling(); setQrData(null); sessionStorage.removeItem('pendingCartQR'); clearCart(); window.location.href = `/${params.locale}/store/${params.slug}/orders/${qrData.orderId}`; }}
          onSimulatePay={handleSimulatePay}
        />
      )}

      {/* Change Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
          <div className={`w-full max-w-md bg-white dark:bg-[#111111] p-6 ${themeStyle === 'neo-brutalism'
            ? 'border-[3px] border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] rounded-none'
            : 'rounded-2xl shadow-xl'
            } overflow-hidden`}>

            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
              {isKm ? 'បញ្ចូលអាសយដ្ឋានថ្មី' : 'Enter New Address'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-gray-300 mb-1.5">{isKm ? 'ឈ្មោះពេញ' : 'Full Name'}</label>
                <input
                  type="text"
                  value={tempName}
                  onChange={e => setTempName(e.target.value)}
                  className={`w-full px-4 py-3 text-sm outline-none transition-all ${themeStyle === 'neo-brutalism' ? 'border-[3px] border-black dark:border-white bg-gray-50 dark:bg-[#1a1a1a] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 focus:border-black dark:focus:border-white'
                    }`}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-gray-300 mb-1.5">{isKm ? 'លេខទូរស័ព្ទ' : 'Phone Number'}</label>
                <input
                  type="tel"
                  value={tempPhone}
                  onChange={e => setTempPhone(e.target.value)}
                  className={`w-full px-4 py-3 text-sm outline-none transition-all ${themeStyle === 'neo-brutalism' ? 'border-[3px] border-black dark:border-white bg-gray-50 dark:bg-[#1a1a1a] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 focus:border-black dark:focus:border-white'
                    }`}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-gray-300 mb-1.5">{isKm ? 'រាជធានី/ខេត្ត' : 'Province'}</label>
                <Select
                  options={provinceOptions}
                  value={provinceOptions.find((opt: any) => opt.value.code === tempProvince?.code) || null}
                  onChange={(selected: any) => {
                    setTempProvince(selected?.value || null);
                    setTempDistrict(null);
                    setTempCommune(null);
                  }}
                  placeholder={isKm ? 'ជ្រើសរើសខេត្ត...' : 'Select Province...'}
                  className="text-sm text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-gray-300 mb-1.5">{isKm ? 'ក្រុង/ស្រុក' : 'District'}</label>
                <Select
                  options={districtOptions}
                  value={districtOptions.find((opt: any) => opt.value.code === tempDistrict?.code) || null}
                  onChange={(selected: any) => {
                    setTempDistrict(selected?.value || null);
                    setTempCommune(null);
                  }}
                  placeholder={isKm ? 'ជ្រើសរើសស្រុក...' : 'Select District...'}
                  isDisabled={!tempProvince}
                  className="text-sm text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-gray-300 mb-1.5">{isKm ? 'ឃុំ/សង្កាត់' : 'Commune'}</label>
                <Select
                  options={communeOptions}
                  value={communeOptions.find((opt: any) => opt.value.code === tempCommune?.code) || null}
                  onChange={(selected: any) => setTempCommune(selected?.value || null)}
                  placeholder={isKm ? 'ជ្រើសរើសឃុំ...' : 'Select Commune...'}
                  isDisabled={!tempDistrict}
                  className="text-sm text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-gray-300 mb-1.5">{isKm ? 'ផ្ទះលេខ/ផ្លូវ' : 'Street/House No.'}</label>
                <input
                  type="text"
                  value={tempStreet}
                  onChange={e => setTempStreet(e.target.value)}
                  placeholder={isKm ? 'ឧ. ផ្ទះលេខ 12, ផ្លូវ 123' : 'Ex. House 12, Street 123'}
                  className={`w-full px-4 py-3 text-sm outline-none transition-all ${themeStyle === 'neo-brutalism' ? 'border-[3px] border-black dark:border-white bg-gray-50 dark:bg-[#1a1a1a] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 focus:border-black dark:focus:border-white'}`}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className={`flex-1 py-3 text-sm font-bold transition-all ${themeStyle === 'neo-brutalism' ? 'border-[2px] border-black dark:border-white bg-white dark:bg-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black dark:text-white' :
                  'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
              >
                {isKm ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                onClick={async () => {
                  if (!tempName || !tempPhone || !tempProvince || !tempDistrict || !tempCommune || !tempStreet) {
                    alert(isKm ? 'សូមបំពេញព័ត៌មានឲ្យបានគ្រប់គ្រាន់' : 'Please fill all fields');
                    return;
                  }

                  const addressParts = [];
                  if (tempStreet) addressParts.push(tempStreet);
                  if (tempCommune) addressParts.push(isKm ? tempCommune.name_km : tempCommune.name_en);
                  if (tempDistrict) addressParts.push(isKm ? tempDistrict.name_km : tempDistrict.name_en);
                  if (tempProvince) addressParts.push(isKm ? tempProvince.name_km : tempProvince.name_en);
                  const finalAddress = addressParts.join(', ');

                  if (user) {
                    try {
                      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/addresses`, {
                        method: 'POST',
                        headers: { 
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${user.token}`
                        },
                        body: JSON.stringify({
                          recipientName: tempName,
                          phoneNumber: tempPhone,
                          addressString: finalAddress
                        })
                      });
                      if (res.ok) {
                        const updatedAddresses = await res.json();
                        setCustomerInfo({ ...user, addresses: updatedAddresses });
                      }
                    } catch (err) {
                      console.error('Failed to save address', err);
                    }
                  }
                  
                  setGuestName(tempName);
                  setGuestPhone(tempPhone);
                  setGuestAddress(finalAddress);
                  setIsAddressModalOpen(false);
                }}
                className={`flex-1 py-3 text-sm font-bold text-white transition-all ${themeStyle === 'neo-brutalism' ? 'border-[2px] border-black dark:border-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' :
                  'rounded-lg shadow-md hover:opacity-90'
                  }`}
                style={{ backgroundColor: primaryColor || '#000' }}
              >
                {isKm ? 'ប្រើប្រាស់អាសយដ្ឋាននេះ' : 'Use this address'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
