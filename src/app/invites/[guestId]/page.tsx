import { headers, cookies } from 'next/headers';
import type { Guest } from '@/lib/google-sheets';
import Link from 'next/link';
import Script from 'next/script';
import InlineSettingsEditor from './InlineSettingsEditor';
import CoverImage from '@/components/CoverImage';
import RsvpSection from '@/components/RsvpSection';
import GodparentAcceptForm from '@/components/GodparentAcceptForm';
import GuestInitialView from '@/components/GuestInitialView';

export const dynamic = 'force-dynamic';

export default async function InvitePage({ params, searchParams }: { params: Promise<{ guestId: string }>, searchParams?: Promise<{ [k: string]: string | string[] | undefined }> }) {
  const { guestId } = await params;
  const sp = (await (searchParams || Promise.resolve({}))) as { [k: string]: string | string[] | undefined };
  const acceptedParam = sp?.accepted === '1';
  const editMode = sp?.edit === '1' || sp?.change === '1';

  // Fetch guest via API to avoid bundling googleapis in page
  let guest: Guest | null = null;
  // Load settings for display text
  let settings: { dedicationDateDisplay: string; dedicationTimeDisplay: string; locationDisplay: string; dedicationTimeLabel: string; locationLabel: string; dateLabel: string; addressLabel: string; mapLabel: string; dressCodeLabel: string; hostsLabel: string; giftNote: string; venueAddress?: string; venueMapUrl?: string; dressCode?: string; hostNames?: string } = {
    dedicationDateDisplay: 'Oct 11, 2025',
    dedicationTimeDisplay: '2:00 PM',
    locationDisplay: 'TBA',
    dedicationTimeLabel: 'Dedication Time',
    locationLabel: 'Location',
    dateLabel: 'Date',
    addressLabel: 'Address',
    mapLabel: 'Map',
    dressCodeLabel: 'Dress code',
    hostsLabel: 'Hosts',
    giftNote: "Your presence is the most precious gift we could ask for. If you wish to bless Lauan further, we would deeply appreciate monetary gifts for his future needs or gift checks from department stores. 💙",
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
    // If settings API fails (e.g., not admin), continue with default settings
  }

  // Check admin session with proper validation
  const adminCookie = (await cookies()).get('admin_session');
  const isAdmin = !!(adminCookie?.value === '1');

  return (
    <div className="invite-page">
      {guest ? (
        <div className="card has-hero">
          {/* Horizontal Cover Image */}
          <div className="cover-section">
            <CoverImage 
              src="/cover.webp" 
              fallbackSrc="/cover.png"
              alt="Dedication Ceremony" 
              className="cover-image"
            />
          </div>

          {/* Main Content Grid */}
          <div className={`content-grid ${!(guest.isGodparent && (
            (!guest.godparentAcceptedAt && !acceptedParam && !guest.godparentDeclinedAt) || 
            guest.godparentDeclinedAt
          )) ? 'has-sidebar' : 'no-sidebar'}`}>
            {/* Left Column - Main Content */}
            <div className="content-main">
              <div className="card-header">
                <h1>Dear {guest.name},</h1>
                <p>We&apos;d love to invite you to a very special milestone in our lives —</p>
                <p style={{ marginBottom: '1rem' }}>the Dedication of our son</p>
                <div className="celebrant-name-image">
                  <img 
                    src="/name.png" 
                    alt="Lauan & Levi" 
                  />
                </div>
              </div>

              {isAdmin ? (
                <InlineSettingsEditor initialSettings={settings} />
              ) : null}

              {guest.isGodparent && !guest.godparentAcceptedAt && !acceptedParam && !guest.godparentDeclinedAt && (
                <GodparentAcceptForm guest={guest} />
              )}

              {guest.isGodparent && (guest.godparentAcceptedAt || acceptedParam) && (
                <div className="rsvp-confirmed">
                  <h3><span className="material-symbols-outlined">celebration</span> Thank you for accepting to be Godparent!</h3>
                  {guest.godparentAcceptedAt ? (<p><span className="material-symbols-outlined">event</span> Accepted on: <strong>{guest.godparentAcceptedAt}</strong></p>) : null}
                  {guest.godparentFullName ? (<p><span className="material-symbols-outlined">badge</span> Full Name: <strong>{guest.godparentFullName}</strong></p>) : null}
                  
                  {/* Show RSVP section for godparents who haven't RSVP'd yet */}
                  {guest.status === 'Pending' && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                      <p style={{ marginBottom: '0.5rem', fontSize: '14px', color: '#6c757d' }}>
                        Now that you've accepted to be a godparent, please let us know if you'll be attending the ceremony.
                      </p>
                      <RsvpSection guest={guest} editMode={false} />
                    </div>
                  )}
                  
                  {/* Show RSVP status if already completed */}
                  {guest.status !== 'Pending' && (
                    <p style={{ marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                      <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '8px' }}>rsvp</span>
                      Status: <strong>{guest.status}</strong>
                    </p>
                  )}
                </div>
              )}

              {guest.isGodparent && guest.godparentDeclinedAt && (
                <div className="rsvp-confirmed">
                  <h3><span className="material-symbols-outlined">handshake</span> Thanks for letting us know</h3>
                  <p>You've declined the Godparent role on <strong>{guest.godparentDeclinedAt}</strong>. You can still RSVP as a guest below.</p>
                </div>
              )}

              {/* RSVP Section for regular guests or godparents who declined */}
              {(!guest.isGodparent || guest.godparentDeclinedAt) && (
                <RsvpSection guest={guest} editMode={editMode} />
              )}

              <div className="party-details">
                <div className="details-grid">
                  {/* Date and Time Row - Desktop: side by side, Mobile: stacked */}
                  <div className="datetime-row">
                    <div className="detail-item">
                      <div className="detail-icon">
                        <span className="material-symbols-outlined">event</span>
                      </div>
                      <div className="detail-content">
                        <div className="detail-label">{settings.dateLabel}</div>
                        <div className="detail-value">{settings.dedicationDateDisplay}</div>
                      </div>
                    </div>
                    
                    <div className="detail-item">
                      <div className="detail-icon">
                        <span className="material-symbols-outlined">schedule</span>
                      </div>
                      <div className="detail-content">
                        <div className="detail-label">{settings.dedicationTimeLabel}</div>
                        <div className="detail-value">{settings.dedicationTimeDisplay}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Location - Full width */}
                  <div className="detail-item location-item">
                    <div className="detail-icon">
                      <span className="material-symbols-outlined">location_on</span>
                    </div>
                    <div className="detail-content">
                      <div className="detail-label">{settings.locationLabel}</div>
                      <div className="detail-value location-with-map">
                        <div className="location-text">{settings.locationDisplay}</div>
                        {settings.venueMapUrl && (
                          <a 
                            href={settings.venueMapUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="map-badge"
                            title="Open in Maps"
                          >
                            <span className="material-symbols-outlined">map</span>
                            <span className="map-text">Open Map</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {settings.venueAddress && (
                    <div className="detail-item">
                      <div className="detail-icon">
                        <span className="material-symbols-outlined">map</span>
                      </div>
                      <div className="detail-content">
                        <div className="detail-label">{settings.addressLabel}</div>
                        <div className="detail-value address-with-map">
                          <div className="address-text">{settings.venueAddress}</div>
                          {settings.venueMapUrl && (
                            <a 
                              href={settings.venueMapUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="map-badge"
                              title="Open in Maps"
                            >
                              <span className="material-symbols-outlined">map</span>
                              <span className="map-text">Open Map</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {settings.dressCode && (
                    <div className="detail-item">
                      <div className="detail-icon">
                        <span className="material-symbols-outlined">checkroom</span>
                      </div>
                      <div className="detail-content">
                        <div className="detail-label">{settings.dressCodeLabel}</div>
                        <div className="detail-value">{settings.dressCode}</div>
                      </div>
                    </div>
                  )}
                  
                  {settings.hostNames && (
                    <div className="detail-item">
                      <div className="detail-icon">
                        <span className="material-symbols-outlined">family_restroom</span>
                      </div>
                      <div className="detail-content">
                        <div className="detail-label">{settings.hostsLabel}</div>
                        <div className="detail-value">{settings.hostNames}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="gift-note">{settings.giftNote}</div>
            </div>

            {/* Right Column - Interactive Elements */}
            {/* Hide entire sidebar for godparents who haven't made their decision yet or have declined */}
            {!(guest.isGodparent && (
              (!guest.godparentAcceptedAt && !acceptedParam && !guest.godparentDeclinedAt) || 
              guest.godparentDeclinedAt
            )) && (
              <div className="content-sidebar">
                <GuestInitialView guest={guest} editMode={editMode} />
              </div>
            )}
          </div>
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


