'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FadeIn } from '@/components/ui/FadeIn';

export default function PricingSection({ isKm }: { isKm: boolean }) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

  const plans = [
    {
      _id: 'free',
      name: 'Free',
      nameKm: 'ឥតគិតថ្លៃ',
      price: 0,
      monthlyPrice: 0,
      annualPrice: 0,
      popular: false,
      benefits: [
        isKm ? 'ចូលប្រើមុខងារមូលដ្ឋានទាំងអស់' : 'Access to all basic features',
        isKm ? 'ទំនិញរហូតដល់ ៥០' : 'Up to 50 Products',
        isKm ? 'ការបញ្ជាទិញរហូតដល់ ៥០/ខែ' : 'Up to 50 Orders/month',
        isKm ? 'បានរួមបញ្ចូល' : 'Included'
      ]
    },
    {
      _id: 'pro',
      name: 'Pro',
      nameKm: 'កម្រិត Pro',
      price: 9.99,
      monthlyPrice: 9.99,
      annualPrice: 7.99,
      popular: true,
      benefits: [
        isKm ? 'ចូលប្រើមុខងារមូលដ្ឋានទាំងអស់' : 'Access to all basic features',
        isKm ? 'ទំនិញរហូតដល់ ៥០០' : 'Up to 500 Products',
        isKm ? 'ការបញ្ជាទិញរហូតដល់ ១០០០/ខែ' : 'Up to 1000 Orders/month',
        isKm ? 'របាយការណ៍វិភាគកម្រិតខ្ពស់' : 'Advanced Analytics',
        isKm ? 'អតិថិជនអាចទូទាត់តាម KHQR' : 'Accept Customer KHQR Payments'
      ]
    },
    {
      _id: 'premium',
      name: 'Premium',
      nameKm: 'កម្រិត Premium',
      price: 29.99,
      monthlyPrice: 29.99,
      annualPrice: 23.99,
      popular: false,
      benefits: [
        isKm ? 'ចូលប្រើមុខងារមូលដ្ឋានទាំងអស់' : 'Access to all basic features',
        isKm ? 'ទំនិញមិនកំណត់ (៩៩៩៩៩)' : 'Unlimited Products (99999)',
        isKm ? 'ការបញ្ជាទិញមិនកំណត់ (៩៩៩៩៩)/ខែ' : 'Unlimited Orders (99999)',
        isKm ? 'របាយការណ៍វិភាគកម្រិតខ្ពស់' : 'Advanced Analytics',
        isKm ? 'ការគាំទ្រអាទិភាព ២៤/៧' : '24/7 Priority Support',
        isKm ? 'អតិថិជនអាចទូទាត់តាម KHQR' : 'Accept Customer KHQR Payments'
      ]
    }
  ];

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
          <div className="flex justify-center mb-16 px-4">
            <div className="flex items-center bg-gray-200/50 dark:bg-[#111111] p-1.5 rounded-full shadow-inner border border-gray-200 dark:border-gray-800 relative w-full max-w-sm sm:max-w-none sm:w-auto">
              <button 
                onClick={() => setBillingCycle('monthly')}
                className={`flex-1 sm:flex-none px-2 sm:px-8 py-3 rounded-full text-sm sm:text-base font-bold transition-all duration-300 ${billingCycle === 'monthly' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md transform sm:scale-105' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
              >
                {isKm ? 'ប្រចាំខែ' : 'Monthly'}
              </button>
              <button 
                onClick={() => setBillingCycle('annually')}
                className={`flex-1 sm:flex-none relative px-2 sm:px-8 py-3 rounded-full text-sm sm:text-base font-bold transition-all duration-300 flex items-center justify-center gap-2 ${billingCycle === 'annually' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md transform sm:scale-105' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
              >
                {isKm ? 'ប្រចាំឆ្នាំ' : 'Annually'}
                
                {/* Floating Discount Badge */}
                <span className="absolute -top-8 right-0 sm:-right-4 px-3 py-1 bg-green-500 text-white text-[10px] sm:text-xs font-bold rounded-full shadow-lg whitespace-nowrap animate-bounce z-10">
                  {isKm ? 'ចំណេញ 30%' : 'Save 30%'}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-green-500 rotate-45"></div>
                </span>
              </button>
            </div>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const isPopular = plan.popular;
            const displayPrice = billingCycle === 'annually' ? plan.annualPrice : plan.monthlyPrice;
            const originalPrice = billingCycle === 'annually' && plan.price > 0 ? plan.monthlyPrice * 12 : null;
            const finalDisplayPrice = billingCycle === 'annually' && plan.price > 0 ? displayPrice * 12 : displayPrice;
            
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
                        ${finalDisplayPrice}
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
                    {plan.benefits.map((benefit, i) => (
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
                    <th className="py-4 px-6 font-bold text-center text-[#E84C3D] w-1/5">{isKm ? "កម្រិត Pro" : "Pro"}</th>
                    <th className="py-4 px-6 font-bold text-center text-gray-900 dark:text-white w-1/5">{isKm ? "កម្រិត Premium" : "Premium"}</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 dark:text-gray-400 font-medium">
                  <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111111] transition-colors">
                    <td className="py-4 px-6">{isKm ? "ចំនួនទំនិញអតិបរមា" : "Maximum Products"}</td>
                    <td className="py-4 px-6 text-center font-semibold">20</td>
                    <td className="py-4 px-6 text-center font-semibold text-[#E84C3D]">500</td>
                    <td className="py-4 px-6 text-center font-semibold text-gray-900 dark:text-white">{isKm ? "មិនកំណត់" : "Unlimited"}</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111111] transition-colors">
                    <td className="py-4 px-6">{isKm ? "ចំនួនការបញ្ជាទិញ / ខែ" : "Monthly Orders Limit"}</td>
                    <td className="py-4 px-6 text-center font-semibold">50</td>
                    <td className="py-4 px-6 text-center font-semibold text-[#E84C3D]">1000</td>
                    <td className="py-4 px-6 text-center font-semibold text-gray-900 dark:text-white">{isKm ? "មិនកំណត់" : "Unlimited"}</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111111] transition-colors bg-gray-50/50 dark:bg-[#111111]/50">
                    <td colSpan={4} className="py-3 px-6 font-bold text-sm text-gray-500 uppercase tracking-wider">{isKm ? "មុខងារស្នូល" : "Core Features"}</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111111] transition-colors">
                    <td className="py-4 px-6 flex items-center gap-2">{isKm ? "គេហទំព័រលក់ទំនិញផ្ទាល់ខ្លួន" : "Personal Storefront URL"}</td>
                    <td className="py-4 px-6 text-center text-gray-900 dark:text-gray-100">✓</td>
                    <td className="py-4 px-6 text-center text-[#E84C3D]">✓</td>
                    <td className="py-4 px-6 text-center text-gray-900 dark:text-gray-100">✓</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111111] transition-colors">
                    <td className="py-4 px-6">{isKm ? "ប្រព័ន្ធគ្រប់គ្រងការបញ្ជាទិញ" : "Order Management System"}</td>
                    <td className="py-4 px-6 text-center text-gray-900 dark:text-gray-100">✓</td>
                    <td className="py-4 px-6 text-center text-[#E84C3D]">✓</td>
                    <td className="py-4 px-6 text-center text-gray-900 dark:text-gray-100">✓</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111111] transition-colors">
                    <td className="py-4 px-6">{isKm ? "គ្រប់គ្រងស្តុកទំនិញ (Inventory)" : "Inventory Management"}</td>
                    <td className="py-4 px-6 text-center text-gray-900 dark:text-gray-100">✓</td>
                    <td className="py-4 px-6 text-center text-[#E84C3D]">✓</td>
                    <td className="py-4 px-6 text-center text-gray-900 dark:text-gray-100">✓</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111111] transition-colors bg-gray-50/50 dark:bg-[#111111]/50">
                    <td colSpan={4} className="py-3 px-6 font-bold text-sm text-gray-500 uppercase tracking-wider">{isKm ? "ការទូទាត់ & បច្ចេកវិទ្យា" : "Payments & Tech"}</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111111] transition-colors">
                    <td className="py-4 px-6">{isKm ? "ស្កេនទូទាត់តាមធនាគារ (KHQR)" : "KHQR Payment Integration"}</td>
                    <td className="py-4 px-6 text-center text-gray-300 dark:text-gray-700">-</td>
                    <td className="py-4 px-6 text-center text-[#E84C3D]">✓</td>
                    <td className="py-4 px-6 text-center text-gray-900 dark:text-gray-100">✓</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111111] transition-colors">
                    <td className="py-4 px-6">{isKm ? "ភ្ជាប់ Telegram Bot ស្វ័យប្រវត្តិ" : "Telegram Bot Integration"}</td>
                    <td className="py-4 px-6 text-center text-gray-300 dark:text-gray-700">-</td>
                    <td className="py-4 px-6 text-center text-[#E84C3D]">✓</td>
                    <td className="py-4 px-6 text-center text-gray-900 dark:text-gray-100">✓</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111111] transition-colors bg-gray-50/50 dark:bg-[#111111]/50">
                    <td colSpan={4} className="py-3 px-6 font-bold text-sm text-gray-500 uppercase tracking-wider">{isKm ? "អាជីវកម្ម & របាយការណ៍" : "Business & Analytics"}</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111111] transition-colors">
                    <td className="py-4 px-6">{isKm ? "របាយការណ៍វិភាគ (Analytics)" : "Analytics Dashboard"}</td>
                    <td className="py-4 px-6 text-center">{isKm ? "មូលដ្ឋាន" : "Basic"}</td>
                    <td className="py-4 px-6 text-center text-[#E84C3D]">{isKm ? "កម្រិតខ្ពស់" : "Advanced"}</td>
                    <td className="py-4 px-6 text-center text-gray-900 dark:text-gray-100">{isKm ? "កម្រិតខ្ពស់" : "Advanced"}</td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-[#111111] transition-colors">
                    <td className="py-4 px-6">{isKm ? "សេវាកម្មគាំទ្រអតិថិជន" : "Customer Support"}</td>
                    <td className="py-4 px-6 text-center">{isKm ? "សហគមន៍" : "Community"}</td>
                    <td className="py-4 px-6 text-center text-[#E84C3D]">{isKm ? "អ៊ីមែលធម្មតា" : "Standard Email"}</td>
                    <td className="py-4 px-6 text-center text-gray-900 dark:text-gray-100 font-semibold">{isKm ? "អាទិភាព ២៤/៧" : "24/7 Priority"}</td>
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
