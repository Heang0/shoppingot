'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import Link from 'next/link';

export default function LoginPage() {
  const t = useTranslations('Index');
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setUser(data);
      
      if (data.role === 'superadmin') {
        router.push('/superadmin');
      } else if (data.role === 'store_admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
      
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
          {t('login')} to ShoppingOT
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[#111111] py-8 px-4 shadow-xl sm:rounded-[2rem] sm:px-10 border border-gray-100 dark:border-gray-800">
          
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="w-full bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 p-3 rounded-lg text-sm text-center border border-red-200 dark:border-red-800/50">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
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
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#E84C3D] hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E84C3D] disabled:opacity-50 transition-colors"
              >
                {loading ? 'Logging in...' : t('login')}
              </button>
            </div>
          </form>
            
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-6 mb-6">
            By logging in, you agree to ShoppingOT's Terms of Service and Privacy Policy.
          </p>

          <div className="w-full border-t border-gray-100 dark:border-gray-800 pt-6">
            <Link href="/register" className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#050505] hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
              {t('register')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
