'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/store/useCartStore';

// In a real app, products would be fetched via API based on the store slug.
// MOCK data for the prototype

const ProductCard = ({ product, onAdd }: { product: any, onAdd: (product: any, selectedVariants: Record<string, string>) => void }) => {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const handleSelect = (variantName: string, option: string) => {
    setSelectedVariants(prev => ({ ...prev, [variantName]: option }));
  };

  const handleAdd = () => {
    // Check if all variants are selected
    if (product.variants && product.variants.length > 0) {
      const missing = product.variants.find((v: any) => !selectedVariants[v.name]);
      if (missing) {
        alert(`Please select a ${missing.name}`);
        return;
      }
    }
    onAdd(product, selectedVariants);
    setSelectedVariants({}); // Reset after adding
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className="h-48 w-full bg-gray-200 relative shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-gray-900">{product.title}</h3>
        <p className="mt-2 text-gray-600 text-sm h-10">{product.description}</p>
        
        {/* Variants Selection */}
        {product.variants && product.variants.length > 0 && (
          <div className="mt-4 space-y-3">
            {product.variants.map((variant: any) => (
              <div key={variant.name}>
                <label className="block text-xs font-medium text-gray-700 mb-1">{variant.name}</label>
                <select 
                  value={selectedVariants[variant.name] || ''}
                  onChange={(e) => handleSelect(variant.name, e.target.value)}
                  className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#E84C3D] outline-none"
                >
                  <option value="" disabled>Select {variant.name}</option>
                  {variant.options.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="text-2xl font-extrabold text-gray-900">${product.price.toFixed(2)}</span>
          <button
            onClick={handleAdd}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};
export default function StorefrontHome({ params }: { params: { slug: string } }) {
  const addItem = useCartStore((state) => state.addItem);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const storeRes = await fetch(`http://localhost:5000/api/stores/${params.slug}`);
        if (!storeRes.ok) throw new Error('Store not found');
        const store = await storeRes.json();
        
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

  const handleAddToCart = (product: any, selectedVariants: Record<string, string>) => {
    addItem({
      productId: product._id,
      title: product.title,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
      selectedVariants,
    });
    setAddedMessage(`${product.title} added to cart!`);
    setTimeout(() => setAddedMessage(null), 3000);
  };

  return (
    <div>
      {addedMessage && (
        <div className="fixed top-20 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50 shadow-md">
          {addedMessage}
        </div>
      )}

      <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Products</h2>

      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
          <button
            onClick={() => setActiveCategory('All')}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === 'All'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Products
          </button>
          {categories.map(cat => (
            <button
              key={cat._id}
              onClick={() => setActiveCategory(cat._id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat._id
                  ? 'bg-[#E84C3D] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>This store has no products yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products
            .filter(p => activeCategory === 'All' || p.category === activeCategory)
            .map((product) => (
            <ProductCard key={product._id} product={product} onAdd={handleAddToCart} />
          ))}
        </div>
      )}
    </div>
  );
}
