'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/store/useCartStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { Minus, Plus } from 'lucide-react';

export default function ProductDetailPage({ params }: { params: { slug: string, productSlug: string, locale: string } }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);
  const [themeStyle, setThemeStyle] = useState('default');
  
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchProductAndStore = async () => {
      try {
        const [prodRes, storeRes] = await Promise.all([
          fetch(`http://localhost:5000/api/products/${params.productSlug}`),
          fetch(`http://localhost:5000/api/stores/${params.slug}`)
        ]);
        if (!prodRes.ok) throw new Error('Failed to load product');
        const data = await prodRes.json();
        setProduct(data);

        if (storeRes.ok) {
          const store = await storeRes.json();
          const previewTheme = searchParams.get('theme');
          setThemeStyle(previewTheme || store.branding?.themeStyle || 'default');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndStore();
  }, [params.productSlug, params.slug, searchParams]);

  const handleSelect = (variantName: string, option: string) => {
    setSelectedVariants(prev => ({ ...prev, [variantName]: option }));
  };

  const handleAddToCart = () => {
    if (product.variants && product.variants.length > 0) {
      const missing = product.variants.find((v: any) => !selectedVariants[v.name]);
      if (missing) {
        alert(`Please select a ${missing.name}`);
        return;
      }
    }

    addItem({
      productId: product._id,
      title: product.title,
      price: product.price,
      quantity,
      imageUrl: product.imageUrl,
      selectedVariants,
    });

    setAddedMessage('Added to cart!');
    setTimeout(() => {
      setAddedMessage(null);
      // Optional: router.back() or redirect to cart
    }, 2000);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="h-full flex items-center justify-center flex-col min-h-[60vh]">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Product not found</h2>
        <button onClick={() => router.back()} className="mt-4 text-[#E84C3D]">Go Back</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-white dark:bg-[#111111] relative pb-28 md:pb-12">
      {/* Toast Notification */}
      {addedMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white px-6 py-3 rounded-full z-50 shadow-lg text-sm font-medium animate-in fade-in slide-in-from-top-4">
          {addedMessage}
        </div>
      )}

      <div className="md:max-w-7xl md:mx-auto md:w-full md:grid md:grid-cols-2 md:gap-12 md:px-5 md:py-12">
        {/* Product Image */}
        <div className="w-full aspect-[4/5] md:aspect-square bg-gray-50 dark:bg-gray-900 relative md:rounded-3xl overflow-hidden shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
        </div>

        {/* Product Info */}
        <div className="px-5 py-6 md:px-0 md:py-0 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight flex-1 pr-4">
            {params.locale === 'km' && product.titleKm ? product.titleKm : product.title}
          </h1>
          <span className="text-2xl font-extrabold text-gray-900 dark:text-white shrink-0">${product.price.toFixed(2)}</span>
        </div>
        
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-4 leading-relaxed">
          {params.locale === 'km' && product.descriptionKm ? product.descriptionKm : product.description}
        </p>

        {/* Variants Selection */}
        {product.variants && product.variants.length > 0 && (
          <div className="mt-8 space-y-6">
            <h3 className="font-medium text-gray-900 dark:text-white pb-2">Options</h3>
            {product.variants.map((variant: any) => (
              <div key={variant.name}>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">{variant.name}</label>
                <div className="flex flex-wrap gap-2">
                  {variant.options.map((opt: string) => {
                    const isSelected = selectedVariants[variant.name] === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => handleSelect(variant.name, opt)}
                        className={`px-5 py-2.5 transition-all text-sm ${
                          themeStyle === 'neo-brutalism' 
                            ? `border-[2px] font-black uppercase rounded-none ${isSelected ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]' : 'bg-white text-black dark:bg-black dark:text-white border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'}`
                            : themeStyle === 'minimalist'
                            ? `border rounded-sm font-medium tracking-wide ${isSelected ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white' : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700 hover:border-black dark:hover:border-white'}`
                            : `rounded-full font-medium ${isSelected ? 'bg-black dark:bg-white text-white dark:text-black scale-105 shadow-md' : 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 hover:bg-gray-200'}`
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quantity Selection */}
        <div className="mt-8 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-6">
          <span className="font-bold text-gray-900 dark:text-white">Quantity</span>
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-1">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))} 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white hover:bg-gray-50 transition-colors"
            >
              <Minus size={18} />
            </button>
            <span className="w-12 text-center font-bold text-gray-900 dark:text-white">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)} 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white hover:bg-gray-50 transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Desktop Add to Cart */}
        <div className="hidden md:block mt-8">
          <button
            onClick={handleAddToCart}
            className={`w-full py-4 text-lg font-bold transition-all flex items-center justify-center gap-2 ${
              themeStyle === 'neo-brutalism'
                ? 'bg-white text-black dark:bg-black dark:text-white border-[3px] border-black dark:border-white rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none uppercase tracking-widest'
                : themeStyle === 'minimalist'
                ? 'bg-black text-white dark:bg-white dark:text-black rounded-sm tracking-widest uppercase hover:bg-gray-800 dark:hover:bg-gray-200'
                : 'bg-black dark:bg-white text-white dark:text-black rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            Add to Cart - ${(product.price * quantity).toFixed(2)}
          </button>
        </div>
      </div>
      </div>

      {/* Sticky Bottom Add to Cart (Mobile Only) */}
      <div className={`md:hidden sticky bottom-0 left-0 w-full bg-white/90 dark:bg-[#111111]/90 backdrop-blur-md p-4 pb-safe z-40 border-t ${themeStyle === 'neo-brutalism' ? 'border-t-[3px] border-black dark:border-white' : 'border-gray-100 dark:border-gray-800'} shadow-[0_-10px_40px_rgba(0,0,0,0.05)]`}>
        <button
          onClick={handleAddToCart}
          className={`w-full py-4 text-lg font-bold transition-all flex items-center justify-center gap-2 ${
              themeStyle === 'neo-brutalism'
                ? 'bg-white text-black dark:bg-black dark:text-white border-[3px] border-black dark:border-white rounded-none uppercase tracking-widest'
                : themeStyle === 'minimalist'
                ? 'bg-black text-white dark:bg-white dark:text-black rounded-sm tracking-widest uppercase'
                : 'bg-black dark:bg-white text-white dark:text-black rounded-2xl shadow-xl'
            }`}
        >
          Add to Cart - ${(product.price * quantity).toFixed(2)}
        </button>
      </div>
    </div>
  );
}
