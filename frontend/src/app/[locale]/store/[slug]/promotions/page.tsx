'use client';

import StorefrontView from '@/components/store/StorefrontView';

export default function StorefrontPromotions({ params }: { params: { locale: string; slug: string } }) {
  return <StorefrontView params={params} viewMode="promotions" />;
}
