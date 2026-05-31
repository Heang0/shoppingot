import Link from 'next/link';
import StoreHeader from '@/components/store/StoreHeader';

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <StoreHeader store={store} locale={locale} primaryColor={primaryColor} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          Powered by <Link href="/" className="font-semibold text-gray-900">ShoppingOT</Link>
        </div>
      </footer>
    </div>
  );
}
