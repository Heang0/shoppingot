import StoreBottomNav from '@/components/store/StoreBottomNav';
import StoreTopNav from '@/components/store/StoreTopNav';
import CartDrawer from '@/components/store/CartDrawer';

async function getStore(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stores/${slug}`, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  return res.json();
}

export default async function StorefrontLayout({
  children,
  params: { slug, locale }
}: {
  children: React.ReactNode;
  params: { slug: string; locale: string };
}) {
  const store = await getStore(slug);

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Store Not Found</h1>
          <p className="mt-2 text-gray-600">The store you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  const primaryColor = store.branding?.primaryColor || '#E84C3D';

  return (
    <div className="min-h-screen bg-white dark:bg-[#111111] w-full selection:bg-black/10 dark:selection:bg-white/10">
      
      {/* Sleek App Top Bar */}
      <StoreTopNav storeName={store.name} storeLogo={store.branding?.logoUrl} primaryColor={primaryColor} slug={slug} locale={locale} initialThemeStyle={store.branding?.themeStyle || 'default'} />

      {/* Content Area */}
      <main className="w-full bg-white dark:bg-black pb-8 md:pb-12 min-h-[calc(100vh-180px)]">
        {children}
      </main>

      {/* Powered By Footer */}
      <footer className="w-full py-6 md:py-8 bg-[#F8F9FA] dark:bg-[#0A0A0A] text-center border-t border-gray-100 dark:border-gray-800 pb-28 md:pb-8 flex flex-col items-center justify-center">
        <a href={process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group">
          <span>{locale === 'km' ? 'ដំណើរការដោយ' : 'Powered by'}</span>
          <img src="/logo/logo-website.png" alt="ShoppingOT Logo" className="h-5 sm:h-6 object-contain grayscale group-hover:grayscale-0 transition-all duration-300 opacity-80 group-hover:opacity-100" />
          <span className="font-bold tracking-tight text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">ShoppingOT</span>
        </a>
      </footer>

      {/* Bottom Navigation (Mobile Only) */}
      <StoreBottomNav locale={locale} primaryColor={primaryColor} slug={slug} initialThemeStyle={store.branding?.themeStyle || 'default'} />

      {/* Cart Drawer */}
      <CartDrawer primaryColor={primaryColor} themeStyle={store.branding?.themeStyle || 'default'} />
    </div>
  );
}
