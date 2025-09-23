import { NextRequest, NextResponse } from 'next/server';
import { addGuest } from '../../../lib/google-sheets';


export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = (formData.get('name') ?? '').toString().trim();
    const isGodparent = formData.get('isGodparent') === 'on' || formData.get('isGodparent') === 'true';
    
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    
    const newGuest = await addGuest(name, Boolean(isGodparent));
    
    if (!newGuest || !newGuest.uniqueId) {
      return NextResponse.json({ error: 'Failed to create guest - missing uniqueId' }, { status: 500 });
    }
    
    const inviteUrl = `/invites/${newGuest.uniqueId}`;
    return NextResponse.json({ ok: true, inviteUrl, guest: newGuest });
  } catch (e) {
    console.error('Generate invite API error:', e);
    const message = e instanceof Error ? e.message : 'Error adding guest';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


