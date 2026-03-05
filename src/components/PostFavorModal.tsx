import { useState } from 'react';
import { insforge } from '../lib/insforge';
import { X, Repeat } from 'lucide-react';
import { useUser } from '@insforge/nextjs';

interface PostFavorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PostFavorModal({ isOpen, onClose, onSuccess }: PostFavorModalProps) {
  const [isBarter, setIsBarter] = useState(false);
  const [title, setTitle] = useState('');
  const [bounty, setBounty] = useState('');
  const [itemOffered, setItemOffered] = useState('');
  const [itemSought, setItemSought] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user } = useUser();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const { error: dbError } = await insforge.database
        .from('favors')
        .insert([
          {
            title: isBarter ? `Trade: ${itemOffered} for ${itemSought}` : title,
            bounty: isBarter ? 'Barter' : bounty,
            location,
            status: 'active',
            requester_id: user?.id,
            is_barter: isBarter,
            item_offered: isBarter ? itemOffered : null,
            item_sought: isBarter ? itemSought : null
          }
        ]);

      if (dbError) throw dbError;

      setTitle('');
      setBounty('');
      setItemOffered('');
      setItemSought('');
      setLocation('');
      setIsBarter(false);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to post favor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl transition-all sm:my-8 text-left align-middle">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Post a Request ⚡</h2>

        {error && (
          <div className="mb-6 rounded-xl bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
            {error}
          </div>
        )}

        <div className="flex gap-2 mb-6 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => setIsBarter(false)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${!isBarter ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Standard Favor
          </button>
          <button
            onClick={() => setIsBarter(true)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${isBarter ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(79,70,229,0.3)]' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Repeat className="w-4 h-4" /> Barter Match
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {!isBarter ? (
            <>
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-1.5">
                  What do you need?
                </label>
                <input
                  id="title"
                  type="text"
                  required={!isBarter}
                  placeholder="e.g. Need a calculator for my mid-term"
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 py-3 px-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="bounty" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Reward / Bounty
                </label>
                <input
                  id="bounty"
                  type="text"
                  required={!isBarter}
                  placeholder="e.g. Will buy you a coffee"
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 py-3 px-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={bounty}
                  onChange={(e) => setBounty(e.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div className="bg-indigo-500/5 border border-indigo-500/20 p-4 rounded-xl -mt-2">
                <p className="text-xs text-indigo-300 mb-4 leading-relaxed">
                  Enter exactly what you have and what you want. We'll automatically look for a 3-way triangle loop if a direct trade isn't available!
                </p>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="itemOffered" className="block text-sm font-medium text-indigo-200 mb-1.5">
                      I am offering:
                    </label>
                    <input
                      id="itemOffered"
                      type="text"
                      required={isBarter}
                      placeholder="e.g. Graphic Calculator"
                      className="w-full rounded-xl bg-slate-950 border border-indigo-500/30 py-3 px-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      value={itemOffered}
                      onChange={(e) => setItemOffered(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="itemSought" className="block text-sm font-medium text-indigo-200 mb-1.5">
                      I am seeking:
                    </label>
                    <input
                      id="itemSought"
                      type="text"
                      required={isBarter}
                      placeholder="e.g. Python Scripting Help"
                      className="w-full rounded-xl bg-slate-950 border border-indigo-500/30 py-3 px-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      value={itemSought}
                      onChange={(e) => setItemSought(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-slate-300 mb-1.5">
              Where to meet?
            </label>
            <input
              id="location"
              type="text"
              required
              placeholder="e.g. Library 2nd Floor"
              className="w-full rounded-xl bg-slate-950 border border-slate-700 py-3 px-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`mt-4 w-full rounded-xl px-4 py-3.5 text-sm font-bold text-white transition-all active:scale-[0.98]
              ${isBarter
                ? 'bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-50'
                : 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-50'}`}
          >
            {isSubmitting ? 'Posting...' : (isBarter ? 'Post Barter Match' : 'Post Favor')}
          </button>
        </form>
      </div>
    </div>
  );
}
