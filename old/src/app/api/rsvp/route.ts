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
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error updating RSVP' }, { status: 500 });
  }
}


