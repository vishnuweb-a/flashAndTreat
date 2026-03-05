'use client';

import { useEffect, useState } from 'react';
import { insforge } from '@/src/lib/insforge';
import { useUser } from '@insforge/nextjs';
import { Navbar } from '@/src/components/Navbar';
import { ListingCard } from '@/src/components/ListingCard';
import { BuyModal } from '@/src/components/BuyModal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Package, Search } from 'lucide-react';

const CATEGORIES = ['All', 'Electronics', 'Books', 'Clothes', 'Stationery', 'Sports', 'Furniture', 'Other'];

export default function SellPage() {
  const { user } = useUser();
  const router = useRouter();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchListings();
    if (user) checkAdmin();
  }, [user]);

  const checkAdmin = async () => {
    const { data } = await insforge.database.from('users').select('is_admin').eq('id', user!.id).maybeSingle();
    if (data?.is_admin) setIsAdmin(true);
  };

  const fetchListings = async () => {
    setLoading(true);
    try {
      const { data } = await insforge.database
        .from('marketplace_listings')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false });
      if (data) setListings(data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this listing from the marketplace?')) return;
    await insforge.database.from('marketplace_listings').delete().eq('id', id);
    setListings(prev => prev.filter(l => l.id !== id));
  };

  const handleBuySuccess = () => {
    setSelectedListing(null);
    setSuccessMsg('🎉 Order placed! Coordinate the pickup with the seller.');
    fetchListings();
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const filtered = listings.filter(l => {
    const matchCategory = activeCategory === 'All' || l.category === activeCategory;
    const matchSearch = !searchQuery || l.title.toLowerCase().includes(searchQuery.toLowerCase()) || l.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans">
      <Navbar onPostClick={() => router.push('/')} />

      <main className="max-w-6xl mx-auto px-4 py-12 sm:px-6 pb-24 sm:pb-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <Package className="w-6 h-6 text-emerald-400" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white">Campus Sell</h1>
            </div>
            <p className="text-slate-400 text-sm">Buy & sell items you no longer need, from campus to campus.</p>
          </div>

          {user && (
            <Link
              href="/sell/new"
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all active:scale-[0.97] shrink-0"
            >
              <Plus className="w-5 h-5" /> Sell an Item
            </Link>
          )}
        </div>

        {/* Success toast */}
        {successMsg && (
          <div className="mb-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-emerald-400 font-medium text-sm">
            {successMsg}
          </div>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-4 py-2 text-sm font-semibold rounded-full border transition-all ${activeCategory === cat
                ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.3)]'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(n => <div key={n} className="h-72 rounded-3xl bg-slate-800/60" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-slate-500">
            <p className="text-6xl mb-4">🛍️</p>
            <p className="text-lg font-medium text-slate-400">No items found</p>
            <p className="text-sm mt-1">Be the first to sell something!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                currentUserId={user?.id}
                isAdmin={isAdmin}
                onBuy={setSelectedListing}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {selectedListing && (
        <BuyModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onSuccess={handleBuySuccess}
        />
      )}
    </div>
  );
}
