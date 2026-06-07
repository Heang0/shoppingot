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
export default function StorefrontView({ params, categorySlug, viewMode = 'home' }: { params: { locale: string; slug: string }, categorySlug?: string, viewMode?: 'home' | 'catalog' | 'promotions' | 'categories' }) {
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
  const isKm = params.locale === 'km';

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
    // If we're on the promotions page, we only show best sellers
    if (viewMode === 'promotions' && !p.isBestSeller) return false;

    if (activeCategorySlug === 'All') return true;
    const cat = categories.find(c => c.slug === activeCategorySlug);
    if (!cat) return false;
    const pCat = p.category?._id ?? p.category;
    return String(pCat) === String(cat._id);
  });

  const bestSellers = products.filter(p => p.isBestSeller);
  const newArrivals = [...products].reverse().slice(0, 8);

  let bannerContainerClass = "w-full bg-gray-100 dark:bg-gray-900 flex ";
  if (themeStyle === 'minimalist') {
    bannerContainerClass += "md:mx-auto md:max-w-7xl md:rounded-sm overflow-hidden mb-6 md:mb-10";
  } else if (themeStyle === 'neo-brutalism') {
    bannerContainerClass += "md:mx-auto md:max-w-7xl md:rounded-none md:border-[3px] md:border-black md:dark:border-white md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] overflow-hidden mb-6 md:mb-10";
  } else {
    bannerContainerClass += "md:mx-auto md:max-w-7xl md:px-4 md:py-4 md:rounded-3xl overflow-hidden mb-6 md:mb-10";
  }

  const getCategoryClass = (isActive: boolean) => {
    if (themeStyle === 'neo-brutalism') {
      return `whitespace-nowrap text-sm px-4 py-2 border-[2.5px] transition-all font-black rounded-none uppercase tracking-wider ${isActive ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white' : 'bg-white text-black dark:bg-black dark:text-white border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'}`;
    } else if (themeStyle === 'minimalist') {
      return `whitespace-nowrap pb-1 border-b transition-all tracking-widest uppercase text-xs ${isActive ? 'font-medium text-black dark:text-white border-black dark:border-white' : 'font-light text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'}`;
    } else {
      return `whitespace-nowrap text-sm pb-1 border-b-2 transition-all ${isActive ? 'font-bold text-gray-900 dark:text-white border-gray-900 dark:border-white' : 'font-semibold text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'}`;
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

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 py-8 sm:py-12 space-y-10 sm:space-y-14">
        {!bannerUrl && (
          <div className="pt-2">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">{isKm ? 'ស្វែងយល់' : 'Discover'}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base font-medium">{isKm ? 'កម្រងផលិតផលថ្មីៗបំផុត។' : 'The latest collection.'}</p>
          </div>
        )}

        {/* CATEGORIES VIEW */}
        {viewMode === 'categories' && (
          <div className="pt-2 pb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-8">
              {isKm ? 'ប្រភេទទាំងអស់' : 'All Categories'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {categories.map(cat => {
                const count = products.filter(p => {
                  const pCat = p.category?._id ?? p.category;
                  return String(pCat) === String(cat._id);
                }).length;
                return (
                  <Link 
                    key={cat._id}
                    href={getAppendParams(`/${params.locale}/category/${cat.slug}`)}
                    className={`flex flex-col bg-white dark:bg-[#111111] border rounded-2xl p-6 transition-all duration-300 group ${themeStyle === 'neo-brutalism' ? 'border-[3px] border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'border-gray-100 dark:border-gray-800 hover:shadow-xl hover:border-gray-200 dark:hover:border-gray-700 hover:-translate-y-1'}`}
                  >
                    <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white group-hover:opacity-80 transition-opacity">
                      {isKm && cat.nameKm ? cat.nameKm : cat.name}
                    </span>
                    <div className="mt-4 flex items-center justify-end">
                      <span className="text-gray-300 dark:text-gray-600 group-hover:text-gray-900 dark:group-hover:text-white transition-colors transform group-hover:translate-x-1 duration-300">&rarr;</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* CATALOG & PROMOTIONS VIEW */}
        {(viewMode === 'catalog' || viewMode === 'promotions' || categorySlug) && (
          <>
            {viewMode === 'promotions' && (
              <div className="pt-2 mb-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{isKm ? 'ប្រូម៉ូសិន' : 'Promotions'}</h2>
                <p className="text-gray-500 mt-1">{isKm ? 'ផលិតផលលក់ដាច់បំផុតនិងប្រូម៉ូសិន' : 'Best sellers and special offers'}</p>
              </div>
            )}
            {categories.length > 0 && viewMode !== 'promotions' && (
              <div className={`flex gap-5 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 ${themeStyle === 'neo-brutalism' ? 'pt-2' : ''}`}>
                <Link
                  href={getAppendParams(`/${params.locale}/products`)}
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

                    const catHref = getAppendParams(`/${params.locale}/category/${cat.slug}`);

                    return (
                      <Link
                        key={cat._id}
                        href={catHref}
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-14">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                  <div key={i} className="animate-pulse flex flex-col">
                    <div className="aspect-square bg-gray-100 dark:bg-[#1a1a1a] rounded-2xl mb-4 w-full" />
                    <div className="h-4 bg-gray-100 dark:bg-[#1a1a1a] rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-100 dark:bg-[#1a1a1a] rounded w-1/2 mb-4" />
                    <div className="mt-auto h-8 bg-gray-100 dark:bg-[#1a1a1a] rounded w-full" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-24 bg-gray-50 dark:bg-[#111111] rounded-3xl border border-gray-100 dark:border-gray-800/50">
                <p className="text-gray-500 dark:text-gray-400 font-medium">{isKm ? 'មិនមានផលិតផលទេ។' : 'No products found.'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-14">
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product._id} 
                    product={product} 
                    primaryColor={primaryColor} 
                    themeStyle={themeStyle}
                    onAddToCart={showToast}
                    isBestSeller={product.isBestSeller}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* HOME VIEW */}
        {viewMode === 'home' && !categorySlug && (
          <div className="flex flex-col gap-16 md:gap-24">
            
            {/* Best Sellers Section */}
            {bestSellers.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{isKm ? 'លក់ដាច់បំផុត' : 'Best Sellers'}</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
                  {bestSellers.slice(0, 10).map((product, index) => (
                    <div 
                      key={product._id} 
                      className={`w-full ${index >= 6 ? 'hidden lg:block' : ''}`}
                    >
                      <ProductCard 
                        product={product} 
                        primaryColor={primaryColor} 
                        themeStyle={themeStyle}
                        onAddToCart={showToast}
                        isBestSeller={product.isBestSeller}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-center">
                  <Link 
                    href={getAppendParams(`/${params.locale}/promotions`)} 
                    className={`px-8 py-3 text-sm font-semibold rounded-full transition-all duration-300 ${themeStyle === 'neo-brutalism' ? 'border-2 border-black dark:border-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'text-white hover:shadow-lg hover:-translate-y-0.5'}`}
                    style={themeStyle === 'neo-brutalism' ? { backgroundColor: primaryColor || '#f0f0f0' } : { backgroundColor: primaryColor || '#000' }}
                  >
                    {isKm ? 'មើលទាំងអស់' : 'View All'}
                  </Link>
                </div>
              </section>
            )}

            {/* Shop by Category Section */}
            {categories.length > 0 && (
              <section>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{isKm ? 'ទិញតាមប្រភេទ' : 'Shop by Category'}</h3>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                  {categories.map(cat => {
                    return (
                      <Link 
                        key={cat._id}
                        href={getAppendParams(`/${params.locale}/category/${cat.slug}`)}
                        className={`flex items-center justify-center bg-white dark:bg-[#111111] border rounded-full px-6 py-3 sm:px-8 sm:py-4 min-w-max hover:-translate-y-1 transition-all duration-300 group shrink-0 ${themeStyle === 'neo-brutalism' ? 'border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'border-gray-200 dark:border-gray-800 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(255,255,255,0.05)]'}`}
                      >
                        <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white group-hover:opacity-80 transition-opacity">
                          {isKm && cat.nameKm ? cat.nameKm : cat.name}
                        </span>
                      </Link>
                    );
                  })}
                </div>
                <div className="mt-6 flex justify-center">
                  <Link 
                    href={getAppendParams(`/${params.locale}/categories`)} 
                    className={`px-8 py-3 text-sm font-semibold rounded-full transition-all duration-300 ${themeStyle === 'neo-brutalism' ? 'border-2 border-black dark:border-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'text-white hover:shadow-lg hover:-translate-y-0.5'}`}
                    style={themeStyle === 'neo-brutalism' ? { backgroundColor: primaryColor || '#f0f0f0' } : { backgroundColor: primaryColor || '#000' }}
                  >
                    {isKm ? 'មើលទាំងអស់' : 'View All'}
                  </Link>
                </div>
              </section>
            )}

            {/* New Arrivals Section */}
            {newArrivals.length > 0 && (
              <section>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{isKm ? 'ទំនិញថ្មី' : 'New Arrivals'}</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-14">
                  {newArrivals.map(product => (
                    <ProductCard 
                      key={product._id} 
                      product={product} 
                      primaryColor={primaryColor} 
                      themeStyle={themeStyle}
                      onAddToCart={showToast}
                      isBestSeller={product.isBestSeller}
                    />
                  ))}
                </div>
                <div className="mt-8 flex justify-center">
                  <Link 
                    href={getAppendParams(`/${params.locale}/products`)} 
                    className={`px-8 py-3 text-sm font-semibold rounded-full transition-all duration-300 ${themeStyle === 'neo-brutalism' ? 'border-2 border-black dark:border-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'text-white hover:shadow-lg hover:-translate-y-0.5'}`}
                    style={themeStyle === 'neo-brutalism' ? { backgroundColor: primaryColor || '#f0f0f0' } : { backgroundColor: primaryColor || '#000' }}
                  >
                    {isKm ? 'មើលទាំងអស់' : 'Shop All'}
                  </Link>
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
