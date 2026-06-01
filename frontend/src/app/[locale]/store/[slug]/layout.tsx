import StoreBottomNav from '@/components/store/StoreBottomNav';
import StoreTopNav from '@/components/store/StoreTopNav';

async function getStore(slug: string) {
  const res = await fetch(`http://localhost:5000/api/stores/${slug}`, { next: { revalidate: 60 } });
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
    <div className="min-h-screen bg-white dark:bg-[#111111] flex flex-col relative w-full selection:bg-black/10 dark:selection:bg-white/10">
      
      {/* Sleek App Top Bar */}
      <StoreTopNav storeName={store.name} storeLogo={store.branding?.logoUrl} primaryColor={primaryColor} slug={slug} locale={locale} />

      {/* Content Area */}
      <main className="flex-1 w-full bg-white dark:bg-black pb-20 md:pb-0">
        {children}
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <StoreBottomNav locale={locale} primaryColor={primaryColor} slug={slug} />
    </div>
  );
}
