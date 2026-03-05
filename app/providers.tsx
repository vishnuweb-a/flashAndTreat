'use client';

import { InsforgeBrowserProvider } from '@insforge/nextjs';
import { insforge } from '@/src/lib/insforge';

export function InsforgeProvider({ children }: { children: React.ReactNode }) {
  return (
    <InsforgeBrowserProvider client={insforge as any} afterSignInUrl="/">
      {children}
    </InsforgeBrowserProvider>
  );
}
