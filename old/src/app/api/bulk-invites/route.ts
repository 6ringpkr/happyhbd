import { NextRequest, NextResponse } from 'next/server';
import { addGuestsBulk } from '@/lib/google-sheets';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let items: Array<{ name: string; isGodparent: boolean }> = [];
    if (contentType.includes('application/json')) {
      const body = await request.json();
      items = Array.isArray(body?.items) ? body.items : [];
    } else {
      const form = await request.formData();
      const payload = form.get('items')?.toString() || '[]';
      items = JSON.parse(payload);
    }
    items = (items || []).map((i: any) => ({ name: String(i.name || '').trim(), isGodparent: Boolean(i.isGodparent) })).filter((i) => i.name);
    if (!items.length) return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    const created = await addGuestsBulk(items);
    return NextResponse.json({ ok: true, created, links: created.map(g => ({ name: g.name, inviteUrl: `/invites/${g.uniqueId}` })) });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Bulk upload failed' }, { status: 500 });
  }
}


