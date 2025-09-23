import { NextRequest, NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/lib/google-sheets';

const COOKIE_NAME = 'admin_session';

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json({ settings });
}

export async function POST(request: NextRequest) {
  // Require admin cookie
  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  
  if (!cookie || cookie !== '1') {
    return NextResponse.json({ error: 'Unauthorized - Please log in as admin first' }, { status: 401 });
  }
  const contentType = request.headers.get('content-type') || '';
  let body: Record<string, unknown> = {};
  if (contentType.includes('application/json')) {
    body = await request.json().catch(() => ({} as Record<string, unknown>));
  } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    const fd = await request.formData();
    body = Object.fromEntries(Array.from(fd.entries()).map(([k, v]) => [k, typeof v === 'string' ? v : ''])) as Record<string, unknown>;
  }
  const allowedKeys = [
    'dedicationDateDisplay','dedicationTimeDisplay','locationDisplay','giftNote',
    'dedicationTimeLabel','locationLabel','dateLabel','addressLabel','mapLabel','dressCodeLabel','hostsLabel',
    'eventTitle','celebrantName','celebrantImageUrl','venueAddress','venueMapUrl','dressCode','registryNote','rsvpDeadlineISO','hostNames','themeName','backgroundImageUrl','accentColor','invitationTemplate'
  ] as const;
  const update: Record<string, string> = {};
  for (const k of allowedKeys) {
    if (typeof body[k] === 'string') update[k] = body[k] as string;
  }
  const settings = await updateSettings(update);
  return NextResponse.json({ ok: true, settings });
}

