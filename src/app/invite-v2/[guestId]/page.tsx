import { headers, cookies } from 'next/headers';
import Link from 'next/link';

type Guest = {
  uniqueId: string;
  name: string;
  status: 'Confirmed' | 'Declined' | 'Pending';
  isGodparent?: boolean;
  godparentAcceptedAt?: string | null;
  godparentDeclinedAt?: string | null;
  godparentFullName?: string | null;
};

export const dynamic = 'force-dynamic';

export default async function InviteV2Page({ params }: { params: Promise<{ guestId: string }> }) {
  const { guestId } = await params;

  let guest: Guest | null = null;
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
    giftNote: 'Your presence is the most precious gift we could ask for. 💙'
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
    <div className="min-h-screen bg-[oklch(0.984_0.003_247.858)] text-[oklch(0.129_0.042_264.695)] flex items-center justify-center p-4">
      <div className="w-full max-w-[720px] rounded-2xl border border-[oklch(0.929_0.013_255.508)] bg-white/90 backdrop-blur px-6 py-7 shadow-[0_20px_40px_rgba(24,56,113,0.12),_0_2px_8px_rgba(24,56,113,0.05)]">
        {guest ? (
          <>
            <header className="text-center mb-5">
              <h1 className="text-2xl font-semibold">Dear {guest.name},</h1>
              <p className="text-sm opacity-80 mt-1">You&apos;re invited to celebrate a very special milestone.</p>
            </header>

            <section className="text-sm">
              <table className="w-full border-collapse">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 pr-4 font-semibold">Date</td>
                    <td className="py-2">{settings.partyDateDisplay}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 pr-4 font-semibold">{settings.dedicationTimeLabel}</td>
                    <td className="py-2">{settings.dedicationTimeDisplay}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 pr-4 font-semibold">{settings.tableReadyLabel}</td>
                    <td className="py-2">{settings.partyTimeDisplay}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 pr-4 font-semibold">{settings.birthdaySnackLocationLabel}</td>
                    <td className="py-2">{settings.birthdaySnackLocation}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 pr-4 font-semibold">{settings.locationLabel}</td>
                    <td className="py-2">{settings.locationDisplay}</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section className="mt-5">
              <p className="text-center text-sm leading-relaxed">{settings.giftNote}</p>
            </section>

            <section className="mt-6 flex justify-center">
              <div className="rounded-md p-2 border">
                <img alt="Invitation QR Code" src={`/api/qr?url=/invites/${guest.uniqueId}&size=144`} width={144} height={144} />
              </div>
            </section>

            <section className="mt-3 flex justify-center gap-2">
              <a href={`/api/qr?url=/invites/${guest.uniqueId}&size=512`} download={`invitation-${guest.uniqueId}.png`} className="inline-flex items-center gap-1 rounded-md bg-[oklch(0.208_0.042_265.755)] text-white px-3 py-1.5 text-sm">Download QR</a>
              <Link href={`/invites/${guest.uniqueId}`} className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm">View classic</Link>
            </section>

            <section className="mt-6 text-center">
              {guest.status === 'Pending' ? (
                <form id="rsvp-form" action="/api/rsvp" method="POST" className="inline-flex gap-2">
                  <input type="hidden" name="uniqueId" value={guest.uniqueId} />
                  <button type="submit" name="status" value="Confirmed" className="rounded-md bg-[oklch(0.208_0.042_265.755)] text-white px-3 py-1.5 text-sm">I&apos;m attending</button>
                  <button type="submit" name="status" value="Declined" className="rounded-md border px-3 py-1.5 text-sm">Can&apos;t make it</button>
                </form>
              ) : (
                <div className="text-sm">
                  <div>Thanks for your response! Status: <strong>{guest.status}</strong></div>
                  <div className="mt-2"><a className="underline" href={`/invites/${guest.uniqueId}?edit=1`}>Change your response</a></div>
                </div>
              )}
            </section>

            {isAdmin ? (
              <p className="mt-5 text-center text-xs opacity-60">Admin session detected.</p>
            ) : null}
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-xl font-semibold">Invitation Not Found</h2>
            <p className="mt-2">Sorry, we couldn&apos;t find your invitation. Please check the link and try again.</p>
            <p className="mt-3"><Link href="/" className="underline">Go back</Link></p>
          </div>
        )}
      </div>
    </div>
  );
}