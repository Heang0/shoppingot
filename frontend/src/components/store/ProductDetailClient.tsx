'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/store/useCartStore';
import { Minus, Plus, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
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

interface ProductDetailClientProps {
  product: any;
  store: any;
  relatedProducts: any[];
  locale: string;
  slug: string;
}

export default function ProductDetailClient({
  product,
  store,
  relatedProducts,
  locale,
  slug
}: ProductDetailClientProps) {
  const themeStyle = store?.branding?.themeStyle || 'default';
  const primaryColor = store?.branding?.primaryColor || '#000000';

  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const addItem = useCartStore((state) => state.addItem);
  const isKm = locale === 'km';
  
  const text = {
    options: isKm ? 'ជម្រើស' : 'Options',
    quantity: isKm ? 'ចំនួន' : 'Quantity',
    addToCart: isKm ? 'បញ្ចូលទៅកន្ត្រក' : 'Add to Cart',
    addedToCart: isKm ? 'បានបញ្ចូលទៅកន្ត្រក!' : 'Added to cart!',
    productNotFound: isKm ? 'រកមិនឃើញផលិតផល' : 'Product not found',
    goBack: isKm ? 'ត្រឡប់ក្រោយ' : 'Go Back',
    selectPrefix: isKm ? 'សូមជ្រើសរើស' : 'Please select a',
    relatedProducts: isKm ? 'ផលិតផលស្រដៀងគ្នា' : 'You might also like',
  };

  const showToast = (prod: any) => {
    const title = isKm && prod.titleKm ? prod.titleKm : prod.title;
    setToast({ message: `${title} ${text.addedToCart}`, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500);
  };

  const handleSelect = (variantName: string, option: string) => {
    setSelectedVariants(prev => ({ ...prev, [variantName]: option }));
  };

  const handleAddToCart = () => {
    if (product.variants && product.variants.length > 0) {
      const missing = product.variants.find((v: any) => !selectedVariants[v.name]);
      if (missing) {
        alert(`${text.selectPrefix} ${missing.name}`);
        return;
      }
    }

    addItem({
      productId: product._id,
      title: product.title,
      titleKm: product.titleKm,
      price: product.price,
      quantity,
      imageUrl: product.imageUrl,
      selectedVariants,
    });

    showToast(product);
  };

  const imagesList = [product.imageUrl, ...(product.images || [])].filter(Boolean);

  return (
    <div className="flex flex-col min-h-full bg-white dark:bg-[#111111] relative pb-28 md:pb-12">
      <AddToCartToast message={toast.message} visible={toast.visible} />
      
      {addedMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white px-6 py-3 rounded-full z-50 shadow-lg text-sm font-medium animate-in fade-in slide-in-from-top-4">
          {addedMessage}
        </div>
      )}

      <div className="md:max-w-6xl md:mx-auto md:w-full md:grid md:grid-cols-2 md:gap-12 md:px-5 md:py-12">
        {/* Product Image Carousel */}
        <div className="w-full flex flex-col gap-4 shrink-0">
          <div className="w-full aspect-square bg-[#F8F9FA] dark:bg-[#161616] relative md:rounded-2xl overflow-hidden group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={imagesList[currentImageIndex]} 
              alt={product.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            />
            
            {imagesList.length > 1 && (
              <>
                <button 
                  onClick={() => setCurrentImageIndex(prev => prev === 0 ? imagesList.length - 1 : prev - 1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-black/80 rounded-full flex items-center justify-center opacity-80 hover:opacity-100 transition-all hover:scale-105 shadow-sm text-gray-900 dark:text-white"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={() => setCurrentImageIndex(prev => prev === imagesList.length - 1 ? 0 : prev + 1)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-black/80 rounded-full flex items-center justify-center opacity-80 hover:opacity-100 transition-all hover:scale-105 shadow-sm text-gray-900 dark:text-white"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
          
          {/* Thumbnails */}
          {imagesList.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-4 md:px-0">
              {imagesList.map((img: string, idx: number) => (
                <button 
                  key={idx} 
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                    currentImageIndex === idx ? 'border-gray-900 dark:border-white opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="px-5 py-6 md:px-0 md:py-0 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight flex-1 pr-4">
              {locale === 'km' && product.titleKm ? product.titleKm : product.title}
            </h1>
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white shrink-0">${product.price.toFixed(2)}</span>
          </div>
          
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-4 leading-relaxed">
            {locale === 'km' && product.descriptionKm ? product.descriptionKm : product.description}
          </p>

          {/* Variants Selection */}
          {product.variants && product.variants.length > 0 && (
            <div className="mt-8 space-y-6">
              <h3 className="font-medium text-gray-900 dark:text-white pb-2">{text.options}</h3>
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
                              ? `border-[2px] font-black uppercase rounded-none ${
                                  isSelected
                                    ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]'
                                    : 'bg-white text-black dark:bg-black dark:text-white border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'
                                }`
                              : themeStyle === 'minimalist'
                              ? `border rounded-sm font-medium tracking-wide ${
                                  isSelected
                                    ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                                    : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700 hover:border-black dark:hover:border-white'
                                }`
                              : `rounded-full font-medium ${
                                  isSelected
                                    ? 'bg-black dark:bg-white text-white dark:text-black scale-105 shadow-md'
                                    : 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                                }`
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
            <span className="font-bold text-gray-900 dark:text-white">{text.quantity}</span>
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

          <div className="hidden md:block mt-8">
            <button
              onClick={handleAddToCart}
              className={`w-full py-4 text-lg font-bold text-white transition-all flex items-center justify-center gap-2 ${
                themeStyle === 'neo-brutalism'
                  ? 'border-[3px] border-black dark:border-white rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none uppercase tracking-widest'
                  : themeStyle === 'minimalist'
                  ? 'rounded-sm tracking-widest uppercase hover:opacity-90'
                  : 'rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98]'
              }`}
              style={{ backgroundColor: primaryColor || '#000' }}
            >
              {text.addToCart} - ${(product.price * quantity).toFixed(2)}
            </button>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto w-full px-5 py-8 md:py-16 md:border-t border-gray-100 dark:border-gray-800">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6 md:mb-8">{text.relatedProducts}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-3 gap-y-8">
            {relatedProducts.map(rp => (
              <ProductCard
                key={rp._id}
                product={rp}
                primaryColor={primaryColor}
                themeStyle={themeStyle}
                onAddToCart={showToast}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sticky Bottom Add to Cart (Mobile Only) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-[#111111] border-t border-gray-100 dark:border-gray-800 md:hidden z-[100] pb-safe">
        <button
          onClick={handleAddToCart}
          className={`w-full py-4 text-lg font-bold text-white transition-all ${
            themeStyle === 'neo-brutalism'
              ? 'border-[3px] border-black dark:border-white rounded-none uppercase tracking-widest'
              : themeStyle === 'minimalist'
              ? 'rounded-sm tracking-widest uppercase hover:opacity-90'
              : 'rounded-2xl shadow-xl hover:opacity-95'
          }`}
          style={{ backgroundColor: primaryColor || '#000' }}
        >
          {text.addToCart} - ${(product.price * quantity).toFixed(2)}
        </button>
      </div>
    </div>
  );
}
