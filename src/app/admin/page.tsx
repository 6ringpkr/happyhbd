"use client";
import { useEffect, useMemo, useState, useCallback } from 'react';
import useSWR from 'swr';
import { Header } from './components/Header';
import { Stats } from './components/Stats';
import { InvitationsPanel } from './components/InvitationsPanel';
import { GuestsTable } from './components/GuestsTable';

type Guest = {
  name: string;
  uniqueId: string;
  status: 'Pending' | 'Confirmed' | 'Declined';
  rsvpAt: string;
  isGodparent: boolean;
  godparentAcceptedAt: string;
  godparentFullName: string;
};

export default function AdminPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [q, setQ] = useState('');
  const [auto, setAuto] = useState<boolean>(false);
  const [name, setName] = useState('');
  const [isGodparent, setIsGodparent] = useState(false);
  const [result, setResult] = useState('');
  const [genInviteUrl, setGenInviteUrl] = useState<string>('');
  const [genQrUrl, setGenQrUrl] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string>('');

  // Debounced search
  const [searchRaw, setSearchRaw] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'name'|'status'|'rsvpAt'>('name');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // SWR fetcher and data
  const fetcher = (url: string) => fetch(url, { headers: { Accept: 'application/json' } }).then((r) => r.json());
  const { data, mutate } = useSWR<{ guests: Guest[] }>(
    '/api/guests',
    fetcher,
    { refreshInterval: auto ? 10000 : 0, revalidateOnFocus: true }
  );

  // Theme
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const isDark = theme === 'dark';
  useEffect(() => {
    // set from localStorage after mount to avoid SSR/client mismatch
    setMounted(true);
    try {
      const savedTheme = (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } catch {}
  }, []);
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    } catch {}
  }, [theme, mounted]);

  // Bulk upload state
  const [bulkHint, setBulkHint] = useState<string>('');
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkBusy, setBulkBusy] = useState<boolean>(false);
  const [bulkDragOver, setBulkDragOver] = useState<boolean>(false);

  const refresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await mutate();
      setLastUpdated(Date.now());
    } finally {
      setIsRefreshing(false);
    }
  }, [mutate]);

  useEffect(() => {
    // initial load + load saved auto flag (client only)
    const saved = typeof window !== 'undefined' && localStorage.getItem('admin:auto') === '1';
    if (saved) setAuto(true);
    refresh();
  }, [refresh]);

  useEffect(() => {
    localStorage.setItem('admin:auto', auto ? '1' : '0');
  }, [auto]);

  // Sync SWR data into local state for existing render logic
  useEffect(() => {
    if (data?.guests) {
      setGuests(data.guests);
      setLoading(false);
    }
  }, [data]);

  useEffect(() => {
    const t = setTimeout(() => setQ(searchRaw), 200);
    return () => clearTimeout(t);
  }, [searchRaw]);

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    if (!text) return guests;
    return guests.filter((g) => JSON.stringify(g).toLowerCase().includes(text));
  }, [q, guests]);

  const ordered = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      let va = '';
      let vb = '';
      if (sortBy === 'name') { va = a.name.toLowerCase(); vb = b.name.toLowerCase(); }
      else if (sortBy === 'status') { va = a.status; vb = b.status; }
      else { va = a.rsvpAt || ''; vb = b.rsvpAt || ''; }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filtered, sortBy, sortDir]);

  const stats = useMemo(() => {
    let pending = 0, confirmed = 0, declined = 0, godparents = 0;
    for (const g of filtered) {
      if (g.status === 'Pending') pending++;
      else if (g.status === 'Confirmed') confirmed++;
      else if (g.status === 'Declined') declined++;
      if (g.isGodparent) godparents++;
    }
    return { pending, confirmed, declined, godparents };
  }, [filtered]);

  async function onGenerate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult('');
    setGenInviteUrl('');
    setGenQrUrl('');
    setIsGenerating(true);
    const fd = new FormData();
    fd.set('name', name);
    if (isGodparent) fd.set('isGodparent', 'on');
    const res = await fetch('/api/generate-invite', { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
    const json = await res.json().catch(() => null);
    if (res.ok) {
      const full = `${location.origin}${json.inviteUrl}`;
      setResult(`Created: ${full}`);
      setGenInviteUrl(full);
      setGenQrUrl(`/api/qr?url=${encodeURIComponent(json.inviteUrl)}&size=200`);
      setName('');
      setIsGodparent(false);
      refresh();
    } else {
      setResult(json?.error || 'Failed to generate invite');
    }
    setIsGenerating(false);
  }

  async function onBulkProcess() {
    try {
      setBulkHint('Processing CSV...');
      setBulkBusy(true);
      if (!bulkFile) { setBulkHint('Choose a CSV file first.'); return; }
      const text = await bulkFile.text();
      const rows = text.split(/\r?\n/).filter(Boolean);
      const header = (rows.shift() || '').split(',').map((s) => s.trim().toLowerCase());
      const idxName = header.indexOf('name');
      const idxGod = header.indexOf('isgodparent');
      if (idxName === -1) { setBulkHint('CSV missing "name" column.'); return; }
      const items = rows.map((r) => {
        const cols = r.split(',');
        return { name: (cols[idxName] || '').trim(), isGodparent: String(cols[idxGod] || '').trim().toLowerCase() === 'true' };
      }).filter((i) => i.name);
      if (!items.length) { setBulkHint('No valid rows found.'); return; }
      const res = await fetch('/api/bulk-invites', { method: 'POST', headers: { 'content-type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ items }) });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.links) {
        setBulkHint(`Created ${json.links.length} invites. Refreshing...`);
        await refresh();
        setBulkFile(null);
      } else {
        setBulkHint(json?.error || 'Bulk upload failed');
      }
    } finally {
      setBulkBusy(false);
    }
  }

  const rootClass = isDark
    ? 'min-h-screen bg-gradient-to-b from-[#0b1020] to-[#0c1224] text-[#e8ecff] p-6'
    : 'min-h-screen bg-gradient-to-b from-[#f6f7fb] to-[#eef1f8] text-[#0b1020] p-6';
  const statsCard = isDark ? 'bg-gradient-to-b from-[#121834] to-[#0e1530] border-[#293057]' : 'bg-white border-[#e5e7ef]';
  const sectionCard = isDark ? 'bg-[#0e1530] border-[#293057]' : 'bg-white border-[#e5e7ef]';
  const inputBase = isDark ? 'bg-[#0f1530] border-[#293057]' : 'bg-white border-[#d0d5e2] text-[#0b1020]';
  const theadBg = isDark ? 'bg-[#10173a]' : 'bg-[#f3f5fb]';
  const zebra = isDark ? 'odd:bg-[#0d1430] hover:bg-[#0f1838]' : 'odd:bg-[#f8fafc] hover:bg-[#eef2f7]';
  const borderCard = isDark ? 'border-[#293057]' : 'border-[#e5e7ef]';
  const textMuted = isDark ? 'text-gray-400' : 'text-slate-500';
  const textSecondary = isDark ? 'text-gray-300' : 'text-slate-700';
  const btnNeutral = `${isDark ? 'border-[#293057] bg-[#141a3a] hover:bg-[#101634] text-[#e8ecff]' : 'border-[#e5e7ef] bg-white hover:bg-[#f2f4f9] text-[#0b1020]'} h-9 px-3 text-sm rounded-lg`;
  const btnPrimary = `${isDark ? 'bg-[#1a2f6e] hover:bg-[#12225b] text-white border-[#3462ff]' : 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white border-[#2563eb]'} h-9 px-3 text-sm rounded-lg border`;
  const inputClass = `${inputBase} h-9 px-3 text-sm rounded-lg`;
  const tabListClass = `inline-flex rounded-lg border ${borderCard} overflow-hidden`;
  const tabTriggerClass = `px-3 py-1.5 text-sm transition-colors data-[state=active]:bg-[${isDark ? '#10183a' : '#e9edf7'}] data-[state=active]:text-[${isDark ? '#e8ecff' : '#0b1020'}]`;
  const textStrong = isDark ? 'text-white' : 'text-slate-900';

  return (
    <div className={rootClass} suppressHydrationWarning>
      <div className="max-w-6xl mx-auto space-y-5">
        <Header
          searchRaw={searchRaw}
          setSearchRaw={setSearchRaw}
          auto={auto}
          setAuto={setAuto}
          isRefreshing={isRefreshing}
          refresh={refresh}
          lastUpdated={lastUpdated}
          theme={theme}
          setTheme={setTheme}
          filtered={filtered}
          textMuted={textMuted}
          textSecondary={textSecondary}
          borderCard={borderCard}
          btnNeutral={btnNeutral}
          inputClass={inputClass}
        />

        <Stats
          stats={stats}
          statsCard={statsCard}
          textMuted={textMuted}
          textStrong={textStrong}
        />

        <InvitationsPanel
          name={name}
          setName={setName}
          isGodparent={isGodparent}
          setIsGodparent={setIsGodparent}
          isGenerating={isGenerating}
          onGenerate={onGenerate}
          result={result}
          genInviteUrl={genInviteUrl}
          genQrUrl={genQrUrl}
          bulkFile={bulkFile}
          setBulkFile={setBulkFile}
          bulkBusy={bulkBusy}
          bulkDragOver={bulkDragOver}
          setBulkDragOver={setBulkDragOver}
          onBulkProcess={onBulkProcess}
          bulkHint={bulkHint}
          theme={theme}
          inputClass={inputClass}
          textMuted={textMuted}
          textSecondary={textSecondary}
          btnPrimary={btnPrimary}
          btnNeutral={btnNeutral}
          borderCard={borderCard}
          sectionCard={sectionCard}
          tabListClass={tabListClass}
          tabTriggerClass={tabTriggerClass}
        />

        <GuestsTable
          loading={loading}
          ordered={ordered}
          expanded={expanded}
          setExpanded={setExpanded}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortDir={sortDir}
          setSortDir={setSortDir}
          copiedId={copiedId}
          setCopiedId={setCopiedId}
          theme={theme}
          borderCard={borderCard}
          theadBg={theadBg}
          zebra={zebra}
        />
      </div>
    </div>
  );
}


