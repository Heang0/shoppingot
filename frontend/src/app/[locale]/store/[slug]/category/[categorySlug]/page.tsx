import StorefrontView from '@/components/store/StorefrontView';

export default function CategoryPage({ params }: { params: { locale: string; slug: string; categorySlug: string } }) {
  return <StorefrontView params={params} categorySlug={params.categorySlug} />;
}
