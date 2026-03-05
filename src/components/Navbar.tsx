'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from '@insforge/nextjs';
import { NotificationsDropdown } from './NotificationsDropdown';
import { ShoppingBag, Home, User, Zap } from 'lucide-react';

interface NavbarProps {
  onPostClick: () => void;
}

export function Navbar({ onPostClick }: NavbarProps) {
  const { user } = useUser();
  const pathname = usePathname();

  return (
    <>
      {/* ── Top Navbar ── */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">

          {/* Logo + Desktop links */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-transform group-hover:scale-105">
                ⚡
              </div>
              <span className="text-xl font-bold tracking-tight text-white hidden sm:inline">Campus Flash</span>
            </Link>

            {/* Desktop: Sell link */}
            <Link
              href="/sell"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" /> Sell
            </Link>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <SignedOut>
              <div className="flex items-center gap-2">
                <Link href="/auth/phone-login" className="hidden sm:block text-sm font-semibold text-slate-400 hover:text-white transition-colors">
                  📱 Login
                </Link>
                <div className="flex items-center gap-2 [&>button]:text-sm [&>button]:font-semibold [&>button]:text-slate-300 hover:[&>button]:text-white transition-colors">
                  <SignInButton />
                  <SignUpButton />
                </div>
              </div>
            </SignedOut>

            <SignedIn>
              <button
                onClick={onPostClick}
                className="flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-2 sm:px-4 text-sm font-semibold text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:bg-blue-500 transition-all active:scale-95"
              >
                <span className="hidden sm:inline">Post a Favor</span>
                <span className="sm:hidden">Post</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
              </button>
              {/* Desktop: My Favors + Notifications */}
              <Link href="/account" className="text-sm font-semibold text-slate-300 hover:text-blue-400 transition-colors hidden sm:block">
                My Favors
              </Link>
              {user && <NotificationsDropdown userId={user.id} />}
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* ── Mobile Bottom Navigation Bar ── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-950/95 backdrop-blur-md pb-safe">
        <div className="flex items-center justify-around py-2 px-2">

          {/* Home */}
          <Link href="/" className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${pathname === '/' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}>
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Home</span>
          </Link>

          {/* Sell */}
          <Link href="/sell" className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${pathname?.startsWith('/sell') ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Sell</span>
          </Link>

          {/* Post Favor – center call-to-action */}
          <SignedIn>
            <button
              onClick={onPostClick}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-amber-400 hover:text-amber-300 transition-colors"
            >
              <Zap className="w-5 h-5" />
              <span className="text-[10px] font-semibold">Post</span>
            </button>
          </SignedIn>

          {/* My Favors */}
          <SignedIn>
            <Link href="/account" className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${pathname === '/account' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}>
              <User className="w-5 h-5" />
              <span className="text-[10px] font-semibold">My Favors</span>
            </Link>
          </SignedIn>

          <SignedOut>
            <Link href="/auth/phone-login" className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-slate-500 hover:text-slate-300 transition-colors">
              <User className="w-5 h-5" />
              <span className="text-[10px] font-semibold">Login</span>
            </Link>
          </SignedOut>

        </div>
      </div>

      {/* Spacer so content isn't hidden behind bottom nav on mobile */}
      <div className="sm:hidden h-16" />
    </>
  );
}
