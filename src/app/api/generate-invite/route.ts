import { NextRequest, NextResponse } from 'next/server';
import { addGuest } from '../../../lib/google-sheets';


export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const name = (formData.get('name') ?? '').toString();
  const isGodparent = formData.get('isGodparent') === 'on' || formData.get('isGodparent') === 'true';
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  try {
    const newGuest = await addGuest(name, Boolean(isGodparent));
    const inviteUrl = `/invites/${newGuest.uniqueId}`;
    return NextResponse.json({ ok: true, inviteUrl, guest: newGuest });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error adding guest';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


