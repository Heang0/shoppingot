'use client';

import { useCartStore } from '@/lib/store/useCartStore';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function ProductCard({ 
  product, 
  primaryColor, 
  themeStyle = 'default', 
  onAddToCart 
}: {
  product: any;
  primaryColor: string;
  themeStyle?: string;
  onAddToCart: (product: any) => void;
}) {
  const params = useParams();
  const router = useRouter();
  const addItem = useCartStore(state => state.addItem);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If product has variants, force user to go to product details page to select them
    if (product.variants && product.variants.length > 0) {
      router.push(`/${params.locale}/product/${product.slug || product._id}`);
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
        <img src={product.imageUrl?.replace('/upload/', '/upload/w_600,c_limit,q_auto/')} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
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
}
