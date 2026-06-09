'use client';

import { useCartStore } from '@/lib/store/useCartStore';
import { useCustomerAuthStore } from '@/lib/store/useCustomerAuthStore';
import { ShoppingCart, Heart } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useParams, useRouter } from 'next/navigation';

export default function ProductCard({ 
  product, 
  primaryColor, 
  themeStyle = 'default', 
  onAddToCart,
  isBestSeller = false
}: {
  product: any;
  primaryColor: string;
  themeStyle?: string;
  onAddToCart: (product: any) => void;
  isBestSeller?: boolean;
}) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const addItem = useCartStore(state => state.addItem);
  const setDrawerOpen = useCartStore(state => state.setDrawerOpen);
  const user = useCustomerAuthStore(state => state.customerInfo);
  const setCustomerInfo = useCustomerAuthStore(state => state.setCustomerInfo);

  // Check if we are testing on the main domain (e.g. shoppingot.vercel.app/store/slug)
  const isPathRouting = pathname?.includes('/store/');
  const basePath = isPathRouting && params.slug ? `/${params.locale}/store/${params.slug}` : `/${params.locale}`;

  const isFavorite = user?.favorites?.some(f => 
    typeof f === 'string' ? f === product._id : f?._id === product._id
  );

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If product has variants, force user to go to product details page to select them
    if (product.variants && product.variants.length > 0) {
      router.push(`${basePath}/product/${product.slug || product._id}`);
      return;
    }

    addItem({
      productId: product._id,
      title: product.title,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
    });
    onAddToCart(product);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      alert("Please login to save favorites.");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/favorites/${product._id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      if (res.ok) {
        const updatedFavorites = await res.json();
        setCustomerInfo({ ...user, favorites: updatedFavorites });
      }
    } catch (err) {
      console.error(err);
    }
  };

  let cardBaseClass = "flex flex-col group h-full transition-all relative";
  let imageContainerClass = "aspect-square w-full relative shrink-0 ";
  let priceClass = "text-sm font-bold text-gray-900 dark:text-white";

  if (themeStyle === 'minimalist') {
    cardBaseClass += " p-0 bg-transparent";
    imageContainerClass += "bg-gray-50 dark:bg-[#1a1a1a] overflow-hidden rounded-sm mb-4";
    priceClass = "text-sm font-medium text-gray-900 dark:text-white tracking-wide";
  } else if (themeStyle === 'neo-brutalism') {
    cardBaseClass += " p-3 border-[3px] border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] rounded-none bg-white dark:bg-black";
    imageContainerClass += "border-2 border-black dark:border-white bg-[#f0f0f0] dark:bg-[#222] overflow-hidden mb-4";
    priceClass = "text-[15px] font-black text-black dark:text-white bg-green-200 dark:bg-green-800 px-1 border-2 border-black dark:border-white";
  } else {
    // Premium Default
    cardBaseClass += " p-3 sm:p-4 rounded-3xl bg-white dark:bg-[#161616] transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)] hover:-translate-y-1";
    imageContainerClass += "bg-[#F8F9FA] dark:bg-[#222222] rounded-2xl mb-4 overflow-hidden";
  }

  return (
    <Link href={`${basePath}/product/${product.slug || product._id}`} className={cardBaseClass}>
      <div className={imageContainerClass}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={product.imageUrl?.replace('/upload/', '/upload/w_600,c_limit,q_auto/')} 
          alt={product.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-2xl" 
        />
        
        {/* Badge - rendered after image so it appears on top */}
        {isBestSeller && (
          <div className="absolute top-2 left-2 z-50">
            <span 
              className="inline-block text-white text-[10px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider whitespace-nowrap shadow-sm"
              style={{ backgroundColor: primaryColor || '#000' }}
            >
              Best Seller
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1">
        <h3 className={`line-clamp-2 ${themeStyle === 'minimalist' ? 'text-[15px] font-bold text-gray-900 dark:text-white mb-0.5' : themeStyle === 'neo-brutalism' ? 'text-base font-black uppercase text-black dark:text-white mb-1 leading-tight' : 'text-[15px] sm:text-base font-bold text-gray-900 dark:text-white mb-1 tracking-tight leading-snug'}`}>
          {params.locale === 'km' && product.titleKm ? product.titleKm : product.title}
        </h3>
        <p className={`line-clamp-2 mt-0.5 ${themeStyle === 'minimalist' ? 'text-xs text-gray-500' : 'text-xs text-gray-500 dark:text-gray-400'}`}>
          {params.locale === 'km' && product.descriptionKm ? product.descriptionKm : product.description}
        </p>
        
        <div className={`mt-auto pt-4 flex items-end justify-between`}>
          <span className={priceClass} style={{ color: themeStyle === 'default' ? (primaryColor || '#000') : undefined }}>
            ${product.price.toFixed(2)}
          </span>
          
          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 text-xs font-bold transition-all active:scale-95 ${
                themeStyle === 'neo-brutalism' 
                  ? 'border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none rounded-none text-white bg-black' 
                  : themeStyle === 'minimalist' 
                    ? 'rounded-sm text-white hover:opacity-90' 
                    : 'rounded-full text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
              }`}
              style={themeStyle !== 'neo-brutalism' ? { backgroundColor: primaryColor || '#000' } : undefined}
              title="Add to cart"
            >
              <ShoppingCart size={16} strokeWidth={2.5} className="text-white" />
            </button>
            <button
              onClick={handleWishlist}
              className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 text-xs font-medium transition-all active:scale-95 ${
                themeStyle === 'neo-brutalism'
                  ? 'border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none rounded-none text-white bg-black'
                  : themeStyle === 'minimalist'
                    ? 'rounded-sm text-white hover:opacity-90'
                    : 'rounded-full text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
              }`}
              style={themeStyle !== 'neo-brutalism' ? { backgroundColor: primaryColor || '#000' } : undefined}
              title="Add to wishlist"
            >
              <Heart 
                size={16} 
                strokeWidth={2.5}
                className={`transition-all ${isFavorite ? 'fill-white text-white scale-110' : 'fill-transparent text-white hover:scale-110'}`}
              />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
