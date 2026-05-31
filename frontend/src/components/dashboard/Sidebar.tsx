"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

export type SidebarItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

interface SidebarProps {
  items: SidebarItem[];
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ items, title, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const [storeLogo, setStoreLogo] = useState<string | null>(null);

  useEffect(() => {
    if (user?.token && user?.role === 'store_admin') {
      fetch('http://localhost:5000/api/stores', {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      .then(res => res.json())
      .then(data => {
        const myStore = data.find((s: any) => s.ownerId?._id === user._id || s.ownerId === user._id);
        if (myStore?.branding?.logoUrl) {
          setStoreLogo(myStore.branding.logoUrl);
        }
      }).catch(console.error);
    }
  }, [user]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white dark:bg-[#111111] border-r border-gray-200 dark:border-gray-800
        flex flex-col transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Logo / Title Area */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
          <Link href="/" className="text-xl font-bold text-[#E84C3D] flex items-center gap-2">
            <div className="w-8 h-8 bg-[#E84C3D] rounded-lg flex items-center justify-center text-white text-sm overflow-hidden">
              {storeLogo ? (
                <img src={storeLogo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                'S'
              )}
            </div>
            <span>{title}</span>
          </Link>
          <button onClick={onClose} className="lg:hidden p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname === `/en${item.href}` || pathname === `/km${item.href}`;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors
                  ${isActive 
                    ? "bg-red-50 dark:bg-red-900/20 text-[#E84C3D]" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"}
                `}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Area */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-[#E84C3D] font-bold overflow-hidden border border-red-200 dark:border-red-900/50">
              {user?.profilePic ? (
                <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase() || 'M'
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name || 'Merchant'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
