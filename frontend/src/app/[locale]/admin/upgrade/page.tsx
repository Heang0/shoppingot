'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useTranslations } from 'next-intl';
import BakongKHQRModal from '@/components/payment/BakongKHQRModal';

interface Plan {
  _id: string;
  name: string;
  price: number;
}

export default function UpgradePlan() {
  const user = useAuthStore((state) => state.user);
  const t = useTranslations('AdminUpgrade');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Need storeId. Assuming we fetch it or it's stored. 
  // For demo, we assume the user has 1 store and we get it first.
  const [storeId, setStoreId] = useState<string | null>(null);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [qrData, setQrData] = useState<{ qrString: string; md5: string; paymentId: string } | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'PAID' | 'FAILED'>('PENDING');

  useEffect(() => {
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

    try {
      const res = await fetch('http://localhost:5000/api/subscription/generate-qr', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({ planId, storeId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setQrData(data);
      setSelectedPlanId(planId);
      setPaymentStatus('PENDING');
      
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('title')}</h2>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">{t('loading')}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan._id} className="bg-white dark:bg-[#111111] p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col hover:border-red-200 dark:hover:border-red-900/50 transition-colors">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center justify-between">
                {plan.name}
                {currentPlanId === plan._id && (
                  <span className="text-xs bg-[#E84C3D]/10 text-[#E84C3D] px-2 py-1 rounded-full font-bold uppercase tracking-wider">Current Plan</span>
                )}
              </h3>
              <div className="mt-4 flex items-baseline text-4xl font-extrabold text-gray-900 dark:text-white">
                ${plan.price}
              </div>
              <ul className="mt-6 space-y-4 flex-1 text-gray-600 dark:text-gray-400">
                <li className="flex items-center">
                  <span className="text-green-500 dark:text-green-400 mr-3 font-bold">✓</span>
                  {t('features')}
                </li>
              </ul>
              <button
                onClick={() => handleUpgrade(plan._id)}
                disabled={currentPlanId === plan._id}
                className={`mt-8 block w-full font-semibold py-3 px-4 rounded-lg text-center transition-colors shadow-sm ${
                  currentPlanId === plan._id 
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                }`}
              >
                {currentPlanId === plan._id ? 'Active' : t('upgrade_button')}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Payment Method Section (Modern, non-brutalist styling) */}
      {!loading && (
        <div className="mt-12 max-w-2xl mx-auto border-t border-gray-100 dark:border-gray-800 pt-10">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">វិធីសាស្ត្រទូទាត់</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">វិធីសាស្ត្រដែលត្រូវបានទទួលយក</p>
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

              {/* Text Content */}
              <div className="flex flex-col">
                <span className="text-[#E1232E] text-[10px] uppercase font-bold tracking-wider mb-0.5">KHQR</span>
                <span className="text-gray-900 dark:text-white font-bold uppercase text-sm md:text-base">Bakong KHQR</span>
                <span className="text-gray-500 dark:text-gray-400 text-xs md:text-sm mt-0.5">ការទូទាត់តាម Bakong</span>
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
          onClose={() => { setQrData(null); setSelectedPlanId(null); }}
          onSuccessClose={() => { setQrData(null); setSelectedPlanId(null); window.location.reload(); }}
          onSimulatePay={handleSimulatePay}
        />
      )}
    </div>
  );
}
