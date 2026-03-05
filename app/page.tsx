'use client';

import { useEffect, useState } from 'react';
import { useUser, SignInButton, SignUpButton } from '@insforge/nextjs';
import { insforge } from '../src/lib/insforge';
import { Navbar } from '../src/components/Navbar';
import { FavorCard } from '../src/components/FavorCard';
import { PostFavorModal } from '../src/components/PostFavorModal';
import { Zap, Star, MessageSquare } from 'lucide-react';

interface Favor {
  id: string;
  requester_id: string;
  title: string;
  bounty: string;
  location: string;
  status: string;
  created_at: string;
}

export default function Home() {
  const [favors, setFavors] = useState<Favor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoaded } = useUser();

  const fetchFavors = async () => {
    if (!user) return;
    setIsLoading(true);
    const { data, error } = await insforge.database
      .from('favors')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setFavors(data as Favor[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchFavors();

      const setupRealtime = async () => {
        await insforge.realtime.connect();
        const { ok } = await insforge.realtime.subscribe('favors');

        if (ok) {
          insforge.realtime.on('INSERT_favor', (payload: any) => {
            if (payload.status === 'active') {
              setFavors(prev => {
                if (prev.some(f => f.id === payload.id)) return prev;
                return [payload, ...prev];
              });
            }
          });

          insforge.realtime.on('UPDATE_favor', (payload: any) => {
            if (payload.status !== 'active') {
              setFavors(prev => prev.filter(f => f.id !== payload.id));
            } else {
              setFavors(prev => prev.map(f => f.id === payload.id ? { ...f, ...payload } : f));
            }
          });
        }
      };

      setupRealtime();

      return () => {
        insforge.realtime.unsubscribe('favors');
        insforge.realtime.disconnect();
      };
    }
  }, [user]);

  const handleClaim = async (id: string) => {
    if (!user) {
      alert("Please log in to claim a favor!");
      return;
    }
    await insforge.database
      .from('favors')
      .update({ status: 'claimed', claimer_id: user.id })
      .eq('id', id);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  // --- LANDING PAGE FOR UNAUTHENTICATED USERS ---
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-blue-500/30 overflow-x-hidden">
        <Navbar onPostClick={() => { }} />

        {/* HERO SECTION */}
        <div className="relative pt-16 pb-20 sm:pt-24 sm:pb-32">
          {/* Background glows */}
          <div className="absolute top-0 right-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 text-center z-10">
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-5 sm:mb-8 leading-tight">
              Campus Favors,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                Done in a Flash.
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
              The real-time barter and favor board for college students. Post what you need, claim what you can do, and earn Belief Stars.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12 sm:mb-20 px-2">
              <SignUpButton>
                <button className="rounded-full bg-blue-600 hover:bg-blue-500 text-white px-7 py-3.5 sm:px-8 sm:py-4 font-bold text-base sm:text-lg transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] active:scale-95 w-full sm:w-auto">
                  Get Started Now
                </button>
              </SignUpButton>
              <SignInButton>
                <button className="rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-7 py-3.5 sm:px-8 sm:py-4 font-bold text-base sm:text-lg transition-all active:scale-95 w-full sm:w-auto">
                  Login to Account
                </button>
              </SignInButton>
            </div>

            {/* App mockup — hidden on very small phones to avoid overflow */}
            <div className="hidden sm:block relative mx-auto w-full max-w-4xl rounded-3xl border border-slate-800 bg-slate-900/50 p-2 shadow-2xl shadow-blue-900/20 backdrop-blur-xl aspect-[16/9] md:aspect-[21/9] overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
              <div className="w-full h-full rounded-2xl bg-slate-950 border border-slate-800 flex flex-col overflow-hidden relative">
                <div className="w-full h-12 border-b border-slate-800 flex items-center px-4 gap-2 bg-slate-900/50">
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                </div>
                <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 p-4 opacity-30 group-hover:opacity-50 transition-opacity duration-500">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 rounded-2xl bg-slate-800/80 border border-slate-700/50 p-3 flex flex-col gap-2">
                      <div className="h-5 w-3/4 bg-slate-700 rounded-md" />
                      <div className="h-3 w-1/2 bg-slate-700/50 rounded-md mt-auto" />
                      <div className="h-8 w-full bg-blue-600/20 border border-blue-500/30 rounded-xl" />
                    </div>
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="bg-slate-900/90 border border-slate-700/80 text-slate-200 px-5 py-2.5 rounded-full font-semibold tracking-wide shadow-2xl backdrop-blur-md flex items-center gap-2 text-sm">
                    <span>Application Snapshot</span>
                    <Zap className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FEATURES SECTION */}
        <div className="py-14 sm:py-24 bg-slate-900/50 border-y border-slate-800/80 relative">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
          <div className="mx-auto max-w-5xl px-4 sm:px-6 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-16 text-slate-100 tracking-tight">Powerful Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 transition-colors">
                <div className="w-11 h-11 sm:w-14 sm:h-14 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                  <Zap className="w-5 h-5 sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-slate-100">Real-Time Sync</h3>
                <p className="text-sm sm:text-base text-slate-400 leading-relaxed">Favors appear instantly without reloading the page.</p>
              </div>
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 transition-colors">
                <div className="w-11 h-11 sm:w-14 sm:h-14 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                  <Star className="w-5 h-5 sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-slate-100">Belief Stars</h3>
                <p className="text-sm sm:text-base text-slate-400 leading-relaxed">Earn trust by completing favors and building your reputation.</p>
              </div>
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 transition-colors sm:col-span-2 md:col-span-1">
                <div className="w-11 h-11 sm:w-14 sm:h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                  <MessageSquare className="w-5 h-5 sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-slate-100">Instant Chat</h3>
                <p className="text-sm sm:text-base text-slate-400 leading-relaxed">Coordinate privately using built-in chat.</p>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER / DEVELOPER COLUMN */}
        <footer className="py-12 bg-slate-950">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]">⚡</div>
              <span className="text-xl font-bold text-slate-100 tracking-tight">Campus Flash</span>
            </div>
            <div className="flex flex-col items-center md:items-end gap-3">
              <p className="font-semibold text-slate-300">Developed by Vishnu Bhardwaj</p>
              <div className="flex items-center gap-6 text-sm font-medium">
                <a href="https://github.com/vishnuweb-a" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-blue-400 transition-colors">GitHub</a>
                <a href="mailto:[vb16vishnu@gmail.com]" className="text-slate-500 hover:text-blue-400 transition-colors">Gmail</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // --- MAIN APP FOR AUTHENTICATED USERS ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans">
      <Navbar onPostClick={() => setIsModalOpen(true)} />

      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8 sm:px-6 pb-24 sm:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Live Favors Board ⚡
          </h1>
          <p className="text-lg text-slate-400">
            Help out a fellow student or ask for a hand.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : favors.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-12 text-center shadow-lg">
            <p className="text-slate-300 text-lg font-medium mb-2">No active favors right now.</p>
            <p className="text-slate-500">Be the first to ask for one! 🚀</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favors.map(favor => (
              <FavorCard key={favor.id} favor={favor} onClaim={handleClaim} />
            ))}
          </div>
        )}
      </main>

      <PostFavorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => setIsModalOpen(false)}
      />
    </div>
  );
}
