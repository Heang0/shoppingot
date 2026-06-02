'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCartStore } from '@/lib/store/useCartStore';
import { Plus, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/store/ProductCard';
import StorefrontView from '@/components/store/StorefrontView';

export default function StorefrontHome({ params }: { params: { locale: string; slug: string } }) {
  return <StorefrontView params={params} />;
}
