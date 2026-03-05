'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@insforge/nextjs';
import { insforge } from '@/src/lib/insforge';
import { Navbar } from '@/src/components/Navbar';
import Link from 'next/link';
import { MessageSquare, MapPin, Coins, CheckCircle, Star, PenLine, HeartHandshake } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Favor {
  id: string;
  requester_id: string;
  claimer_id: string | null;
  title: string;
  bounty: string;
  location: string;
  status: string;
  created_at: string;
}

interface CloseHelper {
  id: string;
  name: string;
  avatar_url: string;
  trust_score: number;
}

export default function AccountPage() {
  const { user, isLoaded } = useUser();
  const [requested, setRequested] = useState<Favor[]>([]);
  const [claimed, setClaimed] = useState<Favor[]>([]);
  const [closeHelpers, setCloseHelpers] = useState<CloseHelper[]>([]);
  const [loading, setLoading] = useState(true);
  const [trustScore, setTrustScore] = useState(0);
  const router = useRouter();

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const [reqRes, claimRes, trustRes] = await Promise.all([
        insforge.database.from('favors').select('*').eq('requester_id', user.id).order('created_at', { ascending: false }),
        insforge.database.from('favors').select('*').eq('claimer_id', user.id).order('created_at', { ascending: false }),
        insforge.database.from('users').select('trust_score').eq('id', user.id).maybeSingle()
      ]);

      const reqs = reqRes.data ? (reqRes.data as Favor[]) : [];
      setRequested(reqs);
      setClaimed(claimRes.data ? (claimRes.data as Favor[]) : []);

      // Default to 0 if not found
      const score = trustRes.data?.trust_score ?? 0;
      setTrustScore(score);

      setEditName(user.profile?.name || user.email?.split('@')[0] || '');
      setEditAvatarUrl(user.profile?.avatar_url || '');

      // Fetch helpers
      const completedFavors = reqs.filter(f => f.status === 'completed' && f.claimer_id);
      if (completedFavors.length > 0) {
        const claimerIds = Array.from(new Set(completedFavors.map(f => f.claimer_id)));
        const { data: helpers } = await insforge.database
          .from('users')
          .select('id, name, avatar_url, trust_score')
          .in('id', claimerIds);
        if (helpers) setCloseHelpers(helpers as CloseHelper[]);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      fetchData();
    }
  }, [user, isLoaded]);

  const handleConfirm = async (favorId: string) => {
    const { error } = await insforge.database.rpc('complete_favor', { target_favor_id: favorId });
    if (!error) {
      setRequested(prev => prev.map(f => f.id === favorId ? { ...f, status: 'completed' } : f));
      // Optionally refetch helpers in background
      fetchData();
    } else {
      alert("Failed to confirm: " + error.message);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    // Upsert into public.users to ensure names/avatars exist for Close Helpers listing
    await insforge.database.from('users').upsert([
      {
        id: user.id,
        name: editName,
        avatar_url: editAvatarUrl,
        trust_score: trustScore // Preserve existing score!
      }
    ]);

    setIsEditing(false);
    // Refresh page fully to update provider state
    window.location.reload();
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <p className="text-xl text-slate-300">Please sign in to view your account.</p>
        <Link href="/" className="text-blue-500 hover:underline">Go back home</Link>
      </div>
    );
  }

  const renderCard = (favor: Favor, isRequester: boolean) => {
    const isCompleted = favor.status === 'completed';

    return (
      <div key={favor.id} className={`relative overflow-hidden rounded-3xl border p-6 shadow-lg transition-all
        ${isCompleted
          ? 'bg-slate-900/40 border-slate-800/50 opacity-80'
          : 'bg-slate-900 border-slate-800 hover:bg-slate-800/80'
        }`}>

        {/* Celebration overlay for completed */}
        {isCompleted && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-8xl opacity-[0.06] select-none">🎉</span>
          </div>
        )}

        <div className="flex justify-between items-start mb-4 relative z-10">
          <h3 className={`font-semibold text-lg leading-tight ${isCompleted ? 'text-slate-500' : 'text-slate-100'}`}>
            {favor.title}
          </h3>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full border shrink-0 ml-3 ${favor.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
              favor.status === 'claimed' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                'bg-slate-700/40 text-slate-500 border-slate-700/40'
            }`}>
            {favor.status === 'claimed'
              ? (isRequester ? 'Awaiting Confirmation' : 'Pending Confirmation')
              : favor.status === 'completed' ? '✔ Completed' : favor.status}
          </span>
        </div>

        {/* Success banner shown when favor is fully completed */}
        {isCompleted && (
          <div className={`mb-4 flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium border
            ${isRequester
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
            <CheckCircle className="w-4 h-4 shrink-0" />
            {isRequester
              ? 'You confirmed this favor! A belief star was awarded. 🌟'
              : 'You helped out and received a belief star! 🎉'}
          </div>
        )}

        <div className={`flex gap-4 mb-4 text-sm relative z-10 ${isCompleted ? 'text-slate-600' : 'text-slate-400'}`}>
          <span className="flex items-center gap-1.5"><Coins className="w-4 h-4 text-amber-500/60" /> {favor.bounty}</span>
          <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-600" /> {favor.location}</span>
        </div>

        <div className="flex gap-3 relative z-10">
          {(favor.status === 'claimed' || favor.status === 'completed') && (
            <Link
              href={`/chat/${favor.id}`}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors
                ${isCompleted
                  ? 'bg-slate-800/30 border border-slate-700/30 text-slate-500 hover:text-slate-300'
                  : 'bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white'}`}
            >
              <MessageSquare className="w-4 h-4 hidden sm:block" /> Open Chat
            </Link>
          )}

          {isRequester && favor.status === 'claimed' && (
            <button
              onClick={() => handleConfirm(favor.id)}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-500/20 border border-amber-500/30 px-4 py-3 text-sm font-semibold text-amber-500 transition-colors hover:bg-amber-500 hover:text-white"
            >
              <CheckCircle className="w-4 h-4 hidden sm:block" /> Confirm & Reward ⭐
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-50">
      <Navbar onPostClick={() => router.push('/')} />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">

        {/* PROFILE HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12 bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-lg">
          <div className="flex items-center gap-6">
            {user.profile?.avatar_url ? (
              <img src={user.profile.avatar_url} alt="Avatar" className="w-20 h-20 rounded-full shadow-sm object-cover ring-2 ring-slate-800" />
            ) : (
              <div className="w-20 h-20 flex items-center justify-center bg-blue-600 text-white text-2xl font-bold rounded-full shadow-lg shadow-blue-500/20">
                {user.email?.[0].toUpperCase()}
              </div>
            )}

            {!isEditing ? (
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">
                  {user.profile?.name || user.email?.split('@')[0]}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400 shadow-amber-400/50" />
                  <span className="font-semibold text-amber-400">{trustScore} Belief Stars</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 flex-1 min-w-[250px]">
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="url"
                  value={editAvatarUrl}
                  onChange={e => setEditAvatarUrl(e.target.value)}
                  placeholder="Avatar Image URL (Optional)"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            )}
          </div>

          <div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-700 bg-slate-800/50 text-slate-300 font-medium hover:bg-slate-800 hover:text-white transition-colors"
              >
                <PenLine className="w-4 h-4" /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-full border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="px-5 py-2.5 rounded-full bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20 text-sm font-bold"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CLOSE HELPERS (PAST HELPERS) */}
        {closeHelpers.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <HeartHandshake className="w-5 h-5 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-100 tracking-tight">My Close Helpers</h2>
            </div>
            <p className="text-slate-400 mb-6 text-sm">People who have successfully completed favors for you before.</p>
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
              {closeHelpers.map(helper => (
                <div key={helper.id} className="min-w-[150px] bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-md flex flex-col items-center text-center hover:border-slate-700 transition-colors">
                  {helper.avatar_url ? (
                    <img src={helper.avatar_url} alt="" className="w-14 h-14 rounded-full mb-3 object-cover ring-2 ring-slate-800" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold mb-3 shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                      {helper.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <h4 className="font-semibold text-sm text-slate-200 truncate w-full">{helper.name}</h4>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-amber-500 mt-2 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                    <Star className="w-3 h-3 fill-amber-500" /> {helper.trust_score}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAVORS GRIDS */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mt-12">
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-slate-100 flex items-center gap-2">
              <span className="text-red-400">🆘</span> Favors I Need
            </h2>
            <div className="flex flex-col gap-4">
              {requested.length === 0 ? (
                <div className="p-10 border border-dashed border-slate-800 rounded-3xl bg-slate-900/30 text-center">
                  <p className="text-slate-400 text-lg">No favors requested yet.</p>
                </div>
              ) : requested.map(f => renderCard(f, true))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-6 text-slate-100 flex items-center gap-2">
              <span className="text-emerald-400">🙌</span> Favors I Got
            </h2>
            <div className="flex flex-col gap-4">
              {claimed.length === 0 ? (
                <div className="p-10 border border-dashed border-slate-800 rounded-3xl bg-slate-900/30 text-center">
                  <p className="text-slate-400 text-lg">You haven't claimed any favors yet!</p>
                </div>
              ) : claimed.map(f => renderCard(f, false))}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
