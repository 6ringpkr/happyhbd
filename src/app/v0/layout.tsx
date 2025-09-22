import type { ReactNode } from 'react';
import Link from 'next/link';

export default function V0Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="size-6 rounded bg-primary" />
            <span className="text-sm font-semibold tracking-wide">HBD · v0</span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/v0/admin" className="hover:underline">Admin</Link>
            <Link href="/" className="hover:underline">Legacy</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}
