import { NextRequest, NextResponse } from 'next/server';
import { updateRsvp } from '@/lib/google-sheets';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const uniqueId = formData.get('uniqueId')?.toString();
  const status = formData.get('status')?.toString();
  if (!uniqueId || (status !== 'Confirmed' && status !== 'Declined')) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  try {
    await updateRsvp(uniqueId, status as 'Confirmed' | 'Declined');
    return NextResponse.json({ ok: true, status });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error updating RSVP';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


