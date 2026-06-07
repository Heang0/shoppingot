'use client';

import { useState } from 'react';
import { useCustomerAuthStore } from '@/lib/store/useCustomerAuthStore';
import TelegramLoginButton from 'react-telegram-login';

export default function StoreCustomerAuth({ primaryColor, themeStyle, isKm }: { primaryColor: string, themeStyle: string, isKm: boolean }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const setCustomerInfo = useCustomerAuthStore(state => state.setCustomerInfo);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin ? { email, password } : { name, email, password, role: 'customer' };

      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Check role safety if logging in
      if (isLogin && data.role !== 'customer') {
        throw new Error('Admins cannot log in as customers on the storefront.');
      }

      setCustomerInfo({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        token: data.token,
        profilePic: data.profilePic,
      });
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTelegramResponse = async (response: any) => {
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Telegram authentication failed');
      }

      setCustomerInfo({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        token: data.token,
        profilePic: data.profilePic,
      });
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border focus:outline-none transition-colors ${
    themeStyle === 'neo-brutalism' 
      ? 'border-2 border-black dark:border-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] focus:shadow-none focus:translate-x-[4px] focus:translate-y-[4px]' 
      : 'border-gray-200 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-600'
  }`;

  const buttonClass = `w-full py-3.5 px-4 font-bold text-center transition-all ${
    themeStyle === 'neo-brutalism'
      ? 'border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] text-black bg-[#f0f0f0]'
      : 'rounded-xl text-white hover:opacity-90 active:scale-[0.98]'
  }`;

  const googleButtonClass = `w-full py-3.5 px-4 font-bold text-center transition-all flex items-center justify-center gap-3 bg-white dark:bg-black text-gray-900 dark:text-white ${
    themeStyle === 'neo-brutalism'
      ? 'border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]'
      : 'border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 active:scale-[0.98]'
  }`;

  return (
    <div className="w-full max-w-md mx-auto pt-8 pb-20 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
          {isLogin ? (isKm ? 'សូមស្វាគមន៍ត្រឡប់មកវិញ' : 'Welcome Back') : (isKm ? 'បង្កើតគណនី' : 'Create Account')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {isLogin 
            ? (isKm ? 'ចូលគណនីរបស់អ្នកដើម្បីមើលការបញ្ជាទិញ' : 'Sign in to view your orders') 
            : (isKm ? 'ចូលរួមជាមួយយើងដើម្បីទិញទំនិញ' : 'Join us to start shopping')}
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex justify-center w-full">
          <TelegramLoginButton 
            dataOnauth={handleTelegramResponse} 
            botName={process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "shoppingot_test_bot"} 
            buttonSize="large" 
            cornerRadius={12}
            usePic={true}
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800"></div>
          <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">{isKm ? 'ឬ' : 'or'}</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-200 dark:border-red-900/30">
              {error}
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-300 mb-1.5">{isKm ? 'ឈ្មោះ' : 'Name'}</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                className={inputClass}
                placeholder={isKm ? 'បញ្ចូលឈ្មោះរបស់អ្នក' : 'Enter your name'}
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-gray-300 mb-1.5">{isKm ? 'អ៊ីមែល' : 'Email Address'}</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={inputClass}
              placeholder={isKm ? 'បញ្ចូលអ៊ីមែលរបស់អ្នក' : 'name@example.com'}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-gray-300 mb-1.5">{isKm ? 'លេខសម្ងាត់' : 'Password'}</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={buttonClass}
            style={themeStyle !== 'neo-brutalism' ? { backgroundColor: primaryColor || '#000' } : undefined}
          >
            {loading ? '...' : isLogin ? (isKm ? 'ចូលគណនី' : 'Sign In') : (isKm ? 'បង្កើតគណនី' : 'Create Account')}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            {isLogin 
              ? (isKm ? 'មិនទាន់មានគណនីមែនទេ? ' : "Don't have an account? ")
              : (isKm ? 'មានគណនីរួចហើយ? ' : "Already have an account? ")}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="font-bold hover:underline"
              style={{ color: primaryColor || '#000' }}
            >
              {isLogin ? (isKm ? 'ចុះឈ្មោះ' : 'Sign Up') : (isKm ? 'ចូលគណនី' : 'Sign In')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
