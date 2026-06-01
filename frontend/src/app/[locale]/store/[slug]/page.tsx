'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCartStore } from '@/lib/store/useCartStore';
import { Plus, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';

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

// --- Product Card ---
const ProductCard = ({ product, primaryColor, themeStyle = 'default', onAddToCart }: {
  product: any;
  primaryColor: string;
  themeStyle?: string;
  onAddToCart: (product: any) => void;
}) => {
  const params = useParams();
  const addItem = useCartStore(state => state.addItem);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product._id,
      title: product.title,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
    });
    onAddToCart(product);
  };

  let cardBaseClass = "flex flex-col group h-full transition-all ";
  let imageContainerClass = "aspect-square w-full relative shrink-0 overflow-hidden mb-3 ";
  let priceClass = "text-[13px] font-semibold text-gray-900 dark:text-white";

  if (themeStyle === 'minimalist') {
    cardBaseClass += "p-2 border border-gray-100 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-600 rounded-sm bg-white dark:bg-black";
    imageContainerClass += "bg-gray-50 dark:bg-gray-900";
    priceClass = "text-[13px] font-light text-gray-900 dark:text-white";
  } else if (themeStyle === 'neo-brutalism') {
    cardBaseClass += "p-3 border-[3px] border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] rounded-none bg-white dark:bg-black";
    imageContainerClass += "border-2 border-black dark:border-white bg-[#f0f0f0] dark:bg-[#222]";
    priceClass = "text-[14px] font-black text-black dark:text-white bg-green-200 dark:bg-green-800 px-1 border-2 border-black dark:border-white";
  } else {
    // Default
    cardBaseClass += "rounded-xl";
    imageContainerClass += "bg-gray-50 dark:bg-gray-900 rounded-lg";
  }

  return (
    <Link href={`/${params.locale}/product/${product.slug || product._id}`} className={cardBaseClass}>
      <div className={imageContainerClass}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        {/* Quick add button overlay */}
        <button
          onClick={handleAdd}
          className={`absolute bottom-2 right-2 w-8 h-8 flex items-center justify-center text-white shadow-lg opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 active:scale-90 md:flex hidden ${themeStyle === 'neo-brutalism' ? 'rounded-none border-2 border-black' : 'rounded-full'}`}
          style={{ backgroundColor: primaryColor || '#000' }}
        >
          <Plus size={16} strokeWidth={2.5} className={themeStyle === 'neo-brutalism' ? 'text-black' : ''} />
        </button>
      </div>
      <div className="flex flex-col flex-1 px-1">
        <h3 className="text-[13px] font-medium text-gray-900 dark:text-white line-clamp-1">{params.locale === 'km' && product.titleKm ? product.titleKm : product.title}</h3>
        <p className="mt-0.5 text-gray-400 dark:text-gray-500 text-[11px] line-clamp-1">{params.locale === 'km' && product.descriptionKm ? product.descriptionKm : product.description}</p>
        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className={priceClass}>${product.price.toFixed(2)}</span>
          {/* Mobile add button (always visible) */}
          <button
            onClick={handleAdd}
            className={`md:hidden w-7 h-7 flex items-center justify-center text-white active:scale-90 shadow-sm ${themeStyle === 'neo-brutalism' ? 'rounded-none border-[1.5px] border-black' : 'rounded-full'}`}
            style={{ backgroundColor: primaryColor || '#000' }}
          >
            <Plus size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </Link>
  );
};

// --- Store Home Page ---
export default function StorefrontHome({ params }: { params: { slug: string } }) {
  const searchParams = useSearchParams();
  const previewTheme = searchParams.get('theme');
  const previewColor = searchParams.get('color');

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [primaryColor, setPrimaryColor] = useState<string>('#000000');
  const [themeStyle, setThemeStyle] = useState<string>('default');
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const storeRes = await fetch(`http://localhost:5000/api/stores/${params.slug}`);
        if (!storeRes.ok) throw new Error('Store not found');
        const store = await storeRes.json();
        
        // Use query params for live preview if they exist
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
  }, [params.slug]);

  const showToast = useCallback((product: any) => {
    setToast({ message: `${product.title} added to cart!`, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500);
  }, []);

  const filteredProducts = products.filter(p => {
    if (activeCategory === 'All') return true;
    // Handle both ObjectId string and populated object
    const pCat = p.category?._id ?? p.category;
    return String(pCat) === String(activeCategory);
  });

  let bannerContainerClass = "w-full aspect-[21/9] sm:aspect-[3/1] overflow-hidden bg-gray-100 dark:bg-gray-900 mb-8 ";
  if (themeStyle === 'minimalist') {
    bannerContainerClass += "rounded-sm";
  } else if (themeStyle === 'neo-brutalism') {
    bannerContainerClass += "rounded-none border-[3px] border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]";
  } else {
    bannerContainerClass += "rounded-2xl";
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">

      {/* Add-to-cart Toast */}
      <AddToCartToast message={toast.message} visible={toast.visible} />

      {/* Banner */}
      {bannerUrl ? (
        <div className={bannerContainerClass}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bannerUrl} alt="Store Banner" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="pt-2">
          <h2 className="text-4xl sm:text-5xl font-medium text-gray-900 dark:text-white tracking-tight mb-1">Discover</h2>
          <p className="text-gray-400 dark:text-gray-500 text-sm">The latest collection.</p>
        </div>
      )}

      {/* Category pills — only show categories that have products */}
      {categories.length > 0 && (
        <div className={`flex gap-5 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 ${themeStyle === 'neo-brutalism' ? 'pt-2' : ''}`}>
          <button
            onClick={() => setActiveCategory('All')}
            className={getCategoryClass(activeCategory === 'All')}
          >
            All ({products.length})
          </button>
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
                <button
                  key={cat._id}
                  onClick={() => setActiveCategory(cat._id)}
                  className={getCategoryClass(activeCategory === cat._id)}
                >
                  {params.locale === 'km' && cat.nameKm ? cat.nameKm : cat.name} ({count})
                </button>
              );
            })
          }
        </div>
      )}

      {/* Product Grid */}
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
  );
}
