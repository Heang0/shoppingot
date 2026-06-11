import StorefrontView from '@/components/store/StorefrontView';

async function getStoreData(slug: string) {
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
    console.error('Failed to pre-fetch store data on server:', err);
    return null;
  }
}

export default async function StorefrontHome({ params }: { params: { locale: string; slug: string } }) {
  const data = await getStoreData(params.slug);
  
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
      initialProducts={data.products} 
      initialCategories={data.categories} 
      initialStore={data.store} 
    />
  );
}

