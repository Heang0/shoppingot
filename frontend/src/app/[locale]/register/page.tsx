'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Link, useRouter } from '@/navigation';

export default function RegisterPage() {
  const t = useTranslations('Index');
  const router = useRouter();
  const params = useParams();
  const isKm = params?.locale === 'km';
  const setUser = useAuthStore((state) => state.setUser);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'store_admin' }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setUser(data);
      router.push('/admin/setup'); // Redirect to Setup Wizard
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <Link href="/">
            <img 
              src="/logo/logo-website.png" 
              alt="ShoppingOT Logo" 
              className="h-14 w-auto object-contain" 
            />
          </Link>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          {isKm ? "បង្កើតគណនី ShoppingOT របស់អ្នក" : "Create your ShoppingOT account"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          {isKm ? "ចាប់ផ្តើមលក់ជាមួយការទូទាត់តាមរយៈ KHQR ថ្ងៃនេះ" : "Start selling with KHQR payments today"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[#111111] py-8 px-4 shadow-xl sm:rounded-[2rem] sm:px-10 border border-gray-100 dark:border-gray-800">
          <form className="space-y-6" onSubmit={handleRegister}>
            {error && (
              <div className="w-full bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 p-3 rounded-lg text-sm text-center border border-red-200 dark:border-red-800/50">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{isKm ? "ឈ្មោះពេញ" : "Full Name"}</label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-[#050505] text-gray-900 dark:text-white focus:outline-none focus:ring-[#E84C3D] focus:border-[#E84C3D] sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{isKm ? "អ៊ីមែល" : "Email address"}</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-[#050505] text-gray-900 dark:text-white focus:outline-none focus:ring-[#E84C3D] focus:border-[#E84C3D] sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{isKm ? "ពាក្យសម្ងាត់" : "Password"}</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-[#050505] text-gray-900 dark:text-white focus:outline-none focus:ring-[#E84C3D] focus:border-[#E84C3D] sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-[#E84C3D] hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E84C3D] disabled:opacity-50 transition-colors"
              >
                {loading ? (isKm ? 'កំពុងបង្កើតគណនី...' : 'Creating account...') : t('register')}
              </button>
            </div>
          </form>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-6 mb-6">
            {isKm 
              ? <>តាមរយៈការចុះឈ្មោះ អ្នកយល់ព្រមនឹង <Link href="#" className="text-[#E84C3D] hover:underline">លក្ខខណ្ឌសេវាកម្ម</Link> និង <Link href="#" className="text-[#E84C3D] hover:underline">គោលការណ៍ឯកជនភាព</Link> របស់ ShoppingOT។</>
              : <>By registering, you agree to ShoppingOT's <Link href="#" className="text-[#E84C3D] hover:underline">Terms of Service</Link> and <Link href="#" className="text-[#E84C3D] hover:underline">Privacy Policy</Link>.</>
            }
          </p>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-[#111111] text-gray-500 dark:text-gray-400">{isKm ? "មានគណនីរួចហើយ?" : "Already have an account?"}</span>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/login" className="w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-700 rounded-full shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#050505] hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                {t('login')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
