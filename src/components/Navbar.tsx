'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from '@insforge/nextjs';
import { NotificationsDropdown } from './NotificationsDropdown';
import { ShoppingBag } from 'lucide-react';

interface NavbarProps {
  onPostClick: () => void;
}

export function Navbar({ onPostClick }: NavbarProps) {
  const { user } = useUser();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-transform group-hover:scale-105">
              ⚡
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Campus Flash
            </span>
          </Link>

          {/* Sell Marketplace link */}
          <Link
            href="/sell"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" /> Sell
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <SignedOut>
            <div className="flex items-center gap-3">
              <Link href="/auth/phone-login" className="hidden sm:block text-sm font-semibold text-slate-400 hover:text-white transition-colors">
                📱 Phone Login
              </Link>
              <div className="flex items-center gap-3 [&>button]:text-sm [&>button]:font-semibold [&>button]:text-slate-300 hover:[&>button]:text-white transition-colors">
                <SignInButton />
                <SignUpButton />
              </div>
            </div>
          </SignedOut>

          <SignedIn>
            <button
              onClick={onPostClick}
              className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all active:scale-95"
            >
              <span className="hidden sm:inline">Post a Favor</span>
              <span className="sm:hidden">Post</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
            </button>
            <Link href="/account" className="text-sm font-semibold text-slate-300 hover:text-blue-400 transition-colors hidden sm:block">
              My Favors
            </Link>
            {user && <NotificationsDropdown userId={user.id} />}
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}

