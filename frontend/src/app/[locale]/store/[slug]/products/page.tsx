import StorefrontView from '@/components/store/StorefrontView';
import { Metadata } from 'next';

async function getProductsStoreData(slug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  try {
    // 1. Fetch store
    const storeRes = await fetch(`${apiUrl}/api/stores/${slug}`, { next: { revalidate: 60 } });
    if (!storeRes.ok) return null;
    const store = await storeRes.json();
    
    // 2. Fetch products and categories in parallel
    const [prodRes, catRes] = await Promise.all([
      fetch(`${apiUrl}/api/products/store/${store._id}?limit=1000`, { next: { revalidate: 60 } }),
      fetch(`${apiUrl}/api/categories/store/${store._id}`, { next: { revalidate: 60 } })
    ]);
    
    const productsData = prodRes.ok ? await prodRes.json() : { products: [] };
    const categories = catRes.ok ? await catRes.json() : [];
    
    return {
      store,
      products: productsData.products || [],
      categories
    };
  } catch (err) {
    console.error('Failed to pre-fetch products page data on server:', err);
    return null;
  }
}

export async function generateMetadata({
  params: { slug, locale }
}: {
  params: { slug: string; locale: string };
}): Promise<Metadata> {
  const data = await getProductsStoreData(slug);
  if (!data) return { title: 'Products Not Found' };

  return {
    title: locale === 'km' ? 'ផលិតផលទាំងអស់' : 'All Products',
    description: locale === 'km'
      ? `ស្វែងរក និងជាវផលិតផលទាំងអស់ពីហាង ${data.store.name}។`
      : `Browse and shop all products from ${data.store.name}.`,
  };
}

export default async function StorefrontProducts({ params }: { params: { locale: string; slug: string } }) {
  const data = await getProductsStoreData(params.slug);
  
  if (!data) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-gray-500 font-medium">Store data not found</p>
      </div>
    );
  }

  return (
    <StorefrontView 
      params={params} 
      viewMode="catalog"
      initialProducts={data.products} 
      initialCategories={data.categories} 
      initialStore={data.store} 
    />
  );
}

