import StorefrontView from '@/components/store/StorefrontView';

export default function PromotionsCategoryPage({ params }: { params: { locale: string; slug: string; categorySlug: string } }) {
  return <StorefrontView params={params} viewMode="promotions" categorySlug={params.categorySlug} />;
}
