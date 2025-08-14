import { headers } from 'next/headers';
import type { Guest } from '@/lib/google-sheets';
import Link from 'next/link';
import Script from 'next/script';

export const dynamic = 'force-dynamic';

export default async function InvitePage({ params, searchParams }: { params: Promise<{ guestId: string }>, searchParams?: Promise<{ [k: string]: string | string[] | undefined }> }) {
  const { guestId } = await params;
  const sp = (await (searchParams || Promise.resolve({}))) as { [k: string]: string | string[] | undefined };
  const acceptedParam = sp?.accepted === '1';

  // Fetch guest via API to avoid bundling googleapis in page
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
    <div className="invite-page">
      {guest ? (
        <div className="card">
          <div className="card-header">
            <h1>Dear {guest.name},</h1>
            <p>You&apos;re invited to celebrate a very special milestone.</p>
          </div>

          <div className="card-body">
            <h2>Our little prince</h2>
            <img
              className="celebrant-name"
              src="/celebrant-name.png"
              alt="Celebrant name"
            />
            <h2>is turning one!</h2>
          </div>

          {guest.isGodparent && !guest.godparentAcceptedAt && !acceptedParam && (
            <div className="godparent-letter">
              <h3>A Special Request</h3>
              <p>We would be honored to have you as Ninong/Ninang. If you accept, please confirm your full legal name for the dedication certificate. Your information will remain private.</p>
              <form id="accept-form" action="/api/godparent-accept" method="POST" style={{ marginTop: '1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '.5rem', alignItems: 'center' }}>
                <input type="hidden" name="uniqueId" value={guest.uniqueId} />
                <div style={{ position: 'relative', maxWidth: 320, width: '100%' }}>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#666' }}>badge</span>
                  <label htmlFor="fullName" className="microcopy" style={{ display: 'block', textAlign: 'left', marginBottom: 4 }}>Full legal name</label>
                  <input id="fullName" type="text" name="fullName" placeholder="Full legal name" required style={{ padding: '.6rem', paddingLeft: 40, borderRadius: 8, border: '1px solid #d9dcff', maxWidth: 320, width: '100%' }} />
                  <div className="microcopy" style={{ marginTop: 6 }}>Used only for the dedication certificate.</div>
                </div>
                <button type="submit" name="accept" value="yes" className="invite-button confirm"><span className="material-symbols-outlined">check_circle</span> I accept to be Godparent</button>
              </form>
            </div>
          )}

          {guest.isGodparent && (guest.godparentAcceptedAt || acceptedParam) && (
            <div className="rsvp-confirmed">
              <h3><span className="material-symbols-outlined">celebration</span> Thank you for accepting to be Godparent!</h3>
              {guest.godparentAcceptedAt ? (<p><span className="material-symbols-outlined">event</span> Accepted on: <strong>{guest.godparentAcceptedAt}</strong></p>) : null}
              {guest.godparentFullName ? (<p><span className="material-symbols-outlined">badge</span> Full Name: <strong>{guest.godparentFullName}</strong></p>) : null}
            </div>
          )}

          <div className="party-details">
            <div className="detail-item"><strong><span className="material-symbols-outlined">event</span> Date</strong><p>Oct 11, 2025</p></div>
            <div className="detail-item"><strong><span className="material-symbols-outlined">schedule</span> Time</strong><p>3:00 PM</p></div>
            <div className="detail-item"><strong><span className="material-symbols-outlined">location_on</span> Location</strong><p>TBA</p></div>
          </div>

          <div id="countdown">
            <h3><span className="material-symbols-outlined">timer</span> Countdown to the party</h3>
            <div id="timer"></div>
          </div>

          <div className="gift-note">
            Your presence is the most precious gift we could ask for. If you wish to bless Lauan further, we would deeply appreciate monetary gifts for his future needs or gift checks from department stores. 💙
          </div>

          {(!guest.isGodparent || guest.godparentAcceptedAt || acceptedParam) && (guest.status === 'Pending' ? (
            <div className="rsvp-form">
              <h3><span className="material-symbols-outlined">rsvp</span> Will you be joining us?</h3>
              <form id="rsvp-form" action="/api/rsvp" method="POST">
                <input type="hidden" name="uniqueId" value={guest.uniqueId} />
                <button type="submit" name="status" value="Confirmed" className="invite-button confirm"><span className="material-symbols-outlined">check_circle</span> I&apos;m attending</button>
                <button type="submit" name="status" value="Declined" className="invite-button decline"><span className="material-symbols-outlined">cancel</span> Can&apos;t make it</button>
              </form>
            </div>
          ) : (
            <div className="rsvp-confirmed">
              <h3><span className="material-symbols-outlined">celebration</span> Thank you for your response!</h3>
              <p>Your status: <strong>{guest.status}</strong></p>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <h1>Invitation Not Found</h1>
            <p>Sorry, we couldn&apos;t find your invitation. Please check the link and try again.</p>
          <p><Link href="/">Go back</Link></p>
        </div>
      )}
      <Script id="invite-scripts" strategy="afterInteractive">
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
                if (distance < 0) { clearInterval(x); timerElement.innerHTML = 'The party is here!'; }
              }, 1000);
            }
            const af = document.getElementById('accept-form');
            if (af) {
              af.addEventListener('submit', async (e) => {
                e.preventDefault();
                const data = new FormData(af);
                const submitter = e.submitter;
                // @ts-ignore
                if (submitter && submitter.name) { data.append(submitter.name, submitter.value || 'yes'); } else { data.append('accept', 'yes'); }
                const res = await fetch(af.getAttribute('action') || '/api/godparent-accept', { method: 'POST', body: data, headers: { Accept: 'application/json' } });
                if (res.ok) {
                  const url = new URL(location.href); url.searchParams.set('accepted', '1'); location.href = url.toString();
                } else { const t = await res.text().catch(()=>''); alert(t || 'Failed to accept godparent role'); }
              });
            }
            const rf = document.getElementById('rsvp-form');
            if (rf) {
              rf.addEventListener('submit', async (e) => {
                e.preventDefault();
                const data = new FormData(rf);
                const submitter = e.submitter; // @ts-ignore
                if (submitter && submitter.name) { data.append(submitter.name, // @ts-ignore
                  submitter.value); }
                const res = await fetch(rf.getAttribute('action') || '/api/rsvp', { method: 'POST', body: data, headers: { Accept: 'application/json' } });
                if (res.ok) { const json = await res.json().catch(() => null); if (json?.ok) { const params = new URLSearchParams(location.search); const uid = params.get('uniqueId') || '${guest?.uniqueId || ''}'; const redirectUrl = '/thank-you?uniqueId=' + encodeURIComponent(uid) + '&status=' + encodeURIComponent(json.status); location.href = redirectUrl; } else { location.href = '/thank-you'; } }
                else { const t = await res.text().catch(()=>''); alert(t || 'Failed to submit RSVP'); }
              });
            }
          })();
        `}
      </Script>
    </div>
  );
}


