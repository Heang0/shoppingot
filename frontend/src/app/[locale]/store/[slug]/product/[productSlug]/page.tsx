'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/store/useCartStore';
import { useRouter } from 'next/navigation';
import { Minus, Plus } from 'lucide-react';

export default function ProductDetailPage({ params }: { params: { slug: string, productSlug: string, locale: string } }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);
  
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${params.productSlug}`);
        if (!res.ok) throw new Error('Failed to load product');
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [params.productSlug]);

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
                        className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                          isSelected 
                            ? 'bg-black dark:bg-white text-white dark:text-black scale-105 shadow-md' 
                            : 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 hover:bg-gray-200'
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
            className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl text-lg font-bold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            Add to Cart - ${(product.price * quantity).toFixed(2)}
          </button>
        </div>
      </div>
      </div>

      {/* Sticky Bottom Add to Cart (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 dark:bg-[#111111]/90 backdrop-blur-md p-4 pb-safe z-40 border-t border-gray-100 dark:border-gray-800 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <button
          onClick={handleAddToCart}
          className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl text-lg font-bold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          Add to Cart - ${(product.price * quantity).toFixed(2)}
        </button>
      </div>
    </div>
  );
}
