'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { QRCodeSVG } from 'qrcode.react';

interface Plan {
  _id: string;
  name: string;
  price: number;
}

export default function UpgradePlan() {
  const user = useAuthStore((state) => state.user);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Need storeId. Assuming we fetch it or it's stored. 
  // For demo, we assume the user has 1 store and we get it first.
  const [storeId, setStoreId] = useState<string | null>(null);

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
      if (myStore) setStoreId(myStore._id);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    if (!storeId) {
      alert("You need to setup a store first.");
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Upgrade Your Plan</h2>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading plans...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan._id} className="bg-white dark:bg-[#111111] p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col hover:border-red-200 dark:hover:border-red-900/50 transition-colors">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
              <div className="mt-4 flex items-baseline text-4xl font-extrabold text-gray-900 dark:text-white">
                ${plan.price}
              </div>
              <ul className="mt-6 space-y-4 flex-1 text-gray-600 dark:text-gray-400">
                <li className="flex items-center">
                  <span className="text-green-500 dark:text-green-400 mr-3 font-bold">✓</span>
                  Access to all basic features
                </li>
              </ul>
              <button
                onClick={() => handleUpgrade(plan._id)}
                className="mt-8 block w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-semibold py-3 px-4 rounded-lg text-center transition-colors shadow-sm"
              >
                Upgrade with KHQR
              </button>
            </div>
          ))}
        </div>
      )}

      {/* QR Modal Overlay */}
      {qrData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center border border-gray-100 dark:border-gray-800">
            {paymentStatus === 'PAID' ? (
              <div>
                <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-green-500 dark:text-green-400 text-4xl">✓</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful!</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8">Your store plan has been upgraded.</p>
                <button onClick={() => setQrData(null)} className="w-full bg-[#E84C3D] text-white py-3 rounded-xl font-semibold shadow-md hover:bg-red-600 transition-colors">
                  Close
                </button>
              </div>
            ) : paymentStatus === 'FAILED' ? (
               <div>
                <h3 className="text-xl font-bold text-red-600 dark:text-red-500 mb-2">Payment Timeout</h3>
                <button onClick={() => setQrData(null)} className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white py-3 rounded-xl font-semibold mt-4 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  Close
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Scan to Pay with Bakong</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Open your banking app and scan the KHQR code below.</p>
                <div className="bg-white p-4 rounded-2xl inline-block shadow-md border border-gray-100 mb-8">
                  <QRCodeSVG value={qrData.qrString} size={200} />
                </div>
                <div className="flex items-center justify-center text-sm font-medium text-[#E84C3D] mb-8">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#E84C3D]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Waiting for payment...
                </div>
                <button onClick={() => setQrData(null)} className="w-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white py-2 font-medium transition-colors">
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
