import { NextRequest, NextResponse } from 'next/server';
import { addGuestsBulk } from '../../../lib/google-sheets';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let items: Array<{ name: string; isGodparent: boolean }> = [];
    if (contentType.includes('application/json')) {
      const body = (await request.json()) as { items?: Array<{ name?: string; isGodparent?: boolean }> };
      items = Array.isArray(body?.items)
        ? (body.items || []).map((i) => ({ name: String(i.name || '').trim(), isGodparent: Boolean(i.isGodparent) }))
        : [];
    } else {
      const form = await request.formData();
      const payload = form.get('items')?.toString() || '[]';
      const parsed = JSON.parse(payload) as Array<{ name?: string; isGodparent?: boolean }>;
      items = (parsed || []).map((i) => ({ name: String(i.name || '').trim(), isGodparent: Boolean(i.isGodparent) }));
    }
    items = items.filter((i) => i.name);
    if (!items.length) return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    const created = await addGuestsBulk(items);
    return NextResponse.json({ ok: true, created, links: created.map(g => ({ name: g.name, inviteUrl: `/invites/${g.uniqueId}` })) });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Bulk upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


