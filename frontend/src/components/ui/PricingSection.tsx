'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FadeIn } from '@/components/ui/FadeIn';

interface Plan {
  _id: string;
  name: string;
  nameKm: string;
  price: number;
  durationDays: number;
  maxProducts: number;
  maxOrders: number;
  hasAnalytics: boolean;
  hasPrioritySupport: boolean;
}

export default function PricingSection({ isKm }: { isKm: boolean }) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/plans`);
        if (res.ok) {
          const data = await res.json();
          // Sort by price ascending to keep Free, Pro, Premium order
          setPlans(data.sort((a: Plan, b: Plan) => a.price - b.price));
        }
      } catch (err) {
        console.error('Failed to fetch plans', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const getDisplayPrice = (plan: Plan) => {
    if (plan.price === 0) return 0;
    if (billingCycle === 'annually') {
      const discount = plan.name === 'Premium' ? 0.7 : (plan.name === 'Pro' ? 0.8 : 1);
      return Number((plan.price * 12 * discount).toFixed(2));
    }
    return plan.price;
  };

  const getOriginalPrice = (plan: Plan) => {
    if (plan.price === 0 || billingCycle === 'monthly') return null;
    return Number((plan.price * 12).toFixed(2));
  };

  const getPresetBenefits = (plan: Plan) => {
    const benefits = [isKm ? 'ចូលប្រើមុខងារមូលដ្ឋានទាំងអស់' : 'Access to all basic features'];
    if (plan.maxProducts) {
      benefits.push(isKm ? `ទំនិញរហូតដល់ ${plan.maxProducts}` : `Up to ${plan.maxProducts} Products`);
    } else {
      benefits.push(isKm ? 'ទំនិញមិនកំណត់' : 'Unlimited products');
    }
    
    if (plan.maxOrders) {
      benefits.push(isKm ? `ការបញ្ជាទិញរហូតដល់ ${plan.maxOrders}/ខែ` : `Up to ${plan.maxOrders} Orders/month`);
    } else {
      benefits.push(isKm ? 'ការបញ្ជាទិញមិនកំណត់' : 'Unlimited orders');
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
    <section id="pricing" className="py-24 bg-gray-50 dark:bg-[#0a0a0a] relative z-10 border-t border-gray-100 dark:border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn delay={0.1}>
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
              {isKm ? "ជ្រើសរើសគម្រោងដ៏ល្អរបស់អ្នក" : "Choose your perfect plan"}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {isKm ? "អនុញ្ញាតឱ្យតម្លើងកម្រិត និងបន្ថែមម៉ូឌុលទៅតាមទំហំអាជីវកម្មរបស់អ្នក" : "Allows upgrading and adding modules according to your business size"}
            </p>
          </div>

          {/* Toggle Switch */}
          <div className="flex justify-center mb-16">
            <div className="flex items-center bg-gray-200/50 dark:bg-[#111111] p-1.5 rounded-full shadow-inner border border-gray-200 dark:border-gray-800">
              <button 
                onClick={() => setBillingCycle('monthly')}
                className={`px-8 py-3 rounded-full text-sm sm:text-base font-bold transition-all duration-300 ${billingCycle === 'monthly' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md transform scale-105' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
              >
                {isKm ? 'ប្រចាំខែ' : 'Monthly'}
              </button>
              <button 
                onClick={() => setBillingCycle('annually')}
                className={`px-8 py-3 rounded-full text-sm sm:text-base font-bold transition-all duration-300 flex items-center gap-2 ${billingCycle === 'annually' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md transform scale-105' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
              >
                {isKm ? 'ប្រចាំឆ្នាំ' : 'Annually'}
                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold rounded-full">
                  {isKm ? 'បញ្ចុះតម្លៃរហូតដល់ 30%' : 'Save up to 30%'}
                </span>
              </button>
            </div>
          </div>
        </FadeIn>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#E84C3D]"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => {
              const isPopular = plan.price > 0 && plan.price < 20; // Assuming Pro is the middle plan
              const displayPrice = getDisplayPrice(plan);
              const originalPrice = getOriginalPrice(plan);
              
              return (
                <FadeIn key={plan._id} delay={0.2 + (index * 0.1)}>
                  <div className={`p-8 rounded-[2rem] shadow-xl relative flex flex-col h-full transition-all duration-300 hover:-translate-y-2
                    ${isPopular 
                      ? 'bg-gray-900 dark:bg-black border-2 border-[#E84C3D] text-white md:-translate-y-4 md:hover:-translate-y-6' 
                      : 'bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 hover:border-[#E84C3D]'
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#E84C3D] text-white px-6 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide whitespace-nowrap shadow-md">
                        {isKm ? "ពេញនិយមបំផុត" : "Most Popular"}
                      </div>
                    )}

                    <h3 className={`text-2xl font-bold mb-2 ${isPopular ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                      {isKm && plan.nameKm ? plan.nameKm : plan.name}
                    </h3>

                    <div className="flex flex-col mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className={`text-5xl font-black ${isPopular ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                          ${displayPrice}
                        </span>
                        <span className={`font-medium ${isPopular ? 'text-gray-400' : 'text-gray-500'}`}>
                          / {billingCycle === 'monthly' ? (isKm ? 'ខែ' : 'mo') : (isKm ? 'ឆ្នាំ' : 'yr')}
                        </span>
                      </div>
                      
                      {/* Show original price crossed out if it's annual to show savings */}
                      <div className="h-6 mt-1">
                        {originalPrice && (
                          <span className="text-gray-500 line-through font-medium text-lg decoration-red-500/50 decoration-2">
                            ${originalPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    <ul className={`space-y-4 mb-8 flex-1 font-medium ${isPopular ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'}`}>
                      {getPresetBenefits(plan).map((benefit, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <span className="text-[#E84C3D] text-lg">✓</span> 
                          {benefit}
                        </li>
                      ))}
                    </ul>

                    <Link href="/register" className={`block w-full py-4 px-6 rounded-xl font-bold text-center transition-all duration-300
                      ${isPopular 
                        ? 'bg-[#E84C3D] text-white hover:bg-red-600 shadow-lg shadow-red-500/20' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-[#E84C3D] hover:text-white'
                      }`}
                    >
                      {isKm ? "ចាប់ផ្តើម" : "Get Started"}
                    </Link>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        )}

        {/* Comparison Table */}
        <FadeIn delay={0.5}>
          <div className="mt-24 max-w-5xl mx-auto">
            <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
              {isKm ? "តារាងប្រៀបធៀប" : "Comparison Table"}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse bg-white dark:bg-[#111111] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black/50">
                    <th className="py-4 px-6 font-bold text-gray-900 dark:text-white w-2/5">{isKm ? "មុខងារ" : "Features"}</th>
                    <th className="py-4 px-6 font-bold text-center text-gray-900 dark:text-white w-1/5">{isKm ? "ឥតគិតថ្លៃ" : "Free"}</th>
                    <th className="py-4 px-6 font-bold text-center text-[#E84C3D] w-1/5">{isKm ? "Pro" : "Pro"}</th>
                    <th className="py-4 px-6 font-bold text-center text-gray-900 dark:text-white w-1/5">{isKm ? "Premium" : "Premium"}</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 dark:text-gray-400 font-medium">
                  <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111111] transition-colors">
                    <td className="py-4 px-6">{isKm ? "ចំនួនទំនិញ" : "Product Limit"}</td>
                    <td className="py-4 px-6 text-center">100</td>
                    <td className="py-4 px-6 text-center">{isKm ? "មិនកំណត់" : "Unlimited"}</td>
                    <td className="py-4 px-6 text-center">{isKm ? "មិនកំណត់" : "Unlimited"}</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111111] transition-colors">
                    <td className="py-4 px-6">{isKm ? "ចំនួនការបញ្ជាទិញ / ខែ" : "Orders Limit / month"}</td>
                    <td className="py-4 px-6 text-center">50</td>
                    <td className="py-4 px-6 text-center">{isKm ? "មិនកំណត់" : "Unlimited"}</td>
                    <td className="py-4 px-6 text-center">{isKm ? "មិនកំណត់" : "Unlimited"}</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111111] transition-colors">
                    <td className="py-4 px-6">{isKm ? "ទទួលប្រាក់តាម KHQR" : "Accept KHQR Payments"}</td>
                    <td className="py-4 px-6 text-center text-gray-300 dark:text-gray-700">-</td>
                    <td className="py-4 px-6 text-center text-[#E84C3D]">✓</td>
                    <td className="py-4 px-6 text-center text-[#E84C3D]">✓</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111111] transition-colors">
                    <td className="py-4 px-6">{isKm ? "របាយការណ៍វិភាគ" : "Analytics"}</td>
                    <td className="py-4 px-6 text-center text-gray-300 dark:text-gray-700">-</td>
                    <td className="py-4 px-6 text-center text-[#E84C3D]">✓</td>
                    <td className="py-4 px-6 text-center text-[#E84C3D]">✓</td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-[#111111] transition-colors">
                    <td className="py-4 px-6">{isKm ? "ចំនួនបុគ្គលិក" : "Staff Accounts"}</td>
                    <td className="py-4 px-6 text-center">1</td>
                    <td className="py-4 px-6 text-center">3</td>
                    <td className="py-4 px-6 text-center">{isKm ? "មិនកំណត់" : "Unlimited"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
