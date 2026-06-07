'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { ChevronLeft, Moon, Sun, Menu, ShoppingCart, Search, Heart, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import StoreSidebarMenu from './StoreSidebarMenu';
import StoreSearchModal from './StoreSearchModal';
import { useCartStore } from '@/lib/store/useCartStore';
import { useFavoritesStore } from '@/lib/store/useFavoritesStore';

interface Category {
  _id: string;
  name: string;
}

export default function StoreTopNav({ storeName, storeLogo, primaryColor, slug, locale, initialThemeStyle }: {
  storeName: string;
  storeLogo?: string;
  primaryColor: string;
  slug: string;
  locale: string;
  initialThemeStyle?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [themeStyle, setThemeStyle] = useState(initialThemeStyle || 'default');
  const [logoUrl, setLogoUrl] = useState(storeLogo || '');

  const items = useCartStore(state => state.items);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const setDrawerOpen = useCartStore(state => state.setDrawerOpen);
  const favorites = useFavoritesStore(state => state.favorites);
  const totalFavorites = favorites.length;

  useEffect(() => {
    setMounted(true);
    const loadCategories = async () => {
      try {
        const storeRes = await fetch(`http://localhost:5000/api/stores/${slug}`);
        if (!storeRes.ok) return;
        const store = await storeRes.json();
        
        const previewTheme = searchParams.get('theme');
        setThemeStyle(previewTheme || store.branding?.themeStyle || 'default');
        if (store.branding?.logoUrl) setLogoUrl(store.branding.logoUrl);

        const catRes = await fetch(`http://localhost:5000/api/categories/store/${store._id}`);
        if (catRes.ok) {
          const cats = await catRes.json();
          setCategories(cats || []);
        }
      } catch (e) { /* silent */ }
    };
    loadCategories();
  }, [slug]);

  // Clean paths — middleware rewrites subdomain paths automatically
  const previewTheme = searchParams.get('theme');
  const previewColor = searchParams.get('color');

  const appendParams = (href: string) => {
    if (!previewTheme && !previewColor) return href;
    const url = new URL(href, 'http://localhost');
    if (previewTheme) url.searchParams.set('theme', previewTheme);
    if (previewColor) url.searchParams.set('color', previewColor);
    return `${url.pathname}${url.search}`;
  };

  const homeHref = appendParams(`/${locale}`);
  const profileHref = appendParams(`/${locale}/profile`);
  const favoritesHref = appendParams(`/${locale}/favorites`);
  // isHome: either the root or /km (locale only)
  const isCategoryPage = pathname?.includes('/category/');
  const isHome = (pathname === `/${locale}` || pathname === '/' || pathname === `/${locale}/`) && !isCategoryPage;

  // Language toggle — swap locale prefix
  const langHref = (() => {
    let base = '';
    if (!pathname) {
      base = `/${locale === 'en' ? 'km' : 'en'}`;
    } else {
      const newLocale = locale === 'en' ? 'km' : 'en';
      if (pathname.startsWith(`/${locale}`)) {
        base = pathname.replace(`/${locale}`, `/${newLocale}`);
      } else {
        base = `/${newLocale}`;
      }
    }
    return appendParams(base);
  })();

  let headerClass = "bg-white dark:bg-[#111111] sticky top-0 z-50 ";
  if (themeStyle === 'neo-brutalism') {
    headerClass += "border-b-[3px] border-black dark:border-white shadow-[0px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[0px_4px_0px_0px_rgba(255,255,255,1)]";
  } else if (themeStyle === 'minimalist') {
    headerClass += "border-b border-gray-200 dark:border-gray-800";
  } else {
    headerClass += "border-b border-gray-100 dark:border-gray-800";
  }

  return (
    <>
    <header className={headerClass}>

      {/* Top bar */}
      <div className="h-14 md:h-16 flex items-center px-4 md:px-8">

        {/* MOBILE Left: back button */}
        <div className="flex md:hidden shrink-0">
          {!isHome && (
            <button
              onClick={() => router.back()}
              className="p-1 -ml-1 text-gray-900 dark:text-white active:opacity-50"
            >
              <ChevronLeft size={26} strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* MOBILE Left: logo + store name */}
        <Link href={homeHref} className="flex-1 flex justify-start items-center gap-2 md:hidden overflow-hidden">
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl.replace('/upload/', '/upload/w_200,c_limit,q_auto/')} alt={storeName} className="h-7 w-auto object-contain shrink-0" />
          )}
          <span className="text-base font-bold text-gray-900 dark:text-white tracking-tight truncate">
            {storeName}
          </span>
        </Link>

        {/* MOBILE Right: favorites + cart badge + hamburger */}
        <div className="flex md:hidden shrink-0 items-center justify-end gap-1">
          <Link href={favoritesHref} className="relative p-2 text-gray-900 dark:text-white active:opacity-50">
            <Heart size={22} strokeWidth={1.5} />
            {mounted && totalFavorites > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-[3px] text-[9px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center leading-none">
                {totalFavorites > 99 ? '99+' : totalFavorites}
              </span>
            )}
          </Link>
          <button onClick={() => setDrawerOpen(true)} className="relative p-2 text-gray-900 dark:text-white active:opacity-50">
            <ShoppingCart size={22} strokeWidth={1.5} />
            {mounted && totalItems > 0 && (
              <span 
                className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-[3px] text-[9px] font-bold text-white rounded-full flex items-center justify-center leading-none shadow-sm"
                style={{ backgroundColor: primaryColor || '#000' }}
              >
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -mr-1 text-gray-900 dark:text-white active:opacity-50"
          >
            <Menu size={24} strokeWidth={1.5} />
          </button>
        </div>

        {/* DESKTOP Left: logo */}
        <Link href={homeHref} className="hidden md:flex items-center gap-2 shrink-0 mr-8">
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl.replace('/upload/', '/upload/w_200,c_limit,q_auto/')} alt={storeName} className="h-7 w-auto object-contain shrink-0" />
          )}
          <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight whitespace-nowrap">
            {storeName}
          </span>
        </Link>

        {/* DESKTOP Center: main nav */}
        <nav className="hidden md:flex items-center gap-6 flex-1 justify-center">
          <Link
            href={homeHref}
            className={`text-sm font-semibold uppercase tracking-wider transition-colors ${
              isHome ? '' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            style={isHome ? { color: primaryColor || '#000' } : undefined}
          >
            {locale === 'km' ? 'ទំព័រដើម' : 'Home'}
          </Link>
          <Link
            href={appendParams(`/${locale}/products`)}
            className={`text-sm font-semibold uppercase tracking-wider transition-colors ${
              pathname?.endsWith('/products') || pathname?.endsWith('/products/') || pathname?.includes('/product/') ? '' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            style={pathname?.endsWith('/products') || pathname?.endsWith('/products/') || pathname?.includes('/product/') ? { color: primaryColor || '#000' } : undefined}
          >
            {locale === 'km' ? 'ផលិតផល' : 'Products'}
          </Link>
          <Link
            href={appendParams(`/${locale}/promotions`)}
            className={`text-sm font-semibold uppercase tracking-wider transition-colors ${
              pathname?.endsWith('/promotions') || pathname?.endsWith('/promotions/') ? '' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            style={pathname?.endsWith('/promotions') || pathname?.endsWith('/promotions/') ? { color: primaryColor || '#000' } : undefined}
          >
            {locale === 'km' ? 'ប្រូម៉ូសិន' : 'Promotions'}
          </Link>

          {/* Categories Dropdown */}
          <div className="relative group">
            <Link
              href={appendParams(`/${locale}/categories`)}
              className={`flex items-center gap-1 text-sm font-semibold uppercase tracking-wider transition-colors py-2 ${
                pathname?.endsWith('/categories') || pathname?.endsWith('/categories/') || pathname?.includes('/category/') 
                ? '' 
                : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              style={pathname?.endsWith('/categories') || pathname?.endsWith('/categories/') || pathname?.includes('/category/') ? { color: primaryColor || '#000' } : undefined}
            >
              {locale === 'km' ? 'ប្រភេទ' : 'Categories'}
              <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
            </Link>
            
            {/* Dropdown Menu */}
            {categories.length > 0 && (
              <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl py-2 min-w-[200px] flex flex-col">
                  {categories.map((cat: any) => {
                    const isCatActive = pathname?.includes(`/category/${cat.slug}`);
                    return (
                      <Link
                        key={cat._id}
                        href={appendParams(`/${locale}/category/${cat.slug}`)}
                        className={`px-4 py-2.5 text-sm font-semibold transition-colors ${
                          isCatActive ? 'bg-gray-50 dark:bg-gray-800/50' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                        }`}
                        style={isCatActive ? { color: primaryColor || '#000' } : undefined}
                      >
                        {locale === 'km' && cat.nameKm ? cat.nameKm : cat.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* DESKTOP Right: search + favorites + cart + account + theme + language */}
        <div className="hidden md:flex items-center gap-2 ml-4 shrink-0">
          <button onClick={() => setIsSearchOpen(true)} className="p-2 text-gray-900 dark:text-white hover:opacity-60 transition-opacity">
            <Search size={20} strokeWidth={1.5} />
          </button>
          <Link href={favoritesHref} className="relative p-2 text-gray-900 dark:text-white hover:opacity-60 transition-opacity">
            <Heart size={20} strokeWidth={1.5} />
            {mounted && totalFavorites > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-[3px] text-[9px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center leading-none">
                {totalFavorites > 99 ? '99+' : totalFavorites}
              </span>
            )}
          </Link>
          <button onClick={() => setDrawerOpen(true)} className="relative p-2 text-gray-900 dark:text-white hover:opacity-60 transition-opacity">
            <ShoppingCart size={20} strokeWidth={1.5} />
            {mounted && totalItems > 0 && (
              <span 
                className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-[3px] text-[9px] font-bold text-white rounded-full flex items-center justify-center leading-none shadow-sm"
                style={{ backgroundColor: primaryColor || '#000' }}
              >
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>
          <Link href={profileHref} className="p-2 text-gray-900 dark:text-white hover:opacity-60 transition-opacity text-sm font-medium uppercase tracking-wider">
            Account
          </Link>

          <div className="flex items-center gap-2 pl-3 ml-1 border-l border-gray-200 dark:border-gray-700">
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white"
              >
                {theme === 'dark' ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
              </button>
            )}
            <a href={langHref} className="hover:opacity-60 transition-opacity">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={locale === 'en' ? 'https://flagcdn.com/w40/us.png' : 'https://flagcdn.com/w40/kh.png'}
                alt={locale}
                className="w-6 h-auto rounded-sm shadow-sm"
              />
            </a>
          </div>
        </div>

      </div>
    </header>

    {/* Sidebar */}
    <StoreSidebarMenu
      isOpen={isSidebarOpen}
      onClose={() => setIsSidebarOpen(false)}
      storeName={storeName}
      storeLogo={storeLogo}
      primaryColor={primaryColor}
      locale={locale}
      slug={slug}
      categories={categories}
      themeStyle={themeStyle}
    />
    
    {mounted && (
      <StoreSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        slug={slug}
        locale={locale}
        primaryColor={primaryColor}
      />
    )}
    </>
  );
}
