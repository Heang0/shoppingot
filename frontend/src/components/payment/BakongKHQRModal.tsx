'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from 'react';
import { X, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';

interface BakongKHQRModalProps {
  qrString: string;
  amount: number;
  currency: string;
  merchantName?: string;
  isPaid: boolean;
  locale?: string;
  onClose: () => void;
  onSuccessClose?: () => void;
  onSimulatePay?: () => void;
}

export default function BakongKHQRModal({
  qrString,
  amount,
  currency,
  merchantName = 'ShoppingOT Merchant',
  isPaid,
  locale = 'en',
  onClose,
  onSuccessClose,
}: BakongKHQRModalProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const isKm = locale === 'km';

  const khmerFont = { fontFamily: "var(--font-kantumruy), 'Kantumruy Pro', sans-serif" };
  const numFont = { fontFamily: '"Nunito Sans", "Inter", sans-serif' };

  const text = {
    cancelPayment: isKm ? 'បោះបង់ការទូទាត់?' : 'Cancel Payment?',
    cancelConfirm: isKm ? 'តើអ្នកប្រាកដជាចង់បោះបង់ប្រតិបត្តិការនេះមែនទេ?' : 'Are you sure you want to cancel this transaction?',
    no: isKm ? 'ទេ' : 'No, keep it',
    yes: isKm ? 'បាទ/ចាស, បោះបង់' : 'Yes, cancel',
    paymentSuccessful: isKm ? 'ការទូទាត់បានជោគជ័យ!' : 'Payment Successful!',
    verified: isKm ? 'ប្រតិបត្តិការរបស់អ្នកត្រូវបានផ្ទៀងផ្ទាត់និងបញ្ជាក់ដោយជោគជ័យ។' : 'Your payment has been verified and confirmed.',
    orderConfirmed: isKm ? 'ការបញ្ជាទិញបានបញ្ជាក់' : 'Order Confirmed',
    continue: isKm ? 'បន្ត' : 'Continue Shopping',
    expiresIn: isKm ? 'ផុតកំណត់ក្នុង' : 'Expires in',
    scanQR: isKm ? 'ស្កេនដើម្បីទូទាត់' : 'Scan to Pay',
    awaitingPayment: isKm ? 'កំពុងរង់ចាំការទូទាត់...' : 'Awaiting payment...',
    securePayment: isKm ? 'ការទូទាត់មានសុវត្ថិភាព' : 'Secure Payment',
  };

  useEffect(() => {
    if (isPaid || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [isPaid, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4">

      {/* Main Container */}
      <div className="relative flex flex-col items-center">

        {/* KHQR Card */}
        <div
          className="bg-white rounded-2xl relative overflow-hidden flex flex-col"
          style={{ width: '330px', height: '479px', fontFamily: isKm ? khmerFont.fontFamily : numFont.fontFamily, boxShadow: '0 0 16px rgba(0,0,0,0.1)' }}
        >
          {/* Header */}
          <div className="h-[57px] bg-[#E1232E] w-full shrink-0 flex items-center justify-end px-4 relative z-10">
            {/* Centered Logo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/logo/KHQR Logo.png" 
              alt="KHQR" 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 object-contain brightness-0 invert" 
            />
            
            <button onClick={() => setShowCancelConfirm(true)} className="text-white/80 hover:text-white transition-colors relative z-20">
              <X size={24} />
            </button>
            {/* Downward Tail */}
            <div className="absolute top-full right-0 border-t-[20px] border-t-[#E1232E] border-l-[28px] border-l-transparent pointer-events-none"></div>
          </div>

          {/* Body */}
          <div className="flex-1 flex flex-col pt-[38px] pb-[38px] px-[48px] relative z-0">

            {/* Text Alignment Left strictly enforced */}
            <div className="text-left w-full mb-auto">
              <div className="text-xs font-medium uppercase tracking-widest text-gray-500 mb-1" style={isKm ? khmerFont : numFont}>{text.scanQR}</div>
              <div className="flex items-baseline gap-1">
                <span className="text-[#000000] text-[31px] font-bold leading-none tracking-[0px]" style={numFont}>{amount.toFixed(2)}</span>
                <span className="text-[#000000] text-[14px] font-normal leading-none tracking-[0px]" style={numFont}>{currency}</span>
              </div>
              <div className="text-[#000000] text-[14px] font-normal mt-2 truncate" style={isKm ? khmerFont : numFont}>{merchantName}</div>
            </div>

            {/* Dashed Line Separator */}
            <div className="w-full border-t-[2px] border-dashed border-gray-300/80 my-2"></div>

            {/* QR Code Section */}
            <div className="w-full aspect-square relative mt-4 mx-auto max-w-[234px] flex items-center justify-center bg-white">
              <QRCodeSVG value={qrString} size={234} />

              {/* Center Coin Badge */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[42px] h-[42px] bg-[#000000] rounded-full flex items-center justify-center border-[3px] border-[#FFFFFF] box-content">
                <span className="text-white font-bold text-xl leading-none pt-0.5" style={numFont}>$</span>
              </div>
            </div>

          </div>

          {/* Overlays inside the card structure */}

          {showCancelConfirm && !isPaid && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-200">
              <h3 className="text-xl font-bold text-gray-900 mb-2" style={isKm ? khmerFont : numFont}>{text.cancelPayment}</h3>
              <p className="text-sm text-gray-500 mb-8" style={isKm ? khmerFont : numFont}>{text.cancelConfirm}</p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-900 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm"
                  style={isKm ? khmerFont : numFont}
                >
                  {text.no}
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-[#E1232E] text-white font-bold rounded-xl hover:bg-red-700 transition-colors text-sm"
                  style={isKm ? khmerFont : numFont}
                >
                  {text.yes}
                </button>
              </div>
            </div>
          )}

          {/* Success Overlay */}
          {isPaid && (
            <div className="absolute inset-0 bg-white z-30 flex flex-col items-center justify-center p-8 text-center">
              {/* Animated success ring */}
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle2 size={52} className="text-green-500" strokeWidth={1.8} />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-green-200 animate-ping opacity-30" />
              </div>

              <span className="inline-block bg-green-50 text-green-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3" style={numFont}>
                {text.orderConfirmed}
              </span>

              <h3
                className="text-2xl font-bold text-gray-900 mb-2"
                style={isKm ? khmerFont : numFont}
              >
                {text.paymentSuccessful}
              </h3>

              <p
                className="text-sm text-gray-500 mb-2 leading-relaxed"
                style={isKm ? khmerFont : numFont}
              >
                {text.verified}
              </p>

              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-8" style={numFont}>
                <ShieldCheck size={12} className="text-green-400" />
                <span>{text.securePayment}</span>
              </div>

              <button
                onClick={onSuccessClose || onClose}
                className="w-full py-4 bg-gray-900 hover:bg-black text-white font-semibold rounded-2xl transition-colors shadow-lg text-sm"
                style={isKm ? khmerFont : numFont}
              >
                {text.continue}
              </button>
            </div>
          )}
        </div>

        {/* Powered by tag */}
        <p className="text-white/30 text-xs mt-4 font-medium" style={numFont}>Powered by Bakong KHQR · NBC Cambodia</p>
      </div>
    </div>
  );
}
