import Link from 'next/link';
import { cookies, headers } from 'next/headers';
import type { Guest } from '@/lib/google-sheets';
import CoverImage from '@/components/CoverImage';

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
  const declined = status === 'Declined';
  const pending = status === 'Pending';

  // Load settings for display text
  let settings: { dedicationDateDisplay: string; dedicationTimeDisplay: string; locationDisplay: string; dedicationTimeLabel: string; locationLabel: string; dateLabel: string; addressLabel: string; mapLabel: string; dressCodeLabel: string; hostsLabel: string; giftNote: string; venueAddress?: string; venueMapUrl?: string; dressCode?: string; hostNames?: string } = {
    dedicationDateDisplay: 'Oct 11, 2025 (Saturday)',
    dedicationTimeDisplay: '10:00 AM',
    locationDisplay: 'Celebration Church | 0486Purok 2 Banlic, Calamba City, Laguna',
    dedicationTimeLabel: 'Time',
    locationLabel: 'Location',
    dateLabel: 'Date',
    addressLabel: 'Address',
    mapLabel: 'Map',
    dressCodeLabel: 'Dress code',
    hostsLabel: 'Hosts',
    giftNote:
      'Your presence is the most precious gift we could ask for. If you wish to bless Lauan further, we would deeply appreciate monetary gifts for his future needs or gift checks from department stores. 💙',
    venueMapUrl: 'https://maps.app.goo.gl/WKZxYMgytgadwv9i7',
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
      <div className="card has-hero">
        {/* Cover Image Header */}
        <div className="cover-section">
          <CoverImage 
            src="/cover.webp" 
            fallbackSrc="/cover.png" 
            alt="Dedication Ceremony" 
          />
        </div>

        <div className="content-grid">
          <div className="content-main">
            {guest ? (
              <>
                <div className="card-header">
                  <h1>Thank you, {guest.name}!</h1>
                  <p style={{ marginTop: '0.5rem', color: '#6b7280', fontSize: '1.1rem' }}>
                    Your response has been recorded
                  </p>
                </div>
                
                <div className="message" style={{ 
                  padding: '1.5rem', 
                  background: confirmed ? '#f0f9ff' : pending ? '#fffbeb' : '#fef3f2', 
                  border: `2px solid ${confirmed ? '#0ea5e9' : pending ? '#f59e0b' : '#f87171'}`, 
                  borderRadius: '12px',
                  marginBottom: '1.5rem'
                }}>
                  {confirmed ? (
                    isGodparent ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: '#0ea5e9' }}>celebration</span>
                        <div>
                          <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#0c4a6e' }}>
                            We are honored that you will be part of Lauan's Dedication Ceremony!
                          </p>
                          <p style={{ margin: '0.5rem 0 0 0', color: '#0369a1' }}>
                            Your role as Ninong/Ninang means so much to our family.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: '#0ea5e9' }}>celebration</span>
                        <div>
                          <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#0c4a6e' }}>
                            We're excited you'll be joining us for Lauan's Dedication Ceremony!
                          </p>
                          <p style={{ margin: '0.5rem 0 0 0', color: '#0369a1' }}>
                            Your presence will make this special day even more meaningful.
                          </p>
                        </div>
                      </div>
                    )
                  ) : pending ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: '#f59e0b' }}>schedule</span>
                      <div>
                        <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#92400e' }}>
                          We understand you need more time to decide.
                        </p>
                        <p style={{ margin: '0.5rem 0 0 0', color: '#b45309' }}>
                          Take your time! You can update your response anytime before the ceremony.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: '#f87171' }}>heart_plus</span>
                      <div>
                        <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#991b1b' }}>
                          We understand you won't be able to make it.
                        </p>
                        <p style={{ margin: '0.5rem 0 0 0', color: '#dc2626' }}>
                          Thank you for letting us know. You can change your response any time.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status and Godparent Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                  {status && (
                    <div className={`status-badge status-${status.toLowerCase()}`} style={{
                      padding: '0.75rem 1.5rem',
                      borderRadius: '25px',
                      fontWeight: '600',
                      textAlign: 'center',
                      fontSize: '1rem'
                    }}>
                      <span className="material-symbols-outlined" style={{ marginRight: '8px' }}>
                        {status === 'Confirmed' ? 'check_circle' : status === 'Declined' ? 'cancel' : 'schedule'}
                      </span>
                      Your Response: {status}
                    </div>
                  )}

                  {isGodparent && guest.godparentAcceptedAt && (
                    <div style={{
                      padding: '1rem',
                      background: '#f0fdf4',
                      border: '2px solid #22c55e',
                      borderRadius: '12px',
                      textAlign: 'center'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                        <span className="material-symbols-outlined" style={{ color: '#22c55e' }}>badge</span>
                        <span style={{ fontWeight: '600', color: '#166534' }}>Godparent Status</span>
                      </div>
                      <p style={{ margin: 0, color: '#15803d' }}>
                        Accepted on: <strong>{guest.godparentAcceptedAt}</strong>
                      </p>
                      {guest.godparentFullName && (
                        <p style={{ margin: '0.5rem 0 0 0', color: '#15803d' }}>
                          Name: <strong>{guest.godparentFullName}</strong>
                        </p>
                      )}
                    </div>
                  )}
                </div>


                {/* Compact Event Summary */}
                <div className="compact-event-summary">
                  <div className="event-header">
                    <span className="material-symbols-outlined" style={{ color: '#6366f1' }}>event</span>
                    <span style={{ fontWeight: '600', color: '#374151' }}>Dedication Ceremony</span>
                  </div>
                  <div className="event-details">
                    <div className="event-detail">
                      <span className="event-detail-label">Date:</span>
                      <div className="event-detail-value">{settings.dedicationDateDisplay}</div>
                    </div>
                    <div className="event-detail">
                      <span className="event-detail-label">Time:</span>
                      <div className="event-detail-value">{settings.dedicationTimeDisplay}</div>
                    </div>
                    <div className="event-detail">
                      <span className="event-detail-label">Location:</span>
                      <div className="event-detail-value">{settings.locationDisplay}</div>
                    </div>
                  </div>
                </div>

                <div className="gift-note">
                  {settings.giftNote}
                </div>
          </>
        ) : (
          <>
            <div className="card-header">
              <h1>Thank you!</h1>
              <p style={{ marginTop: '0.5rem', color: '#6b7280', fontSize: '1.1rem' }}>
                Your response has been recorded
              </p>
            </div>
            <div className="message" style={{ 
              padding: '1.5rem', 
              background: '#f0f9ff', 
              border: '2px solid #0ea5e9', 
              borderRadius: '12px',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: '#0ea5e9' }}>check_circle</span>
                <div>
                  <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#0c4a6e' }}>
                    Your response has been recorded successfully!
                  </p>
                  <p style={{ margin: '0.5rem 0 0 0', color: '#0369a1' }}>
                    We appreciate you taking the time to respond.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

            {isAdmin ? (
              <div style={{ marginTop: 16 }}>
                <Link href="/" className="invite-button primary"><span className="material-symbols-outlined">home</span> Back to Home</Link>
              </div>
            ) : null}
          </div>

          {/* Right Sidebar - QR Code */}
          {guest && (
            <div className="content-sidebar">
              <div className="qr-section sticky-qr" style={{ 
                background: '#f8fafc', 
                padding: '1.5rem', 
                borderRadius: '12px', 
                border: '1px solid #e2e8f0',
                textAlign: 'center',
                position: 'sticky',
                top: '2rem'
              }}>
                <h3 style={{ marginBottom: '1rem', color: '#374151' }}>
                  <span className="material-symbols-outlined" style={{ marginRight: '8px', color: '#6366f1' }}>qr_code</span>
                  Save Your Invitation
                </h3>
                <p style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '0.9rem' }}>
                  Keep this QR code for quick access to your invitation any time:
                </p>
                <div className="qr-code" style={{ marginBottom: '1rem' }}>
                  <img 
                    alt="Invitation QR Code" 
                    src={`/api/qr?url=/invites/${guest.uniqueId}&size=200`} 
                    width={200} 
                    height={200} 
                    style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <a 
                    href={`/api/qr?url=/invites/${guest.uniqueId}&size=512`} 
                    download={`invitation-${guest.uniqueId}.png`} 
                    className="invite-button primary"
                    style={{ 
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <span className="material-symbols-outlined">download</span> Download QR
                  </a>
                  <Link 
                    href={`/invites/${guest.uniqueId}`} 
                    className="invite-button confirm"
                    style={{ 
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <span className="material-symbols-outlined">visibility</span> View Invitation
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


