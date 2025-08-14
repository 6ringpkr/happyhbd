"use client";
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import Link from 'next/link';

interface HeaderProps {
  searchRaw: string;
  setSearchRaw: (value: string) => void;
  auto: boolean;
  setAuto: (value: boolean) => void;
  isRefreshing: boolean;
  refresh: () => void;
  lastUpdated: number | null;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  filtered: Array<{
    name: string;
    uniqueId: string;
    status: 'Pending' | 'Confirmed' | 'Declined';
    rsvpAt: string;
    isGodparent: boolean;
    godparentAcceptedAt: string;
    godparentFullName: string;
  }>;
  textMuted: string;
  textSecondary: string;
  borderCard: string;
  btnNeutral: string;
  inputClass: string;
}

export function Header({
  searchRaw,
  setSearchRaw,
  auto,
  setAuto,
  isRefreshing,
  refresh,
  lastUpdated,
  theme,
  setTheme,
  filtered,
  textMuted,
  textSecondary,
  borderCard,
  btnNeutral,
  inputClass
}: HeaderProps) {
  const isDark = theme === 'dark';
  const switchBase = isDark ? 'bg-[#141a3a] border-[#293057]' : 'bg-white border-[#d0d5e2]';
  const knobBase = isDark ? 'bg-[#7aa2ff]' : 'bg-[#334155]';

  return (
    <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <h1 className="text-xl font-semibold tracking-wide">Admin Dashboard</h1>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-auto">
          <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${textMuted}`}>🔎</span>
          <Input 
            value={searchRaw} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchRaw(e.target.value)} 
            placeholder="Search guests..." 
            className={`pl-9 pr-9 w-full sm:w-64 ${inputClass} focus-visible:ring-2 focus-visible:ring-[#4c6fff]`} 
          />
          {searchRaw ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearchRaw('')}
              className={`absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full flex items-center justify-center ${isDark ? 'bg-[#1a1f3a] text-[#cdd5ff]' : 'bg-[#e9edf7] text-[#334155]'}`}
            >×</button>
          ) : null}
        </div>
        <label className={`text-sm ${textMuted} flex items-center gap-2 px-2 py-1 rounded-lg border ${borderCard} ${isDark ? 'bg-[#0f1530]' : 'bg-white'}`}>
          <input 
            type="checkbox" 
            checked={auto} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { 
              setAuto(e.target.checked); 
              localStorage.setItem('admin:auto', e.target.checked ? '1' : '0'); 
            }} 
          /> Auto-refresh
        </label>
        <Button 
          className={`${btnNeutral} focus-visible:ring-2 focus-visible:ring-[#4c6fff]`} 
          variant="secondary" 
          onClick={refresh}
        >
          Refresh
        </Button>
        {isRefreshing ? <span className="text-xs text-gray-400" aria-live="polite">Refreshing…</span> : null}
        <span className={`text-xs ${textMuted}`} suppressHydrationWarning>
          Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '—'}
        </span>
        <Button
          className={`${btnNeutral} focus-visible:ring-2 focus-visible:ring-[#4c6fff]`}
          variant="secondary"
          onClick={() => { setSearchRaw(''); }}
        >Clear</Button>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${textMuted}`}>Theme</span>
          <button
            type="button"
            role="switch"
            aria-checked={isDark}
            aria-label="Toggle theme"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`relative w-12 h-6 rounded-full border ${switchBase} transition-colors`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full transition-transform ${knobBase} ${isDark ? 'translate-x-6' : 'translate-x-0'}`}
            />
          </button>
        </div>
        <Button
          className={`${btnNeutral} focus-visible:ring-2 focus-visible:ring-[#4c6fff]`}
          variant="secondary"
          onClick={() => {
            const header = ['name','uniqueId','status','rsvpAt','isGodparent','godparentAcceptedAt','invite'];
            const rows = filtered.map(g => [g.name, g.uniqueId, g.status, g.rsvpAt, g.isGodparent ? 'TRUE' : 'FALSE', g.godparentAcceptedAt, `${location.origin}/invites/${g.uniqueId}`]);
            const csv = [header, ...rows].map(r => r.map(v => `"${String(v ?? '').replace(/"/g,'""')}"`).join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `guests-${Date.now()}.csv`;
            a.click();
            URL.revokeObjectURL(a.href);
          }}
        >Export CSV</Button>
        <Link href="/" className={`px-3 py-2 rounded-lg border ${borderCard} bg-transparent ${textSecondary}`}>Logout</Link>
      </div>
    </header>
  );
}
