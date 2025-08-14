import { headers } from 'next/headers';
import type { Guest } from '@/lib/google-sheets';
import Link from 'next/link';
import Script from 'next/script';

export const dynamic = 'force-dynamic';

export default async function InvitePixelPage({ params, searchParams }: { params: Promise<{ guestId: string }>, searchParams?: Promise<{ [k: string]: string | string[] | undefined }> }) {
  const { guestId } = await params;
  const sp = (await (searchParams || Promise.resolve({}))) as { [k: string]: string | string[] | undefined };
  const acceptedParam = sp?.accepted === '1';

  let guest: Guest | null = null;
  if (guestId) {
    const h = await headers();
    const host = h.get('x-forwarded-host') || h.get('host');
    const proto = h.get('x-forwarded-proto') || 'http';
    const origin = host ? `${proto}://${host}` : '';
    const res = await fetch(`${origin}/api/guests?id=${encodeURIComponent(guestId)}`, { headers: { Accept: 'application/json' }, cache: 'no-store' });
    if (res.ok) {
      const data = await res.json().catch(() => null);
      guest = data?.guest || null;
    }
  }

  return (
    <div className="pixel-page pixel-crt" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      {guest ? (
        <div className="pixel-card" style={{ maxWidth: 700, width: '100%', padding: 24, background: '#0e1530', color: '#e6f0ff' }}>
          <div className="card-header" style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: 28, margin: 0 }}>Dear {guest.name},</h1>
            <p style={{ marginTop: 10, opacity: .9 }}>Press Start to celebrate!</p>
          </div>

          <div className="card-body" style={{ marginTop: 16, textAlign: 'center' }}>
            <h2 style={{ fontSize: 16, margin: 0 }}>Our little hero</h2>
            <img className="celebrant-name" src="/celebrant-name.png" alt="Celebrant name" style={{ width: 320, maxWidth: '100%', imageRendering: 'pixelated', margin: '8px auto' }} />
            <h2 style={{ fontSize: 16, margin: 0 }}>is turning one!</h2>
          </div>

          {guest.isGodparent && !guest.godparentAcceptedAt && !acceptedParam && (
            <div className="pixel-panel" style={{ background: '#0b1124', padding: 16, marginTop: 16 }}>
              <h3 style={{ marginTop: 0 }}>Quest: Become Godparent</h3>
              <p>We would be honored to have you as Ninong/Ninang. If you accept, please confirm your full legal name for the dedication certificate.</p>
              <form id="accept-form" action="/api/godparent-accept" method="POST" style={{ display: 'grid', justifyItems: 'center', gap: 8 }}>
                <input type="hidden" name="uniqueId" value={guest.uniqueId} />
                <label htmlFor="fullName" style={{ width: '100%', maxWidth: 320, textAlign: 'left', fontSize: 12, opacity: .8 }}>Full legal name</label>
                <input id="fullName" name="fullName" required className="pixel-input" placeholder="Full legal name" style={{ width: '100%', maxWidth: 320, padding: 10, border: '4px solid #1e2a56', background: '#0a0f1f', color: '#e6f0ff' }} />
                <button type="submit" name="accept" value="yes" className="pixel-btn" style={{ marginTop: 6 }}>
                  ▶ I accept to be Godparent
                </button>
              </form>
            </div>
          )}

          <div className="party-details" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 16 }}>
            <div><strong>Date</strong><p>Oct 11, 2025</p></div>
            <div><strong>Time</strong><p>3:00 PM</p></div>
            <div><strong>Location</strong><p>TBA</p></div>
          </div>

          <div id="countdown" style={{ marginTop: 16, textAlign: 'center' }}>
            <h3>Countdown</h3>
            <div id="timer" style={{ fontSize: 20 }}></div>
          </div>

          {(!guest.isGodparent || guest.godparentAcceptedAt || acceptedParam) && (guest.status === 'Pending' ? (
            <div className="pixel-panel" style={{ background: '#0b1124', padding: 16, marginTop: 16, textAlign: 'center' }}>
              <h3>Will you be joining us?</h3>
              <form id="rsvp-form" action="/api/rsvp" method="POST" style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                <input type="hidden" name="uniqueId" value={guest.uniqueId} />
                <button type="submit" name="status" value="Confirmed" className="pixel-btn">▶ I’m attending</button>
                <button type="submit" name="status" value="Declined" className="pixel-btn" style={{ background: '#6e2237' }}>✖ Can’t make it</button>
              </form>
            </div>
          ) : (
            <div className="pixel-panel" style={{ background: '#0b1124', padding: 16, marginTop: 16 }}>
              <h3>Thank you for your response!</h3>
              <p>Status: <strong>{guest.status}</strong></p>
            </div>
          ))}

          <div className="gift-note" style={{ marginTop: 16, textAlign: 'center' }}>
            Your presence is the most precious gift we could ask for. If you wish to bless Lauan further, we would deeply appreciate monetary gifts for his future needs or gift checks from department stores. 💙
          </div>
        </div>
      ) : (
        <div className="pixel-card" style={{ maxWidth: 700, width: '100%', padding: 24, background: '#0e1530', color: '#e6f0ff', textAlign: 'center' }}>
          <h1>Invitation Not Found</h1>
          <p>Sorry, we couldn’t find your invitation. Please check the link and try again.</p>
          <p><Link href="/">Go back</Link></p>
        </div>
      )}
      <Script id="invite-scripts-pixel" strategy="afterInteractive">
        {`
          (function(){
            const partyDate = '2025-10-11T15:00:00';
            const countDownDate = new Date(partyDate).getTime();
            const timerElement = document.getElementById('timer');
            if (timerElement) {
              const x = setInterval(function() {
                const now = new Date().getTime();
                const distance = countDownDate - now;
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                timerElement.innerHTML = days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's';
                if (distance < 0) { clearInterval(x); timerElement.innerHTML = 'It\'s party time!'; }
              }, 1000);
            }
            const af = document.getElementById('accept-form');
            if (af) {
              af.addEventListener('submit', async (e) => {
                e.preventDefault();
                const data = new FormData(af);
                const submitter = e.submitter;
                if (submitter && submitter.name) { data.append(submitter.name, submitter.value || 'yes'); } else { data.append('accept', 'yes'); }
                const res = await fetch(af.getAttribute('action') || '/api/godparent-accept', { method: 'POST', body: data, headers: { Accept: 'application/json' } });
                if (res.ok) {
                  const url = new URL(location.href); url.searchParams.set('accepted', '1'); location.href = url.toString();
                } else { const t = await res.text().catch(()=>'' ); alert(t || 'Failed to accept godparent role'); }
              });
            }
            const rf = document.getElementById('rsvp-form');
            if (rf) {
              rf.addEventListener('submit', async (e) => {
                e.preventDefault();
                const data = new FormData(rf);
                const submitter = e.submitter;
                if (submitter && submitter.name) { data.append(submitter.name, submitter.value); }
                const res = await fetch(rf.getAttribute('action') || '/api/rsvp', { method: 'POST', body: data, headers: { Accept: 'application/json' } });
                if (res.ok) { const json = await res.json().catch(() => null); if (json?.ok) { const params = new URLSearchParams(location.search); const uid = params.get('uniqueId') || '${guest?.uniqueId || ''}'; const redirectUrl = '/thank-you?uniqueId=' + encodeURIComponent(uid) + '&status=' + encodeURIComponent(json.status); location.href = redirectUrl; } else { location.href = '/thank-you'; } }
                else { const t = await res.text().catch(()=>'' ); alert(t || 'Failed to submit RSVP'); }
              });
            }
          })();
        `}
      </Script>
    </div>
  );
}

