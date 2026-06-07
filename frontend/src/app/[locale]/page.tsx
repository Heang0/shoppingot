import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { FadeIn } from '@/components/ui/FadeIn';
import { Navbar } from '@/components/ui/Navbar';
import { Building2, ShieldCheck, CreditCard, ArrowRight } from 'lucide-react';

export default function Index() {
  const t = useTranslations('Index');
  
  const locale = useLocale();
  const isKm = locale === 'km';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden pb-16 pt-[120px] lg:pt-[140px] min-h-[calc(100vh-100px)]">
        {/* Dynamic Background */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-white dark:bg-[#050505] pointer-events-none">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover opacity-70 dark:opacity-50 pointer-events-none"
          >
            <source src="/video/ecommerce.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white dark:from-[#050505]/80 dark:via-[#050505]/60 dark:to-[#050505]"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/10 dark:from-red-900/20 dark:to-orange-900/20 mix-blend-multiply dark:mix-blend-screen pointer-events-none"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full w-full relative z-10 flex flex-col items-center justify-center -mt-10 lg:-mt-20">
          <FadeIn delay={0.1}>
            <div className="text-center mb-8 max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100/50 dark:bg-red-900/30 text-[#E84C3D] text-sm font-bold mb-6 border border-red-200 dark:border-red-800/50 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                {isKm ? "ប្រព័ន្ធគ្រប់គ្រងអាជីវកម្មជំនាន់ថ្មី" : "Next-Generation Platform"}
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.1] mb-6">
                {isKm 
                  ? "ដំណើរការអាជីវកម្មអនឡាញរបស់អ្នក ប្រកបដោយភាពឆ្លាតវៃ" 
                  : "Run your entire online business smartly"}
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto font-medium">
                {isKm 
                  ? "គ្រប់គ្រងការលក់ ស្តុកទំនិញ និងអតិថិជនពីគ្រប់ទីកន្លែង ដោយមិនចាំបាច់មានជំនាញបច្ចេកទេស។" 
                  : "Manage sales, inventory, and customers from anywhere with zero technical skills required."}
              </p>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link href="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base sm:text-lg font-bold bg-[#E84C3D] text-white rounded-full hover:bg-red-600 hover:-translate-y-1 transition-all shadow-[0_8px_30px_rgb(232,76,61,0.3)]">
                {isKm ? "ចាប់ផ្តើមប្រើប្រាស់ឥតគិតថ្លៃ" : "Start Using for Free"}
              </Link>
              <a href="#demo" className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base sm:text-lg font-bold bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-full hover:border-[#E84C3D] dark:hover:border-[#E84C3D] hover:-translate-y-1 transition-all shadow-sm">
                {isKm ? "ស្វែងយល់បន្ថែម" : "Learn More"}
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Product Showcase - Unique Overlapping Layout */}
      <section className="relative z-10 -mt-16 lg:-mt-24 pb-32 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
        <FadeIn delay={0.3}>
          <div className="relative w-full aspect-[16/9] lg:aspect-[21/9] rounded-[2rem] bg-gray-900 dark:bg-black shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-800 flex items-center justify-center overflow-hidden group">
            
            <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=2000&q=80" alt="Dashboard Mockup" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent dark:from-black dark:via-black/20"></div>

            {/* Ambient glow inside the mockup */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[#E84C3D]/20 blur-[120px] rounded-full"></div>

            <div className="relative z-10 text-center">
              <div className="w-20 h-20 bg-gray-800/80 backdrop-blur-md rounded-2xl mx-auto mb-6 flex items-center justify-center border border-gray-700/50 group-hover:scale-110 transition-transform duration-500">
                <span className="text-gray-300 font-bold">ShoppingOT</span>
              </div>
            </div>

            {/* Overlapping Mobile Mockup */}
            <div className="absolute -bottom-10 -right-10 lg:bottom-10 lg:right-20 w-[200px] lg:w-[280px] aspect-[9/19] bg-gray-950 rounded-[2.5rem] border-[8px] border-gray-800 shadow-2xl flex flex-col items-center justify-center group-hover:-translate-y-4 transition-transform duration-500">
               <div className="absolute top-0 w-1/2 h-5 bg-gray-800 rounded-b-xl z-10"></div>
               <span className="text-gray-500 text-sm">Mobile App</span>
            </div>

            {/* Floating Stats Card */}
            <div className="absolute top-10 lg:top-20 -left-10 lg:left-20 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-2xl hidden md:flex flex-col gap-2 group-hover:translate-y-4 transition-transform duration-500">
              <span className="text-gray-300 text-sm">{isKm ? "ចំណូលថ្ងៃនេះ" : "Today's Revenue"}</span>
              <span className="text-3xl font-bold text-white">$1,240.00</span>
              <span className="text-[#00C853] text-sm font-medium">+15% {isKm ? "កើនឡើង" : "Growth"}</span>
            </div>
            
          </div>
        </FadeIn>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-white dark:bg-[#111111] relative z-10 border-y border-gray-100 dark:border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn delay={0.1}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">{t('about_title')}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              {t('about_desc')}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-gray-50 dark:bg-[#0a0a0a] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn delay={0.1}>
            <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center text-gray-900 dark:text-white">{t('services_title')}</h2>
          </FadeIn>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FadeIn delay={0.2}>
              <div className="bg-white dark:bg-[#111111] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-red-200 dark:hover:border-red-900/50 transition-colors group">
                <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-6 text-[#E84C3D] group-hover:scale-110 transition-transform">
                  <Building2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">{t('service_1_title')}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t('service_1_desc')}</p>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="bg-white dark:bg-[#111111] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-red-200 dark:hover:border-red-900/50 transition-colors group">
                <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-6 text-[#E84C3D] group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">{t('service_2_title')}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t('service_2_desc')}</p>
              </div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="bg-white dark:bg-[#111111] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-red-200 dark:hover:border-red-900/50 transition-colors group">
                <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-6 text-[#E84C3D] group-hover:scale-110 transition-transform">
                  <CreditCard className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">{t('service_3_title')}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t('service_3_desc')}</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gray-50 dark:bg-[#0a0a0a] relative z-10 border-t border-gray-100 dark:border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn delay={0.1}>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
                {isKm ? "ជ្រើសរើសគម្រោងដ៏ល្អរបស់អ្នក" : "Choose your perfect plan"}
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {isKm ? "អនុញ្ញាតឱ្យតម្លើងកម្រិត និងបន្ថែមម៉ូឌុលទៅតាមទំហំអាជីវកម្មរបស់អ្នក" : "Allows upgrading and adding modules according to your business size"}
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <FadeIn delay={0.2}>
              <div className="bg-white dark:bg-[#111111] p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 hover:border-[#E84C3D] hover:shadow-xl transition-all relative group flex flex-col h-full">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{isKm ? "ឥតគិតថ្លៃ" : "Free"}</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-5xl font-black text-gray-900 dark:text-white">$0</span>
                  <span className="text-gray-500 font-medium">/ {isKm ? "ខែ" : "mo"}</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1 text-gray-600 dark:text-gray-400 font-medium">
                  <li className="flex items-center gap-3"><span className="text-[#E84C3D]">✓</span> {isKm ? "ចូលប្រើមុខងារមូលដ្ឋានទាំងអស់" : "Access to basic features"}</li>
                  <li className="flex items-center gap-3"><span className="text-[#E84C3D]">✓</span> {isKm ? "ទំនិញរហូតដល់ ១០០" : "Up to 100 products"}</li>
                  <li className="flex items-center gap-3"><span className="text-[#E84C3D]">✓</span> {isKm ? "ការបញ្ជាទិញរហូតដល់ ៥០/ខែ" : "Up to 50 orders/mo"}</li>
                </ul>
                <Link href="/register" className="block w-full py-4 px-6 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-center group-hover:bg-[#E84C3D] group-hover:text-white transition-colors">
                  {isKm ? "ចាប់ផ្តើម" : "Get Started"}
                </Link>
              </div>
            </FadeIn>

            {/* Pro Plan */}
            <FadeIn delay={0.3}>
              <div className="bg-gray-900 dark:bg-black p-8 rounded-[2rem] shadow-2xl border-2 border-[#E84C3D] relative flex flex-col h-full transform md:-translate-y-4">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#E84C3D] text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide">
                  {isKm ? "ពេញនិយមបំផុត" : "Most Popular"}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{isKm ? "កម្រិត Pro" : "Pro"}</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-5xl font-black text-white">$15</span>
                  <span className="text-gray-400 font-medium">/ {isKm ? "ខែ" : "mo"}</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1 text-gray-300 font-medium">
                  <li className="flex items-center gap-3"><span className="text-[#E84C3D]">✓</span> {isKm ? "ចូលប្រើមុខងារទាំងអស់" : "Access all features"}</li>
                  <li className="flex items-center gap-3"><span className="text-[#E84C3D]">✓</span> {isKm ? "ទំនិញមិនកំណត់" : "Unlimited products"}</li>
                  <li className="flex items-center gap-3"><span className="text-[#E84C3D]">✓</span> {isKm ? "ការបញ្ជាទិញមិនកំណត់" : "Unlimited orders"}</li>
                  <li className="flex items-center gap-3"><span className="text-[#E84C3D]">✓</span> {isKm ? "របាយការណ៍វិភាគកម្រិតខ្ពស់" : "Advanced Analytics"}</li>
                  <li className="flex items-center gap-3"><span className="text-[#E84C3D]">✓</span> {isKm ? "អតិថិជនអាចទូទាត់តាម KHQR" : "Customer KHQR Payments"}</li>
                </ul>
                <Link href="/register" className="block w-full py-4 px-6 rounded-xl bg-[#E84C3D] text-white font-bold text-center hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">
                  {isKm ? "ជ្រើសរើស Pro" : "Choose Pro"}
                </Link>
              </div>
            </FadeIn>

            {/* Premium Plan */}
            <FadeIn delay={0.4}>
              <div className="bg-white dark:bg-[#111111] p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 hover:border-[#E84C3D] hover:shadow-xl transition-all relative group flex flex-col h-full">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{isKm ? "កម្រិត Premium" : "Premium"}</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-5xl font-black text-gray-900 dark:text-white">$29</span>
                  <span className="text-gray-500 font-medium">/ {isKm ? "ខែ" : "mo"}</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1 text-gray-600 dark:text-gray-400 font-medium">
                  <li className="flex items-center gap-3"><span className="text-[#E84C3D]">✓</span> {isKm ? "មុខងារ Pro ទាំងអស់" : "All Pro features"}</li>
                  <li className="flex items-center gap-3"><span className="text-[#E84C3D]">✓</span> {isKm ? "សាខាច្រើន" : "Multiple branches"}</li>
                  <li className="flex items-center gap-3"><span className="text-[#E84C3D]">✓</span> {isKm ? "បុគ្គលិកមិនកំណត់" : "Unlimited staff accounts"}</li>
                  <li className="flex items-center gap-3"><span className="text-[#E84C3D]">✓</span> {isKm ? "ការគាំទ្រអាទិភាព ២៤/៧" : "24/7 Priority Support"}</li>
                </ul>
                <Link href="/register" className="block w-full py-4 px-6 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-center group-hover:bg-[#E84C3D] group-hover:text-white transition-colors">
                  {isKm ? "ជ្រើសរើស Premium" : "Choose Premium"}
                </Link>
              </div>
            </FadeIn>
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

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-white dark:bg-[#111111] border-t border-gray-100 dark:border-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn delay={0.1}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">{t('contact_title')}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
              {t('contact_desc')}
            </p>
            <button className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-lg text-lg">
              {t('contact_btn')}
            </button>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-gray-50 dark:bg-[#050505] border-t border-gray-200 dark:border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="inline-block mb-6 hover:opacity-90 transition-opacity">
                <img 
                  src="/logo/logo-website.png" 
                  alt="ShoppingOT Logo" 
                  className="h-10 sm:h-12 w-auto object-contain" 
                />
              </Link>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
                {t('description') || "The ultimate multi-vendor e-commerce platform. Empowering merchants to sell more, manage easier, and grow faster."}
              </p>
            </div>
            
            <div>
              <h4 className="text-gray-900 dark:text-white font-bold mb-6">Platform</h4>
              <ul className="space-y-4">
                <li><a href="#about" className="text-gray-500 dark:text-gray-400 hover:text-[#E84C3D] transition-colors">About Us</a></li>
                <li><a href="#services" className="text-gray-500 dark:text-gray-400 hover:text-[#E84C3D] transition-colors">Features</a></li>
                <li><Link href="/register" className="text-gray-500 dark:text-gray-400 hover:text-[#E84C3D] transition-colors">Pricing</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-gray-900 dark:text-white font-bold mb-6">Support</h4>
              <ul className="space-y-4">
                <li><a href="#contact" className="text-gray-500 dark:text-gray-400 hover:text-[#E84C3D] transition-colors">Contact Us</a></li>
                <li><Link href="/login" className="text-gray-500 dark:text-gray-400 hover:text-[#E84C3D] transition-colors">Merchant Login</Link></li>
                <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-[#E84C3D] transition-colors">Help Center</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              &copy; {new Date().getFullYear()} ShoppingOT. {t('footer_rights') || "All rights reserved."}
            </p>
            <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
              <a href="#" className="hover:text-[#E84C3D] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#E84C3D] transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
