"use client";
import { Button } from '@/components/ui/button';

export function RsvpForm({ uniqueId }: { uniqueId: string }) {
  async function send(status: 'Confirmed' | 'Declined') {
    const fd = new FormData();
    fd.set('uniqueId', uniqueId);
    fd.set('status', status);
    const res = await fetch('/api/rsvp', { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
    if (res.ok) {
      const json = await res.json().catch(() => null);
      const url = new URL('/thank-you', location.origin);
      url.searchParams.set('uniqueId', uniqueId);
      if (json?.status) url.searchParams.set('status', json.status);
      location.href = url.toString();
    } else {
      const t = await res.text().catch(()=>'');
      alert(t || 'Failed to submit RSVP');
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => send('Confirmed')}>I’m attending</Button>
      <Button variant="outline" onClick={() => send('Declined')}>Can’t make it</Button>
    </div>
  );
}
