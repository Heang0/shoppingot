'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useBaseDomain } from '@/lib/hooks/useBaseDomain';
import { User, Store as StoreIcon, Copy, Check } from 'lucide-react';

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
}

export default function AdminSettings() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const baseDomain = useBaseDomain();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'store'>('profile');
  
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
        setSuccessMsg('Profile updated successfully!');
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
          branding: storeData.branding
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

        setSuccessMsg('Store settings updated successfully!');
        setLogoUploaded(false);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'storeLogo') => {
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
          setStoreData({ 
            ...storeData, 
            branding: { ...storeData.branding, logoUrl: data.url } 
          });
          setLogoUploaded(true);
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
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h2>

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
          Personal Profile
        </button>
        <button
          onClick={() => { setActiveTab('store'); setSuccessMsg(''); }}
          className={`pb-4 px-4 font-medium transition-colors border-b-2 ${
            activeTab === 'store' 
              ? 'border-[#E84C3D] text-[#E84C3D]' 
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Store Settings
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profile Picture</label>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-4">
                    <label className="cursor-pointer bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors">
                      {uploading ? 'Uploading...' : 'Upload Image'}
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'profile')} disabled={uploading} />
                    </label>
                  </div>
                  {profileUploaded && (
                    <p className="text-xs text-green-600 dark:text-green-400">Image uploaded! Click "Save Profile" to confirm.</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
              <input
                type="text"
                required
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#E84C3D] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password (Optional)</label>
              <input
                type="password"
                placeholder="Leave blank to keep current password"
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
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
              {successMsg && activeTab === 'profile' && (
                <span className="text-green-600 dark:text-green-400 font-medium flex items-center">
                  <Check size={20} className="mr-1" /> {successMsg}
                </span>
              )}
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Store Logo</label>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-4">
                      <label className="cursor-pointer bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors">
                        {uploading ? 'Uploading...' : 'Upload Logo'}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'storeLogo')} disabled={uploading} />
                      </label>
                    </div>
                    {logoUploaded && (
                      <p className="text-xs text-green-600 dark:text-green-400">Logo uploaded! Click "Save Store Settings" below.</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Store Name</label>
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Store Full URL</label>
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
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">This URL is automatically generated from your store name and cannot be edited manually.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Store Category</label>
                <select 
                  value={storeData.category || 'General Retail'} 
                  onChange={(e) => setStoreData({ ...storeData, category: e.target.value })} 
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#E84C3D] outline-none"
                >
                  <option value="Clothing">Clothing</option>
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Supplements (អាហារបំប៉ន់)">Supplements (អាហារបំប៉ន់)</option>
                  <option value="General Retail">General Retail</option>
                  <option value="Other">Other</option>
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">This helps us customize your product templates.</p>
              </div>

              <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Settings (KHQR)</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bakong ID</label>
                  <input
                    type="text"
                    value={storeData.paymentSettings?.bakongId || ''}
                    onChange={(e) => setStoreData({ ...storeData, paymentSettings: { ...storeData.paymentSettings, bakongId: e.target.value } })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#E84C3D] outline-none"
                    placeholder="example@bkrt"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Must end with @bkrt or @wing, etc.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Currency</label>
                  <select 
                    value={storeData.paymentSettings?.currency || 'USD'} 
                    onChange={(e) => setStoreData({ ...storeData, paymentSettings: { ...storeData.paymentSettings, currency: e.target.value } })} 
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#E84C3D] outline-none"
                  >
                    <option value="USD">USD</option>
                    <option value="KHR">KHR</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Store Branding</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Brand Color</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={storeData.branding?.primaryColor || '#E84C3D'}
                    onChange={(e) => setStoreData({ ...storeData, branding: { ...storeData.branding, primaryColor: e.target.value } })}
                    className="h-10 w-10 border-0 p-0 rounded cursor-pointer"
                  />
                  <span className="text-gray-600 dark:text-gray-400 font-mono">
                    {storeData.branding?.primaryColor || '#E84C3D'}
                  </span>
                </div>
              </div>
            </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center space-x-4">
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="bg-[#E84C3D] text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Store Settings'}
                </button>
                {successMsg && activeTab === 'store' && (
                  <span className="text-green-600 dark:text-green-400 font-medium flex items-center">
                    <Check size={20} className="mr-1" /> {successMsg}
                  </span>
                )}
              </div>
            </form>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 py-8 text-center">You need to set up a store first.</p>
          )
        )}
      </div>
    </div>
  );
}
