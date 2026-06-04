'use client';

import StorefrontView from '@/components/store/StorefrontView';

export default function StorefrontProducts({ params }: { params: { locale: string; slug: string } }) {
  return <StorefrontView params={params} viewMode="catalog" />;
}
