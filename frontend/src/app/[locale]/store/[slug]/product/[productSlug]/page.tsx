import ProductDetailClient from '@/components/store/ProductDetailClient';
import { Metadata } from 'next';
import Link from 'next/link';

async function getProductPageData(slug: string, productSlug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  try {
    const [prodRes, storeRes] = await Promise.all([
      fetch(`${apiUrl}/api/products/${productSlug}`, { next: { revalidate: 60 } }),
      fetch(`${apiUrl}/api/stores/${slug}`, { next: { revalidate: 60 } })
    ]);
    
    if (!prodRes.ok || !storeRes.ok) return null;
    
    const product = await prodRes.json();
    const store = await storeRes.json();
    
    // Fetch store products to select related items (same category, excluding current product)
    const allProdRes = await fetch(`${apiUrl}/api/products/store/${store._id}?limit=1000`, { next: { revalidate: 60 } });
    let relatedProducts = [];
    if (allProdRes.ok) {
      const prodData = await allProdRes.json();
      const allProducts = prodData.products || [];
      const pCat = product.category?._id ?? product.category;
      
      relatedProducts = allProducts
        .filter((p: any) => {
          const catId = p.category?._id ?? p.category;
          return String(catId) === String(pCat) && String(p._id) !== String(product._id);
        })
        .slice(0, 4); // Limit to 4 related products
    }
    
    return {
      product,
      store,
      relatedProducts
    };
  } catch (err) {
    console.error('Failed to pre-fetch product page data on server:', err);
    return null;
  }
}

export async function generateMetadata({
  params: { slug, productSlug, locale }
}: {
  params: { slug: string; productSlug: string; locale: string };
}): Promise<Metadata> {
  const data = await getProductPageData(slug, productSlug);
  if (!data) return { title: 'Product Not Found' };

  const title = locale === 'km' && data.product.titleKm ? data.product.titleKm : data.product.title;
  const description = locale === 'km' && data.product.descriptionKm 
    ? data.product.descriptionKm 
    : data.product.description || `Buy ${title} at ${data.store.name}`;

  return {
    title: title,
    description: description,
    openGraph: {
      title: `${title} | ${data.store.name}`,
      description: description,
      images: data.product.imageUrl ? [{ url: data.product.imageUrl }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: { slug: string; productSlug: string; locale: string } }) {
  const data = await getProductPageData(params.slug, params.productSlug);
  const isKm = params.locale === 'km';

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center flex-col min-h-[60vh]">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {isKm ? 'រកមិនឃើញផលិតផល' : 'Product not found'}
        </h2>
        <Link href={`/${params.locale}`} className="mt-4 text-[#E84C3D] hover:underline">
          {isKm ? 'ត្រឡប់ក្រោយ' : 'Go Back'}
        </Link>
      </div>
    );
  }

  return (
    <ProductDetailClient 
      product={data.product} 
      store={data.store} 
      relatedProducts={data.relatedProducts} 
      locale={params.locale} 
      slug={params.slug} 
    />
  );
}
