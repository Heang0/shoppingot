'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Heart, ArrowLeft, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useFavoritesStore } from '@/lib/store/useFavoritesStore';
import { useCartStore } from '@/lib/store/useCartStore';
import { useAuthStore } from '@/lib/store/useAuthStore';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isBestSeller?: boolean;
}

export default function FavoritesPage() {
  const t = useTranslations();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const favorites = useFavoritesStore((state) => state.favorites);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);
  const isFavorite = useFavoritesStore((state) => state.isFavorite);
  const addToCart = useCartStore((state) => state.addItem);
  const store = useAuthStore((state) => state.store);

  useEffect(() => {
    const fetchFavoriteProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        if (favorites.length === 0) {
          setProducts([]);
          setLoading(false);
          return;
        }

        // Get all products
        const response = await fetch('http://localhost:5000/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        
        const allProducts = await response.json();
        
        // Filter to only favorite products
        const favoriteProducts = allProducts.filter((product: Product) =>
          favorites.some((fav) => fav.productId === product._id)
        );
        
        setProducts(favoriteProducts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteProducts();
  }, [favorites]);

  const handleRemoveFavorite = (productId: string) => {
    removeFavorite(productId);
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 py-4 sm:py-6 md:py-8">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            href={`/${store?.slug || ''}`}
            className="inline-flex items-center gap-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-3 sm:mb-4 active:scale-95 transition-transform"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            <span>Back to Store</span>
          </Link>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-2 sm:gap-3 flex-wrap">
            <Heart size={24} className="sm:w-8 sm:h-8 md:w-8 md:h-8 text-red-500 fill-red-500 flex-shrink-0" />
            <span>My Favorites</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
            {favorites.length} item{favorites.length !== 1 ? 's' : ''} saved
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm sm:text-base text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Empty State */}
        {products.length === 0 && !loading && (
          <div className="text-center py-12 sm:py-16">
            <Heart size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4 sm:w-16 sm:h-16" />
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              No Favorites Yet
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 px-2">
              Start adding your favorite products to build your wishlist!
            </p>
            <Link
              href={`/${store?.slug || ''}`}
              className="inline-block px-5 sm:px-6 py-2 sm:py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium text-sm sm:text-base hover:bg-gray-800 dark:hover:bg-gray-100 transition active:scale-95"
            >
              Browse Products
            </Link>
          </div>
        )}

        {/* Products Grid */}
        {products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="group bg-gray-50 dark:bg-gray-900 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-800 flex flex-col"
              >
                {/* Image Container */}
                <div className="relative w-full aspect-square bg-gray-200 dark:bg-gray-800 overflow-hidden rounded-xl sm:rounded-2xl">
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}

                  {/* Best Seller Badge */}
                  {product.isBestSeller && (
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-yellow-400 text-gray-900 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-bold">
                      ⭐ BEST
                    </div>
                  )}

                  {/* Action Buttons - Mobile & Desktop */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex flex-col sm:flex-row items-center justify-between p-2 sm:p-4 opacity-0 group-hover:opacity-100 gap-2 sm:gap-0">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="hidden sm:flex items-center justify-center gap-2 flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-2 px-3 rounded-lg font-medium text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition mr-2"
                    >
                      <ShoppingCart size={16} />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleRemoveFavorite(product._id)}
                      className="hidden sm:flex items-center justify-center w-10 h-10 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                      title="Remove from favorites"
                    >
                      <Heart size={18} className="fill-white" />
                    </button>
                  </div>

                  {/* Mobile Action Buttons - Visible always on mobile */}
                  <div className="sm:hidden absolute bottom-0 left-0 right-0 flex gap-1 p-2 bg-gradient-to-t from-black/60 to-transparent">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex items-center justify-center flex-1 bg-gray-900 text-white py-1.5 px-2 rounded-lg font-medium text-xs hover:bg-gray-800 transition active:scale-95"
                    >
                      <ShoppingCart size={14} className="mr-1" />
                      Add
                    </button>
                    <button
                      onClick={() => handleRemoveFavorite(product._id)}
                      className="flex items-center justify-center w-9 h-9 bg-red-500 text-white rounded-lg hover:bg-red-600 transition active:scale-95"
                      title="Remove from favorites"
                    >
                      <Heart size={16} className="fill-white" />
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-2 sm:p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm line-clamp-2 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs line-clamp-1 sm:line-clamp-2 mb-2 flex-1">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
