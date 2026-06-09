"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useTranslations, useLocale } from "next-intl";
import { Moon, Sun, Globe } from "lucide-react";
import { useState, useEffect } from "react";

export function Navbar() {
  const t = useTranslations("Index");
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const locale = useLocale();

  const toggleLanguage = () => {
    if (!pathname) return "/en";
    const newLocale = locale === "en" ? "km" : "en";

    let currentPath = pathname;
    if (currentPath.startsWith(`/${locale}`)) {
      currentPath = currentPath.replace(`/${locale}`, "");
    }

    if (!currentPath.startsWith('/')) {
      currentPath = '/' + currentPath;
    }

    return `/${newLocale}${currentPath}`;
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-black/70 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                <img
                  src="/logo/logo-website.png"
                  alt="ShoppingOT Logo"
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-gray-600 dark:text-gray-300 font-bold hover:text-[#E84C3D] transition-colors">{locale === 'km' ? 'ទំព័រដើម' : 'Home'}</a>
              <a href="#about" className="text-gray-600 dark:text-gray-300 font-bold hover:text-[#E84C3D] transition-colors">{locale === 'km' ? 'អំពីយើង' : 'About Us'}</a>
              <a href="#services" className="text-gray-600 dark:text-gray-300 font-bold hover:text-[#E84C3D] transition-colors">{locale === 'km' ? 'សេវាកម្ម' : 'Services'}</a>
              <a href="#contact" className="text-gray-600 dark:text-gray-300 font-bold hover:text-[#E84C3D] transition-colors">{locale === 'km' ? 'ទំនាក់ទំនង' : 'Contact'}</a>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {mounted && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                  aria-label="Toggle Dark Mode"
                >
                  {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              )}

              <Link
                href={toggleLanguage()}
                className="p-1 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 border border-transparent hover:border-gray-300 dark:hover:border-gray-600 shadow-sm"
                title="Toggle Language"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={locale === 'en' ? 'https://flagcdn.com/w40/us.png' : 'https://flagcdn.com/w40/kh.png'} alt={locale} className="w-6 h-auto rounded-sm" />
              </Link>

              <Link
                href="/login"
                className="hidden sm:inline-flex px-4 py-2 bg-[#E84C3D] text-white rounded-full text-sm font-medium hover:bg-red-600 transition-colors"
              >
                {t("login")}
              </Link>

              {/* Hamburger Icon for Mobile */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                aria-label="Open Mobile Menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-black/60 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Mobile Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-[280px] bg-white dark:bg-[#0a0a0a] z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <img
              src="/logo/logo-website.png"
              alt="ShoppingOT Logo"
              className="h-8 w-auto object-contain"
            />
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div className="flex flex-col space-y-6 px-6 py-8">
            <a onClick={() => setIsMobileMenuOpen(false)} href="/" className="text-gray-800 dark:text-gray-200 font-bold hover:text-[#E84C3D] text-lg transition-colors">{locale === 'km' ? 'ទំព័រដើម' : 'Home'}</a>
            <a onClick={() => setIsMobileMenuOpen(false)} href="#about" className="text-gray-800 dark:text-gray-200 font-bold hover:text-[#E84C3D] text-lg transition-colors">{locale === 'km' ? 'អំពីយើង' : 'About Us'}</a>
            <a onClick={() => setIsMobileMenuOpen(false)} href="#services" className="text-gray-800 dark:text-gray-200 font-bold hover:text-[#E84C3D] text-lg transition-colors">{locale === 'km' ? 'សេវាកម្ម' : 'Services'}</a>
            <a onClick={() => setIsMobileMenuOpen(false)} href="#contact" className="text-gray-800 dark:text-gray-200 font-bold hover:text-[#E84C3D] text-lg transition-colors">{locale === 'km' ? 'ទំនាក់ទំនង' : 'Contact'}</a>
            
            <div className="pt-8 mt-4 border-t border-gray-100 dark:border-gray-800">
              <Link
                onClick={() => setIsMobileMenuOpen(false)}
                href="/login"
                className="block text-center w-full py-3 bg-[#E84C3D] text-white rounded-full font-medium hover:bg-red-600 transition-colors shadow-md"
              >
                {t("login")}
              </Link>
            </div>
        </div>
      </div>
    </>
  );
}
