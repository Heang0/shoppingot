'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Home, ShoppingCart, User, Search } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import { useEffect, useState } from 'react';
import StoreSearchModal from './StoreSearchModal';

export default function StoreBottomNav({ locale, primaryColor, slug, initialThemeStyle }: {
  locale: string;
  primaryColor: string;
  slug: string;
  initialThemeStyle?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const items = useCartStore(state => state.items);
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [themeStyle, setThemeStyle] = useState(initialThemeStyle || 'default');

  useEffect(() => {
    setMounted(true);
    const fetchTheme = async () => {
      try {
        const storeRes = await fetch(`http://localhost:5000/api/stores/${slug}`);
        if (storeRes.ok) {
          const store = await storeRes.json();
          const previewTheme = searchParams.get('theme');
          setThemeStyle(previewTheme || store.branding?.themeStyle || 'default');
        }
      } catch (e) { /* ignore */ }
    };
    fetchTheme();
  }, [slug, searchParams]);

  // Hide on product detail pages
  if (pathname?.includes('/product/')) return null;

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
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  const navItems = [
    {
      label: 'Home',
      href: homeHref,
      icon: Home,
      isActive: pathname === `/${locale}` || pathname === `/${locale}/` || pathname === '/',
    },
    {
      label: 'Search',
      onClick: () => setIsSearchOpen(true),
      icon: Search,
      isActive: isSearchOpen,
    },
    {
      label: 'Cart',
      href: cartHref,
      icon: ShoppingCart,
      isActive: pathname?.includes('/cart'),
      badge: totalItems,
    },
    {
      label: 'Account',
      href: profileHref,
      icon: User,
      isActive: pathname?.includes('/profile'),
    },
  ];

  let navClass = "fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#111111] md:hidden ";
  if (themeStyle === 'neo-brutalism') {
    navClass += "border-t-[3px] border-black dark:border-white shadow-[0px_-4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[0px_-4px_0px_0px_rgba(255,255,255,1)] pb-safe";
  } else if (themeStyle === 'minimalist') {
    navClass += "border-t border-gray-200 dark:border-gray-800 pb-safe";
  } else {
    navClass += "border-t border-gray-100 dark:border-gray-800 pb-safe shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)] dark:shadow-none";
  }

  return (
    <>
      <nav className={navClass}>
        <div className="flex h-16">
          {navItems.map((item) =>
            item.onClick ? (
              <button
                key={item.label}
                onClick={item.onClick}
                className="flex flex-1 flex-col items-center justify-center gap-0.5"
                style={{ color: item.isActive ? primaryColor : '#9CA3AF' }}
              >
                <item.icon size={22} strokeWidth={item.isActive ? 2.5 : 1.8} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            ) : (
              <Link
                key={item.label}
                href={item.href!}
                className="flex flex-1 flex-col items-center justify-center gap-0.5 relative"
                style={{ color: item.isActive ? primaryColor : '#9CA3AF' }}
              >
                <div className="relative">
                  <item.icon size={22} strokeWidth={item.isActive ? 2.5 : 1.8} />
                  {mounted && (item.badge ?? 0) > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 text-[9px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          )}
        </div>
      </nav>

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
