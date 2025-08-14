import { NextRequest, NextResponse } from 'next/server';
import { acceptGodparentRole } from '../../../lib/google-sheets';

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const uniqueId = form.get('uniqueId')?.toString() ?? '';
  const fullName = form.get('fullName')?.toString() || '';
  const accept = form.get('accept');
  if (!uniqueId || !accept) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  try {
    await acceptGodparentRole(uniqueId, fullName);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error accepting godparent role';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


