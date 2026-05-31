'use client';

import Link from 'next/link';
import { useCartStore } from '@/lib/store/useCartStore';
import { useEffect, useState } from 'react';

export default function StoreHeader({ store, locale, primaryColor }: { store: any, locale: string, primaryColor: string }) {
  const items = useCartStore(state => state.items);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10" style={{ borderBottom: `4px solid ${primaryColor}` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href={`/${locale}`} className="text-2xl font-bold" style={{ color: primaryColor }}>
          {store.name}
        </Link>
        
        <nav className="flex items-center gap-4">
          <Link href={`/${locale}/cart`} className="text-gray-600 hover:text-gray-900 relative p-2">
            <span className="sr-only">Cart</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {mounted && totalItems > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                {totalItems}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
