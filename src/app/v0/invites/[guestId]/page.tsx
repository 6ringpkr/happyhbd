import { headers } from 'next/headers';
import type { Guest } from '@/lib/google-sheets';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AcceptForm } from './AcceptForm';
import { RsvpForm } from './RsvpForm';
import { Countdown } from './Countdown';

export const dynamic = 'force-dynamic';

export default async function InviteV0Page({ params }: { params: Promise<{ guestId: string }> }) {
  const { guestId } = await params;
  const h = await headers();
  const host = h.get('x-forwarded-host') || h.get('host');
  const proto = h.get('x-forwarded-proto') || 'http';
  const origin = host ? `${proto}://${host}` : '';

  let guest: Guest | null = null;
  let settings: any = null;
  const [resGuest, resSettings] = await Promise.all([
    fetch(`${origin}/api/guests?id=${encodeURIComponent(guestId)}`, { headers: { Accept: 'application/json' }, cache: 'no-store' }),
    fetch(`${origin}/api/settings`, { headers: { Accept: 'application/json' }, cache: 'no-store' }),
  ]);
  if (resGuest.ok) {
    const data = await resGuest.json().catch(() => null);
    guest = data?.guest || null;
  }
  if (resSettings.ok) {
    const json = await resSettings.json().catch(() => null);
    settings = json?.settings || null;
  }

  if (!guest) {
    return (
      <div className="py-12">
        <Card>
          <CardHeader>
            <CardTitle>Invitation Not Found</CardTitle>
            <CardDescription>Please check your link and try again.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold">Dear {guest.name},</h1>
        <p>You are invited to celebrate a very special milestone.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>Save the date and venue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-0">
              <table className="w-full border-collapse">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 pr-4 font-medium">Date</td>
                    <td className="py-2">{settings?.partyDateDisplay || 'TBA'}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 pr-4 font-medium">{settings?.dedicationTimeLabel || 'Dedication Time'}</td>
                    <td className="py-2">{settings?.dedicationTimeDisplay || 'TBA'}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 pr-4 font-medium">{settings?.tableReadyLabel || 'Table\'s Ready'}</td>
                    <td className="py-2">{settings?.partyTimeDisplay || 'TBA'}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 pr-4 font-medium">{settings?.birthdaySnackLocationLabel || 'Birthday Snack Location'}</td>
                    <td className="py-2">{settings?.birthdaySnackLocation || 'TBA'}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 pr-4 font-medium">{settings?.locationLabel || 'Location'}</td>
                    <td className="py-2">{settings?.locationDisplay || 'TBA'}</td>
                  </tr>
                  {settings?.venueAddress ? (
                    <tr className="border-b border-gray-200">
                      <td className="py-2 pr-4 font-medium">Address</td>
                      <td className="py-2">{settings.venueAddress}</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
            <div>
              <h3 className="text-sm font-medium">Countdown to the party</h3>
              <div className="mt-2">
                <Countdown iso={settings?.countdownISO || new Date().toISOString()} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Gift Note</CardTitle>
            <CardDescription>Optional</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{settings?.giftNote || ''}</p>
          </CardContent>
        </Card>
      </div>

      {guest.isGodparent && !guest.godparentAcceptedAt && !guest.godparentDeclinedAt ? (
        <Card>
          <CardHeader>
            <CardTitle>A Special Request</CardTitle>
            <CardDescription>If you accept, please confirm your full legal name.</CardDescription>
          </CardHeader>
          <CardContent>
            <AcceptForm uniqueId={guest.uniqueId} onDone={() => { /* refresh by reloading */ (location as any).reload(); }} />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>RSVP</CardTitle>
          <CardDescription>Let us know if you’ll join</CardDescription>
        </CardHeader>
        <CardContent>
          {guest.status === 'Pending' ? (
            <RsvpForm uniqueId={guest.uniqueId} />
          ) : (
            <div className="space-y-2">
              <div>Your status: <span className="font-medium">{guest.status}</span></div>
              <a className="text-primary underline" href={`/invites/${guest.uniqueId}?edit=1`}>Change your response</a>
              <div className="pt-2">
                <h4 className="text-sm font-medium">Save your invitation</h4>
                <div className="mt-2">
                  <img alt="Invitation QR Code" src={`/api/qr?url=/invites/${guest.uniqueId}&size=144`} width={144} height={144} className="rounded" />
                </div>
                <div className="mt-2">
                  <a className="text-primary underline" href={`/api/qr?url=/invites/${guest.uniqueId}&size=512`} download={`invitation-${guest.uniqueId}.png`}>Download QR</a>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
