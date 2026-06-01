'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingCart, User, Search } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import { useEffect, useState } from 'react';
import StoreSearchModal from './StoreSearchModal';

export default function StoreBottomNav({ locale, primaryColor, slug }: {
  locale: string;
  primaryColor: string;
  slug: string;
}) {
  const pathname = usePathname();
  const items = useCartStore(state => state.items);
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide on product detail pages
  if (pathname?.includes('/product/')) return null;

  // Clean paths — middleware rewrites subdomain paths automatically
  const homeHref = `/${locale}`;
  const cartHref = `/${locale}/cart`;
  const profileHref = `/${locale}/profile`;
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

  return (
    <>
      {/* Bottom Tab Bar — mobile only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#111111] border-t border-gray-100 dark:border-gray-800">
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
      </div>

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
