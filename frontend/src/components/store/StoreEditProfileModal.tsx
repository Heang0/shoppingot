'use client';

import { useState } from 'react';
import { X, Camera, Loader2 } from 'lucide-react';
import { useCustomerAuthStore } from '@/lib/store/useCustomerAuthStore';

interface StoreEditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  primaryColor: string;
  themeStyle: string;
  isKm: boolean;
}

export default function StoreEditProfileModal({ isOpen, onClose, primaryColor, themeStyle, isKm }: StoreEditProfileModalProps) {
  const user = useCustomerAuthStore(state => state.customerInfo);
  const setCustomerInfo = useCustomerAuthStore(state => state.setCustomerInfo);
  
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const body: any = { name };
      if (password) body.password = password;

      const res = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');

      setCustomerInfo({
        ...user,
        name: data.name,
      });

      setSuccess(isKm ? 'បានធ្វើបច្ចុប្បន្នភាពគណនីដោយជោគជ័យ!' : 'Profile updated successfully!');
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 2000);
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-md bg-white dark:bg-[#111111] ${
        themeStyle === 'neo-brutalism' 
          ? 'border-[3px] border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] rounded-none' 
          : 'rounded-3xl shadow-xl'
      } overflow-hidden`}>
        
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isKm ? 'កែប្រែគណនី' : 'Edit Profile'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-200 dark:border-red-900/30">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl text-sm font-medium border border-green-200 dark:border-green-900/30">
              {success}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-gray-300 mb-1.5">{isKm ? 'ឈ្មោះ' : 'Name'}</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-gray-300 mb-1.5">{isKm ? 'លេខសម្ងាត់ថ្មី (ស្រេចចិត្ត)' : 'New Password (Optional)'}</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
              minLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">{isKm ? 'ទុកវាទទេប្រសិនបើអ្នកមិនចង់ផ្លាស់ប្តូរ' : 'Leave blank to keep current password'}</p>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={buttonClass}
            style={themeStyle !== 'neo-brutalism' ? { backgroundColor: primaryColor || '#000' } : undefined}
          >
            {loading ? <Loader2 className="w-5 h-5 mx-auto animate-spin" /> : (isKm ? 'រក្សាទុក' : 'Save Changes')}
          </button>
        </form>
      </div>
    </div>
  );
}
