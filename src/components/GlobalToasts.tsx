'use client';

import { useEffect, useState } from 'react';
import { insforge } from '../lib/insforge';
import { useUser } from '@insforge/nextjs';
import { X, Bell, Zap, MessageSquare, Repeat } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function GlobalToasts() {
  const { user } = useUser();
  const [toasts, setToasts] = useState<any[]>([]);
  const router = useRouter();

  const addToast = (toast: any) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((t) => [...t, { id, ...toast }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 5000);
  };

  useEffect(() => {
    const setupRealtime = async () => {
      await insforge.realtime.connect();

      // Listen for new active favors globally
      const { ok: okFavors } = await insforge.realtime.subscribe('favors');
      if (okFavors) {
        insforge.realtime.on('INSERT_favor', (payload: any) => {
          // Skip if I am the one who posted it
          if (payload.status === 'active' && payload.requester_id !== user?.id) {
            if (payload.is_barter) {
              // Barter offer notification
              addToast({
                title: 'Barter Offer Posted 🔄',
                message: `Offering ${payload.item_offered} for ${payload.item_sought}`,
                icon: <Repeat className="w-5 h-5 text-indigo-400" />,
                onClick: () => router.push('/')
              });
            } else {
              // Standard favor notification
              addToast({
                title: 'New Favor Needed! ⚡',
                message: payload.title,
                icon: <Zap className="w-5 h-5 text-amber-400" />,
                onClick: () => router.push('/')
              });
            }
          }
        });
      }

      // Listen for personal notifications if logged in
      if (user) {
        const { ok: okNotifs } = await insforge.realtime.subscribe(`notifications:${user.id}`);
        if (okNotifs) {
          insforge.realtime.on('INSERT_notification', (payload: any) => {
            // The trigger sets type to 'new_message' 
            if (payload.user_id === user.id) {
              addToast({
                title: payload.type === 'new_message' ? 'New Message 💬' : 'Notification 🔔',
                message: payload.content,
                icon: payload.type === 'new_message' ? <MessageSquare className="w-5 h-5 text-blue-400" /> : <Bell className="w-5 h-5 text-blue-400" />,
                onClick: payload.related_favor_id ? () => router.push(`/chat/${payload.related_favor_id}`) : undefined
              });
            }
          });
        }
      }
    };

    setupRealtime();

    return () => {
      insforge.realtime.unsubscribe('favors');
      if (user) insforge.realtime.unsubscribe(`notifications:${user.id}`);
    };
  }, [user]);

  // Don't render anything if there are no toasts
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-2xl flex items-start gap-4 min-w-[320px] max-w-[400px] animate-in slide-in-from-bottom-5 fade-in duration-300 cursor-pointer hover:bg-slate-800 hover:border-slate-600 transition-all"
          onClick={() => {
            if (t.onClick) t.onClick();
            setToasts(prev => prev.filter(x => x.id !== t.id));
          }}
        >
          <div className="shrink-0 pt-0.5 bg-slate-800 p-2 rounded-lg border border-slate-700">
            {t.icon}
          </div>
          <div className="flex-1">
            <h4 className="text-white font-bold text-sm mb-1">{t.title}</h4>
            <p className="text-slate-300 text-sm leading-snug">{t.message}</p>
          </div>
          <button
            className="text-slate-500 hover:text-white shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              setToasts(prev => prev.filter(x => x.id !== t.id));
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
