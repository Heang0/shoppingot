'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Check, Palette, Save, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBaseDomain } from '@/lib/hooks/useBaseDomain';
import { useTranslations } from 'next-intl';

function AdminToast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      className={`fixed top-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-max md:max-w-sm z-[200] flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-3 rounded-full shadow-xl text-sm font-medium transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'
      }`}
    >
      <Check size={16} strokeWidth={2.5} className="shrink-0" />
      <span className="truncate">{message}</span>
    </div>
  );
}

export default function ThemeCustomizer() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const baseDomain = useBaseDomain();
  const t = useTranslations('AdminTheme');

  const [storeId, setStoreId] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [themeStyle, setThemeStyle] = useState('default');
  const [primaryColor, setPrimaryColor] = useState('#E84C3D');
  
  const [saving, setSaving] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stores`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        const stores = await res.json();
        const myStore = stores.find((s: any) => 
          s.ownerId?._id === user?._id || s.ownerId === user?._id
        );
        if (myStore) {
          setStoreId(myStore._id);
          setStoreSlug(myStore.slug);
          setThemeStyle(myStore.branding?.themeStyle || 'default');
          setPrimaryColor(myStore.branding?.primaryColor || '#E84C3D');
        }
      } catch (err) {
        console.error('Error fetching store', err);
      }
    };
    if (user?.token) fetchStore();
  }, [user]);

  const handleSave = async () => {
    if (!storeId) return;
    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stores/${storeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          branding: {
            themeStyle,
            primaryColor
          }
        })
      });

      if (res.ok) {
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <AdminToast message={t('toast_success')} visible={toastVisible} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <Link href="/admin/settings" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 px-3 py-2 md:px-4 md:py-2 rounded-xl">
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            <span className="hidden sm:inline">{t('back_settings')}</span>
          </Link>
          <h2 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Palette className="w-5 h-5 md:w-8 md:h-8 text-[#E84C3D]" />
            {t('title')}
          </h2>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-[#E84C3D] hover:bg-red-600 text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm"
        >
          <Save size={18} />
          {saving ? t('saving_btn') : t('save_btn')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Controls Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-[#111111] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('color_title')}</h3>
            <p className="text-sm text-gray-500 mb-4">{t('color_desc')}</p>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-3 mb-2">
                {['#000000', '#111111', '#E84C3D', '#E67E22', '#2ECC71', '#3498DB', '#9B59B6', '#E91E63'].map(color => (
                  <button
                    key={color}
                    onClick={() => setPrimaryColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      primaryColor.toUpperCase() === color 
                        ? 'border-gray-900 dark:border-white scale-110 shadow-md' 
                        : 'border-transparent hover:scale-105 shadow-sm'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-16 h-16 rounded-xl cursor-pointer border-2 border-gray-100 dark:border-gray-800 p-0 bg-transparent overflow-hidden"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111111] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('style_title')}</h3>
            <p className="text-sm text-gray-500 mb-4">{t('style_desc')}</p>
            <div className="space-y-3">
              {[
                { id: 'default', name: t('style_default'), desc: t('style_default_desc') },
                { id: 'minimalist', name: t('style_minimalist'), desc: t('style_minimalist_desc') },
                { id: 'neo-brutalism', name: t('style_neo'), desc: t('style_neo_desc') },
              ].map((style) => (
                <div 
                  key={style.id}
                  onClick={() => setThemeStyle(style.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    themeStyle === style.id 
                      ? 'border-[#E84C3D] bg-red-50 dark:bg-red-900/10' 
                      : 'border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{style.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{style.desc}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    themeStyle === style.id ? 'border-[#E84C3D]' : 'border-gray-300 dark:border-gray-700'
                  }`}>
                    {themeStyle === style.id && <div className="w-3 h-3 rounded-full bg-[#E84C3D]" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-8 bg-gray-50 dark:bg-[#0a0a0a] p-4 lg:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-start min-h-[500px] h-[600px] md:h-[800px]">
          
          {/* Mock Browser URL Bar */}
          <div className="w-full mb-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-t-lg shadow-sm flex items-center px-4 py-3 gap-2 sticky top-0 z-10">
            <div className="flex gap-1.5 mr-4">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded flex items-center px-3 py-1.5 gap-2">
              <Lock size={12} className="text-gray-400" />
              <span className="text-xs text-gray-600 dark:text-gray-300 font-medium truncate">
                http://{storeSlug}{baseDomain}
              </span>
            </div>
          </div>
          
          {storeSlug ? (
            <div className="w-full flex-1 rounded-b-lg border border-gray-200 dark:border-gray-800 overflow-hidden shadow-inner bg-white relative">
              <iframe 
                key={`${themeStyle}-${primaryColor}`}
                src={`http://${storeSlug}${baseDomain}/?theme=${themeStyle}&color=${encodeURIComponent(primaryColor)}`}
                className="w-full h-full border-0"
                title="Store Preview"
              />
            </div>
          ) : (
            <div className="w-full flex-1 rounded-b-lg border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-400">
              {t('loading_preview')}
            </div>
          )}
          
        </div>

      </div>
    </div>
  );
}
