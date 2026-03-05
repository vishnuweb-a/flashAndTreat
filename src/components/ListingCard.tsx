'use client';

import { useState } from 'react';
import { MapPin, Tag, Trash2, ShoppingCart } from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  condition: string;
  take_point: string;
  upi_id: string;
  status: string;
  seller_id: string;
}

interface Props {
  listing: Listing;
  currentUserId?: string;
  isAdmin?: boolean;
  onBuy: (listing: Listing) => void;
  onDelete: (id: string) => void;
}

const CONDITION_COLORS: Record<string, string> = {
  'New': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  'Like New': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'Good': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  'Fair': 'text-slate-400 bg-slate-700/40 border-slate-600/40',
};

export function ListingCard({ listing, currentUserId, isAdmin, onBuy, onDelete }: Props) {
  const [imgError, setImgError] = useState(false);
  const isOwner = currentUserId === listing.seller_id;
  const thumbnail = listing.images?.[0];

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-lg transition-all hover:border-slate-700 hover:shadow-slate-900/50">

      {/* Product Image */}
      <div className="h-48 w-full overflow-hidden bg-slate-800 relative flex-shrink-0">
        {thumbnail && !imgError ? (
          <img
            src={thumbnail}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-5xl bg-gradient-to-br from-slate-800 to-slate-900">
            📦
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-900/80 text-slate-300 border border-slate-700/60 backdrop-blur-sm">
            {listing.category}
          </span>
        </div>

        {/* Admin/Owner Delete */}
        {(isAdmin || isOwner) && (
          <button
            onClick={() => onDelete(listing.id)}
            className="absolute top-3 right-3 p-2 rounded-full bg-red-500/90 text-white hover:bg-red-400 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm shadow-lg"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col gap-3 p-5 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-100 text-base leading-snug">{listing.title}</h3>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border shrink-0 ${CONDITION_COLORS[listing.condition] || CONDITION_COLORS['Fair']}`}>
            {listing.condition}
          </span>
        </div>

        {listing.description && (
          <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">{listing.description}</p>
        )}

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-600" />
          <span className="truncate">{listing.take_point}</span>
        </div>
      </div>

      {/* Price + Buy */}
      <div className="flex items-center gap-3 px-5 pb-5 pt-0 justify-between mt-auto">
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-emerald-400">₹{listing.price}</span>
        </div>

        {isOwner ? (
          <span className="text-xs text-slate-500 font-medium px-3 py-2 rounded-xl border border-slate-800 bg-slate-800/40">
            Your Listing
          </span>
        ) : (
          <button
            onClick={() => onBuy(listing)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-bold text-white shadow-[0_0_12px_rgba(37,99,235,0.2)] transition-all active:scale-[0.97]"
          >
            <ShoppingCart className="w-4 h-4" /> Buy Now
          </button>
        )}
      </div>
    </div>
  );
}
