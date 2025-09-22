"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AcceptForm({ uniqueId, onDone }: { uniqueId: string; onDone: (accepted: boolean) => void }) {
  const [fullName, setFullName] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(accept: boolean) {
    setBusy(true);
    const fd = new FormData();
    fd.set('uniqueId', uniqueId);
    if (accept) {
      if (!fullName.trim()) { alert('Please enter your full legal name'); setBusy(false); return; }
      fd.set('fullName', fullName.trim());
      fd.set('accept', 'yes');
    } else {
      fd.set('decline', 'yes');
    }
    const res = await fetch('/api/godparent-accept', { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
    if (res.ok) { onDone(accept); }
    else { const t = await res.text().catch(()=>''); alert(t || 'Failed to submit response'); }
    setBusy(false);
  }

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="fullName">Full legal name</Label>
        <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Juan Dela Cruz" />
        <p className="text-muted-foreground mt-1 text-xs">Used only for the dedication certificate.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => submit(true)} disabled={busy}>I accept to be Godparent</Button>
        <Button variant="outline" onClick={() => submit(false)} disabled={busy}>I can’t be a Godparent</Button>
      </div>
    </div>
  );
}
