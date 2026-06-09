'use client';

import { useCartStore } from '@/lib/store/useCartStore';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function CartDrawer({
  primaryColor = '#000000',
  themeStyle = 'default'
}: {
  primaryColor?: string;
  themeStyle?: string;
}) {
  const { items, isDrawerOpen, setDrawerOpen, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const params = useParams();
  const pathname = usePathname();
  const isKm = params.locale === 'km';

  const isPathRouting = pathname?.includes('/store/');
  const checkoutHref = isPathRouting ? `/${params.locale}/store/${params.slug}/checkout` : `/${params.locale}/checkout`;

  // Prevent scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isDrawerOpen]);

  if (!isDrawerOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[100] transition-opacity"
        onClick={() => setDrawerOpen(false)}
      />

      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white dark:bg-[#111111] z-[101] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          themeStyle === 'neo-brutalism' ? 'border-l-4 border-black dark:border-white' : ''
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            {isKm ? 'កន្ត្រករបស់អ្នក' : 'Your Cart'} ({items.length})
          </h2>
          <button 
            onClick={() => setDrawerOpen(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center">
                <Trash2 size={32} className="text-gray-300" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {isKm ? 'កន្ត្រករបស់អ្នកទទេ' : 'Your cart is empty'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {isKm ? 'សូមបន្ថែមទំនិញដើម្បីបន្តការទូទាត់' : 'Add some items to get started'}
                </p>
              </div>
              <button 
                onClick={() => setDrawerOpen(false)}
                className="mt-4 px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-transform active:scale-95"
                style={{ backgroundColor: primaryColor }}
              >
                {isKm ? 'បន្តការទិញទំនិញ' : 'Continue Shopping'}
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.cartItemId} className="flex gap-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl bg-gray-50 dark:bg-gray-900 overflow-hidden border border-gray-100 dark:border-gray-800">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white line-clamp-2">
                        {isKm && item.titleKm ? item.titleKm : item.title}
                      </h3>
                      <button 
                        onClick={() => removeItem(item.cartItemId)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 -mr-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {Object.entries(item.selectedVariants).map(([key, value]) => (
                          <span key={key} className="mr-2 inline-block px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px]">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-gray-900 dark:text-white">
                      ${item.price.toFixed(2)}
                    </span>
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))}
                        className="text-gray-500 hover:text-gray-900 dark:hover:text-white p-1"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-semibold w-4 text-center dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        className="text-gray-500 hover:text-gray-900 dark:hover:text-white p-1"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#1a1a1a]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500 dark:text-gray-400 font-medium">
                {isKm ? 'សរុប' : 'Subtotal'}
              </span>
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                ${getTotalPrice().toFixed(2)}
              </span>
            </div>
            <Link 
              href={checkoutHref}
              onClick={() => setDrawerOpen(false)}
              className={`w-full py-4 text-lg font-bold text-white transition-all flex items-center justify-center gap-2 ${
                themeStyle === 'neo-brutalism' ? 'border-[3px] border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none uppercase tracking-widest' :
                themeStyle === 'minimalist' ? 'rounded-sm tracking-widest uppercase hover:opacity-90' :
                'rounded-xl shadow-lg hover:shadow-xl active:scale-95'
              }`}
              style={{ backgroundColor: primaryColor }}
            >
              {isKm ? 'ទៅកាន់ការទូទាត់' : 'Checkout'}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
