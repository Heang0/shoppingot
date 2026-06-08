'use client';

import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import Link from 'next/link';

interface Product {
  _id: string;
  title: string;
  titleKm?: string;
  slug: string;
  imageUrl: string;
  price: number;
}

export default function StoreSearchModal({ isOpen, onClose, slug, locale, primaryColor }: { isOpen: boolean, onClose: () => void, slug: string, locale: string, primaryColor: string }) {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchProducts = async () => {
        setLoading(true);
        try {
          const storeRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stores/${slug}`);
          if (!storeRes.ok) return;
          const store = await storeRes.json();
          const prodRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/store/${store._id}`);
          if (!prodRes.ok) return;
          const prods = await prodRes.json();
          setProducts(prods.products || []);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchProducts();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, slug]);

  if (!isOpen) return null;

  const t = (en: string, km: string) => locale === 'km' ? km : en;

  const filteredProducts = query 
    ? products.filter(p => 
        p.title.toLowerCase().includes(query.toLowerCase()) || 
        (p.titleKm && p.titleKm.includes(query))
      )
    : products;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-4 pb-4 animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-white dark:bg-[#111111] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-top-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
      <div className="flex items-center px-4 pt-safe h-20 border-b border-gray-100 dark:border-gray-900 shrink-0 gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            autoFocus
            type="text"
            placeholder={t('Search products...', 'ស្វែងរកផលិតផល...')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-gray-100 dark:bg-gray-800 border-transparent rounded-full py-3 pl-12 pr-4 outline-none text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 transition-all shadow-inner"
            style={{ '--tw-ring-color': primaryColor } as any}
          />
        </div>
        <button onClick={onClose} className="p-2 text-gray-500 hover:text-black dark:hover:text-white transition-colors bg-gray-100 dark:bg-gray-800 rounded-full active:scale-95">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-safe">
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-gray-200 border-t-black dark:border-t-white rounded-full animate-spin"></div></div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-500">{t('No results found', 'រកមិនឃើញលទ្ធផល')} {query ? `${t('for', 'សម្រាប់')} "${query}"` : ''}</div>
        ) : (
          <div className="pb-4">
            {!query && <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 mb-4 px-1">{t('Suggested Products', 'ផលិតផលដែលបានណែនាំ')}</h3>}
            <div className="flex flex-col gap-y-2">
              {filteredProducts.map(product => (
                <Link 
                  key={product._id} 
                  href={`/${locale}/product/${product.slug || product._id}`}
                  onClick={onClose}
                  className="flex items-center gap-4 group hover:bg-gray-50 dark:hover:bg-gray-800/80 p-2 -mx-2 rounded-xl transition-colors"
                >
                  <div className="w-16 h-16 shrink-0 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden relative border border-gray-100 dark:border-gray-800">
                    <img src={product.imageUrl?.replace('/upload/', '/upload/w_200,c_limit,q_auto/')} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[14px] font-medium text-gray-900 dark:text-white line-clamp-1">{locale === 'km' && product.titleKm ? product.titleKm : product.title}</h4>
                    <p className="text-[14px] font-semibold mt-0.5" style={{ color: primaryColor }}>${product.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
