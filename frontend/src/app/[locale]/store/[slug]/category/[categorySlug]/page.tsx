import StorefrontView from '@/components/store/StorefrontView';
import { Metadata } from 'next';

async function getCategoryStoreData(slug: string) {
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
    console.error('Failed to pre-fetch category page data on server:', err);
    return null;
  }
}

export async function generateMetadata({
  params: { slug, categorySlug, locale }
}: {
  params: { slug: string; categorySlug: string; locale: string };
}): Promise<Metadata> {
  const data = await getCategoryStoreData(slug);
  if (!data) return { title: 'Category Not Found' };

  const category = data.categories.find((c: any) => c.slug === categorySlug);
  if (!category) return { title: 'Category Not Found' };

  const name = locale === 'km' && category.nameKm ? category.nameKm : category.name;
  return {
    title: name,
    description: locale === 'km'
      ? `ទិញទំនិញតាមប្រភេទ ${name} នៅហាង ${data.store.name}។`
      : `Shop by category ${name} at ${data.store.name}.`,
  };
}

export default async function CategoryPage({ params }: { params: { locale: string; slug: string; categorySlug: string } }) {
  const data = await getCategoryStoreData(params.slug);
  
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
      categorySlug={params.categorySlug}
      initialProducts={data.products} 
      initialCategories={data.categories} 
      initialStore={data.store} 
    />
  );
}

