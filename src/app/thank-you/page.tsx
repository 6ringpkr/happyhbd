import Link from 'next/link';
import { cookies, headers } from 'next/headers';
import type { Guest } from '@/lib/google-sheets';

export default async function ThankYouPage({ searchParams }: { searchParams?: Promise<{ [k: string]: string | string[] | undefined }> }) {
  const sp = (await (searchParams || Promise.resolve({}))) as { [k: string]: string | string[] | undefined };
  const uniqueId = typeof sp.uniqueId === 'string' ? sp.uniqueId : '';
  const status = (typeof sp.status === 'string' ? sp.status : '') as 'Pending' | 'Confirmed' | 'Declined' | '';
  let guest: Guest | null = null;
  if (uniqueId) {
    const h = await headers();
    const host = h.get('x-forwarded-host') || h.get('host');
    const proto = h.get('x-forwarded-proto') || 'http';
    const origin = host ? `${proto}://${host}` : '';
    const res = await fetch(`${origin}/api/guests?id=${encodeURIComponent(uniqueId)}`, { headers: { Accept: 'application/json' }, cache: 'no-store' });
    if (res.ok) {
      const data = await res.json().catch(() => null);
      guest = data?.guest || null;
    }
  }

  const isGodparent = !!guest?.isGodparent;
  const confirmed = status === 'Confirmed';

  // Load settings for display text
  let settings: { partyDateDisplay: string; partyTimeDisplay: string; dedicationTimeDisplay: string; birthdaySnackLocation: string; locationDisplay: string; dedicationTimeLabel: string; tableReadyLabel: string; birthdaySnackLocationLabel: string; locationLabel: string; giftNote: string } = {
    partyDateDisplay: 'Oct 11, 2025',
    partyTimeDisplay: '3:00 PM',
    dedicationTimeDisplay: '2:00 PM',
    birthdaySnackLocation: 'Main Hall',
    locationDisplay: 'TBA',
    dedicationTimeLabel: 'Dedication Time',
    tableReadyLabel: 'Table\'s Ready',
    birthdaySnackLocationLabel: 'Birthday Snack Location',
    locationLabel: 'Location',
    giftNote:
      'Your presence is the most precious gift we could ask for. If you wish to bless Lauan further, we would deeply appreciate monetary gifts for his future needs or gift checks from department stores. 💙',
  };
  try {
    const h = await headers();
    const host = h.get('x-forwarded-host') || h.get('host');
    const proto = h.get('x-forwarded-proto') || 'http';
    const origin = host ? `${proto}://${host}` : '';
    const resSettings = await fetch(`${origin}/api/settings`, { headers: { Accept: 'application/json' }, cache: 'no-store' });
    if (resSettings.ok) {
      const json = await resSettings.json().catch(() => null);
      if (json?.settings) settings = json.settings;
    }
  } catch {}

  const isAdmin = !!(await cookies()).get('admin_session');

  return (
    <div className="invite-page">
      <div className="card">
        {guest ? (
          <>
            <div className="card-header">
              <h1>Thank you, {guest.name}!</h1>
            </div>
            <div className="message">
              {confirmed ? (
                isGodparent ? (
                  <p>We are honored that you will be part of Lauan’s Dedication and 1st Birthday celebration. Your role as Ninong/Ninang means so much to our family.</p>
                ) : (
                  <p>We’re excited you’ll be joining us for Lauan’s 1st birthday celebration!</p>
                )
              ) : (
                <p>We understand you won’t be able to make it. Thank you for letting us know. You can change your response any time.</p>
              )}
            </div>

            {status ? (
              <div className={`status-badge status-${status.toLowerCase()}`}>Your Response: {status}</div>
            ) : null}

            <div className="qr-section">
              <h3><span className="material-symbols-outlined icon">qr_code</span> Save Your Invitation</h3>
              <p>Keep this QR code for quick access to your invitation any time:</p>
              <div className="qr-code">
                <img alt="Invitation QR Code" src={`/api/qr?url=/invites/${guest.uniqueId}&size=200`} width={200} height={200} style={{ borderRadius: 8 }} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: 12 }}>
                <a href={`/api/qr?url=/invites/${guest.uniqueId}&size=512`} download={`invitation-${guest.uniqueId}.png`} className="invite-button primary">
                  <span className="material-symbols-outlined">download</span> Download QR
                </a>
                <Link href={`/invites/${guest.uniqueId}`} className="invite-button confirm">
                  <span className="material-symbols-outlined">visibility</span> View Invitation
                </Link>
              </div>
            </div>

            <div className="party-details">
              <div className="detail-item"><strong><span className="material-symbols-outlined">event</span> Date</strong><p>{settings.partyDateDisplay}</p></div>
              <div className="detail-item"><strong><span className="material-symbols-outlined">schedule</span> {settings.dedicationTimeLabel}</strong><p>{settings.dedicationTimeDisplay}</p></div>
              <div className="detail-item"><strong><span className="material-symbols-outlined">schedule</span> {settings.tableReadyLabel}</strong><p>{settings.partyTimeDisplay}</p></div>
              <div className="detail-item"><strong><span className="material-symbols-outlined">location_on</span> {settings.birthdaySnackLocationLabel}</strong><p>{settings.birthdaySnackLocation}</p></div>
              <div className="detail-item"><strong><span className="material-symbols-outlined">location_on</span> {settings.locationLabel}</strong><p>{settings.locationDisplay}</p></div>
            </div>

            <div className="gift-note">
              {settings.giftNote}
            </div>
          </>
        ) : (
          <>
            <div className="card-header">
              <h1>Thank you!</h1>
            </div>
            <p>Your response has been recorded.</p>
            <div className="party-details">
              <div className="detail-item"><strong><span className="material-symbols-outlined">event</span> Date</strong><p>{settings.partyDateDisplay}</p></div>
              <div className="detail-item"><strong><span className="material-symbols-outlined">schedule</span> {settings.dedicationTimeLabel}</strong><p>{settings.dedicationTimeDisplay}</p></div>
              <div className="detail-item"><strong><span className="material-symbols-outlined">schedule</span> {settings.tableReadyLabel}</strong><p>{settings.partyTimeDisplay}</p></div>
              <div className="detail-item"><strong><span className="material-symbols-outlined">location_on</span> {settings.birthdaySnackLocationLabel}</strong><p>{settings.birthdaySnackLocation}</p></div>
              <div className="detail-item"><strong><span className="material-symbols-outlined">location_on</span> {settings.locationLabel}</strong><p>{settings.locationDisplay}</p></div>
            </div>
          </>
        )}

        {isAdmin ? (
          <div style={{ marginTop: 16 }}>
            <Link href="/" className="invite-button primary"><span className="material-symbols-outlined">home</span> Back to Home</Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}


