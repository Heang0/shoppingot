'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useTranslations, useLocale } from 'next-intl';
import BakongKHQRModal from '@/components/payment/BakongKHQRModal';

interface Plan {
  _id: string;
  name: string;
  price: number;
}

export default function UpgradePlan() {
  const user = useAuthStore((state) => state.user);
  const t = useTranslations('AdminUpgrade');
  const locale = useLocale();
  const isKm = locale === 'km';
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Need storeId. Assuming we fetch it or it's stored. 
  // For demo, we assume the user has 1 store and we get it first.
  const [storeId, setStoreId] = useState<string | null>(null);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [currentStorePlan, setCurrentStorePlan] = useState<any>(null);
  const [storeData, setStoreData] = useState<any>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [qrData, setQrData] = useState<{ qrString: string; md5: string; paymentId: string } | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'PAID' | 'FAILED'>('PENDING');

  useEffect(() => {
    // Restore pending QR session
    const savedQR = sessionStorage.getItem('pendingUpgradeQR');
    const savedPlanId = sessionStorage.getItem('pendingUpgradePlanId');
    if (savedQR && savedPlanId) {
      try {
        const data = JSON.parse(savedQR);
        if (Date.now() - data.timestamp < 300000) { // 5 mins validity
          setQrData(data);
          setSelectedPlanId(savedPlanId);
          setPaymentStatus('PENDING');
          pollPaymentStatus(data.paymentId, data.md5);
        } else {
          sessionStorage.removeItem('pendingUpgradeQR');
          sessionStorage.removeItem('pendingUpgradePlanId');
        }
      } catch (e) {}
    }

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch plans
      const plansRes = await fetch('http://localhost:5000/api/superadmin/plans');
      const plansData = await plansRes.json();
      setPlans(plansData);

      // Fetch user's store
      const storesRes = await fetch('http://localhost:5000/api/stores', {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const storesData = await storesRes.json();
      // find store belonging to this user
      const myStore = storesData.find((s: any) => s.ownerId._id === user?._id || s.ownerId === user?._id);
      if (myStore) {
        setStoreId(myStore._id);
        setStoreData(myStore);
        setCurrentStorePlan(myStore.plan);
        if (myStore.plan && myStore.plan.planId) {
          setCurrentPlanId(myStore.plan.planId._id || myStore.plan.planId);
        }
      }
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    if (!storeId) {
      alert(t('setup_store_first'));
      return;
    }

    const selected = plans.find(p => p._id === planId);
    if (selected && selected.price === 0) {
      try {
        const res = await fetch('http://localhost:5000/api/subscription/free-plan', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`
          },
          body: JSON.stringify({ planId }),
        });
        if (res.ok) {
          alert('Successfully activated Free Plan!');
          window.location.reload();
        } else {
          alert('Failed to activate Free Plan');
        }
      } catch (err) {
        console.error(err);
        alert('Network error');
      }
      return;
    }

    try {
        const res = await fetch('http://localhost:5000/api/subscription/generate-qr', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`
          },
          body: JSON.stringify({ planId, storeId, billingCycle }),
        });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setQrData(data);
      setSelectedPlanId(planId);
      setPaymentStatus('PENDING');
      sessionStorage.setItem('pendingUpgradeQR', JSON.stringify({ ...data, timestamp: Date.now() }));
      sessionStorage.setItem('pendingUpgradePlanId', planId);
      
      // Start polling
      pollPaymentStatus(data.paymentId, data.md5);
    } catch (err) {
      console.error(err);
      alert('Error generating QR code');
    }
  };

  const pollPaymentStatus = (paymentId: string, md5: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('http://localhost:5000/api/subscription/verify', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`
          },
          body: JSON.stringify({ paymentId, md5 }),
        });

        const data = await res.json();
        
        if (data.status === 'PAID') {
          setPaymentStatus('PAID');
          sessionStorage.removeItem('pendingUpgradeQR');
          sessionStorage.removeItem('pendingUpgradePlanId');
          if (data.store) {
            setCurrentPlanId(data.store.plan?.planId);
          }
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Polling error', error);
      }
    }, 3000); // poll every 3 seconds

    // Clear after 5 minutes to prevent infinite polling
    setTimeout(() => {
      clearInterval(interval);
      if (paymentStatus === 'PENDING') {
        setPaymentStatus('FAILED'); // Or timeout
        sessionStorage.removeItem('pendingUpgradeQR');
        sessionStorage.removeItem('pendingUpgradePlanId');
      }
    }, 300000); 
  };

  const handleSimulatePay = async () => {
    if (!qrData?.paymentId) return;
    try {
      await fetch(`http://localhost:5000/api/subscription/simulate-pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: qrData.paymentId }),
      });
      // The polling loop will automatically pick up the PAID status on its next tick!
    } catch (err) {
      console.error(err);
    }
  };

  const getDisplayPrice = (plan: any) => {
    if (plan.price === 0) return 0;
    if (billingCycle === 'annually') {
      const discount = plan.name === 'Premium' ? 0.7 : (plan.name === 'Pro' ? 0.8 : 1);
      return Number((plan.price * 12 * discount).toFixed(2));
    }
    return plan.price;
  };

  const getOriginalPrice = (plan: any) => {
    if (plan.price === 0 || billingCycle === 'monthly') return null;
    return Number((plan.price * 12).toFixed(2));
  };

  const isExpired = () => {
    if (!currentStorePlan || !currentStorePlan.expiresAt) return false;
    return new Date(currentStorePlan.expiresAt) < new Date();
  };

  const getPresetBenefits = (plan: any) => {
    const benefits = [isKm ? 'ចូលប្រើមុខងារមូលដ្ឋានទាំងអស់' : 'Access to all basic features'];
    if (plan.maxProducts) {
      benefits.push(isKm ? `ទំនិញរហូតដល់ ${plan.maxProducts}` : `Up to ${plan.maxProducts} Products`);
    }
    if (plan.maxOrders) {
      benefits.push(isKm ? `ការបញ្ជាទិញរហូតដល់ ${plan.maxOrders}/ខែ` : `Up to ${plan.maxOrders} Orders/month`);
    }
    if (plan.hasAnalytics) {
      benefits.push(isKm ? 'របាយការណ៍វិភាគកម្រិតខ្ពស់' : 'Advanced Analytics');
    }
    if (plan.hasPrioritySupport) {
      benefits.push(isKm ? 'ការគាំទ្រអាទិភាព ២៤/៧' : '24/7 Priority Support');
    }
    if (plan.price > 0) {
      benefits.push(isKm ? 'អតិថិជនអាចទូទាត់តាម KHQR' : 'Accept Customer KHQR Payments');
    }
    return benefits;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('title')}</h2>
        
        {/* Toggle Switch */}
        <div className="flex items-center bg-gray-100 dark:bg-[#111111] p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <button 
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            {isKm ? 'ប្រចាំខែ' : 'Monthly'}
          </button>
          <button 
            onClick={() => setBillingCycle('annually')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${billingCycle === 'annually' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            {isKm ? 'ប្រចាំឆ្នាំ' : 'Annually'}
            <span className="bg-[#E1232E]/10 text-[#E1232E] text-[10px] uppercase px-1.5 py-0.5 rounded font-black tracking-wider">Save 30%</span>
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">{t('loading')}</p>
      ) : (
        <>
          {/* Current Subscription Overview */}
          {storeData && currentStorePlan && (
            <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  {isKm ? 'គម្រោងបច្ចុប្បន្នរបស់អ្នក' : 'Your Current Plan'}
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currentStorePlan?.planId?.name || 'Free'}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    isExpired() 
                      ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                      : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {isExpired() ? (isKm ? 'ហួសកំណត់' : 'Expired') : (isKm ? 'សកម្ម' : 'Active')}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {currentStorePlan?.expiresAt 
                    ? `${isKm ? 'ផុតកំណត់: ' : 'Expires on: '} ${new Date(currentStorePlan.expiresAt).toLocaleDateString(isKm ? 'km-KH' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
                    : (isKm ? 'គម្រោងឥតគិតថ្លៃ (មិនមានថ្ងៃផុតកំណត់)' : 'Free Plan (Never expires)')}
                </p>
              </div>
              
              <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                {storeData.branding?.logoUrl ? (
                  <div className="w-[120px] h-auto max-h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-center shrink-0">
                    <img src={storeData.branding.logoUrl} alt="Store Logo" className="w-full h-full object-contain p-1" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-[#E84C3D] rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                    {storeData.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{storeData.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{storeData.slug}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan._id} 
              className={`bg-white dark:bg-[#111111] p-8 rounded-xl shadow-sm border flex flex-col transition-all relative ${
                currentPlanId === plan._id 
                  ? (isExpired() ? 'border-orange-500 ring-1 ring-orange-500' : 'border-[#E84C3D] ring-1 ring-[#E84C3D] shadow-md scale-[1.02]') 
                  : 'border-gray-100 dark:border-gray-800 hover:border-red-200 dark:hover:border-red-900/50 hover:scale-[1.01]'
              }`}
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center justify-between">
                {isKm && plan.nameKm ? plan.nameKm : plan.name}
                {currentPlanId === plan._id && (
                  <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider ${isExpired() ? 'bg-orange-100 text-orange-600' : 'bg-[#E84C3D]/10 text-[#E84C3D]'}`}>
                    {isKm ? (isExpired() ? 'ហួសកំណត់' : 'គម្រោងបច្ចុប្បន្ន') : (isExpired() ? 'Expired' : 'Current Plan')}
                  </span>
                )}
              </h3>
              <div className="mt-4 flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                    ${getDisplayPrice(plan)}
                  </span>
                  <span className="text-sm font-medium text-gray-500">
                    /{billingCycle === 'annually' ? (isKm ? 'ឆ្នាំ' : 'yr') : (isKm ? 'ខែ' : 'mo')}
                  </span>
                </div>
                {getOriginalPrice(plan) && (
                  <div className="text-sm font-medium text-gray-400 line-through mt-1">
                    ${getOriginalPrice(plan)}/{isKm ? 'ឆ្នាំ' : 'yr'}
                  </div>
                )}
              </div>
              <ul className="mt-6 space-y-4 flex-1 text-gray-600 dark:text-gray-400">
                {getPresetBenefits(plan).map((benefit, idx) => (
                  <li key={idx} className="flex items-center">
                    <span className="text-green-500 dark:text-green-400 mr-3 font-bold">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
              {(() => {
                const isFreePlanButHasPaid = plan.price === 0 && currentStorePlan?.planId?.price > 0 && !isExpired();
                const isDisabled = (currentPlanId === plan._id && !isExpired()) || isFreePlanButHasPaid;

                return (
                  <button
                    onClick={() => handleUpgrade(plan._id)}
                    disabled={isDisabled}
                    className={`mt-8 block w-full font-semibold py-3 px-4 rounded-lg text-center transition-colors shadow-sm ${
                      isDisabled
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed' 
                        : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                    }`}
                  >
                    {currentPlanId === plan._id 
                      ? (isExpired() ? (isKm ? 'បន្តគម្រោង' : 'Renew Plan') : (isKm ? 'បានដំណើរការ' : 'Active')) 
                      : (isFreePlanButHasPaid 
                          ? (isKm ? 'បានរួមបញ្ចូល' : 'Included') 
                          : (plan.price === 0 ? (isKm ? 'ដំណើរការគម្រោងមិនគិតថ្លៃ' : 'Activate Free Plan') : t('upgrade_button')))}
                  </button>
                );
              })()}
              
              {/* Expiration Notice */}
              {currentPlanId === plan._id && currentStorePlan?.expiresAt && (
                <div className={`mt-3 text-xs text-center font-medium ${isExpired() ? 'text-red-500' : 'text-gray-500'}`}>
                  {isKm ? 'ផុតកំណត់: ' : 'Expires: '} 
                  {new Date(currentStorePlan.expiresAt).toLocaleDateString(isKm ? 'km-KH' : 'en-US')}
                </div>
              )}
            </div>
          ))}
          </div>
        </>
      )}

      {/* Payment Method Section (Modern, non-brutalist styling) */}
      {!loading && (
        <div className="mt-12 max-w-2xl mx-auto border-t border-gray-100 dark:border-gray-800 pt-10">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{isKm ? 'វិធីសាស្ត្រទូទាត់' : 'Payment Method'}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{isKm ? 'វិធីសាស្ត្រដែលត្រូវបានទទួលយក' : 'Accepted payment methods'}</p>
          </div>

          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 md:p-5 shadow-sm transition-all cursor-pointer relative overflow-hidden flex items-center justify-between group hover:border-[#E1232E]/30 hover:shadow-md">
            
            <div className="flex items-center gap-5">
              {/* Logo Box */}
              <div className="w-12 h-12 rounded-xl bg-[#E1232E] flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                <img 
                  src="/logo/KHQR Logo.png" 
                  alt="KHQR" 
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    // Fallback if image not found
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<span class="text-white font-bold text-xs">KHQR</span>';
                  }}
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-[#E1232E] uppercase tracking-wider bg-[#E1232E]/10 px-2 py-0.5 rounded">KHQR</span>
                  <span className="text-[10px] text-gray-400 font-medium hidden sm:inline-block">• {isKm ? 'អនុញ្ញាតភ្លាមៗ' : 'Instant Approval'}</span>
                </div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white uppercase">Bakong KHQR</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{isKm ? 'ការទូទាត់តាម Bakong' : 'Payment via Bakong KHQR'}</p>
              </div>
            </div>

            {/* Selected Indicator */}
            <div className="w-6 h-6 rounded-full bg-[#E1232E] flex items-center justify-center shrink-0 shadow-sm mr-2">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            {/* Subtle border effect on selected */}
            <div className="absolute inset-0 border-2 border-[#E1232E] rounded-2xl pointer-events-none opacity-100"></div>
          </div>
        </div>
      )}

      {/* QR Modal Overlay via BakongKHQRModal component */}
      {qrData && selectedPlanId && (
        <BakongKHQRModal
          qrString={qrData.qrString}
          amount={plans.find(p => p._id === selectedPlanId)?.price || 0}
          currency="USD"
          merchantName="ShoppingOT Superadmin"
          isPaid={paymentStatus === 'PAID'}
          onClose={() => { setQrData(null); setSelectedPlanId(null); sessionStorage.removeItem('pendingUpgradeQR'); sessionStorage.removeItem('pendingUpgradePlanId'); }}
          onSuccessClose={() => { setQrData(null); setSelectedPlanId(null); sessionStorage.removeItem('pendingUpgradeQR'); sessionStorage.removeItem('pendingUpgradePlanId'); window.location.reload(); }}
          onSimulatePay={handleSimulatePay}
        />
      )}
    </div>
  );
}
