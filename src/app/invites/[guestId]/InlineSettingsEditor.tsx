"use client";
import { useEffect, useState } from 'react';

type Settings = {
  partyDateDisplay: string;
  partyTimeDisplay: string;
  dedicationTimeDisplay: string;
  birthdaySnackLocation: string;
  locationDisplay: string;
  // Editable labels
  dedicationTimeLabel: string;
  tableReadyLabel: string;
  birthdaySnackLocationLabel: string;
  locationLabel: string;
  giftNote: string;
  countdownISO: string;
  eventTitle?: string;
  celebrantName?: string;
  celebrantImageUrl?: string;
  venueAddress?: string;
  venueMapUrl?: string;
  dressCode?: string;
  registryNote?: string;
  rsvpDeadlineISO?: string;
  hostNames?: string;
  themeName?: string;
  backgroundImageUrl?: string;
  accentColor?: string;
  invitationTemplate?: string;
};

export default function InlineSettingsEditor({ initialSettings }: { initialSettings: Settings }) {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [hint, setHint] = useState<string>("");

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setHint("");
    try {
      const res = await fetch('/api/settings', { method: 'POST', headers: { 'content-type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(settings) });
      const json = await res.json().catch(() => null);
      if (res.ok) {
        setSettings(json.settings);
        setHint('Saved.');
        // Trigger a refresh to reflect new server-rendered settings
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      } else {
        setHint(json?.error || 'Failed to save');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border rounded-xl p-3" style={{ margin: '16px 0' }}>
      <details>
        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Customize invitation (admin only)</summary>
        <form onSubmit={onSave} className="grid md:grid-cols-3 gap-3" style={{ marginTop: 12 }}>
          <div>
            <label className="microcopy">Party Date (display)</label>
            <input className="invite-input" value={settings.partyDateDisplay} onChange={(e) => setSettings({ ...settings, partyDateDisplay: e.target.value })} />
          </div>
          <div>
            <label className="microcopy">Table's Ready (display)</label>
            <input className="invite-input" value={settings.partyTimeDisplay} onChange={(e) => setSettings({ ...settings, partyTimeDisplay: e.target.value })} />
          </div>
          <div>
            <label className="microcopy">Dedication Time (display)</label>
            <input className="invite-input" value={settings.dedicationTimeDisplay} onChange={(e) => setSettings({ ...settings, dedicationTimeDisplay: e.target.value })} />
          </div>
          <div>
            <label className="microcopy">Birthday Snack Location</label>
            <input className="invite-input" value={settings.birthdaySnackLocation} onChange={(e) => setSettings({ ...settings, birthdaySnackLocation: e.target.value })} />
          </div>
          <div>
            <label className="microcopy">Location (display)</label>
            <input className="invite-input" value={settings.locationDisplay} onChange={(e) => setSettings({ ...settings, locationDisplay: e.target.value })} />
          </div>
          <div>
            <label className="microcopy">Dedication Time Label</label>
            <input className="invite-input" value={settings.dedicationTimeLabel} onChange={(e) => setSettings({ ...settings, dedicationTimeLabel: e.target.value })} />
          </div>
          <div>
            <label className="microcopy">Table's Ready Label</label>
            <input className="invite-input" value={settings.tableReadyLabel} onChange={(e) => setSettings({ ...settings, tableReadyLabel: e.target.value })} />
          </div>
          <div>
            <label className="microcopy">Birthday Snack Location Label</label>
            <input className="invite-input" value={settings.birthdaySnackLocationLabel} onChange={(e) => setSettings({ ...settings, birthdaySnackLocationLabel: e.target.value })} />
          </div>
          <div>
            <label className="microcopy">Location Label</label>
            <input className="invite-input" value={settings.locationLabel} onChange={(e) => setSettings({ ...settings, locationLabel: e.target.value })} />
          </div>
          <div className="md:col-span-3">
            <label className="microcopy">Gift Note</label>
            <textarea className="invite-input" value={settings.giftNote} onChange={(e) => setSettings({ ...settings, giftNote: e.target.value })} />
          </div>
          <div>
            <label className="microcopy">Countdown ISO</label>
            <input className="invite-input" value={settings.countdownISO} onChange={(e) => setSettings({ ...settings, countdownISO: e.target.value })} placeholder="2025-10-11T15:00:00" />
          </div>
          <div>
            <label className="microcopy">Venue Address</label>
            <input className="invite-input" value={settings.venueAddress || ''} onChange={(e) => setSettings({ ...settings, venueAddress: e.target.value })} />
          </div>
          <div>
            <label className="microcopy">Venue Map URL</label>
            <input className="invite-input" value={settings.venueMapUrl || ''} onChange={(e) => setSettings({ ...settings, venueMapUrl: e.target.value })} />
          </div>
          <div>
            <label className="microcopy">Dress Code</label>
            <input className="invite-input" value={settings.dressCode || ''} onChange={(e) => setSettings({ ...settings, dressCode: e.target.value })} />
          </div>
          <div>
            <label className="microcopy">Hosts</label>
            <input className="invite-input" value={settings.hostNames || ''} onChange={(e) => setSettings({ ...settings, hostNames: e.target.value })} />
          </div>
          <div className="md:col-span-3 flex items-center gap-3">
            <button type="submit" disabled={saving} className="invite-button primary">{saving ? 'Saving…' : 'Save'}</button>
            {hint ? <span className="microcopy">{hint}</span> : null}
          </div>
        </form>
      </details>
    </div>
  );
}
