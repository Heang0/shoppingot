'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/store/useCartStore';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CartPage({ params }: { params: { slug: string, locale: string } }) {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [themeStyle, setThemeStyle] = useState('default');
  const searchParams = useSearchParams();
  const isKm = params.locale === 'km';
  
  const text = {
    cartEmpty: isKm ? 'កន្ត្រកទំនេរ' : 'Cart is Empty',
    cartEmptyDesc: isKm ? 'អ្នកមិនទាន់បានបញ្ចូលទំនិញទៅក្នុងកន្ត្រកនៅឡើយទេ។' : "Looks like you haven't added anything to your cart yet.",
    startShopping: isKm ? 'ចាប់ផ្តើមទិញទំនិញ' : 'Start Shopping',
    myCart: isKm ? 'កន្ត្រករបស់ខ្ញុំ' : 'My Cart',
    totalAmount: isKm ? 'សរុប' : 'Total :',
    proceedCheckout: isKm ? 'បន្តទៅការទូទាត់' : 'Proceed to Checkout',
  };

  useEffect(() => {
    setMounted(true);
    fetch(`http://localhost:5000/api/stores/${params.slug}`)
      .then(res => res.json())
      .then(data => {
        const previewTheme = searchParams.get('theme');
        setThemeStyle(previewTheme || data.branding?.themeStyle || 'default');
      })
      .catch(console.error);
  }, [params.slug, searchParams]);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] px-4 text-center">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{text.cartEmpty}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">{text.cartEmptyDesc}</p>
        <Link href={`/${params.locale}`} className="bg-black dark:bg-white text-white dark:text-black font-semibold px-8 py-3 rounded-full hover:scale-105 transition-transform">
          {text.startShopping}
        </Link>
      </div>
    );
  }

  return (
    <div className="relative pb-48 lg:pb-12 max-w-4xl mx-auto w-full">
      <div className="px-4 py-4 lg:py-8 lg:px-8">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-6">{text.myCart}</h2>

        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.cartItemId} className={`py-4 flex gap-4 ${themeStyle === 'neo-brutalism' ? 'border-b-[2px] border-black dark:border-white' : themeStyle === 'minimalist' ? 'border-b border-gray-200 dark:border-gray-800' : 'border-b border-gray-100 dark:border-gray-800'} last:border-0`}>
              <div className={`w-24 h-24 bg-gray-50 dark:bg-gray-900 overflow-hidden shrink-0 ${themeStyle === 'neo-brutalism' ? 'rounded-none border-[2px] border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]' : themeStyle === 'minimalist' ? 'rounded-sm' : 'rounded-xl'}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {item.imageUrl && <img src={item.imageUrl.replace('/upload/', '/upload/w_300,c_limit,q_auto/')} alt={item.title} className="w-full h-full object-cover" />}
              </div>
              <div className="flex flex-col flex-1 py-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-900 dark:text-white text-base line-clamp-2 pr-2">{isKm && item.titleKm ? item.titleKm : item.title}</h4>
                  <button onClick={() => removeItem(item.cartItemId)} className="text-gray-400 hover:text-red-500 transition-colors shrink-0 mt-1">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                
                {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                  <div className="text-xs text-gray-500 mt-1.5">
                    {Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                  </div>
                )}

                <div className="mt-auto flex items-center justify-between pt-4">
                  <div className={`flex items-center bg-gray-100 dark:bg-gray-800 px-1 py-1 ${themeStyle === 'neo-brutalism' ? 'rounded-none border border-black dark:border-white' : themeStyle === 'minimalist' ? 'rounded-sm' : 'rounded-full'}`}>
                    <button onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))} className={`w-7 h-7 flex items-center justify-center bg-white dark:bg-gray-700 shadow-sm text-gray-600 dark:text-gray-300 ${themeStyle === 'neo-brutalism' ? 'rounded-none border border-black dark:border-white' : themeStyle === 'minimalist' ? 'rounded-sm' : 'rounded-full'}`}>-</button>
                    <span className="w-10 text-center text-sm font-bold text-gray-900 dark:text-white">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className={`w-7 h-7 flex items-center justify-center bg-white dark:bg-gray-700 shadow-sm text-gray-600 dark:text-gray-300 ${themeStyle === 'neo-brutalism' ? 'rounded-none border border-black dark:border-white' : themeStyle === 'minimalist' ? 'rounded-sm' : 'rounded-full'}`}>+</button>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs text-gray-500 mb-0.5">{text.totalAmount}</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-lg">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={`mt-8 p-6 ${themeStyle === 'neo-brutalism' ? 'border-[3px] border-black dark:border-white bg-[#f9f9f9] dark:bg-[#111]' : themeStyle === 'minimalist' ? 'border border-gray-200 dark:border-gray-800' : 'bg-gray-50 dark:bg-gray-900 rounded-2xl'}`}>
          <div className="flex justify-between items-end mb-6">
            <span className="text-gray-500 dark:text-gray-400 font-medium">{text.totalAmount}</span>
            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">${getTotalPrice().toFixed(2)}</span>
          </div>
          
          <button 
            onClick={() => router.push(`/${params.locale}/checkout`)}
            className={`w-full py-4 text-lg font-bold transition-all flex items-center justify-center gap-2 ${
              themeStyle === 'neo-brutalism' ? 'bg-black text-white dark:bg-white dark:text-black border-[3px] border-black dark:border-white rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none uppercase tracking-widest' :
              themeStyle === 'minimalist' ? 'bg-black text-white dark:bg-white dark:text-black rounded-sm tracking-widest uppercase hover:bg-gray-800' :
              'bg-black dark:bg-white text-white dark:text-black rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {text.proceedCheckout}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>

      </div>
    </div>
  );
}
