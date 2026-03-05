'use client';

import { useEffect, useState } from 'react';
import { insforge } from '../lib/insforge';
import { X, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useUser } from '@insforge/nextjs';

export function CircularMatchModal() {
  const { user } = useUser();
  const [activeTrade, setActiveTrade] = useState<any>(null);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Listen for new trades involving me
    const setupRealtime = async () => {
      await insforge.realtime.connect();

      const { ok } = await insforge.realtime.subscribe('trades');
      if (ok) {
        insforge.realtime.on('INSERT_trades', (payload: any) => {
          if (payload.user_ids && payload.user_ids.includes(user.id)) {
            // New match found!
            setActiveTrade(payload);
            setHasAccepted(payload.accepted_by?.includes(user.id) || false);
          }
        });

        insforge.realtime.on('UPDATE_trades', (payload: any) => {
          if (payload.user_ids && payload.user_ids.includes(user.id)) {
            setActiveTrade(payload);
            setHasAccepted(payload.accepted_by?.includes(user.id) || false);
          }
        });
      }

      // Pre-fetch any active trades pending approval I am part of 
      const fetchExisting = async () => {
        const { data } = await insforge.database
          .from('trades')
          .select('*')
          .eq('status', 'pending_approval')
          .contains('user_ids', [user.id])
          .limit(1)
          .maybeSingle();

        if (data) {
          setActiveTrade(data);
          setHasAccepted(data.accepted_by?.includes(user.id) || false);
        }
      };
      fetchExisting();
    };

    setupRealtime();

    return () => {
      insforge.realtime.unsubscribe('trades');
    };
  }, [user]);

  const handleAccept = async () => {
    if (!activeTrade || !user) return;
    setIsAccepting(true);

    try {
      const { error } = await insforge.database.rpc('accept_trade', { target_trade_id: activeTrade.id });
      if (error) {
        console.error(error);
        alert("Failed to accept trade: " + error.message);
      } else {
        setHasAccepted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAccepting(false);
    }
  };

  if (!activeTrade || !user) {
    return null;
  }

  const acceptedCount = activeTrade.accepted_by ? activeTrade.accepted_by.length : 0;

  if (activeTrade.status === 'active') {
    // Trade is fully accepted!
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setActiveTrade(null)} />
        <div className="relative w-full max-w-sm rounded-3xl bg-emerald-900 border border-emerald-500/50 p-8 text-center shadow-[0_0_50px_rgba(16,185,129,0.3)] animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-emerald-100 mb-2">Trade Confirmed!</h2>
          <p className="text-emerald-300 text-sm mb-6">
            All 3 users have accepted the loop. Check your Active Favors to coordinate the meetup!
          </p>
          <button
            onClick={() => setActiveTrade(null)}
            className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-3 transition-colors"
          >
            Awesome
          </button>
        </div>
      </div>
    );
  }

  // Pending State
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-slate-900 border border-indigo-500/30 rounded-3xl p-8 shadow-[0_0_40px_rgba(79,70,229,0.2)] text-center animate-in zoom-in-95 duration-500 fade-in">
        <button
          onClick={() => setActiveTrade(null)}
          className="absolute right-4 top-4 text-slate-500 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mx-auto w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mb-6 ring-4 ring-indigo-500/10">
          <RefreshCw className="w-8 h-8 animate-spin-slow" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">⚡ Magic Match Found!</h2>
        <p className="text-indigo-200 text-sm leading-relaxed mb-6">
          The AI system found a 3-way circular loop where everyone gets what they want!
        </p>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 mb-8 relative overflow-hidden">
          {/* Abstract Triangle Visualization */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-indigo-500/20 rounded-full opacity-50" />
          <div className="relative z-10 flex flex-col gap-4 text-sm font-medium">
            <div className="flex justify-between items-center bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400">You Give:</span>
              <span className="text-white">Your Item</span>
            </div>
            <div className="w-px h-4 bg-indigo-500/30 mx-auto" />
            <div className="flex justify-between items-center bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400">You Get:</span>
              <span className="text-indigo-400 font-bold text-right leading-tight max-w-[150px]">What you asked for!</span>
            </div>
          </div>
        </div>

        {hasAccepted ? (
          <div className="w-full py-4 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-semibold flex flex-col gap-1 items-center">
            <span>Waiting for others...</span>
            <span className="text-xs text-indigo-400 font-normal">{acceptedCount}/3 Accepted</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <button
              onClick={handleAccept}
              disabled={isAccepting}
              className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isAccepting ? 'Accepting...' : `Accept 3-Way Trade (${acceptedCount}/3 ready)`}
            </button>
            <button
              onClick={() => setActiveTrade(null)}
              className="text-slate-500 text-sm hover:text-white transition-colors py-2"
            >
              Dismiss for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
