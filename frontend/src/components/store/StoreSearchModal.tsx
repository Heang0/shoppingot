'use client';

import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import Link from 'next/link';

interface Product {
  _id: string;
  title: string;
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
          const storeRes = await fetch(`http://localhost:5000/api/stores/${slug}`);
          if (!storeRes.ok) return;
          const store = await storeRes.json();
          const prodRes = await fetch(`http://localhost:5000/api/products/store/${store._id}`);
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

  const filteredProducts = query 
    ? products.filter(p => p.title.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="fixed inset-0 z-[100] bg-white/95 dark:bg-[#111111]/95 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
      <div className="flex items-center px-4 pt-safe h-20 border-b border-gray-100 dark:border-gray-900 shrink-0 gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            autoFocus
            type="text"
            placeholder="Search products..."
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
        ) : query && filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No results found for "{query}"</div>
        ) : query && filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-2 gap-y-6">
            {filteredProducts.map(product => (
              <Link 
                key={product._id} 
                href={`/${locale}/product/${product.slug || product._id}`}
                onClick={onClose}
                className="flex flex-col group"
              >
                <div className="aspect-square bg-gray-50 dark:bg-gray-900 overflow-hidden mb-2 relative">
                  <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <h4 className="text-[13px] font-medium text-gray-900 dark:text-white line-clamp-1 px-1">{product.title}</h4>
                <p className="text-[13px] font-semibold mt-1 px-1" style={{ color: primaryColor }}>${product.price.toFixed(2)}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Search size={48} className="mb-4 opacity-20" />
            <p className="text-sm">Type to start searching...</p>
          </div>
        )}
      </div>
    </div>
  );
}
