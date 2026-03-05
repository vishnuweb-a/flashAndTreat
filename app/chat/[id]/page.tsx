'use client';

import { useEffect, useState, useRef, use } from 'react';
import { useUser } from '@insforge/nextjs';
import { insforge } from '@/src/lib/insforge';
import { Navbar } from '@/src/components/Navbar';
import { Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  favor_id: string;
  sender_id: string;
  text: string;
  created_at: string;
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ChatPage({ params }: PageProps) {
  const { id: favorId } = use(params);
  const { user, isLoaded } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch past messages
  useEffect(() => {
    if (!user) return;

    const fetchMessages = async () => {
      const { data } = await insforge.database
        .from('messages')
        .select('*')
        .eq('favor_id', favorId)
        .order('created_at', { ascending: true });

      if (data) setMessages(data as Message[]);
    };

    fetchMessages();
  }, [user, favorId]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const setupRealtime = async () => {
      await insforge.realtime.connect();
      const channel = `messages:${favorId}`;
      const { ok } = await insforge.realtime.subscribe(channel);

      if (ok) {
        insforge.realtime.on('INSERT_message', (payload: any) => {
          setMessages(prev => {
            if (prev.some(m => m.id === payload.id)) return prev;
            return [...prev, payload];
          });
        });
      }
    };

    setupRealtime();

    return () => {
      insforge.realtime.unsubscribe(`messages:${favorId}`);
    };
  }, [user, favorId]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    setIsSending(true);

    await insforge.database.from('messages').insert([{
      favor_id: favorId,
      sender_id: user.id,
      text: newMessage.trim()
    }]);

    setNewMessage('');
    setIsSending(false);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-slate-50">
        <p className="text-xl text-slate-300">Please log in to chat.</p>
        <Link href="/" className="text-blue-500 hover:underline">Go back home</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-50 font-sans">
      <Navbar onPostClick={() => router.push('/')} />

      <main className="flex-1 flex flex-col max-w-3xl w-full mx-auto p-4 overflow-hidden relative">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/account" className="p-3 bg-slate-900 border border-slate-800 rounded-full shadow-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">Favor Chat</h1>
        </div>

        {/* Chat window */}
        <div className="flex-1 overflow-hidden bg-slate-900 rounded-3xl shadow-lg border border-slate-800 flex flex-col relative">

          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto flex flex-col gap-5 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="m-auto text-slate-500 text-sm bg-slate-800/50 px-6 py-3 rounded-full border border-slate-700">
                No messages yet. Say hi! 👋
              </div>
            ) : (
              messages.map(msg => {
                const isMe = msg.sender_id === user.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-md ${isMe
                      ? 'bg-blue-600 text-white rounded-br-none shadow-blue-900/20'
                      : 'bg-slate-800 border border-slate-700 text-slate-100 rounded-bl-none'
                      }`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md">
            <form onSubmit={sendMessage} className="flex gap-3">
              <input
                type="text"
                className="flex-1 rounded-full border border-slate-700 bg-slate-950 py-3.5 px-5 text-slate-100 placeholder-slate-500 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-shadow"
                placeholder="Type a message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
              />
              <button
                type="submit"
                disabled={isSending || !newMessage.trim()}
                className="rounded-full bg-blue-600 p-3.5 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 hover:shadow-blue-500/40 disabled:opacity-50 disabled:hover:bg-blue-600 disabled:hover:shadow-blue-500/20 transition-all active:scale-95"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
