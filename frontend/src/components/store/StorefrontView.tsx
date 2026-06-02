'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCartStore } from '@/lib/store/useCartStore';
import { Plus, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/store/ProductCard';

// --- Toast Component ---
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

// --- Shared Storefront View ---
export default function StorefrontView({ params, categorySlug }: { params: { locale: string; slug: string }, categorySlug?: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const previewTheme = searchParams.get('theme');
  const previewColor = searchParams.get('color');

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  // We determine active category by the slug, or 'All'
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>(categorySlug || 'All');
  const [loading, setLoading] = useState(true);
  const [primaryColor, setPrimaryColor] = useState<string>('#000000');
  const [themeStyle, setThemeStyle] = useState<string>('default');
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const allLabel = params.locale === 'km' ? 'ទាំងអស់' : 'All';

  useEffect(() => {
    setActiveCategorySlug(categorySlug || 'All');
  }, [categorySlug]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const storeRes = await fetch(`http://localhost:5000/api/stores/${params.slug}`);
        if (!storeRes.ok) throw new Error('Store not found');
        const store = await storeRes.json();
        
        setPrimaryColor(previewColor || store.branding?.primaryColor || '#000000');
        setThemeStyle(previewTheme || store.branding?.themeStyle || 'default');
        setBannerUrl(store.branding?.bannerUrl || null);

        const prodRes = await fetch(`http://localhost:5000/api/products/store/${store._id}`);
        const prods = await prodRes.json();
        setProducts(prods.products || []);

        const catRes = await fetch(`http://localhost:5000/api/categories/store/${store._id}`);
        if (catRes.ok) {
          const cats = await catRes.json();
          setCategories(cats);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [params.slug, previewColor, previewTheme]);

  const showToast = useCallback((product: any) => {
    setToast({ message: `${product.title} added to cart!`, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500);
  }, []);

  const filteredProducts = products.filter(p => {
    if (activeCategorySlug === 'All') return true;
    const cat = categories.find(c => c.slug === activeCategorySlug);
    if (!cat) return false;
    const pCat = p.category?._id ?? p.category;
    return String(pCat) === String(cat._id);
  });

  let bannerContainerClass = "w-full bg-gray-100 dark:bg-gray-900 flex ";
  if (themeStyle === 'minimalist') {
    bannerContainerClass += "md:mx-auto md:max-w-7xl md:rounded-sm overflow-hidden";
  } else if (themeStyle === 'neo-brutalism') {
    bannerContainerClass += "md:mx-auto md:max-w-7xl md:rounded-none md:border-[3px] md:border-black md:dark:border-white md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] overflow-hidden";
  } else {
    bannerContainerClass += "md:mx-auto md:max-w-7xl md:px-4 md:rounded-2xl overflow-hidden";
  }

  const getCategoryClass = (isActive: boolean) => {
    if (themeStyle === 'neo-brutalism') {
      return `whitespace-nowrap text-sm px-4 py-2 border-[2.5px] transition-all font-black rounded-none uppercase tracking-wider ${isActive ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white' : 'bg-white text-black dark:bg-black dark:text-white border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'}`;
    } else if (themeStyle === 'minimalist') {
      return `whitespace-nowrap pb-1 border-b transition-all tracking-widest uppercase text-xs ${isActive ? 'font-medium text-black dark:text-white border-black dark:border-white' : 'font-light text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'}`;
    } else {
      return `whitespace-nowrap text-sm pb-1 border-b-2 transition-all ${isActive ? 'font-semibold text-gray-900 dark:text-white border-gray-900 dark:border-white' : 'font-medium text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'}`;
    }
  };

  const getAppendParams = (href: string) => {
    if (!previewTheme && !previewColor) return href;
    const url = new URL(href, 'http://localhost');
    if (previewTheme) url.searchParams.set('theme', previewTheme);
    if (previewColor) url.searchParams.set('color', previewColor);
    return `${url.pathname}${url.search}`;
  };

  return (
    <div>
      <AddToCartToast message={toast.message} visible={toast.visible} />

      {bannerUrl ? (
        <div className={bannerContainerClass}>
          <img src={bannerUrl} alt="Store Banner" className="w-full h-auto max-h-[60vh] object-cover object-center" />
        </div>
      ) : null}

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {!bannerUrl && (
          <div className="pt-2">
            <h2 className="text-4xl sm:text-5xl font-medium text-gray-900 dark:text-white tracking-tight mb-1">Discover</h2>
            <p className="text-gray-400 dark:text-gray-500 text-sm">The latest collection.</p>
          </div>
        )}

        {categories.length > 0 && (
          <div className={`flex gap-5 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 ${themeStyle === 'neo-brutalism' ? 'pt-2' : ''}`}>
            <Link
              href={getAppendParams(`/${params.locale}`)}
              className={getCategoryClass(activeCategorySlug === 'All')}
            >
              {allLabel} ({products.length})
            </Link>
            {categories
              .filter(cat => products.some(p => {
                const pCat = p.category?._id ?? p.category;
                return String(pCat) === String(cat._id);
              }))
              .map(cat => {
                const count = products.filter(p => {
                  const pCat = p.category?._id ?? p.category;
                  return String(pCat) === String(cat._id);
                }).length;
                return (
                  <Link
                    key={cat._id}
                    href={getAppendParams(`/${params.locale}/category/${cat.slug}`)}
                    className={getCategoryClass(activeCategorySlug === cat.slug)}
                  >
                    {params.locale === 'km' && cat.nameKm ? cat.nameKm : cat.name} ({count})
                  </Link>
                );
              })
            }
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 mb-3" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded mb-2" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">No products found.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-8">
            {filteredProducts.map(product => (
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
    </div>
  );
}
