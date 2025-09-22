"use client";
import useSWR from 'swr';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Shared Guest type from backend contract
export type Guest = {
  name: string;
  uniqueId: string;
  status: 'Pending' | 'Confirmed' | 'Declined';
  rsvpAt: string;
  isGodparent: boolean;
  godparentAcceptedAt: string;
  godparentFullName: string;
  godparentDeclinedAt?: string;
};

const fetcher = (url: string) => fetch(url, { headers: { Accept: 'application/json' } }).then(r => r.json());

export default function AdminV0Page() {
  const { data, mutate, isValidating } = useSWR<{ guests: Guest[] }>("/api/guests", fetcher, { refreshInterval: 0 });
  const [query, setQuery] = useState('');

  const guests = data?.guests ?? [];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return guests;
    return guests.filter(g => JSON.stringify(g).toLowerCase().includes(q));
  }, [guests, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">Manage invites, RSVPs, and godparents.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => mutate()}>Refresh</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Guests</CardTitle>
            <CardDescription>All tracked guests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{guests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Confirmed</CardTitle>
            <CardDescription>Guests attending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{guests.filter(g => g.status === 'Confirmed').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Godparents</CardTitle>
            <CardDescription>Marked as godparent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{guests.filter(g => g.isGodparent).length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Invitations</CardTitle>
          <CardDescription>Create and manage invitations</CardDescription>
        </CardHeader>
        <CardContent className="py-6">
          <Tabs defaultValue="single" className="w-full">
            <TabsList>
              <TabsTrigger value="single">Single</TabsTrigger>
              <TabsTrigger value="bulk">Bulk CSV</TabsTrigger>
            </TabsList>
            <TabsContent value="single" className="mt-4">
              <SingleInviteForm onCreated={() => mutate()} />
            </TabsContent>
            <TabsContent value="bulk" className="mt-4">
              <BulkInviteForm onProcessed={() => mutate()} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Guests</CardTitle>
          <CardDescription>Search and export guest list</CardDescription>
        </CardHeader>
        <CardContent className="py-6 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex-1">
              <Label htmlFor="q">Search</Label>
              <Input id="q" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, status, id..." />
            </div>
            <Button variant="outline" onClick={() => exportCsv(guests)}>Export CSV</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left">
                <tr>
                  <th className="p-2">Name</th>
                  <th className="p-2">Unique ID</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">RSVP At</th>
                  <th className="p-2">Godparent</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(isValidating && guests.length === 0) ? (
                  <tr><td className="p-3" colSpan={6}>Loading...</td></tr>
                ) : (
                  filtered.map(g => (
                    <tr key={g.uniqueId} className="border-b">
                      <td className="p-2">{g.name}</td>
                      <td className="p-2 font-mono text-xs">{g.uniqueId}</td>
                      <td className="p-2">{g.status}</td>
                      <td className="p-2">{g.rsvpAt || '-'}</td>
                      <td className="p-2">{g.isGodparent ? 'Yes' : 'No'}</td>
                      <td className="p-2">
                        <a className="text-primary underline" href={`/invites/${g.uniqueId}`} target="_blank" rel="noreferrer">Open invite</a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function exportCsv(guests: Guest[]) {
  const header = ['name','uniqueId','status','rsvpAt','isGodparent','godparentAcceptedAt','godparentFullName'];
  const rows = guests.map(g => [g.name, g.uniqueId, g.status, g.rsvpAt, String(g.isGodparent), g.godparentAcceptedAt, g.godparentFullName]);
  const csv = [header, ...rows].map(r => r.map(s => `"${String(s ?? '').replaceAll('"','""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'guests.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function SingleInviteForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('');
  const [isGodparent, setIsGodparent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setInviteUrl('');
    const fd = new FormData();
    fd.set('name', name);
    if (isGodparent) fd.set('isGodparent', 'on');
    const res = await fetch('/api/generate-invite', { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
    const json = await res.json().catch(() => null);
    setBusy(false);
    if (res.ok && json?.inviteUrl) {
      const full = `${location.origin}${json.inviteUrl}`;
      setInviteUrl(full);
      setName('');
      setIsGodparent(false);
      onCreated();
    } else {
      alert(json?.error || 'Failed to create invite');
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
      <div>
        <Label htmlFor="name">Guest name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required />
        <div className="mt-2 flex items-center gap-2 text-sm">
          <input id="isGodparent" type="checkbox" checked={isGodparent} onChange={(e) => setIsGodparent(e.target.checked)} className="size-4" />
          <label htmlFor="isGodparent">Mark as godparent</label>
        </div>
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={busy}>Create Invite</Button>
      </div>
      {inviteUrl ? (
        <div className="sm:col-span-3">
          <div className="text-sm">Created:</div>
          <a className="text-primary underline break-all" href={inviteUrl} target="_blank" rel="noreferrer">{inviteUrl}</a>
        </div>
      ) : null}
    </form>
  );
}

function BulkInviteForm({ onProcessed }: { onProcessed: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!file) { alert('Choose a CSV file'); return; }
    setBusy(true);
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    const header = (lines.shift() || '').toLowerCase();
    const cols = header.split(',').map(s => s.trim());
    const idxName = cols.indexOf('name');
    const idxGod = cols.indexOf('isgodparent');
    if (idxName === -1) { alert('CSV missing "name" column'); setBusy(false); return; }
    const items = lines.map(line => {
      const parts = line.split(',');
      const name = (parts[idxName] || '').trim();
      const godRaw = ((idxGod >= 0 ? parts[idxGod] : '') || '').trim().toLowerCase();
      const isGodparent = ['1','true','yes','on','y'].includes(godRaw);
      return { name, isGodparent };
    }).filter(i => i.name);
    const res = await fetch('/api/bulk-invites', { method: 'POST', headers: { 'content-type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ items }) });
    const json = await res.json().catch(() => null);
    setBusy(false);
    if (res.ok) { onProcessed(); alert(`Created ${json?.links?.length ?? 0} invites`); setFile(null); }
    else { alert(json?.error || 'Bulk upload failed'); }
  }

  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
      <div>
        <Label>CSV file</Label>
        <Input type="file" accept=".csv,text/csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <p className="text-muted-foreground mt-1 text-xs">Columns: name,isGodparent</p>
      </div>
      <div className="flex items-end">
        <Button onClick={submit} disabled={busy}>Process CSV</Button>
      </div>
    </div>
  );
}
