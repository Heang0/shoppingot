'use client';

import { useState, useEffect } from 'react';
import { useFavoritesStore } from '@/lib/store/useFavoritesStore';
import { Heart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ProductCard from '@/components/store/ProductCard';
import { CheckCircle } from 'lucide-react';

function AddToCartToast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      className={`fixed top-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-max md:max-w-sm z-[200] flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-3 rounded-full shadow-xl text-sm font-medium transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'
      }`}
    >
      <CheckCircle size={16} strokeWidth={2.5} className="shrink-0" />
      <span className="truncate">{message}</span>
    </div>
  );
}

export default function FavoritesPage({ params }: { params: { locale: string; slug: string } }) {
  const { favorites } = useFavoritesStore();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [primaryColor, setPrimaryColor] = useState('#000000');
  const [themeStyle, setThemeStyle] = useState('default');
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const isKm = params.locale === 'km';

  useEffect(() => {
    const loadStoreAndProducts = async () => {
      try {
        const storeRes = await fetch(`http://localhost:5000/api/stores/${params.slug}`);
        if (!storeRes.ok) throw new Error('Store not found');
        const store = await storeRes.json();
        
        setPrimaryColor(store.branding?.primaryColor || '#000000');
        setThemeStyle(store.branding?.themeStyle || 'default');

        const prodRes = await fetch(`http://localhost:5000/api/products/store/${store._id}`);
        const prods = await prodRes.json();
        
        // Filter products that are in the favorites store
        const storeProducts = prods.products || [];
        const favoriteProducts = storeProducts.filter((p: any) => 
          favorites.some(f => f.productId === p._id)
        );
        
        setProducts(favoriteProducts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    // Only load if there are favorites
    if (favorites.length > 0) {
      loadStoreAndProducts();
    } else {
      setLoading(false);
    }
  }, [params.slug, favorites]);

  // Remove products from local state immediately if un-favorited while on this page
  const displayProducts = products.filter(p => favorites.some(f => f.productId === p._id));

  const showToast = (product: any) => {
    setToast({ message: `${product.title} added to cart!`, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500);
  };

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 pt-4 pb-24 sm:pt-8 space-y-8 min-h-[70vh]">
      <AddToCartToast message={toast.message} visible={toast.visible} />
      
      <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
        <Link 
          href={`/${params.locale}`}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-900 dark:text-white" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {isKm ? 'ចំណូលចិត្ត' : 'Wishlist'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {isKm ? 'ទំនិញដែលអ្នកបានរក្សាទុក' : 'Items you have saved for later'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-14">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse flex flex-col">
              <div className="aspect-square bg-gray-100 dark:bg-[#1a1a1a] rounded-2xl mb-4 w-full" />
              <div className="h-4 bg-gray-100 dark:bg-[#1a1a1a] rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 dark:bg-[#1a1a1a] rounded w-1/2 mb-4" />
              <div className="mt-auto h-8 bg-gray-100 dark:bg-[#1a1a1a] rounded w-full" />
            </div>
          ))}
        </div>
      ) : displayProducts.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-16 px-4 text-center mt-8 ${
          themeStyle === 'neo-brutalism' 
            ? 'bg-white dark:bg-[#111111] border-[3px] border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] max-w-2xl mx-auto' 
            : 'bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-900 max-w-2xl mx-auto'
        }`}>
          <div className={`w-20 h-20 flex items-center justify-center mb-6 ${
            themeStyle === 'neo-brutalism' 
              ? 'bg-white dark:bg-black border-[3px] border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]' 
              : 'bg-white dark:bg-[#111111] rounded-full shadow-sm border border-gray-100 dark:border-gray-800'
          }`}>
            <Heart size={32} className="text-gray-300 dark:text-gray-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
            {isKm ? 'មិនមានចំណូលចិត្តទេ' : 'Your wishlist is empty'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">
            {isKm ? 'អ្នកមិនទាន់មានទំនិញក្នុងចំណូលចិត្តនៅឡើយទេ។' : 'You haven\'t added any items to your wishlist yet.'}
          </p>
          <Link 
            href={`/${params.locale}`} 
            className={`inline-block font-bold px-8 py-3.5 transition-all ${
              themeStyle === 'neo-brutalism'
                ? 'border-[2px] border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-black bg-white dark:bg-black dark:text-white uppercase tracking-wider text-sm'
                : themeStyle === 'minimalist'
                ? 'border border-gray-200 dark:border-gray-800 rounded-full hover:border-gray-900 dark:hover:border-white text-gray-900 dark:text-white'
                : 'text-white rounded-full hover:scale-105 shadow-md'
            }`}
            style={themeStyle === 'default' ? { backgroundColor: primaryColor || '#000' } : undefined}
          >
            {isKm ? 'ត្រលប់ទៅទិញទំនិញវិញ' : 'Return to Shopping'}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-14">
          {displayProducts.map((product) => (
            <ProductCard 
              key={product._id} 
              product={product} 
              primaryColor={primaryColor} 
              themeStyle={themeStyle}
              onAddToCart={showToast}
            />
          ))}
        </div>
      )}
    </div>
  );
}
