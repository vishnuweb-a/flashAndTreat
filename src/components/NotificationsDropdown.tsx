'use client';

import { useEffect, useState, useRef } from 'react';
import { insforge } from '../lib/insforge';
import { Bell } from 'lucide-react';
import Link from 'next/link';

interface Notification {
  id: string;
  type: string;
  content: string;
  is_read: boolean;
  related_favor_id: string;
  created_at: string;
}

interface Props {
  userId: string;
}

export function NotificationsDropdown({ userId }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchNotifs = async () => {
      const { data } = await insforge.database
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) setNotifications(data as Notification[]);
    };

    fetchNotifs();

    const setupRealtime = async () => {
      await insforge.realtime.connect();
      const { ok } = await insforge.realtime.subscribe(`notifications:${userId}`);
      if (ok) {
        insforge.realtime.on('INSERT_notification', (payload: any) => {
          setNotifications(prev => {
            if (prev.some(n => n.id === payload.id)) return prev;
            return [payload, ...prev].slice(0, 10);
          });
        });
      }
    };

    setupRealtime();

    // Click outside to close
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      insforge.realtime.unsubscribe(`notifications:${userId}`);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userId]);

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    await insforge.database.from('notifications').update({ is_read: true }).eq('id', id);
    setIsOpen(false);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500 ring-2 ring-white" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white shadow-lg ring-1 ring-slate-200 overflow-hidden z-50">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-semibold text-slate-900">Notifications</h3>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                You're all caught up! ✨
              </div>
            ) : (
              notifications.map(n => (
                <Link
                  key={n.id}
                  href={`/chat/${n.related_favor_id}`}
                  onClick={() => markAsRead(n.id)}
                  className={`block p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!n.is_read ? 'bg-indigo-50/30' : ''}`}
                >
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <p className={`text-sm ${!n.is_read ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                        {n.content}
                      </p>
                      <span className="text-xs text-slate-400 mt-1 block">
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {!n.is_read && <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
