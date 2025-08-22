"use client";
import { useEffect, useState } from 'react';

interface Settings {
  partyDateDisplay: string;
  partyTimeDisplay: string;
  locationDisplay: string;
  giftNote: string;
  countdownISO: string;
  eventTitle: string;
  celebrantName: string;
  celebrantImageUrl: string;
  venueAddress: string;
  venueMapUrl: string;
  dressCode: string;
  registryNote: string;
  rsvpDeadlineISO: string;
  hostNames: string;
  themeName: string;
  backgroundImageUrl: string;
  accentColor: string;
  invitationTemplate: string;
}

interface SettingsPanelProps {
  sectionCard: string;
  inputClass: string;
  textMuted: string;
  btnPrimary: string;
}

export function SettingsPanel({ sectionCard, inputClass, textMuted, btnPrimary }: SettingsPanelProps) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [hint, setHint] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/settings', { headers: { Accept: 'application/json' } });
        const json = await res.json();
        if (json?.settings) setSettings(json.settings);
      } catch {}
    })();
  }, []);

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setHint('');
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'content-type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(settings),
      });
      const json = await res.json().catch(() => null);
      if (res.ok) {
        setSettings(json.settings);
        setHint('Saved.');
      } else {
        setHint(json?.error || 'Failed to save settings');
      }
    } finally {
      setSaving(false);
    }
  }

  if (!settings) {
    return (
      <section className={`${sectionCard} border rounded-xl p-4 space-y-4`}>
        <h2 className="text-lg font-medium">Settings</h2>
        <div className={`${textMuted}`}>Loading…</div>
      </section>
    );
  }

  return (
    <section className={`${sectionCard} border rounded-xl p-4 space-y-4`}>
      <h2 className="text-lg font-medium">Settings</h2>
      <form onSubmit={onSave} className="space-y-6">
        {/* Template & Theme */}
        <fieldset className="grid md:grid-cols-3 gap-4">
          <legend className={`text-sm ${textMuted}`}>Template & Theme</legend>
          <div>
            <label className={`block text-xs mb-1 ${textMuted}`}>Template</label>
            <input className={`${inputClass} w-full`} value={settings.invitationTemplate} onChange={(e) => setSettings({ ...settings, invitationTemplate: e.target.value })} placeholder="classic" />
          </div>
          <div>
            <label className={`block text-xs mb-1 ${textMuted}`}>Theme Name</label>
            <input className={`${inputClass} w-full`} value={settings.themeName} onChange={(e) => setSettings({ ...settings, themeName: e.target.value })} />
          </div>
          <div>
            <label className={`block text-xs mb-1 ${textMuted}`}>Accent Color</label>
            <input className={`${inputClass} w-full`} value={settings.accentColor} onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })} placeholder="#2563eb" />
          </div>
          <div className="md:col-span-3">
            <label className={`block text-xs mb-1 ${textMuted}`}>Background Image URL</label>
            <input className={`${inputClass} w-full`} value={settings.backgroundImageUrl} onChange={(e) => setSettings({ ...settings, backgroundImageUrl: e.target.value })} placeholder="/pattern.png or https://..." />
          </div>
        </fieldset>

        {/* Event Basics */}
        <fieldset className="grid md:grid-cols-3 gap-4">
          <legend className={`text-sm ${textMuted}`}>Event Basics</legend>
          <div>
            <label className={`block text-xs mb-1 ${textMuted}`}>Event Title</label>
            <input className={`${inputClass} w-full`} value={settings.eventTitle} onChange={(e) => setSettings({ ...settings, eventTitle: e.target.value })} placeholder="First Birthday" />
          </div>
          <div>
            <label className={`block text-xs mb-1 ${textMuted}`}>Celebrant Name</label>
            <input className={`${inputClass} w-full`} value={settings.celebrantName} onChange={(e) => setSettings({ ...settings, celebrantName: e.target.value })} />
          </div>
          <div>
            <label className={`block text-xs mb-1 ${textMuted}`}>Celebrant Image URL</label>
            <input className={`${inputClass} w-full`} value={settings.celebrantImageUrl} onChange={(e) => setSettings({ ...settings, celebrantImageUrl: e.target.value })} placeholder="/celebrant-name.png or https://..." />
          </div>
          <div>
            <label className={`block text-xs mb-1 ${textMuted}`}>Party Date (display)</label>
            <input className={`${inputClass} w-full`} value={settings.partyDateDisplay} onChange={(e) => setSettings({ ...settings, partyDateDisplay: e.target.value })} />
          </div>
          <div>
            <label className={`block text-xs mb-1 ${textMuted}`}>Party Time (display)</label>
            <input className={`${inputClass} w-full`} value={settings.partyTimeDisplay} onChange={(e) => setSettings({ ...settings, partyTimeDisplay: e.target.value })} />
          </div>
          <div>
            <label className={`block text-xs mb-1 ${textMuted}`}>Location (display)</label>
            <input className={`${inputClass} w-full`} value={settings.locationDisplay} onChange={(e) => setSettings({ ...settings, locationDisplay: e.target.value })} />
          </div>
        </fieldset>

        {/* Venue & Logistics */}
        <fieldset className="grid md:grid-cols-3 gap-4">
          <legend className={`text-sm ${textMuted}`}>Venue & Logistics</legend>
          <div className="md:col-span-2">
            <label className={`block text-xs mb-1 ${textMuted}`}>Venue Address</label>
            <input className={`${inputClass} w-full`} value={settings.venueAddress} onChange={(e) => setSettings({ ...settings, venueAddress: e.target.value })} />
          </div>
          <div>
            <label className={`block text-xs mb-1 ${textMuted}`}>Venue Map URL</label>
            <input className={`${inputClass} w-full`} value={settings.venueMapUrl} onChange={(e) => setSettings({ ...settings, venueMapUrl: e.target.value })} placeholder="https://maps.google.com/..." />
          </div>
          <div>
            <label className={`block text-xs mb-1 ${textMuted}`}>Dress Code</label>
            <input className={`${inputClass} w-full`} value={settings.dressCode} onChange={(e) => setSettings({ ...settings, dressCode: e.target.value })} />
          </div>
          <div>
            <label className={`block text-xs mb-1 ${textMuted}`}>Countdown ISO DateTime</label>
            <input className={`${inputClass} w-full`} value={settings.countdownISO} onChange={(e) => setSettings({ ...settings, countdownISO: e.target.value })} placeholder="2025-10-11T15:00:00" />
          </div>
          <div>
            <label className={`block text-xs mb-1 ${textMuted}`}>RSVP Deadline (ISO)</label>
            <input className={`${inputClass} w-full`} value={settings.rsvpDeadlineISO} onChange={(e) => setSettings({ ...settings, rsvpDeadlineISO: e.target.value })} placeholder="2025-09-20" />
          </div>
        </fieldset>

        {/* Messaging */}
        <fieldset className="grid md:grid-cols-2 gap-4">
          <legend className={`text-sm ${textMuted}`}>Messaging</legend>
          <div>
            <label className={`block text-xs mb-1 ${textMuted}`}>Hosts</label>
            <input className={`${inputClass} w-full`} value={settings.hostNames} onChange={(e) => setSettings({ ...settings, hostNames: e.target.value })} placeholder="Allan & Gia" />
          </div>
          <div>
            <label className={`block text-xs mb-1 ${textMuted}`}>Registry Note</label>
            <textarea className={`${inputClass} w-full min-h-24`} value={settings.registryNote} onChange={(e) => setSettings({ ...settings, registryNote: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className={`block text-xs mb-1 ${textMuted}`}>Gift Note</label>
            <textarea className={`${inputClass} w-full min-h-28`} value={settings.giftNote} onChange={(e) => setSettings({ ...settings, giftNote: e.target.value })} />
          </div>
        </fieldset>

        <div className="md:col-span-2 flex items-center gap-3">
          <button type="submit" disabled={saving} className={btnPrimary}>{saving ? 'Saving…' : 'Save Settings'}</button>
          {hint ? <span className={`${textMuted} text-sm`}>{hint}</span> : null}
        </div>
      </form>
    </section>
  );
}

