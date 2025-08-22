"use client";
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

  async function refresh() {
    const res = await fetch('/api/guests', { headers: { Accept: 'application/json' } });
    const json = await res.json().catch(() => null);
    if (json?.guests) setGuests(json.guests);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('admin:auto') === '1';
    setAuto(saved);
    if (saved) {
      const id = setInterval(refresh, 10000);
      return () => clearInterval(id);
    }
  }, []);

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    if (!text) return guests;
    return guests.filter((g) => JSON.stringify(g).toLowerCase().includes(text));
  }, [q, guests]);

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

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    setResult('');
    const fd = new FormData();
    fd.set('name', name);
    if (isGodparent) fd.set('isGodparent', 'on');
    const res = await fetch('/api/generate-invite', { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
    const json = await res.json().catch(() => null);
    if (res.ok) {
      setResult(`${location.origin}${json.inviteUrl}`);
      setName('');
      setIsGodparent(false);
      refresh();
    } else {
      setResult(json?.error || 'Failed to generate invite');
    }
  }

  return (
    <div className="min-h-screen bg-[#0b1020] text-[#e8ecff] p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          <div className="flex items-center gap-2">
            <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search guests..." className="w-64" />
            <label className="text-sm text-gray-400 flex items-center gap-2">
              <input type="checkbox" checked={auto} onChange={(e)=>{ setAuto(e.target.checked); localStorage.setItem('admin:auto', e.target.checked ? '1':'0'); }} /> Auto-refresh
            </label>
            <Button variant="secondary" onClick={refresh}>Refresh</Button>
            <a href="/" className="underline text-gray-300">Logout</a>
          </div>
        </header>

        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-3 bg-[#121834] border-[#293057]"><div className="text-gray-400 text-sm">Pending</div><div className="text-2xl font-bold">{stats.pending}</div></Card>
          <Card className="p-3 bg-[#121834] border-[#293057]"><div className="text-gray-400 text-sm">Confirmed</div><div className="text-2xl font-bold">{stats.confirmed}</div></Card>
          <Card className="p-3 bg-[#121834] border-[#293057]"><div className="text-gray-400 text-sm">Declined</div><div className="text-2xl font-bold">{stats.declined}</div></Card>
          <Card className="p-3 bg-[#121834] border-[#293057]"><div className="text-gray-400 text-sm">Godparents</div><div className="text-2xl font-bold">{stats.godparents}</div></Card>
        </section>

        <section className="bg-[#0e1530] border border-[#293057] rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Invitations</h2>
            <Tabs defaultValue="single">
              <TabsList>
                <TabsTrigger value="single">Single</TabsTrigger>
                <TabsTrigger value="bulk">Bulk</TabsTrigger>
              </TabsList>
              <TabsContent value="single">
                <form onSubmit={onGenerate} className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 items-center pt-3">
                  <Input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Enter Guest's Full Name" required />
                  <label className="text-sm text-gray-300 flex items-center gap-2"><input type="checkbox" checked={isGodparent} onChange={(e)=>setIsGodparent(e.target.checked)} /> Godparent / VIP</label>
                  <Button type="submit">Generate</Button>
                </form>
                {result ? <div className="text-gray-300 mt-2 break-all">{result}</div> : null}
              </TabsContent>
              <TabsContent value="bulk">
                <div className="text-gray-400 text-sm pt-3">Use the Bulk tab in a future step.</div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <section className="overflow-x-auto">
          <table className="min-w-full border border-[#293057] rounded-xl overflow-hidden">
            <thead className="bg-[#10173a]">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Godparent</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">RSVP</th>
                <th className="p-2 text-left">Accepted</th>
                <th className="p-2 text-left">Invite</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="p-3" colSpan={6}>Loading...</td></tr>
              ) : filtered.length ? filtered.map(g => (
                <tr key={g.uniqueId} className="border-t border-[#1a2147]">
                  <td className="p-2">{g.name}</td>
                  <td className="p-2">{g.isGodparent ? 'Yes' : 'No'}</td>
                  <td className="p-2">{g.status}</td>
                  <td className="p-2">{g.rsvpAt}</td>
                  <td className="p-2">{g.godparentAcceptedAt}</td>
                  <td className="p-2"><a className="underline" href={`/invites/${g.uniqueId}`} target="_blank" rel="noreferrer">/invites/{g.uniqueId}</a></td>
                </tr>
              )) : (
                <tr><td className="p-3" colSpan={6}>No guests</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}


