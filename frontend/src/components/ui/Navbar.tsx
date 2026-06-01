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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-black/70 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-[#E84C3D] flex items-center gap-2">
              <div className="w-8 h-8 bg-[#E84C3D] rounded-lg flex items-center justify-center text-white">
                S
              </div>
              <span className="hidden sm:block">ShoppingOT</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#about" className="text-gray-600 dark:text-gray-300 hover:text-[#E84C3D] transition-colors">{t("nav_about")}</a>
            <a href="#services" className="text-gray-600 dark:text-gray-300 hover:text-[#E84C3D] transition-colors">{t("nav_services")}</a>
            <a href="#contact" className="text-gray-600 dark:text-gray-300 hover:text-[#E84C3D] transition-colors">{t("nav_contact")}</a>
          </div>

          <div className="flex items-center space-x-4">
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
          </div>
        </div>
      </div>
    </nav>
  );
}
