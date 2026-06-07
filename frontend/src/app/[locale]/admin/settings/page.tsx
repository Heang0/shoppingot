'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useBaseDomain } from '@/lib/hooks/useBaseDomain';
import { User, Store as StoreIcon, Copy, Check, Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface Store {
  _id: string;
  name: string;
  slug: string;
  category?: string;
  paymentSettings?: {
    bakongId?: string;
    currency?: string;
  };
  branding: {
    logoUrl?: string;
    bannerUrl?: string;
    primaryColor?: string;
  };
  contact?: {
    phone?: string;
    address?: string;
  };
}

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

export default function AdminSettings() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const baseDomain = useBaseDomain();
  const t = useTranslations('AdminSettings');
  
  const [activeTab, setActiveTab] = useState<'profile' | 'store' | 'payment'>('profile');
  
  // Profile Form
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    password: '',
    profilePic: user?.profilePic || ''
  });

  // Sync profileData when user hydrates from localStorage
  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        profilePic: user.profilePic || prev.profilePic
      }));
    }
  }, [user]);

  // Store Form
  const [storeData, setStoreData] = useState<Store | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [copied, setCopied] = useState(false);
  
  const [profileUploaded, setProfileUploaded] = useState(false);
  const [logoUploaded, setLogoUploaded] = useState(false);

  const handleCopyUrl = () => {
    if (!storeData) return;
    const url = `http://${storeData.slug}${baseDomain}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/stores', {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        const stores = await res.json();
        const myStore = stores.find((s: any) => 
          s.ownerId?._id === user?._id || s.ownerId === user?._id
        );
        if (myStore) {
          setStoreData(myStore);
        }
      } catch (err) {
        console.error('Error fetching store', err);
      }
    };
    if (user?.token) fetchStore();
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    try {
      const res = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(t('profile_success'));
        setUser({ ...user, ...data, token: user?.token } as any);
        setProfileUploaded(false);
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeData) return;
    setLoading(true);
    setSuccessMsg('');
    try {
      const res = await fetch(`http://localhost:5000/api/stores/${storeData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          name: storeData.name,
          slug: storeData.slug,
          category: storeData.category || 'General Retail',
          branding: storeData.branding,
          contact: storeData.contact,
          deliverySettings: storeData.deliverySettings,
        })
      });
      if (res.ok) {
        // Also update payment settings
        await fetch(`http://localhost:5000/api/stores/${storeData._id}/payment-settings`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`
          },
          body: JSON.stringify({
            bakongId: storeData.paymentSettings?.bakongId || '',
            currency: storeData.paymentSettings?.currency || 'USD'
          })
        });

        setSuccessMsg(t('store_success'));
        setLogoUploaded(false);
        // Dispatch custom event to update Sidebar instantly
        window.dispatchEvent(new CustomEvent('storeUpdated'));
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update store');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'storeLogo' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const res = await fetch(`http://localhost:5000/api/upload?type=${type}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${user?.token}` },
        body: uploadData
      });
      const data = await res.json();
      if (res.ok) {
        if (type === 'profile') {
          setProfileData({ ...profileData, profilePic: data.url });
          setProfileUploaded(true);
        } else if (type === 'storeLogo' && storeData) {
          const newBranding = { ...storeData.branding, logoUrl: data.url };
          setStoreData({ ...storeData, branding: newBranding });
          setLogoUploaded(true);
          // Auto-save to DB immediately so it persists on refresh
          await fetch(`http://localhost:5000/api/stores/${storeData._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}` },
            body: JSON.stringify({ name: storeData.name, slug: storeData.slug, category: storeData.category, branding: newBranding })
          });
          setSuccessMsg('Logo saved successfully!');
          setTimeout(() => setSuccessMsg(''), 3000);
          window.dispatchEvent(new CustomEvent('storeUpdated'));
        } else if (type === 'banner' && storeData) {
          const newBranding = { ...storeData.branding, bannerUrl: data.url };
          setStoreData({ ...storeData, branding: newBranding });
          // Auto-save to DB immediately so it persists on refresh
          await fetch(`http://localhost:5000/api/stores/${storeData._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}` },
            body: JSON.stringify({ name: storeData.name, slug: storeData.slug, category: storeData.category, branding: newBranding })
          });
          setSuccessMsg('Banner saved successfully!');
          setTimeout(() => setSuccessMsg(''), 3000);
        }
      } else {
        alert(data.message || 'Image upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Upload error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <AdminToast message={successMsg} visible={!!successMsg} />
      
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('settings')}</h2>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => { setActiveTab('profile'); setSuccessMsg(''); }}
          className={`pb-4 px-4 font-medium transition-colors border-b-2 ${
            activeTab === 'profile' 
              ? 'border-[#E84C3D] text-[#E84C3D]' 
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          {t('personal_profile')}
        </button>
        <button
          onClick={() => { setActiveTab('store'); setSuccessMsg(''); }}
          className={`pb-4 px-4 font-medium transition-colors border-b-2 ${
            activeTab === 'store' 
              ? 'border-[#E84C3D] text-[#E84C3D]' 
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          {t('store_settings')}
        </button>
        <button
          onClick={() => { setActiveTab('payment'); setSuccessMsg(''); }}
          className={`pb-4 px-4 font-medium transition-colors border-b-2 ${
            activeTab === 'payment' 
              ? 'border-[#E84C3D] text-[#E84C3D]' 
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          {t('payment_settings')}
        </button>
      </div>

      <div className="bg-white dark:bg-[#111111] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="shrink-0">
                <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden border-2 border-gray-100 dark:border-gray-700">
                  {profileData.profilePic ? (
                    <img src={profileData.profilePic} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-gray-400" />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('profile_picture')}</label>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-4">
                    <label className="cursor-pointer bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors">
                      {uploading ? t('uploading') : t('upload_image')}
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'profile')} disabled={uploading} />
                    </label>
                  </div>
                  {profileUploaded && (
                    <p className="text-xs text-green-600 dark:text-green-400">{t('image_uploaded_profile')}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('full_name')}</label>
              <input
                type="text"
                required
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#E84C3D] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('new_password')}</label>
              <input
                type="password"
                placeholder={t('leave_blank')}
                value={profileData.password}
                onChange={(e) => setProfileData({ ...profileData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#E84C3D] outline-none"
              />
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center space-x-4">
              <button
                type="submit"
                disabled={loading || uploading}
                className="bg-[#E84C3D] text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? t('saving') : t('save_profile')}
              </button>
            </div>
          </form>
        )}

        {/* Store Tab */}
        {activeTab === 'store' && (
          storeData ? (
            <form onSubmit={handleStoreSubmit} className="space-y-6">
              <div className="flex items-center space-x-6">
                <div className="shrink-0">
                  <div className="h-24 w-24 rounded-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden border-2 border-gray-100 dark:border-gray-700">
                    {storeData.branding?.logoUrl ? (
                      <img src={storeData.branding.logoUrl} alt="Store Logo" className="h-full w-full object-cover" />
                    ) : (
                      <StoreIcon className="w-10 h-10 text-gray-400" />
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('store_logo')}</label>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-4">
                      <label className="cursor-pointer bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors">
                        {uploading ? t('uploading') : t('upload_logo')}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'storeLogo')} disabled={uploading} />
                      </label>
                    </div>
                    {logoUploaded && (
                      <p className="text-xs text-green-600 dark:text-green-400">{t('image_uploaded_store')}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('store_name')}</label>
                <input
                  type="text"
                  required
                  value={storeData.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    const newSlug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                    setStoreData({ ...storeData, name: newName, slug: newSlug });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#E84C3D] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('store_full_url')}</label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    http://
                  </span>
                  <input
                    type="text"
                    readOnly
                    value={storeData.slug}
                    className="flex-1 px-4 py-3 border-y border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 outline-none cursor-not-allowed"
                  />
                  <span className="inline-flex items-center px-4 border border-l-0 border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    {baseDomain}
                  </span>
                  <button 
                    type="button" 
                    onClick={handleCopyUrl}
                    className="inline-flex items-center px-4 rounded-r-lg border border-l-0 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('url_warning')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('store_category')}</label>
                <select 
                  value={storeData.category || 'General Retail'} 
                  onChange={(e) => setStoreData({ ...storeData, category: e.target.value })} 
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#E84C3D] outline-none"
                >
                  <option value="Clothing">{t('cat_clothing')}</option>
                  <option value="Food & Beverage">{t('cat_food')}</option>
                  <option value="Electronics">{t('cat_electronics')}</option>
                  <option value="Supplements">{t('cat_supplements')}</option>
                  <option value="General Retail">{t('cat_general')}</option>
                  <option value="Other">{t('cat_other')}</option>
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('category_warning')}</p>
              </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store Phone Number</label>
                  <input
                    type="text"
                    value={storeData.contact?.phone || ''}
                    onChange={(e) => setStoreData({ ...storeData, contact: { ...storeData.contact, phone: e.target.value } })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#E84C3D] bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                    placeholder="e.g. +855 12 345 678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store Address</label>
                  <textarea
                    value={storeData.contact?.address || ''}
                    onChange={(e) => setStoreData({ ...storeData, contact: { ...storeData.contact, address: e.target.value } })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#E84C3D] bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors h-24"
                    placeholder="Your physical store or return address"
                  />
                </div>

              <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delivery Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="freeDelivery" 
                      checked={storeData.deliverySettings?.isFreeDeliveryEnabled || false}
                      onChange={(e) => setStoreData({ 
                        ...storeData, 
                        deliverySettings: { ...storeData.deliverySettings, isFreeDeliveryEnabled: e.target.checked } 
                      })}
                      className="w-5 h-5 text-[#E84C3D] rounded focus:ring-[#E84C3D]"
                    />
                    <label htmlFor="freeDelivery" className="text-sm font-medium text-gray-900 dark:text-white">
                      Enable "Buy $... Up To Get Free Delivery"
                    </label>
                  </div>
                  
                  {storeData.deliverySettings?.isFreeDeliveryEnabled && (
                    <div className="pl-8">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Minimum Purchase for Free Delivery ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={storeData.deliverySettings?.freeDeliveryThreshold || ''}
                        onChange={(e) => setStoreData({ 
                          ...storeData, 
                          deliverySettings: { ...storeData.deliverySettings, freeDeliveryThreshold: Number(e.target.value) } 
                        })}
                        className="w-full max-w-xs px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#E84C3D] bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                        placeholder="e.g. 50"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('store_branding')}</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('store_banner')}</label>
                  <div className="flex items-center space-x-4">
                    {storeData.branding?.bannerUrl && (
                      <div className="h-16 w-32 rounded bg-gray-200 dark:bg-gray-800 overflow-hidden border border-gray-100 dark:border-gray-700 shrink-0">
                        <img src={storeData.branding.bannerUrl} alt="Store Banner" className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div>
                      <label className="cursor-pointer bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors">
                        {uploading ? t('uploading') : t('upload_banner')}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'banner')} disabled={uploading} />
                      </label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-5 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{t('theme_customizer_title')}</h4>
                      <p className="text-sm text-gray-500 mt-1">{t('theme_customizer_desc')}</p>
                    </div>
                    <Link href="/admin/settings/theme" className="px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                      {t('customize_theme_btn')}
                    </Link>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center space-x-4">
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="bg-[#E84C3D] text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors shadow-sm disabled:opacity-50"
                >
                  {loading ? t('saving') : t('save_store')}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 py-8 text-center">{t('setup_store_first')}</p>
          )
        )}

        {/* Payment Settings Tab */}
        {activeTab === 'payment' && (
          storeData ? (
            <form onSubmit={handleStoreSubmit} className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('payment_settings')}</h3>
              
              <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-100 dark:border-gray-800 space-y-6">
                {(storeData as any)?.plan?.planId?.name === 'Free' && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-4 rounded-lg text-sm border border-yellow-200 dark:border-yellow-800/50 flex items-start gap-3">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <p className="font-semibold">Upgrade Required</p>
                      <p className="mt-1">KHQR automatic payments are only available on Pro and Premium plans. Please upgrade to unlock.</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('bakong_id')}</label>
                  <input
                    type="text"
                    value={storeData.paymentSettings?.bakongId || ''}
                    onChange={(e) => setStoreData({ ...storeData, paymentSettings: { ...storeData.paymentSettings, bakongId: e.target.value } })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#E84C3D] outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="e.g. yourbusiness@bkrt"
                    disabled={(storeData as any)?.plan?.planId?.name === 'Free'}
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{t('bakong_warning')}</p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('currency')}</label>
                  <select 
                    value={storeData.paymentSettings?.currency || 'USD'} 
                    onChange={(e) => setStoreData({ ...storeData, paymentSettings: { ...storeData.paymentSettings, currency: e.target.value } })} 
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#E84C3D] outline-none"
                  >
                    <option value="USD">USD (US Dollar)</option>
                    <option value="KHR">KHR (Khmer Riel)</option>
                  </select>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Choose the default currency for generating your KHQR codes.</p>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#E84C3D] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E84C3D] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save size={20} />
                  )}
                  {t('save_changes')}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Loading payment settings...</p>
          )
        )}
      </div>
    </div>
  );
}
