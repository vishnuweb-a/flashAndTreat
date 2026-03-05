import { MapPin, Coins } from 'lucide-react';

interface Favor {
  id: string;
  requester_id: string;
  title: string;
  bounty: string;
  location: string;
  status: string;
  created_at: string;
  is_barter?: boolean;
  item_offered?: string;
  item_sought?: string;
}

interface FavorCardProps {
  favor: Favor;
  onClaim: (id: string) => void;
}

export function FavorCard({ favor, onClaim }: FavorCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-3xl bg-slate-900 p-6 shadow-lg border border-slate-800 transition-all hover:bg-slate-800/80 hover:border-slate-700">
      <div className="flex flex-col gap-4 relative z-10">

        {/* Header: Title and Status */}
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-semibold text-xl text-slate-100 leading-tight">
            {favor.title}
          </h3>
          <span className="shrink-0 inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20">
            Active
          </span>
        </div>

        {/* Details: Bounty/Barter & Location */}
        <div className="flex flex-col gap-3 relative z-10 mt-2">
          {favor.is_barter ? (
            <div className="flex flex-col gap-1.5 self-start px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-sm">
              <div className="flex items-center gap-1.5 text-indigo-300">
                <span className="font-semibold text-indigo-400">Offers:</span> {favor.item_offered}
              </div>
              <div className="flex items-center gap-1.5 text-amber-300">
                <span className="font-semibold text-amber-500">Seeks:</span> {favor.item_sought}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 self-start px-3 py-1.5 rounded-lg">
              <Coins className="h-4 w-4" />
              <span className="font-medium">{favor.bounty}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <MapPin className="h-4 w-4 shrink-0 text-slate-500" />
            <span>{favor.location}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 relative z-10">
          <button
            onClick={() => onClaim(favor.id)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600/10 border border-blue-500/20 px-4 py-3 text-sm font-semibold text-blue-400 transition-all hover:bg-blue-600 hover:text-white hover:border-blue-500 active:scale-[0.98]"
          >
            I Got You
            <span className="text-lg leading-none">🤝</span>
          </button>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute -right-4 -top-8 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl group-hover:bg-blue-500/20 transition-colors pointer-events-none" />
    </div>
  );
}
