'use client';

import { useState, useEffect } from 'react';
import { useCustomerAuthStore } from '@/lib/store/useCustomerAuthStore';
import { useCartStore } from '@/lib/store/useCartStore';
import StoreCustomerAuth from '@/components/store/StoreCustomerAuth';
import StoreEditProfileModal from '@/components/store/StoreEditProfileModal';
import BakongKHQRModal from '@/components/payment/BakongKHQRModal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Package, Clock, CheckCircle2, Truck, XCircle, AlertCircle, Camera, Edit2, Hash, Link2, Activity, CreditCard, Tag, Percent, MapPin, Calendar, FileText, RefreshCcw } from 'lucide-react';

export default function StoreProfilePage({ params }: { params: { slug: string, locale: string } }) {
  const user = useCustomerAuthStore((state) => state.customerInfo);
  const setCustomerInfo = useCustomerAuthStore((state) => state.setCustomerInfo);
  const logout = useCustomerAuthStore((state) => state.logout);
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const handleReorder = (order: any) => {
    order.items.forEach((item: any) => {
      addItem({
        productId: item.productId?._id || item.productId,
        title: item.productId?.title || 'Product',
        titleKm: item.productId?.titleKm,
        price: item.price,
        imageUrl: item.productId?.imageUrl,
        quantity: item.quantity,
        selectedVariants: item.selectedVariants || {}
      });
    });
    router.push(`/${params.locale}/checkout`);
  };

  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#000000');
  const [themeStyle, setThemeStyle] = useState('default');
  const [orders, setOrders] = useState<any[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Tabs State
  const [activeTab, setActiveTab] = useState<'orders' | 'address'>('orders');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);

  // Address Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user]);

  useEffect(() => {
    const fetchStoreAndOrders = async () => {
      try {
        // 1. Always Fetch Store Details for Branding
        const storeRes = await fetch(`http://192.168.1.7:5000/api/stores/${params.slug}`);
        if (!storeRes.ok) throw new Error('Store not found');
        const storeData = await storeRes.json();
        setStoreId(storeData._id);
        setPrimaryColor(storeData.branding?.primaryColor || '#000000');
        setThemeStyle(storeData.branding?.themeStyle || 'default');

        // 2. Fetch Customer Orders if Logged In
        if (user) {
          const ordersRes = await fetch('http://192.168.1.7:5000/api/orders/customer', {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          if (ordersRes.ok) {
            const ordersData = await ordersRes.json();
            // 3. Filter orders specifically for THIS store
            const storeOrders = ordersData.filter((order: any) => 
              order.storeId && order.storeId._id === storeData._id
            );
            setOrders(storeOrders);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreAndOrders();
  }, [params.slug, user]);

  const handleLogout = () => {
    logout();
    window.location.href = `/${params.locale}`;
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      // Upload image
      const uploadRes = await fetch('http://192.168.1.7:5000/api/upload?type=profile', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.message || 'Upload failed');

      // Update profile
      const profileRes = await fetch('http://192.168.1.7:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ profilePic: uploadData.url })
      });
      
      const profileData = await profileRes.json();
      if (!profileRes.ok) throw new Error(profileData.message || 'Profile update failed');

      setCustomerInfo({ ...user, profilePic: profileData.profilePic });
    } catch (err) {
      console.error(err);
      alert(params.locale === 'km' ? 'បរាជ័យក្នុងការបញ្ចូលរូបភាព' : 'Failed to upload profile picture');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess('');

    try {
      const profileRes = await fetch('http://192.168.1.7:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ name, phone, address })
      });
      
      const profileData = await profileRes.json();
      if (!profileRes.ok) throw new Error(profileData.message || 'Profile update failed');

      setCustomerInfo({ 
        ...user, 
        name: profileData.name, 
        phone: profileData.phone, 
        address: profileData.address 
      });
      setSaveSuccess(params.locale === 'km' ? 'បានរក្សាទុកដោយជោគជ័យ!' : 'Saved successfully!');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err: any) {
      console.error(err);
      setSaveError(err.message || (params.locale === 'km' ? 'បរាជ័យក្នុងការរក្សាទុក' : 'Failed to save'));
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'SHIPPED': return <Truck className="w-5 h-5 text-blue-500" />;
      case 'PROCESSING': return <Package className="w-5 h-5 text-purple-500" />;
      case 'CANCELLED': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800/30';
      case 'SHIPPED': return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800/30';
      case 'PROCESSING': return 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800/30';
      case 'CANCELLED': return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800/30';
      default: return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/30';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center py-20 min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <StoreCustomerAuth 
          primaryColor={primaryColor} 
          themeStyle={themeStyle} 
          isKm={params.locale === 'km'} 
        />
      </div>
    );
  }

  const cardClass = themeStyle === 'neo-brutalism'
    ? 'bg-white dark:bg-[#111111] border-[3px] border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] p-5'
    : 'bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800/50 hover:border-gray-200 dark:hover:border-gray-700 shadow-sm p-5 rounded-2xl transition-colors';

  const avatarClass = themeStyle === 'neo-brutalism'
    ? 'w-20 h-20 bg-gray-100 dark:bg-[#1a1a1a] flex items-center justify-center text-2xl font-black text-gray-900 dark:text-white shrink-0 overflow-hidden border-[3px] border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] relative group cursor-pointer'
    : 'w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-2xl font-bold text-gray-900 dark:text-white shrink-0 overflow-hidden border-4 border-white dark:border-[#111111] shadow-md relative group cursor-pointer';

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 py-6 sm:py-10 space-y-8 pb-32">
      {/* Profile Header */}
      <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-8 border-b ${themeStyle === 'neo-brutalism' ? 'border-black dark:border-white border-b-[3px]' : 'border-gray-100 dark:border-gray-900'}`}>
        <div className="flex items-center gap-5">
          <label className="relative cursor-pointer group block w-fit">
            <div className={avatarClass}>
              {user.profilePic ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
              ) : (
                user.name?.charAt(0).toUpperCase() || 'U'
              )}
              
              {/* Loading Overlay */}
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                </div>
              )}
            </div>
            
            {/* Persistent Camera Badge */}
            <div className={`absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center ${themeStyle === 'neo-brutalism' ? 'bg-white border-2 border-black' : 'bg-white shadow-md border border-gray-100'} z-20 transition-transform group-hover:scale-110`}>
              <Camera className="w-3.5 h-3.5 text-gray-700" />
            </div>
            
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
          </label>
          
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{user.name}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-2">{user.email}</p>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className={`mt-2 flex items-center gap-1.5 text-sm font-bold w-fit px-4 py-1.5 transition-all ${
                themeStyle === 'neo-brutalism'
                  ? 'border-[2px] border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] text-black bg-white dark:bg-black dark:text-white uppercase tracking-wider text-xs'
                  : themeStyle === 'minimalist'
                  ? 'border border-gray-200 dark:border-gray-800 rounded-full hover:border-gray-900 dark:hover:border-white text-gray-900 dark:text-white'
                  : 'rounded-full text-white shadow-sm hover:opacity-90'
              }`}
              style={themeStyle === 'default' ? { backgroundColor: primaryColor || '#000' } : undefined}
            >
              <Edit2 size={14} strokeWidth={themeStyle === 'neo-brutalism' ? 2.5 : 2} />
              {params.locale === 'km' ? 'កែប្រែគណនី' : 'Edit Profile'}
            </button>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className={`flex items-center gap-2 px-5 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 font-bold transition-all w-full md:w-auto justify-center ${
            themeStyle === 'neo-brutalism' 
              ? 'border-[2px] border-red-600 shadow-[3px_3px_0px_0px_rgba(220,38,38,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none' 
              : 'rounded-full border border-red-100 dark:border-red-900/30'
          }`}
        >
          <LogOut size={18} strokeWidth={2.5} />
          {params.locale === 'km' ? 'ចាកចេញ' : 'Sign Out'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200 dark:border-gray-800 mb-8">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 font-bold text-lg transition-colors border-b-2 ${
            activeTab === 'orders'
              ? 'border-black dark:border-white text-black dark:text-white'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          {params.locale === 'km' ? 'ប្រវត្តិការបញ្ជាទិញ' : 'Order History'}
        </button>
        <button
          onClick={() => setActiveTab('address')}
          className={`pb-3 font-bold text-lg transition-colors border-b-2 ${
            activeTab === 'address'
              ? 'border-black dark:border-white text-black dark:text-white'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          {params.locale === 'km' ? 'អាសយដ្ឋាន' : 'Address'}
        </button>
      </div>

      {activeTab === 'orders' ? (
        <div>
        
        {orders.length === 0 ? (
          <div className={`text-center py-16 ${
            themeStyle === 'neo-brutalism' 
              ? 'bg-white dark:bg-[#111111] border-[3px] border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]' 
              : 'bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-900'
          }`}>
            <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{params.locale === 'km' ? 'មិនមានការបញ្ជាទិញនៅឡើយទេ' : 'No Orders Yet'}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">{params.locale === 'km' ? 'អ្នកមិនទាន់បានបញ្ជាទិញអ្វីនៅហាងនេះទេ' : "You haven't placed any orders at this store."}</p>
            <Link 
              href={`/${params.locale}`} 
              className={`inline-block font-bold px-8 py-3 transition-all ${
                themeStyle === 'neo-brutalism'
                  ? 'border-[2px] border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-black bg-white dark:bg-black dark:text-white'
                  : 'text-white rounded-full hover:scale-105 shadow-md'
              }`}
              style={themeStyle !== 'neo-brutalism' ? { backgroundColor: primaryColor || '#000' } : undefined}
            >
              {params.locale === 'km' ? 'ចាប់ផ្តើមទិញទំនិញ' : 'Start Shopping'}
            </Link>
          </div>
        ) : (
          selectedOrder ? (
            <div className={`p-6 md:p-8 ${
              themeStyle === 'neo-brutalism' 
                ? 'bg-white dark:bg-[#111111] border-[3px] border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]' 
                : 'bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800'
            }`}>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <button 
                  onClick={() => setSelectedOrder(null)} 
                  className={`flex items-center justify-center gap-2 px-6 py-2.5 font-bold text-white transition-all ${
                    themeStyle === 'neo-brutalism'
                      ? 'border-[2px] border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
                      : 'rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                  style={{ backgroundColor: primaryColor || '#000' }}
                >
                  ← {params.locale === 'km' ? 'ត្រលប់ក្រោយ' : 'Back'}
                </button>
                
                <div className="flex gap-4">
                  {selectedOrder.paymentStatus === 'PENDING' ? (
                    selectedOrder.qrString && (
                      <button 
                        onClick={() => setShowPayModal(true)}
                        className={`flex items-center justify-center gap-2 px-6 py-2.5 font-bold text-white transition-all ${
                          themeStyle === 'neo-brutalism'
                            ? 'border-[2px] border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none bg-blue-600'
                            : 'rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] bg-blue-600'
                        }`}
                      >
                        <CreditCard size={18} />
                        {params.locale === 'km' ? 'បង់ប្រាក់ឥឡូវនេះ' : 'Pay Now'}
                      </button>
                    )
                  ) : (
                    <button 
                      onClick={() => handleReorder(selectedOrder)}
                      className={`flex items-center justify-center gap-2 px-6 py-2.5 font-bold text-white transition-all ${
                        themeStyle === 'neo-brutalism'
                          ? 'border-[2px] border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none bg-green-600'
                          : 'rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] bg-green-600'
                      }`}
                    >
                      <RefreshCcw size={18} />
                      {params.locale === 'km' ? 'បញ្ជាទិញម្តងទៀត' : 'Order Again'}
                    </button>
                  )}
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {params.locale === 'km' ? 'ព័ត៌មានការបញ្ជាទិញ' : 'Order Information'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 mb-8 border-b border-gray-100 dark:border-gray-800 pb-8">
                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-1"><Hash size={14} />{params.locale === 'km' ? 'លេខសម្គាល់ប្រតិបត្តិការ' : 'Transaction ID'}</p>
                  <p className="font-semibold text-gray-900 dark:text-white font-mono">{selectedOrder._id.substring(0, 10).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-1"><Link2 size={14} />{params.locale === 'km' ? 'លេខសម្គាល់ប្រតិបត្តិការ ABA/Bakong' : 'Bakong Transaction ID'}</p>
                  <p className="font-semibold text-gray-900 dark:text-white font-mono">{selectedOrder.bakongMd5 ? selectedOrder.bakongMd5.substring(0, 10).toUpperCase() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-1"><Activity size={14} />{params.locale === 'km' ? 'ស្ថានភាព' : 'Status'}</p>
                  <p className={`font-bold ${selectedOrder.orderStatus === 'FAILED' ? 'text-red-500' : 'text-green-500'}`}>{selectedOrder.orderStatus}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-1"><CreditCard size={14} />{params.locale === 'km' ? 'វិធីបង់ប្រាក់' : 'Payment Method'}</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedOrder.paymentMethod === 'bakong_app' ? 'Bakong App' : selectedOrder.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-1"><Tag size={14} />{params.locale === 'km' ? 'តម្លៃផលិតផល' : 'Product Price'}</p>
                  <p className="font-semibold text-gray-900 dark:text-white">${selectedOrder.subtotal?.toFixed(2) || (selectedOrder.totalAmount - (selectedOrder.deliveryFee || 0)).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-1"><Percent size={14} />{params.locale === 'km' ? 'បញ្ចុះតម្លៃ' : 'Discount'}</p>
                  <p className="font-semibold text-red-500">-${selectedOrder.discountApplied?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-1"><Truck size={14} />{params.locale === 'km' ? 'ថ្លៃដឹកជញ្ជូន' : 'Delivery Fee'}</p>
                  <p className="font-semibold text-gray-900 dark:text-white">${selectedOrder.deliveryFee?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-1"><CreditCard size={14} />{params.locale === 'km' ? 'តម្លៃសរុបទាំងអស់' : 'Grand Total'}</p>
                  <p className="font-bold text-xl text-gray-900 dark:text-white">${selectedOrder.totalAmount?.toFixed(2)}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-1"><FileText size={14} />{params.locale === 'km' ? 'ចំណាំ' : 'Note'}</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedOrder.deliveryNote || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-1"><MapPin size={14} />{params.locale === 'km' ? 'អាសយដ្ឋានដឹកជញ្ជូន' : 'Delivery Address'}</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedOrder.guestInfo?.address || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-1"><Calendar size={14} />{params.locale === 'km' ? 'បានបង្កើតនៅថ្ងៃ' : 'Created At'}</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {new Date(selectedOrder.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {params.locale === 'km' ? 'ផលិតផល' : 'Products'}
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b-2 border-gray-200 dark:border-gray-800 text-sm text-gray-500">
                      <th className="py-3 px-4 font-medium">{params.locale === 'km' ? 'ល.រ' : 'N.O'}</th>
                      <th className="py-3 px-4 font-medium">{params.locale === 'km' ? 'រូបភាព' : 'Image'}</th>
                      <th className="py-3 px-4 font-medium">{params.locale === 'km' ? 'ផលិតផល' : 'Product'}</th>
                      <th className="py-3 px-4 font-medium">{params.locale === 'km' ? 'តម្លៃឯកតា' : 'Unit Price'}</th>
                      <th className="py-3 px-4 font-medium text-center">{params.locale === 'km' ? 'បរិមាណ' : 'Quantity'}</th>
                      <th className="py-3 px-4 font-medium text-right">{params.locale === 'km' ? 'តម្លៃ' : 'Price'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(selectedOrder.items.reduce((acc: any, item: any) => {
                      const id = item.productId?._id || item.productId;
                      if (!acc[id]) acc[id] = { ...item };
                      else acc[id].quantity += item.quantity;
                      return acc;
                    }, {})).map((item: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">{idx + 1}</td>
                        <td className="py-4 px-4">
                          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                            {item.productId?.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.productId.imageUrl} alt="Product" className="w-full h-full object-cover" />
                            ) : null}
                          </div>
                        </td>
                        <td className="py-4 px-4 font-semibold text-gray-900 dark:text-white line-clamp-2">
                          {params.locale === 'km' && item.productId?.titleKm ? item.productId.titleKm : item.productId?.title || 'Unknown Product'}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-300">${item.price?.toFixed(2)}</td>
                        <td className="py-4 px-4 text-center font-bold text-gray-900 dark:text-white">{item.quantity}</td>
                        <td className="py-4 px-4 text-right font-bold text-gray-900 dark:text-white">${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 dark:bg-gray-900/50">
                      <td colSpan={3} className="py-4 px-4 font-bold text-gray-900 dark:text-white">
                        {params.locale === 'km' ? 'តម្លៃសរុប' : 'Total'}
                      </td>
                      <td className="py-4 px-4 font-bold">${selectedOrder.subtotal?.toFixed(2) || (selectedOrder.totalAmount - (selectedOrder.deliveryFee || 0)).toFixed(2)}</td>
                      <td className="py-4 px-4 text-center font-bold">
                        {selectedOrder.items.reduce((acc: number, item: any) => acc + item.quantity, 0)}
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-black dark:text-white">
                        ${selectedOrder.subtotal?.toFixed(2) || (selectedOrder.totalAmount - (selectedOrder.deliveryFee || 0)).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className={`overflow-x-auto ${
              themeStyle === 'neo-brutalism' 
                ? 'bg-white dark:bg-[#111111] border-[3px] border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]' 
                : 'bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800'
            }`}>
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700">
                    <th className="py-4 px-4 text-sm font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">{params.locale === 'km' ? 'ល.រ' : 'N.O'}</th>
                    <th className="py-4 px-4 text-sm font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">{params.locale === 'km' ? 'លេខសម្គាល់ប្រតិបត្តិការ' : 'Transaction ID'}</th>
                    <th className="py-4 px-4 text-sm font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">{params.locale === 'km' ? 'សរុបរង' : 'Subtotal'}</th>
                    <th className="py-4 px-4 text-sm font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">{params.locale === 'km' ? 'តម្លៃសរុប' : 'Total'}</th>
                    <th className="py-4 px-4 text-sm font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">{params.locale === 'km' ? 'វិធីបង់ប្រាក់' : 'Payment Method'}</th>
                    <th className="py-4 px-4 text-sm font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">{params.locale === 'km' ? 'ស្ថានភាព' : 'Status'}</th>
                    <th className="py-4 px-4 text-sm font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">{params.locale === 'km' ? 'អាសយដ្ឋាន' : 'Address'}</th>
                    <th className="py-4 px-4 text-sm font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">{params.locale === 'km' ? 'បានបង្កើតនៅថ្ងៃ' : 'Created At'}</th>
                    <th className="py-4 px-4 text-sm font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">{params.locale === 'km' ? 'សកម្មភាព' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => (
                    <tr key={order._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">{index + 1}</td>
                      <td className="py-4 px-4 text-sm text-blue-600 dark:text-blue-400 font-semibold cursor-pointer hover:underline" onClick={() => setSelectedOrder(order)}>
                        {order._id.substring(0, 10).toUpperCase()}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">${order.subtotal?.toFixed(2) || (order.totalAmount - (order.deliveryFee || 0)).toFixed(2)}</td>
                      <td className="py-4 px-4 text-sm font-bold text-gray-900 dark:text-white">${order.totalAmount.toFixed(2)}</td>
                      <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">{order.paymentMethod === 'bakong_app' ? 'Bakong App' : order.paymentMethod}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                          order.orderStatus === 'FAILED' ? 'bg-red-100 text-red-700' :
                          order.orderStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-500 truncate max-w-[150px]" title={order.guestInfo?.address}>
                        {order.guestInfo?.address || 'N/A'}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-4 px-4 text-sm">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
      ) : (
      <div className={`max-w-2xl ${
        themeStyle === 'neo-brutalism' 
          ? 'bg-white dark:bg-[#111111] border-[3px] border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] p-6 md:p-8' 
          : 'bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-900 p-6 md:p-8 shadow-sm'
      }`}>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
          {params.locale === 'km' ? 'ព័ត៌មានទំនាក់ទំនងភ្ញៀវ / Shipping Address' : 'Shipping Address'}
        </h2>
        
        <form onSubmit={handleSaveAddress} className="space-y-5">
          {saveSuccess && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium border border-green-200 dark:border-green-800/30 flex items-center gap-2">
              <CheckCircle2 size={18} /> {saveSuccess}
            </div>
          )}
          {saveError && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium border border-red-200 dark:border-red-800/30 flex items-center gap-2">
              <AlertCircle size={18} /> {saveError}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-gray-300 mb-2">
              {params.locale === 'km' ? 'ឈ្មោះពេញ / Full Name' : 'Full Name'}
            </label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-gray-300 mb-2">
              {params.locale === 'km' ? 'លេខទូរស័ព្ទ / Phone Number' : 'Phone Number'}
            </label>
            <input 
              type="tel" 
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-gray-300 mb-2">
              {params.locale === 'km' ? 'អាសយដ្ឋានដឹកជញ្ជូន / Address' : 'Address'}
            </label>
            <textarea 
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-black dark:focus:border-white transition-colors resize-none"
              rows={4}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isSaving}
            className={`w-full py-3.5 px-4 font-bold text-center transition-all mt-4 ${
              themeStyle === 'neo-brutalism'
                ? 'border-[2px] border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] text-black bg-[#f0f0f0]'
                : 'rounded-xl text-white hover:opacity-90 active:scale-[0.98]'
            }`}
            style={themeStyle !== 'neo-brutalism' ? { backgroundColor: primaryColor || '#000' } : undefined}
          >
            {isSaving ? (params.locale === 'km' ? 'កំពុងរក្សាទុក...' : 'Saving...') : (params.locale === 'km' ? 'រក្សាទុកអាសយដ្ឋាន' : 'Save Address')}
          </button>
        </form>
      </div>
      )}

      <StoreEditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        primaryColor={primaryColor}
        themeStyle={themeStyle}
        isKm={params.locale === 'km'}
      />

      {showPayModal && selectedOrder && selectedOrder.qrString && (
        <BakongKHQRModal
          qrString={selectedOrder.qrString}
          amount={selectedOrder.totalAmount}
          currency="USD"
          merchantName="ShoppingOT Merchant"
          isPaid={selectedOrder.paymentStatus === 'PAID'}
          locale={params.locale}
          onClose={() => setShowPayModal(false)}
        />
      )}
    </div>
  );
}
