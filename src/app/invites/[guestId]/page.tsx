import { headers, cookies } from 'next/headers';
import type { Guest } from '@/lib/google-sheets';
import Link from 'next/link';
import Script from 'next/script';
import InlineSettingsEditor from './InlineSettingsEditor';

export const dynamic = 'force-dynamic';

export default async function InvitePage({ params, searchParams }: { params: Promise<{ guestId: string }>, searchParams?: Promise<{ [k: string]: string | string[] | undefined }> }) {
  const { guestId } = await params;
  const sp = (await (searchParams || Promise.resolve({}))) as { [k: string]: string | string[] | undefined };
  const acceptedParam = sp?.accepted === '1';
  const editMode = sp?.edit === '1' || sp?.change === '1';

  // Fetch guest via API to avoid bundling googleapis in page
  let guest: Guest | null = null;
  // Load settings for display text
  let settings: { partyDateDisplay: string; partyTimeDisplay: string; locationDisplay: string; giftNote: string; countdownISO: string; venueAddress?: string; venueMapUrl?: string; dressCode?: string; hostNames?: string } = {
    partyDateDisplay: 'Oct 11, 2025',
    partyTimeDisplay: '3:00 PM',
    locationDisplay: 'TBA',
    giftNote: "Your presence is the most precious gift we could ask for. If you wish to bless Lauan further, we would deeply appreciate monetary gifts for his future needs or gift checks from department stores. 💙",
    countdownISO: '2025-10-11T15:00:00',
  };
  if (guestId) {
    const h = await headers();
    const host = h.get('x-forwarded-host') || h.get('host');
    const proto = h.get('x-forwarded-proto') || 'http';
    const origin = host ? `${proto}://${host}` : '';
    const [resGuest, resSettings] = await Promise.all([
      fetch(`${origin}/api/guests?id=${encodeURIComponent(guestId)}`, { headers: { Accept: 'application/json' }, cache: 'no-store' }),
      fetch(`${origin}/api/settings`, { headers: { Accept: 'application/json' }, cache: 'no-store' })
    ]);
    if (resGuest.ok) {
      const data = await resGuest.json().catch(() => null);
      guest = data?.guest || null;
    }
    if (resSettings.ok) {
      const json = await resSettings.json().catch(() => null);
      if (json?.settings) settings = json.settings;
    }
  }

  const isAdmin = !!(await cookies()).get('admin_session');

  return (
    <div className="invite-page">
      {guest ? (
        <div className="card has-hero">
          <div className="card-header">
            <h1>Dear {guest.name},</h1>
            <p>You&apos;re invited to celebrate a very special milestone.</p>
          </div>

          <div className="invite-hero">
            <div className="hero-avatar" aria-label="Celebrant portrait loading preview">
              <img src="/face.png" alt="Celebrant portrait" loading="eager" />
              <svg className="hero-ring" viewBox="0 0 120 120" aria-hidden="true">
                <circle cx="60" cy="60" r="56" pathLength="100"></circle>
              </svg>
            </div>
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

        {isAdmin ? (
          <InlineSettingsEditor initialSettings={settings} />
        ) : null}

          {guest.isGodparent && !guest.godparentAcceptedAt && !acceptedParam && !guest.godparentDeclinedAt && (
            <div className="godparent-letter">
              <h3>A Special Request</h3>
              <p>We would be honored to have you as Ninong/Ninang. If you accept, please confirm your full legal name for the dedication certificate. Your information will remain private.</p>
              <form id="accept-form" action="/api/godparent-accept" method="POST" style={{ marginTop: '1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '.75rem', alignItems: 'center' }}>
                <input type="hidden" name="uniqueId" value={guest.uniqueId} />
                <div style={{ position: 'relative', maxWidth: 360, width: '100%' }}>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#666' }}>badge</span>
                  <label htmlFor="fullName" className="microcopy" style={{ display: 'block', textAlign: 'left', marginBottom: 4 }}>Full legal name</label>
                  <input id="fullName" type="text" name="fullName" placeholder="Full legal name" className="invite-input" style={{ paddingLeft: 40, maxWidth: 360 }} />
                  <div className="microcopy" style={{ marginTop: 6 }}>Used only for the dedication certificate.</div>
                </div>
                <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button type="submit" name="accept" value="yes" className="invite-button confirm"><span className="material-symbols-outlined">check_circle</span> I accept to be Godparent</button>
                  <button type="submit" name="decline" value="yes" className="invite-button decline"><span className="material-symbols-outlined">cancel</span> I can’t be a Godparent</button>
                </div>
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

          {guest.isGodparent && guest.godparentDeclinedAt && (
            <div className="rsvp-confirmed">
              <h3><span className="material-symbols-outlined">handshake</span> Thanks for letting us know</h3>
              <p>You’ve declined the Godparent role on <strong>{guest.godparentDeclinedAt}</strong>. You can still RSVP as a guest below.</p>
            </div>
          )}

          <div className="party-details">
            <div className="detail-item"><strong><span className="material-symbols-outlined">event</span> Date</strong><p>{settings.partyDateDisplay}</p></div>
            <div className="detail-item"><strong><span className="material-symbols-outlined">schedule</span> Time</strong><p>{settings.partyTimeDisplay}</p></div>
            <div className="detail-item"><strong><span className="material-symbols-outlined">location_on</span> Location</strong><p>{settings.locationDisplay}</p></div>
            {settings.venueAddress ? (
              <div className="detail-item"><strong><span className="material-symbols-outlined">map</span> Address</strong><p>{settings.venueAddress}</p></div>
            ) : null}
            {settings.venueMapUrl ? (
              <div className="detail-item"><strong><span className="material-symbols-outlined">map</span> Map</strong><p><a className="underline" href={settings.venueMapUrl} target="_blank" rel="noreferrer">Open map</a></p></div>
            ) : null}
            {settings.dressCode ? (
              <div className="detail-item"><strong><span className="material-symbols-outlined">checkroom</span> Dress code</strong><p>{settings.dressCode}</p></div>
            ) : null}
            {settings.hostNames ? (
              <div className="detail-item"><strong><span className="material-symbols-outlined">family_restroom</span> Hosts</strong><p>{settings.hostNames}</p></div>
            ) : null}
          </div>

          <div id="countdown">
            <h3><span className="material-symbols-outlined">timer</span> Countdown to the party</h3>
            <div className="countdown-grid" aria-live="polite">
              <div className="countdown-box" data-part="days">
                <span className="countdown-number" id="cd-days" style={{ ['--value' as unknown as string]: 0 as unknown as string } as React.CSSProperties}>0</span>
                <div className="countdown-label">days</div>
              </div>
              <div className="countdown-box" data-part="hours">
                <span className="countdown-number" id="cd-hours" style={{ ['--value' as unknown as string]: 0 as unknown as string } as React.CSSProperties}>0</span>
                <div className="countdown-label">hours</div>
              </div>
              <div className="countdown-box" data-part="minutes">
                <span className="countdown-number" id="cd-minutes" style={{ ['--value' as unknown as string]: 0 as unknown as string } as React.CSSProperties}>0</span>
                <div className="countdown-label">min</div>
              </div>
              <div className="countdown-box" data-part="seconds">
                <span className="countdown-number" id="cd-seconds" style={{ ['--value' as unknown as string]: 0 as unknown as string } as React.CSSProperties}>0</span>
                <div className="countdown-label">sec</div>
              </div>
            </div>
          </div>

          <div className="gift-note">{settings.giftNote}</div>

          {(guest.status === 'Pending' || editMode ? (
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
              <div style={{ marginTop: 8 }}>
                <a className="underline" href={`/invites/${guest.uniqueId}?edit=1`}>Change your response</a>
              </div>
              <div className="qr-section" style={{ marginTop: 12 }}>
                <h3><span className="material-symbols-outlined">qr_code</span> Save Your Invitation</h3>
                <div className="qr-code">
                  <img alt="Invitation QR Code" src={`/api/qr?url=/invites/${guest.uniqueId}&size=144`} width={144} height={144} style={{ borderRadius: 8 }} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: 8 }}>
                  <a href={`/api/qr?url=/invites/${guest.uniqueId}&size=512`} download={`invitation-${guest.uniqueId}.png`} className="invite-button primary">
                    <span className="material-symbols-outlined">download</span> Download QR
                  </a>
                </div>
              </div>
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
            const partyDate = '${settings.countdownISO}';
            const countDownDate = new Date(partyDate).getTime();
            const elDays = document.getElementById('cd-days');
            const elHours = document.getElementById('cd-hours');
            const elMinutes = document.getElementById('cd-minutes');
            const elSeconds = document.getElementById('cd-seconds');
            function setNumber(el, value) {
              if (!el) return;
              const prev = el.getAttribute('data-prev') || '';
              const next = String(value);
              if (prev !== next) {
                el.setAttribute('data-prev', next);
                el.textContent = '';
                try { el.style.setProperty('--value', next); } catch {}
                const box = el.parentElement;
                if (box) {
                  box.classList.remove('tick');
                  void box.offsetWidth; // reflow to restart animation
                  box.classList.add('tick');
                }
                el.setAttribute('aria-label', next);
              }
            }
            const x = setInterval(function() {
              const now = new Date().getTime();
              let distance = countDownDate - now;
              if (distance < 0) distance = 0;
              const days = Math.floor(distance / (1000 * 60 * 60 * 24));
              const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
              const seconds = Math.floor((distance % (1000 * 60)) / 1000);
              setNumber(elDays, days);
              setNumber(elHours, hours);
              setNumber(elMinutes, minutes);
              setNumber(elSeconds, seconds);
              if (distance <= 0) { clearInterval(x); }
            }, 1000);
            const af = document.getElementById('accept-form');
            if (af) {
              af.addEventListener('submit', async (e) => {
                e.preventDefault();
                const data = new FormData(af);
                const submitter = e.submitter;
                // @ts-ignore
                if (submitter && submitter.name) { data.append(submitter.name, submitter.value || 'yes'); } else { data.append('accept', 'yes'); }

                // Check if declining - fullname not required
                const isDeclining = submitter?.name === 'decline' || data.get('decline') === 'yes';
                const fullNameInput = document.getElementById('fullName');
                const fullName = fullNameInput && fullNameInput.value ? fullNameInput.value.trim() : '';

                // Require fullname only when accepting
                if (!isDeclining && !fullName) {
                  alert('Please enter your full legal name to accept the godparent role.');
                  fullNameInput?.focus();
                  return;
                }

                const res = await fetch(af.getAttribute('action') || '/api/godparent-accept', { method: 'POST', body: data, headers: { Accept: 'application/json' } });
                if (res.ok) {
                  try { const json = await res.json(); const url = new URL(location.href); if (json && json.action === 'accepted') { url.searchParams.set('accepted', '1'); } location.href = url.toString(); } catch { location.reload(); }
                } else { const t = await res.text().catch(()=>''); alert(t || 'Failed to submit response'); }
              });
            }
            const rf = document.getElementById('rsvp-form');
            if (rf) {
              rf.addEventListener('submit', async (e) => {
                e.preventDefault();
                const data = new FormData(rf);
                const submitter = e.submitter;
                if (submitter && submitter.name) {
                  // @ts-ignore - submitter is HTMLButtonElement in modern browsers
                  data.append(submitter.name, submitter.value);
                }
                const res = await fetch(rf.getAttribute('action') || '/api/rsvp', { method: 'POST', body: data, headers: { Accept: 'application/json' } });
                if (res.ok) { const json = await res.json().catch(() => null); if (json?.ok) { const params = new URLSearchParams(location.search); const uid = params.get('uniqueId') || '${guest?.uniqueId || ''}'; const redirectUrl = '/thank-you?uniqueId=' + encodeURIComponent(uid) + '&status=' + encodeURIComponent(json.status); location.href = redirectUrl; } else { location.href = '/thank-you'; } }
                else { const t = await res.text().catch(()=>''); alert(t || 'Failed to submit RSVP'); }
              });
            }

            // Dummy hero loading ring: complete in ~5s then fade out
            try {
              var hero = document.querySelector('.hero-avatar');
              if (hero) {
                setTimeout(function(){ hero.classList.add('loaded'); }, 5000);
              }
            } catch {}
          })();
        `}
      </Script>
    </div>
  );
}


