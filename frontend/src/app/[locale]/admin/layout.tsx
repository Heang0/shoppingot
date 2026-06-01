'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { LayoutDashboard, Settings, Package, ShoppingCart, ArrowUpCircle } from 'lucide-react';

import { useTranslations } from 'next-intl';

export default function StoreAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [isHydrated, setIsHydrated] = useState(false);
  const t = useTranslations('Dashboard');

  useEffect(() => {
    // Wait a brief moment to ensure Zustand has hydrated from localStorage
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      if (!user || user.role !== 'store_admin') {
        router.push('/login');
      }
    }
  }, [user, router, isHydrated]);

  if (!isHydrated || !user || user.role !== 'store_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E84C3D]"></div>
      </div>
    );
  }

  const sidebarItems = [
    { label: t('dashboard'), href: '/admin', icon: <LayoutDashboard size={20} /> },
    { label: t('categories'), href: '/admin/categories', icon: <Package size={20} /> },
    { label: t('manage_products'), href: '/admin/products', icon: <Package size={20} /> },
    { label: t('order_tracking'), href: '/admin/orders', icon: <ShoppingCart size={20} /> },
    { label: t('upgrade_plan'), href: '/admin/upgrade', icon: <ArrowUpCircle size={20} /> },
    { label: t('settings'), href: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} title={t('merchant_panel')}>
      {children}
    </DashboardLayout>
  );
}
