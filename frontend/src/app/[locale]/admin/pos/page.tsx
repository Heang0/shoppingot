'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';

interface Product {
  _id: string;
  title: string;
  titleKm?: string;
  price: number;
  stock: number;
  barcode?: string;
  sku?: string;
  imageUrl: string;
  category?: string | { _id: string; name?: string; nameKm?: string };
}

interface CartItem extends Product {
  quantity: number;
}

export default function POSPage() {
  const user = useAuthStore((state) => state.user);
  const locale = useLocale();
  const t = useTranslations('AdminProducts'); // Reusing some translations

  const [products, setProducts] = useState<Product[]>([]);
  const [store, setStore] = useState<any>(null);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Checkout States
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'KHQR'>('CASH');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [qrData, setQrData] = useState<{ qrString: string; md5: string; orderId: string } | null>(null);

  // Barcode scanner buffer
  const barcodeBuffer = useRef('');
  const barcodeTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchStoreAndProducts();
  }, [user]);

  const fetchStoreAndProducts = async () => {
    try {
      const storeRes = await fetch('http://192.168.1.7:5000/api/stores', {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const storeData = await storeRes.json();
      const myStore = storeData.find((s: any) => s.ownerId._id === user?._id || s.ownerId === user?._id);
      
      if (myStore) {
        setStore(myStore);
        const prodRes = await fetch(`http://192.168.1.7:5000/api/products/store/${myStore._id}?limit=1000`);
        const prodData = await prodRes.json();
        setProducts(prodData.products || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Barcode Scanner Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Enter') {
        if (barcodeBuffer.current.length > 0) {
          handleBarcodeScanned(barcodeBuffer.current);
          barcodeBuffer.current = '';
        }
      } else {
        if (e.key.length === 1) { // Only printable characters
          barcodeBuffer.current += e.key;
        }
        
        if (barcodeTimeout.current) clearTimeout(barcodeTimeout.current);
        barcodeTimeout.current = setTimeout(() => {
          barcodeBuffer.current = ''; // Clear buffer if typing is too slow (human)
        }, 50); // Scanners type very fast (<20ms per char)
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products, cart]);

  const handleBarcodeScanned = (code: string) => {
    const product = products.find(p => p.barcode === code);
    if (product) {
      addToCart(product);
    } else {
      alert(`Barcode not found: ${code}`);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        return prev.map(item => 
          item._id === product._id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item._id === id) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item._id !== id));
  };

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    const lowerQ = searchQuery.toLowerCase();
    return products.filter(p => 
      p.title.toLowerCase().includes(lowerQ) || 
      (p.titleKm && p.titleKm.toLowerCase().includes(lowerQ)) ||
      (p.barcode && p.barcode.toLowerCase().includes(lowerQ)) ||
      (p.sku && p.sku.toLowerCase().includes(lowerQ))
    );
  }, [products, searchQuery]);

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const change = (Number(cashReceived) - totalAmount);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'CASH' && Number(cashReceived) < totalAmount) {
      alert('Cash received is less than total amount!');
      return;
    }

    setIsCheckingOut(true);
    try {
      const payload = {
        storeId: store._id,
        items: cart.map(c => ({
          productId: c._id,
          quantity: c.quantity,
          price: c.price
        })),
        totalAmount,
        orderSource: 'POS',
        paymentMethod,
        cashReceived: paymentMethod === 'CASH' ? Number(cashReceived) : undefined,
        changeGiven: paymentMethod === 'CASH' ? change : undefined,
        guestInfo: { name: 'Walk-in Customer' } // Default POS customer
      };

      const res = await fetch('http://192.168.1.7:5000/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      
      if (res.ok) {
        if (paymentMethod === 'CASH') {
          // Finish and Print Receipt
          setLastOrder({ ...payload, items: [...cart], orderId: data.orderId, date: new Date() });
          setCart([]);
          setCashReceived('');
          // Trigger print dialog after state updates render the receipt
          setTimeout(() => window.print(), 500); 
        } else {
          // KHQR
          setQrData(data);
          pollPaymentStatus(data.orderId, data.md5);
        }
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
    setIsCheckingOut(false);
  };

  const pollPaymentStatus = (orderId: string, md5: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://192.168.1.7:5000/api/orders/${orderId}/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ md5 })
        });
        const data = await res.json();
        if (data.status === 'PAID') {
          clearInterval(interval);
          setQrData(null);
          setLastOrder({ orderId, items: [...cart], totalAmount, paymentMethod: 'KHQR', date: new Date() });
          setCart([]);
          setTimeout(() => window.print(), 500); 
        }
      } catch (err) {
        console.error(err);
      }
    }, 3000);

    // Stop polling if user closes QR (handled elsewhere) or after 5 mins
    setTimeout(() => clearInterval(interval), 300000);
  };

  const getProductName = (p: Product) => locale === 'km' && p.titleKm ? p.titleKm : p.title;

  return (
    <div className="flex h-[calc(100vh-100px)] -mt-6 -mx-6 bg-gray-100 dark:bg-[#0a0a0a]">
      {/* LEFT PANEL - PRODUCTS */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="mb-4 flex gap-4 items-center">
          <input 
            type="text"
            placeholder="Search products, SKU, or Barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 bg-white dark:bg-gray-900 border-none rounded-xl shadow-sm focus:ring-2 focus:ring-[#E84C3D] dark:text-white"
          />
          <div className="bg-white dark:bg-gray-900 px-4 py-3 rounded-xl shadow-sm text-sm font-medium text-gray-500 dark:text-gray-400">
            Scanner Ready 🟢
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-20">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div 
                key={product._id} 
                onClick={() => addToCart(product)}
                className="bg-white dark:bg-[#111111] rounded-xl shadow-sm hover:shadow-md cursor-pointer overflow-hidden border border-transparent hover:border-[#E84C3D] transition-all"
              >
                <div className="h-32 w-full relative bg-gray-100">
                  <Image src={product.imageUrl} alt={product.title} fill className="object-cover" />
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2">{getProductName(product)}</h3>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-[#E84C3D] font-bold">${product.price.toFixed(2)}</span>
                    <span className="text-xs text-gray-500">{product.stock} in stock</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - CART */}
      <div className="w-[400px] bg-white dark:bg-[#111111] shadow-xl flex flex-col border-l border-gray-200 dark:border-gray-800 z-10">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Current Order</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <span className="text-4xl mb-2">🛒</span>
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item._id} className="flex gap-3 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                <div className="w-12 h-12 relative rounded overflow-hidden shrink-0">
                  <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{getProductName(item)}</h4>
                  <div className="text-[#E84C3D] text-sm font-medium">${item.price.toFixed(2)}</div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button onClick={() => removeFromCart(item._id)} className="text-gray-400 hover:text-red-500">✕</button>
                  <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded px-1">
                    <button onClick={() => updateQuantity(item._id, -1)} className="w-6 h-6 flex items-center justify-center text-gray-600 dark:text-gray-300">-</button>
                    <span className="text-sm font-medium w-4 text-center dark:text-white">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, 1)} className="w-6 h-6 flex items-center justify-center text-gray-600 dark:text-gray-300">+</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#111111]">
          <div className="flex justify-between mb-4">
            <span className="text-gray-600 dark:text-gray-400 text-lg">Total</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">${totalAmount.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <button 
              onClick={() => setPaymentMethod('CASH')}
              className={`py-3 rounded-lg font-medium transition-colors border ${paymentMethod === 'CASH' ? 'bg-[#E84C3D] text-white border-[#E84C3D]' : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700'}`}
            >
              💵 Cash
            </button>
            <button 
              onClick={() => setPaymentMethod('KHQR')}
              className={`py-3 rounded-lg font-medium transition-colors border ${paymentMethod === 'KHQR' ? 'bg-[#E84C3D] text-white border-[#E84C3D]' : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700'}`}
            >
              📱 KHQR
            </button>
          </div>

          {paymentMethod === 'CASH' && (
            <div className="mb-4 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <label className="block text-xs font-medium text-gray-500 mb-1">Cash Received</label>
              <input 
                type="number" 
                value={cashReceived}
                onChange={e => setCashReceived(e.target.value)}
                placeholder="0.00"
                className="w-full text-xl font-bold bg-transparent border-none focus:ring-0 p-0 text-gray-900 dark:text-white"
              />
              {Number(cashReceived) >= totalAmount && (
                <div className="flex justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-sm text-gray-500">Change</span>
                  <span className="text-sm font-bold text-green-600">${change.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}

          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0 || isCheckingOut || (paymentMethod === 'CASH' && Number(cashReceived) < totalAmount)}
            className="w-full py-4 bg-[#E84C3D] text-white rounded-xl font-bold text-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isCheckingOut ? 'Processing...' : `Pay $${totalAmount.toFixed(2)}`}
          </button>
        </div>
      </div>

      {/* KHQR MODAL */}
      {qrData && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
            <h3 className="text-xl font-bold mb-4 text-black">Scan to Pay</h3>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrData.qrString} alt="KHQR" className="w-full h-auto mb-4 rounded-lg" />
            <p className="text-xl font-bold text-[#E84C3D] mb-4">${qrData.totalAmount.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mb-6">Awaiting payment confirmation...</p>
            <button onClick={() => setQrData(null)} className="text-gray-500 hover:text-gray-800">Cancel</button>
          </div>
        </div>
      )}

      {/* HIDDEN RECEIPT (For Printing) */}
      <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-4 text-black" style={{ width: '80mm', margin: '0 auto' }}>
        {lastOrder && (
          <div className="font-mono text-sm">
            <div className="text-center mb-4">
              <h1 className="text-xl font-bold">{store?.name}</h1>
              <p className="text-xs">{store?.domain}</p>
              <p className="text-xs mt-2">{new Date(lastOrder.date).toLocaleString()}</p>
              <p className="text-xs">Order ID: {lastOrder.orderId}</p>
            </div>
            
            <div className="border-t border-b border-black py-2 mb-2">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left">
                    <th>Item</th>
                    <th className="text-center">Qty</th>
                    <th className="text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {lastOrder.items && lastOrder.items.length > 0 ? lastOrder.items.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-1 break-words max-w-[40mm]">{getProductName(item)}</td>
                      <td className="py-1 text-center">{item.quantity}</td>
                      <td className="py-1 text-right">${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={3} className="text-center">Items printed</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between font-bold mb-2">
              <span>TOTAL</span>
              <span>${lastOrder.totalAmount.toFixed(2)}</span>
            </div>

            {lastOrder.paymentMethod === 'CASH' ? (
              <>
                <div className="flex justify-between text-xs">
                  <span>CASH</span>
                  <span>${Number(lastOrder.cashReceived).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>CHANGE</span>
                  <span>${Number(lastOrder.changeGiven).toFixed(2)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-xs">
                <span>PAID VIA</span>
                <span>KHQR</span>
              </div>
            )}

            <div className="text-center mt-6 text-xs">
              <p>Thank you for shopping with us!</p>
              <p className="mt-2">Powered by ShoppingOT POS</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
