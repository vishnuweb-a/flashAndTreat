'use client';

import { useState } from 'react';
import { insforge } from '@/src/lib/insforge';
import { useRouter } from 'next/navigation';
import { Smartphone, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PhoneLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Format: +91XXXXXXXXXX
    const formatted = phone.startsWith('+') ? phone : `+91${phone.replace(/\s/g, '')}`;

    try {
      const { error: err } = await (insforge.auth as any).signInWithOtp?.({ phone: formatted })
        ?? await (insforge.auth as any).sendPhoneOtp?.({ phone: formatted })
        ?? { error: new Error('OTP via phone not configured in InsForge dashboard.') };

      if (err) throw err;
      setStep('otp');
    } catch (err: any) {
      // For platforms that don't support phone OTP natively, show a user-friendly message
      setError(err.message || 'Could not send OTP. Make sure your number is correct.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formatted = phone.startsWith('+') ? phone : `+91${phone.replace(/\s/g, '')}`;

    try {
      const { data, error: err } = await (insforge.auth as any).verifyPhoneOtp?.({ phone: formatted, otp })
        ?? await (insforge.auth as any).verifyOtp?.({ phone: formatted, token: otp, type: 'sms' })
        ?? { data: null, error: new Error('OTP verification not configured.') };

      if (err) throw err;
      if (data) router.push('/');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Back */}
        <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-white mb-8 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Logo area */}
        <div className="mb-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
            <Smartphone className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Phone Login</h1>
          <p className="text-slate-400 text-sm mt-2">
            {step === 'phone' ? 'Enter your mobile number to receive a one-time code' : `We sent a code to +91${phone}`}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Mobile Number</label>
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-transparent transition-all">
                  <div className="px-4 py-3 text-slate-400 text-sm font-semibold border-r border-slate-700 bg-slate-900 shrink-0">
                    🇮🇳 +91
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="9876543210"
                    maxLength={10}
                    required
                    className="flex-1 bg-transparent py-3 px-3 text-slate-100 placeholder-slate-500 outline-none text-sm"
                  />
                </div>
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={isLoading || phone.replace(/\s/g, '').length < 10}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(37,99,235,0.25)] active:scale-[0.98]"
              >
                {isLoading ? 'Sending...' : <><ArrowRight className="w-5 h-5" /> Send OTP</>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Enter 6-digit OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="• • • • • •"
                  maxLength={6}
                  required
                  className="w-full text-center text-2xl tracking-[0.5rem] font-bold bg-slate-950 border border-slate-700 rounded-xl py-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={isLoading || otp.length < 6}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(16,185,129,0.25)] active:scale-[0.98]"
              >
                <ShieldCheck className="w-5 h-5" /> {isLoading ? 'Verifying...' : 'Verify & Login'}
              </button>
              <button
                type="button"
                onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
                className="w-full text-sm text-slate-500 hover:text-white transition-colors py-2"
              >
                ← Change number
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          By continuing, you agree to the Campus Barter terms of service.
        </p>
      </div>
    </div>
  );
}
