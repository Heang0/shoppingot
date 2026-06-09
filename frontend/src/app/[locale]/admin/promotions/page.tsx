'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Tag, Plus, Trash2, Edit2, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminPromotionsPage({ params }: { params: { locale: string } }) {
  const isKm = params.locale === 'km';
  const user = useAuthStore(state => state.user);
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('');
  const [minPurchase, setMinPurchase] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [validUntil, setValidUntil] = useState('');

  const [storeId, setStoreId] = useState<string | null>(null);

  const fetchPromos = async (currentStoreId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/promos/store/${currentStoreId}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (res.ok) setPromos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stores`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      .then(res => res.json())
      .then(data => {
        const myStore = data.find((s: any) => s.ownerId?._id === user._id || s.ownerId === user._id);
        if (myStore) {
          setStoreId(myStore._id);
          fetchPromos(myStore._id);
        } else {
          setLoading(false);
        }
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!storeId) {
      setError('Store ID not found');
      return;
    }

    try {
      const url = editingPromoId 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/promos/${editingPromoId}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/promos`;
      
      const method = editingPromoId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          storeId,
          code,
          discountType,
          discountValue: Number(discountValue),
          minPurchase: minPurchase ? Number(minPurchase) : 0,
          usageLimit: usageLimit ? Number(usageLimit) : null,
          validUntil: validUntil ? new Date(validUntil).toISOString() : null,
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (editingPromoId) {
        setPromos(promos.map(p => p._id === editingPromoId ? data : p));
      } else {
        setPromos([data, ...promos]);
      }
      setShowModal(false);
      resetForm();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const togglePromo = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/promos/${id}/toggle`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (res.ok) {
        setPromos(promos.map(p => p._id === id ? { ...p, isActive: !p.isActive } : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deletePromo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/promos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (res.ok) {
        setPromos(promos.filter(p => p._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setCode('');
    setDiscountType('PERCENTAGE');
    setDiscountValue('');
    setMinPurchase('');
    setUsageLimit('');
    setValidUntil('');
    setError('');
    setEditingPromoId(null);
  };

  const handleEditPromo = (promo: any) => {
    setEditingPromoId(promo._id);
    setCode(promo.code);
    setDiscountType(promo.discountType);
    setDiscountValue(promo.discountValue.toString());
    setMinPurchase(promo.minPurchase > 0 ? promo.minPurchase.toString() : '');
    setUsageLimit(promo.usageLimit ? promo.usageLimit.toString() : '');
    setValidUntil(promo.validUntil ? new Date(promo.validUntil).toISOString().split('T')[0] : '');
    setShowModal(true);
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{isKm ? 'លេខកូដបញ្ចុះតម្លៃ' : 'Promo Codes'}</h1>
          <p className="text-sm text-gray-500">{isKm ? 'បង្កើតលេខកូដបញ្ចុះតម្លៃសម្រាប់អតិថិជនរបស់អ្នក។' : 'Create discount codes for your customers.'}</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="w-full sm:w-auto justify-center bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 flex items-center gap-2"
        >
          <Plus size={16} /> {isKm ? 'បង្កើតលេខកូដថ្មី' : 'New Promo Code'}
        </button>
      </div>

      <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-gray-800 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{isKm ? 'លេខកូដ' : 'Code'}</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{isKm ? 'បញ្ចុះតម្លៃ' : 'Discount'}</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{isKm ? 'ស្ថានភាព' : 'Status'}</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{isKm ? 'ចំនួនប្រើប្រាស់' : 'Usage'}</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{isKm ? 'ផុតកំណត់' : 'Valid Until'}</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">{isKm ? 'សកម្មភាព' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {promos.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">{isKm ? 'មិនមានលេខកូដបញ្ចុះតម្លៃទេ។ សូមបង្កើតមួយ!' : 'No promo codes found. Create one above!'}</td>
              </tr>
            ) : promos.map((promo) => (
              <tr key={promo._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Tag size={16} className="text-gray-400" />
                    <span className="font-bold text-gray-900 dark:text-white tracking-widest">{promo.code}</span>
                  </div>
                </td>
                <td className="p-4 font-medium text-green-600 dark:text-green-400">
                  {promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}% ${isKm ? 'បញ្ចុះ' : 'OFF'}` : `$${promo.discountValue} ${isKm ? 'បញ្ចុះ' : 'OFF'}`}
                  {promo.minPurchase > 0 && <span className="block text-xs text-gray-400 mt-0.5">{isKm ? 'ចំណាយអប្បបរមា: $' : 'Min: $'}{promo.minPurchase}</span>}
                </td>
                <td className="p-4">
                  <button 
                    onClick={() => togglePromo(promo._id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      promo.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    {promo.isActive ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {promo.isActive ? (isKm ? 'ដំណើរការ' : 'ACTIVE') : (isKm ? 'ផ្អាក' : 'INACTIVE')}
                  </button>
                </td>
                <td className="p-4 text-sm text-gray-500">
                  {promo.usedCount} {promo.usageLimit ? `/ ${promo.usageLimit}` : (isKm ? 'ដង' : 'uses')}
                </td>
                <td className="p-4 text-sm text-gray-500">
                  {promo.validUntil ? format(new Date(promo.validUntil), 'MMM dd, yyyy') : (isKm ? 'មិនផុតកំណត់' : 'No Expiry')}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleEditPromo(promo)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => deletePromo(promo._id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-[#111111] w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingPromoId ? (isKm ? 'កែប្រែលេខកូដ' : 'Update Promo Code') : (isKm ? 'បង្កើតលេខកូដថ្មី' : 'Create Promo Code')}</h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-900 dark:hover:text-white"><XCircle size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isKm ? 'លេខកូដ (ឧទាហរណ៍: SUMMER20)' : 'Code (e.g., SUMMER20)'}</label>
                <input type="text" value={code} onChange={e => setCode(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-900 uppercase" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isKm ? 'ប្រភេទបញ្ចុះតម្លៃ' : 'Discount Type'}</label>
                  <select value={discountType} onChange={e => setDiscountType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-900">
                    <option value="PERCENTAGE">{isKm ? 'ភាគរយ (%)' : 'Percentage (%)'}</option>
                    <option value="FIXED">{isKm ? 'ចំនួនទឹកប្រាក់ ($)' : 'Fixed Amount ($)'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isKm ? 'តម្លៃ' : 'Value'}</label>
                  <input type="number" step="0.01" min="0" value={discountValue} onChange={e => setDiscountValue(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-900" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isKm ? 'ចំណាយអប្បបរមា ($)' : 'Min. Purchase ($)'}</label>
                  <input type="number" step="0.01" min="0" value={minPurchase} onChange={e => setMinPurchase(e.target.value)} placeholder={isKm ? '0 សម្រាប់មិនមានកំណត់' : '0 for no min'} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isKm ? 'ចំនួនកំណត់ប្រើប្រាស់' : 'Usage Limit'}</label>
                  <input type="number" min="1" value={usageLimit} onChange={e => setUsageLimit(e.target.value)} placeholder={isKm ? 'ទុកចំហសម្រាប់ប្រើប្រាស់គ្មានកំណត់' : 'Leave blank for unlimited'} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-900" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isKm ? 'ថ្ងៃផុតកំណត់ (ស្រេចចិត្ត)' : 'Expiry Date (Optional)'}</label>
                <input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-900" />
              </div>

              <button type="submit" className="w-full py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg font-bold hover:opacity-90 mt-4">
                {editingPromoId ? (isKm ? 'រក្សាទុក' : 'Save Changes') : (isKm ? 'បង្កើតលេខកូដ' : 'Create Code')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
