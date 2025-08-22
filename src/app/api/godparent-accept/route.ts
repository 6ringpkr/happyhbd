import { NextRequest, NextResponse } from 'next/server';
import { acceptGodparentRole, declineGodparentRole } from '../../../lib/google-sheets';

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const uniqueId = form.get('uniqueId')?.toString() ?? '';
  const fullName = form.get('fullName')?.toString() || '';
  const accept = form.get('accept');
  const decline = form.get('decline');
  if (!uniqueId || (!accept && !decline)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  try {
    if (decline) {
      await declineGodparentRole(uniqueId);
      return NextResponse.json({ ok: true, action: 'declined' });
    }
    await acceptGodparentRole(uniqueId, fullName);
    return NextResponse.json({ ok: true, action: 'accepted' });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error accepting godparent role';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


