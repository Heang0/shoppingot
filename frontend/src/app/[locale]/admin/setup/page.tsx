'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useBaseDomain } from '@/lib/hooks/useBaseDomain';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Store, CreditCard, CheckCircle2, ChevronRight, ChevronLeft, Rocket, Info } from 'lucide-react';

export default function StoreSetup() {
  const user = useAuthStore((state) => state.user);
  const baseDomain = useBaseDomain();
  const t = useTranslations('AdminSetup');
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [bakongId, setBakongId] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [category, setCategory] = useState('General Retail');
  const [message, setMessage] = useState('');
  const [existingStoreId, setExistingStoreId] = useState<string | null>(null);
  const [storeData, setStoreData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stores`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      .then(res => res.json())
      .then(data => {
        const myStore = data.find((s: any) => s.ownerId._id === user._id || s.ownerId === user._id);
        if (myStore) {
          // If they already have a store configured, redirect to dashboard
          router.push('/admin');
        }
      })
      .catch(console.error);
    }
  }, [user, router]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    // Auto-generate slug strictly from name
    setSlug(newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!name || !slug) {
        setMessage(t('fill_required'));
        return;
      }
      setMessage('');
      setStep(2);
      return;
    }

    setMessage('');
    setIsSubmitting(true);

    try {
      // Create new store
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stores`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({ name, slug, category }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      const storeId = data._id;

      // Update Bakong Settings if entered
      if (bakongId && storeId) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stores/${storeId}/payment-settings`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`
          },
          body: JSON.stringify({ bakongId, currency }),
        });
      }

      setStep(3); // Success step
      setTimeout(() => {
        router.push('/admin');
      }, 2500);

    } catch (err: any) {
      setMessage(err.message || t('error'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Stepper Header */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-full -z-10"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#E84C3D] rounded-full -z-10 transition-all duration-500 ease-in-out" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
          
          <div className={`flex flex-col items-center gap-2 bg-gray-50 dark:bg-[#0a0a0a] px-2 transition-colors ${step >= 1 ? 'text-[#E84C3D]' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors ${step >= 1 ? 'border-[#E84C3D] bg-[#E84C3D] text-white shadow-md' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900'}`}>
              <Store size={18} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider">{t('store_info_tab')}</span>
          </div>

          <div className={`flex flex-col items-center gap-2 bg-gray-50 dark:bg-[#0a0a0a] px-2 transition-colors ${step >= 2 ? 'text-[#E84C3D]' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors ${step >= 2 ? 'border-[#E84C3D] bg-[#E84C3D] text-white shadow-md' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900'}`}>
              <CreditCard size={18} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider">{t('payments_tab')}</span>
          </div>

          <div className={`flex flex-col items-center gap-2 bg-gray-50 dark:bg-[#0a0a0a] px-2 transition-colors ${step >= 3 ? 'text-[#E84C3D]' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors ${step >= 3 ? 'border-[#E84C3D] bg-[#E84C3D] text-white shadow-md' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900'}`}>
              <CheckCircle2 size={18} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider">{t('launch_tab')}</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-2xl bg-white dark:bg-[#111111] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        
        {/* Header Area */}
        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {step === 1 ? t('step1_title') : step === 2 ? t('step2_title') : t('step3_title')}
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            {step === 1 ? t('step1_desc') : step === 2 ? t('step2_desc') : t('step3_desc')}
          </p>
        </div>

        {message && (
          <div className="mx-8 mt-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50 flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <p className="text-sm font-medium">{message}</p>
          </div>
        )}

        <form onSubmit={handleSaveStore} className="p-8">
          
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('store_name')}</label>
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={handleNameChange} 
                  className="w-full px-5 py-3 text-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#E84C3D] focus:border-[#E84C3D] dark:text-white transition-all outline-none" 
                  placeholder="e.g. My Awesome Shop"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('your_store_link')}</label>
                <div className="flex shadow-sm rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#E84C3D]">
                  <input 
                    type="text" 
                    readOnly
                    value={slug} 
                    className="flex-1 min-w-0 w-full px-5 py-3 bg-gray-100 dark:bg-gray-800 border-y border-l border-gray-300 dark:border-gray-700 focus:outline-none dark:text-gray-400 cursor-not-allowed" 
                  />
                  <span className="inline-flex items-center px-4 border-y border-r border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-semibold">
                    {baseDomain}
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-500">{t('link_desc')}</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('store_category')}</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)} 
                  className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#E84C3D] outline-none dark:text-white"
                >
                  <option value="Clothing">{t('cat_clothing')}</option>
                  <option value="Food & Beverage">{t('cat_food')}</option>
                  <option value="Electronics">{t('cat_electronics')}</option>
                  <option value="Supplements">{t('cat_supplements')}</option>
                  <option value="General Retail">{t('cat_general')}</option>
                  <option value="Other">{t('cat_other')}</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-5 rounded-xl text-sm border border-yellow-200 dark:border-yellow-800/50 flex items-start gap-4">
                <div className="mt-0.5 text-yellow-600 dark:text-yellow-400">
                  <Info size={24} />
                </div>
                <div>
                  <p className="font-bold text-base">{t('start_free_plan')}</p>
                  <p className="mt-1 leading-relaxed text-yellow-700 dark:text-yellow-300">{t('free_plan_desc')}</p>
                </div>
              </div>

              <div className="opacity-60 pointer-events-none">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('bakong_id')}</label>
                <input 
                  type="text" 
                  disabled
                  value={bakongId} 
                  className="w-full px-5 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl dark:text-gray-400" 
                  placeholder="example@bkrt (Pro feature)" 
                />
              </div>
              
              <div className="opacity-60 pointer-events-none">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('currency')}</label>
                <select disabled value={currency} className="w-full px-5 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl dark:text-gray-400">
                  <option value="USD">USD</option>
                  <option value="KHR">KHR</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 3 - SUCCESS */}
          {step === 3 && (
            <div className="py-12 flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                <Rocket className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{t('store_created')}</h3>
              <p className="text-gray-500 dark:text-gray-400">{t('preparing_dash')}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          {step < 3 && (
            <div className="pt-8 mt-8 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              {step === 2 ? (
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="px-6 py-3 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors flex items-center gap-2"
                >
                  <ChevronLeft size={18} /> {t('back')}
                </button>
              ) : (
                <div></div> // Empty div for flex spacing
              )}
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-[#E84C3D] text-white px-8 py-3 rounded-xl font-bold shadow-md shadow-red-500/20 hover:bg-red-600 hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-70"
              >
                {step === 1 ? (
                  <>{t('continue')} <ChevronRight size={18} /></>
                ) : (
                  isSubmitting ? t('creating_store') : t('create_and_launch')
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
