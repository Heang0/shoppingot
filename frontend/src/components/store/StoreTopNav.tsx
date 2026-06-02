'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { ChevronLeft, Moon, Sun, Menu, ShoppingCart, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import StoreSidebarMenu from './StoreSidebarMenu';
import StoreSearchModal from './StoreSearchModal';
import { useCartStore } from '@/lib/store/useCartStore';

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
  const cartHref = appendParams(`/${locale}/cart`);
  const profileHref = appendParams(`/${locale}/profile`);
  const allLabel = locale === 'km' ? 'ទាំងអស់' : 'All';

  // isHome: either the root or /km (locale only), and no category in the pathname
  const isCategoryPage = pathname.includes('/category/');
  const activeCategorySlug = isCategoryPage ? pathname.split('/').pop() : null;
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

        {/* MOBILE Right: cart badge + hamburger */}
        <div className="flex md:hidden shrink-0 items-center justify-end gap-1">
          <Link href={cartHref} className="relative p-2 text-gray-900 dark:text-white active:opacity-50">
            <ShoppingCart size={22} strokeWidth={1.5} />
            {mounted && totalItems > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-[3px] text-[9px] font-bold text-white bg-black dark:bg-white dark:text-black rounded-full flex items-center justify-center leading-none">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>
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

        {/* DESKTOP Center: nav + categories */}
        <nav className="hidden md:flex items-center gap-5 flex-1 overflow-hidden">
          <Link
            href={homeHref}
            className={`text-sm font-medium whitespace-nowrap uppercase tracking-wider transition-colors ${
              isHome ? 'text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {allLabel}
          </Link>
          {categories.map(cat => (
            <Link 
              key={cat._id} 
              href={appendParams(`/${locale}/category/${(cat as any).slug}`)}
              className={`text-sm font-medium whitespace-nowrap uppercase tracking-wider transition-colors ${
                activeCategorySlug === (cat as any).slug ? 'text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {locale === 'km' && (cat as any).nameKm ? (cat as any).nameKm : cat.name}
            </Link>
          ))}
        </nav>

        {/* DESKTOP Right: cart + theme + language + search */}
        <div className="hidden md:flex items-center gap-2 ml-4 shrink-0">
          <button onClick={() => setIsSearchOpen(true)} className="p-2 text-gray-900 dark:text-white hover:opacity-60 transition-opacity">
            <Search size={20} strokeWidth={1.5} />
          </button>
          <Link href={cartHref} className="relative p-2 text-gray-900 dark:text-white hover:opacity-60 transition-opacity">
            <ShoppingCart size={20} strokeWidth={1.5} />
            {mounted && totalItems > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-[3px] text-[9px] font-bold text-white bg-black dark:bg-white dark:text-black rounded-full flex items-center justify-center leading-none">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>
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
