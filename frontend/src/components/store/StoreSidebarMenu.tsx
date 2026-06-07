'use client';

import { X, Moon, Sun, Heart, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useFavoritesStore } from '@/lib/store/useFavoritesStore';

interface Category {
  _id: string;
  name: string;
}

export default function StoreSidebarMenu({
  isOpen,
  onClose,
  storeName,
  storeLogo,
  primaryColor,
  locale,
  slug,
  categories = [],
  themeStyle = 'default',
}: {
  isOpen: boolean;
  onClose: () => void;
  storeName: string;
  storeLogo?: string;
  primaryColor: string;
  locale: string;
  slug: string;
  categories?: Category[];
  themeStyle?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Helper to preserve preview parameters
  const appendParams = (basePath: string) => {
    if (!searchParams) return basePath;
    const url = new URL(basePath, 'http://localhost');
    searchParams.forEach((val, key) => url.searchParams.set(key, val));
    return url.pathname + url.search;
  };

  // Clean paths — preserve preview parameters
  const homeHref = appendParams(`/${locale}`);
  const cartHref = appendParams(`/${locale}/cart`);
  const profileHref = appendParams(`/${locale}/profile`);
  const favoritesHref = appendParams(`/${locale}/favorites`);
  const categoryTitle = locale === 'km' ? 'ប្រភេទតាមប្រភេទ' : 'Categories By Type';
  const homeLabel = locale === 'km' ? 'ទំព័រដើម' : 'Home';
  const productsLabel = locale === 'km' ? 'ផលិតផល' : 'Products';
  const promotionsLabel = locale === 'km' ? 'ប្រូម៉ូសិន' : 'Promotions';
  const allCategoriesLabel = locale === 'km' ? 'ប្រភេទទាំងអស់' : 'All Categories';
  const cartLabel = locale === 'km' ? 'កន្ត្រក' : 'Cart';
  const accountLabel = locale === 'km' ? 'គណនី' : 'Account';
  const favoritesLabel = locale === 'km' ? 'ចំណូលចិត្ត' : 'Favorites';
  
  const productsHref = appendParams(`/${locale}/products`);
  const promotionsHref = appendParams(`/${locale}/promotions`);
  const categoriesHref = appendParams(`/${locale}/categories`);
  
  const favorites = useFavoritesStore(state => state.favorites);
  const totalFavorites = favorites.length;

  const langHref = (() => {
    let basePath = `/${locale === 'en' ? 'km' : 'en'}`;
    if (pathname && pathname.startsWith(`/${locale}`)) {
      basePath = pathname.replace(`/${locale}`, `/${locale === 'en' ? 'km' : 'en'}`);
    }
    return appendParams(basePath);
  })();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[99] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer — slides from right */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[90vw] sm:w-[85vw] md:max-w-[360px] z-[100] bg-white dark:bg-[#111111] flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } ${
          themeStyle === 'neo-brutalism'
            ? 'border-l-[4px] border-black dark:border-white shadow-[-6px_0px_0px_0px_rgba(0,0,0,1)] dark:shadow-[-6px_0px_0px_0px_rgba(255,255,255,1)] rounded-none'
            : themeStyle === 'minimalist'
            ? 'border-l border-gray-200 dark:border-gray-800'
            : 'shadow-2xl'
        }`}
      >
        {/* Header */}
        <div className="h-12 sm:h-14 flex items-center justify-between px-3 sm:px-5 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {storeLogo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={storeLogo.replace('/upload/', '/upload/w_200,c_limit,q_auto/')} alt={storeName} className="h-7 w-auto object-contain shrink-0" />
            )}
            <span className="text-base font-bold text-gray-900 dark:text-white tracking-tight truncate">{storeName}</span>
          </div>
          <button onClick={onClose} className="ml-2 p-1 shrink-0 text-gray-900 dark:text-white active:opacity-50">
            <X size={20} strokeWidth={1.5} className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 sm:py-6 flex flex-col gap-0">
          <Link href={homeHref} onClick={onClose} className={`py-3 sm:py-4 text-lg sm:text-xl ${themeStyle === 'neo-brutalism' ? 'font-bold uppercase tracking-widest' : 'font-medium'} hover:opacity-50 transition-opacity border-b border-gray-50 dark:border-gray-900 ${pathname === `/${locale}` || pathname === '/' ? '' : 'text-gray-900 dark:text-white'}`} style={pathname === `/${locale}` || pathname === '/' ? { color: primaryColor || '#000' } : undefined}>
            {homeLabel}
          </Link>
          <Link href={productsHref} onClick={onClose} className={`py-3 sm:py-4 text-lg sm:text-xl ${themeStyle === 'neo-brutalism' ? 'font-bold uppercase tracking-widest' : 'font-medium'} hover:opacity-50 transition-opacity border-b border-gray-50 dark:border-gray-900 ${pathname?.endsWith('/products') || pathname?.endsWith('/products/') || pathname?.includes('/product/') ? '' : 'text-gray-900 dark:text-white'}`} style={pathname?.endsWith('/products') || pathname?.endsWith('/products/') || pathname?.includes('/product/') ? { color: primaryColor || '#000' } : undefined}>
            {productsLabel}
          </Link>
          <Link href={promotionsHref} onClick={onClose} className={`py-3 sm:py-4 text-lg sm:text-xl ${themeStyle === 'neo-brutalism' ? 'font-bold uppercase tracking-widest' : 'font-medium'} hover:opacity-50 transition-opacity border-b border-gray-50 dark:border-gray-900 ${pathname?.endsWith('/promotions') || pathname?.endsWith('/promotions/') ? '' : 'text-gray-900 dark:text-white'}`} style={pathname?.endsWith('/promotions') || pathname?.endsWith('/promotions/') ? { color: primaryColor || '#000' } : undefined}>
            {promotionsLabel}
          </Link>
          {categories.length > 0 ? (
            <div className="flex flex-col border-b border-gray-50 dark:border-gray-900">
              <button
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className={`py-3 sm:py-4 text-lg sm:text-xl flex items-center justify-between ${themeStyle === 'neo-brutalism' ? 'font-bold uppercase tracking-widest' : 'font-medium'} hover:opacity-50 transition-opacity ${pathname?.endsWith('/categories') || pathname?.includes('/category/') ? '' : 'text-gray-900 dark:text-white'}`}
                style={pathname?.endsWith('/categories') || pathname?.includes('/category/') ? { color: primaryColor || '#000' } : undefined}
              >
                {allCategoriesLabel}
                <ChevronDown size={20} className={`transition-transform duration-200 ${isCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <div className={`flex flex-col pl-4 overflow-hidden transition-all duration-300 ${isCategoriesOpen ? 'max-h-[500px] mb-2 opacity-100' : 'max-h-0 opacity-0'}`}>
                <Link
                  href={categoriesHref}
                  onClick={onClose}
                  className={`py-2.5 px-1 text-sm sm:text-base font-semibold transition-colors border-b border-gray-50 dark:border-gray-900 last:border-0 ${pathname?.endsWith('/categories') || pathname?.endsWith('/categories/') ? '' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                  style={pathname?.endsWith('/categories') || pathname?.endsWith('/categories/') ? { color: primaryColor || '#000' } : undefined}
                >
                  {locale === 'km' ? 'មើលទាំងអស់' : 'View All Categories'}
                </Link>
                {categories.map(cat => {
                  const isCatActive = pathname?.includes(`/category/${(cat as any).slug}`);
                  return (
                    <Link
                      key={cat._id}
                      href={appendParams(`/${locale}/category/${(cat as any).slug}`)}
                      onClick={onClose}
                      className={`py-2.5 px-1 text-sm sm:text-base font-semibold transition-colors border-b border-gray-50 dark:border-gray-900 last:border-0 break-words ${isCatActive ? '' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                      style={isCatActive ? { color: primaryColor || '#000' } : undefined}
                    >
                      {locale === 'km' && (cat as any).nameKm ? (cat as any).nameKm : cat.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            <Link href={categoriesHref} onClick={onClose} className={`py-3 sm:py-4 text-lg sm:text-xl ${themeStyle === 'neo-brutalism' ? 'font-bold uppercase tracking-widest' : 'font-medium'} hover:opacity-50 transition-opacity border-b border-gray-50 dark:border-gray-900 ${pathname?.endsWith('/categories') || pathname?.endsWith('/categories/') || pathname?.includes('/category/') ? '' : 'text-gray-900 dark:text-white'}`} style={pathname?.endsWith('/categories') || pathname?.endsWith('/categories/') || pathname?.includes('/category/') ? { color: primaryColor || '#000' } : undefined}>
              {allCategoriesLabel}
            </Link>
          )}

          <Link href={cartHref} onClick={onClose} className={`py-3 sm:py-4 mt-4 text-lg sm:text-xl ${themeStyle === 'neo-brutalism' ? 'font-bold uppercase tracking-widest' : 'font-medium'} hover:opacity-50 transition-opacity border-b border-gray-50 dark:border-gray-900 ${pathname?.endsWith('/cart') || pathname?.endsWith('/cart/') ? '' : 'text-gray-900 dark:text-white'}`} style={pathname?.endsWith('/cart') || pathname?.endsWith('/cart/') ? { color: primaryColor || '#000' } : undefined}>
            {cartLabel}
          </Link>
          <Link href={favoritesHref} onClick={onClose} className={`py-3 sm:py-4 text-lg sm:text-xl ${themeStyle === 'neo-brutalism' ? 'font-bold uppercase tracking-widest' : 'font-medium'} hover:opacity-50 transition-opacity border-b border-gray-50 dark:border-gray-900 flex items-center gap-2 ${pathname?.endsWith('/favorites') || pathname?.endsWith('/favorites/') ? '' : 'text-gray-900 dark:text-white'}`} style={pathname?.endsWith('/favorites') || pathname?.endsWith('/favorites/') ? { color: primaryColor || '#000' } : undefined}>
            <Heart size={20} strokeWidth={1.5} />
            {favoritesLabel}
            {totalFavorites > 0 && (
              <span className="ml-auto min-w-[24px] h-6 px-2 text-xs font-bold text-white bg-red-500 rounded-full flex items-center justify-center">
                {totalFavorites > 99 ? '99+' : totalFavorites}
              </span>
            )}
          </Link>
          <Link href={profileHref} onClick={onClose} className={`py-3 sm:py-4 text-lg sm:text-xl ${themeStyle === 'neo-brutalism' ? 'font-bold uppercase tracking-widest' : 'font-medium'} hover:opacity-50 transition-opacity border-b border-gray-50 dark:border-gray-900 ${pathname?.includes('/profile') ? '' : 'text-gray-900 dark:text-white'}`} style={pathname?.includes('/profile') ? { color: primaryColor || '#000' } : undefined}>
            {accountLabel}
          </Link>
        </nav>

        {/* Footer */}
        <div className="shrink-0 px-3 sm:px-5 pb-6 sm:pb-8 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white uppercase tracking-widest transition-colors whitespace-nowrap"
            >
              {theme === 'dark' ? <><Sun size={14} className="sm:w-4 sm:h-4" /> Light</> : <><Moon size={14} className="sm:w-4 sm:h-4" /> Dark</>}
            </button>
          )}
          <a href={langHref} className="flex items-center gap-1 sm:gap-2 hover:opacity-60 transition-opacity ml-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={locale === 'en' ? 'https://flagcdn.com/w40/us.png' : 'https://flagcdn.com/w40/kh.png'}
              alt={locale}
              className="w-6 sm:w-7 h-auto rounded-sm shadow"
            />
            <span className="text-xs sm:text-sm text-gray-500 font-medium uppercase tracking-widest">
              {locale === 'en' ? 'EN' : 'KH'}
            </span>
          </a>
        </div>
      </div>
    </>
  );
}
