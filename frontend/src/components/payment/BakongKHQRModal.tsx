'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from 'react';
import { X, CheckCircle2 } from 'lucide-react';

interface BakongKHQRModalProps {
  qrString: string;
  amount: number;
  currency: string;
  merchantName?: string;
  isPaid: boolean;
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
  onClose,
  onSuccessClose,
  onSimulatePay
}: BakongKHQRModalProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 mins

  useEffect(() => {
    if (isPaid || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaid, timeLeft]);

  const handleCloseClick = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancel = () => {
    onClose();
  };

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
          style={{ width: '330px', height: '479px', fontFamily: '"Nunito Sans", sans-serif', boxShadow: '0 0 16px rgba(0,0,0,0.1)' }}
        >
          {/* Header */}
          <div className="h-[57px] bg-[#E1232E] w-full shrink-0 flex items-center justify-between px-4 relative z-10">
            <span className="text-white font-bold tracking-wider">KHQR</span>
            <button onClick={handleCloseClick} className="text-white/80 hover:text-white transition-colors">
              <X size={24} />
            </button>
            {/* Downward Tail */}
            <div className="absolute top-full right-0 border-t-[20px] border-t-[#E1232E] border-l-[28px] border-l-transparent pointer-events-none"></div>
          </div>

          {/* Body */}
          <div className="flex-1 flex flex-col pt-[38px] pb-[38px] px-[48px] relative z-0">

            {/* Text Alignment Left strictly enforced */}
            <div className="text-left w-full mb-auto">
              <div className="text-[#000000] text-[14px] font-normal leading-none mb-2 truncate">{merchantName}</div>
              <div className="flex items-baseline gap-1">
                <span className="text-[#000000] text-[31px] font-bold leading-none tracking-[0px]">{amount.toFixed(2)}</span>
                <span className="text-[#000000] text-[14px] font-normal leading-none tracking-[0px]">{currency}</span>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="w-full aspect-square relative mt-4 mx-auto max-w-[234px] flex items-center justify-center bg-white">
              <QRCodeSVG value={qrString} size={234} />

              {/* Center Coin Badge */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[42px] h-[42px] bg-[#000000] rounded-full flex items-center justify-center border-[3px] border-[#FFFFFF] box-content">
                <span className="text-white font-bold text-xl leading-none pt-0.5">$</span>
              </div>
            </div>

          </div>

          {/* Overlays inside the card structure */}

          {/* Cancel Confirmation */}
          {showCancelConfirm && !isPaid && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-200">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Payment?</h3>
              <p className="text-sm text-gray-500 mb-8">Are you sure you want to cancel this transaction?</p>
              <div className="flex w-full gap-3">
                <button onClick={() => setShowCancelConfirm(false)} className="flex-1 py-3 bg-gray-100 text-gray-900 font-bold rounded-xl hover:bg-gray-200">No</button>
                <button onClick={confirmCancel} className="flex-1 py-3 bg-[#E1232E] text-white font-bold rounded-xl hover:bg-red-700">Yes</button>
              </div>
            </div>
          )}

          {/* Success Modal */}
          {isPaid && (
            <div className="absolute inset-0 bg-white z-30 flex flex-col items-center justify-center p-8 text-center animate-in fade-in slide-in-from-bottom-8 duration-500">
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={48} className="text-green-500" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful</h3>
              <p className="text-sm text-gray-500 mb-8">Your transaction has been verified.</p>
              <button onClick={onSuccessClose || onClose} className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black shadow-lg">
                Continue
              </button>
            </div>
          )}

        </div>

        {/* Floating Details (Outside Card) */}
        <div className="w-[330px] mt-6 flex flex-col gap-3">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex items-center justify-between text-white/90 text-sm shadow-lg border border-white/5">
            <span className="font-medium">Expires in</span>
            <span className="font-bold tracking-widest font-mono">{formatTime(timeLeft)}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex items-center justify-between text-white/90 text-sm shadow-lg border border-white/5">
            <span className="font-medium">Status</span>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
              </span>
              <span className="font-semibold text-blue-100">Waiting...</span>
            </div>
          </div>
        </div>

        {/* DEV ONLY: Simulate Webhook Button */}
        {onSimulatePay && !isPaid && (
          <button
            onClick={onSimulatePay}
            className="mt-4 bg-[#E1232E] text-white text-xs font-bold uppercase tracking-widest py-2 px-6 rounded-full hover:bg-red-700 shadow-[0_0_15px_rgba(225,35,46,0.5)] border border-red-500/50"
          >
            [DEV] Simulate Payment
          </button>
        )}

      </div>
    </div>
  );
}
