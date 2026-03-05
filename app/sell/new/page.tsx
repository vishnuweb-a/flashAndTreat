'use client';

import { useState } from 'react';
import { insforge } from '@/src/lib/insforge';
import { useUser } from '@insforge/nextjs';
import { Navbar } from '@/src/components/Navbar';
import { useRouter } from 'next/navigation';
import { ArrowLeft, PackagePlus } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = ['Electronics', 'Books', 'Clothes', 'Stationery', 'Sports', 'Furniture', 'Other'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

export default function NewListingPage() {
  const { user } = useUser();
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    images: '',
    category: 'Electronics',
    condition: 'Good',
    take_point: '',
    upi_id: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    setError('');

    try {
      const { error: dbErr } = await insforge.database.from('marketplace_listings').insert([{
        seller_id: user.id,
        title: form.title.trim(),
        description: form.description.trim(),
        price: parseInt(form.price),
        images: form.images ? form.images.split(',').map(u => u.trim()).filter(Boolean) : [],
        category: form.category,
        condition: form.condition,
        take_point: form.take_point.trim(),
        upi_id: form.upi_id.trim(),
        status: 'available',
      }]);

      if (dbErr) throw dbErr;
      router.push('/sell');
    } catch (err: any) {
      setError(err.message || 'Failed to create listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Please <Link href="/auth/login" className="text-blue-400 underline">log in</Link> to list an item.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans">
      <Navbar onPostClick={() => router.push('/')} />

      <main className="max-w-2xl mx-auto px-4 py-12 sm:px-6">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/sell" className="p-2.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2"><PackagePlus className="w-7 h-7 text-emerald-400" /> List an Item</h1>
            <p className="text-slate-400 text-sm mt-1">Sell items you no longer need to fellow students</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-xl">

          <div className="grid gap-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Item Title *</label>
              <input name="title" required value={form.title} onChange={handleChange} placeholder="e.g. Casio Scientific Calculator" className="input-dark w-full" />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Describe the item, its condition, age, any defects..." className="input-dark w-full resize-none" />
            </div>

            {/* Price + Category row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Price (₹) *</label>
                <input name="price" required type="number" min="1" value={form.price} onChange={handleChange} placeholder="500" className="input-dark w-full" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Category *</label>
                <select name="category" value={form.category} onChange={handleChange} className="input-dark w-full">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Condition + Take Point row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Condition *</label>
                <select name="condition" value={form.condition} onChange={handleChange} className="input-dark w-full">
                  {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Pickup Point *</label>
                <input name="take_point" required value={form.take_point} onChange={handleChange} placeholder="e.g. Hostel A lobby" className="input-dark w-full" />
              </div>
            </div>

            {/* UPI ID */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Your UPI ID *</label>
              <input name="upi_id" required value={form.upi_id} onChange={handleChange} placeholder="yourname@upi" className="input-dark w-full" />
              <p className="text-xs text-slate-500 mt-1.5">Buyers will pay directly to this UPI ID</p>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Image URLs (comma separated)</label>
              <input name="images" value={form.images} onChange={handleChange} placeholder="https://....jpg, https://....png" className="input-dark w-full" />
              <p className="text-xs text-slate-500 mt-1.5">Paste image links to showcase your item</p>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? 'Publishing...' : '🚀 Publish Listing'}
          </button>
        </form>
      </main>

      <style>{`
        .input-dark {
          background: #020617;
          border: 1px solid #1e293b;
          color: #f1f5f9;
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          transition: all 0.15s ease;
          outline: none;
        }
        .input-dark::placeholder { color: #475569; }
        .input-dark:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.2); }
        select.input-dark option { background: #0f172a; }
      `}</style>
    </div>
  );
}
