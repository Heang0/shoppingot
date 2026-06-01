'use client';

import { X, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

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
}: {
  isOpen: boolean;
  onClose: () => void;
  storeName: string;
  storeLogo?: string;
  primaryColor: string;
  locale: string;
  slug: string;
  categories?: Category[];
}) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Clean paths — middleware rewrites subdomain paths automatically
  const homeHref = `/${locale}`;
  const cartHref = `/${locale}/cart`;
  const profileHref = `/${locale}/profile`;

  const langHref = (() => {
    if (!pathname) return `/${locale === 'en' ? 'km' : 'en'}`;
    const newLocale = locale === 'en' ? 'km' : 'en';
    if (pathname.startsWith(`/${locale}`)) return pathname.replace(`/${locale}`, `/${newLocale}`);
    return `/${newLocale}`;
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
        className={`fixed top-0 right-0 bottom-0 w-[80vw] max-w-[320px] z-[100] bg-white dark:bg-[#111111] flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {storeLogo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={storeLogo} alt={storeName} className="h-6 w-auto object-contain shrink-0" />
            )}
            <span className="font-bold text-gray-900 dark:text-white truncate">{storeName}</span>
          </div>
          <button onClick={onClose} className="ml-2 p-1 shrink-0 text-gray-900 dark:text-white active:opacity-50">
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-1">
          <Link href={homeHref} onClick={onClose} className="py-3 text-2xl font-light text-gray-900 dark:text-white hover:opacity-50 transition-opacity border-b border-gray-50 dark:border-gray-900">
            Home
          </Link>
          <Link href={cartHref} onClick={onClose} className="py-3 text-2xl font-light text-gray-900 dark:text-white hover:opacity-50 transition-opacity border-b border-gray-50 dark:border-gray-900">
            Cart
          </Link>
          <Link href={profileHref} onClick={onClose} className="py-3 text-2xl font-light text-gray-900 dark:text-white hover:opacity-50 transition-opacity border-b border-gray-50 dark:border-gray-900">
            Account
          </Link>

          {categories.length > 0 && (
            <>
              <p className="mt-6 mb-2 text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-semibold">
                Categories
              </p>
              {categories.map(cat => (
                <Link
                  key={cat._id}
                  href={homeHref}
                  onClick={onClose}
                  className="py-2.5 text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors border-b border-gray-50 dark:border-gray-900 last:border-0"
                >
                  {locale === 'km' && (cat as any).nameKm ? (cat as any).nameKm : cat.name}
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="shrink-0 px-5 pb-8 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white uppercase tracking-widest transition-colors"
            >
              {theme === 'dark' ? <><Sun size={14} /> Light</> : <><Moon size={14} /> Dark</>}
            </button>
          )}
          <a href={langHref} className="flex items-center gap-2 hover:opacity-60 transition-opacity">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={locale === 'en' ? 'https://flagcdn.com/w40/us.png' : 'https://flagcdn.com/w40/kh.png'}
              alt={locale}
              className="w-7 h-auto rounded-sm shadow"
            />
            <span className="text-sm text-gray-500 font-medium uppercase tracking-widest">
              {locale === 'en' ? 'EN' : 'KH'}
            </span>
          </a>
        </div>
      </div>
    </>
  );
}
