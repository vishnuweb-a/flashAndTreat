'use client';

import { useState } from 'react';
import { insforge } from '../lib/insforge';
import { useUser } from '@insforge/nextjs';
import { X, CheckCircle, Smartphone, ExternalLink } from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  price: number;
  upi_id: string;
  seller_id: string;
  take_point: string;
}

interface Props {
  listing: Listing | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function BuyModal({ listing, onClose, onSuccess }: Props) {
  const { user } = useUser();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [error, setError] = useState('');

  if (!listing) return null;

  // Format UPI ID — if it looks like a 10-digit phone number, convert it to mobile@upi format
  const rawUpi = listing.upi_id.trim();
  const isPhone = /^\d{10}$/.test(rawUpi);
  const upiId = isPhone ? `${rawUpi}@paytm` : rawUpi;

  const tn = encodeURIComponent('Payment for: ' + listing.title);
  const pn = encodeURIComponent('Seller');

  // Proper Android Intent deep links — these actually launch the installed apps
  const makeIntentUrl = (pkg: string) =>
    `intent://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${pn}&am=${listing.price}&tn=${tn}&cu=INR#Intent;scheme=upi;package=${pkg};end`;

  const gpayIntentUrl = makeIntentUrl('com.google.android.apps.nbu.paisa.user');
  const phonepeIntentUrl = makeIntentUrl('com.phonepe.app');
  const paytmIntentUrl = makeIntentUrl('net.one97.paytm');
  const genericUpiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${pn}&am=${listing.price}&tn=${tn}&cu=INR`;

  const handleOpenPay = () => {
    setTimeout(() => setIsPaid(true), 2500);
  };


  const handleConfirm = async () => {
    if (!user) return;
    setIsConfirming(true);
    setError('');

    try {
      const { error: dbErr } = await insforge.database
        .from('marketplace_orders')
        .insert([{
          listing_id: listing.id,
          buyer_id: user.id,
          seller_id: listing.seller_id,
          amount: listing.price,
          status: 'payment_confirmed'
        }]);

      if (dbErr) throw dbErr;

      await insforge.database
        .from('marketplace_listings')
        .update({ status: 'reserved' })
        .eq('id', listing.id);

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to confirm order');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl text-left animate-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-500 hover:text-white p-1 transition-colors">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-1">Pay & Collect</h2>
        <p className="text-slate-400 text-sm mb-6">Tap your payment app to pay instantly</p>

        {/* Item Summary */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 mb-6 flex items-center justify-between">
          <div>
            <p className="text-slate-100 font-semibold">{listing.title}</p>
            <p className="text-slate-500 text-xs mt-1">📍 Pickup: {listing.take_point}</p>
            <p className="text-slate-500 text-xs mt-0.5">UPI: {upiId}</p>
          </div>
          <div className="text-3xl font-bold text-emerald-400">₹{listing.price}</div>
        </div>

        {/* Payment app buttons */}
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">Choose payment app</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <a
            href={gpayIntentUrl}
            onClick={handleOpenPay}
            className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all active:scale-[0.97] text-center no-underline"
          >
            <span className="text-2xl">🟢</span>
            <span className="text-sm font-bold text-white">Google Pay</span>
          </a>
          <a
            href={phonepeIntentUrl}
            onClick={handleOpenPay}
            className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all active:scale-[0.97] text-center no-underline"
          >
            <span className="text-2xl">🟣</span>
            <span className="text-sm font-bold text-white">PhonePe</span>
          </a>
          <a
            href={paytmIntentUrl}
            onClick={handleOpenPay}
            className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all active:scale-[0.97] text-center no-underline"
          >
            <span className="text-2xl">🔵</span>
            <span className="text-sm font-bold text-white">Paytm</span>
          </a>
          <a
            href={genericUpiUrl}
            onClick={handleOpenPay}
            className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all active:scale-[0.97] text-center no-underline"
          >
            <Smartphone className="w-6 h-6 text-slate-300" />
            <span className="text-sm font-bold text-white">Other UPI</span>
          </a>
        </div>


        {/* Confirm after payment */}
        {isPaid && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            Payment app opened! Tap confirm after completing the payment.
          </div>
        )}

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

        <button
          onClick={isPaid ? handleConfirm : () => setIsPaid(true)}
          disabled={isConfirming}
          className={`w-full py-4 rounded-xl font-bold text-white transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 ${isPaid
            ? 'bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
            : 'bg-slate-700 hover:bg-slate-600 border border-slate-600'
            }`}
        >
          <CheckCircle className="w-5 h-5" />
          {isConfirming ? 'Confirming...' : isPaid ? "I've Paid — Confirm Order" : 'Already Paid? Confirm'}
        </button>
      </div>
    </div>
  );
}
