import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { FadeIn } from '@/components/ui/FadeIn';
import { Navbar } from '@/components/ui/Navbar';
import { Building2, ShieldCheck, CreditCard, ArrowRight } from 'lucide-react';

export default function Index() {
  const t = useTranslations('Index');
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex flex-col items-center justify-center p-4">
        {/* Decorative background blurs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-500/20 dark:bg-red-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-orange-500/20 dark:bg-orange-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px] animate-blob animation-delay-2000"></div>

        <div className="text-center space-y-8 max-w-3xl mx-auto relative z-10 mt-10">
          <FadeIn delay={0.1}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-[#E84C3D] text-sm font-semibold mb-4 border border-red-200 dark:border-red-800/50">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              SaaS Platform Live
            </div>
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight">
              {t('title')}
            </h1>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed font-light">
              {t('description')}
            </p>
          </FadeIn>
          
          <FadeIn delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Link href="/register" className="group px-8 py-4 bg-[#E84C3D] text-white rounded-full font-semibold hover:bg-red-600 transition-all shadow-lg hover:shadow-red-500/30 flex items-center justify-center gap-2 text-lg">
                {t('register')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/login" className="px-8 py-4 bg-white dark:bg-gray-900 text-[#E84C3D] border-2 border-gray-200 dark:border-gray-800 rounded-full font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm flex items-center justify-center text-lg">
                {t('login')} (Merchant)
              </Link>
            </div>
          </FadeIn>
        </div>
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
      <footer className="py-8 bg-gray-50 dark:bg-[#050505] border-t border-gray-200 dark:border-gray-900 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
          &copy; {new Date().getFullYear()} ShoppingOT. {t('footer_rights')}
        </p>
      </footer>
    </div>
  );
}
