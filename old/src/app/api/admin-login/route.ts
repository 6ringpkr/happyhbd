import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'admin_session';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = formData.get('password')?.toString() || '';
  const expected = process.env.ADMIN_PASSWORD || '';
  if (!expected) {
    return NextResponse.json({ error: 'Missing ADMIN_PASSWORD' }, { status: 500 });
  }
  if (password !== expected) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, '1', { path: '/', httpOnly: true, sameSite: 'lax', secure: false, maxAge: 60 * 60 * 8 });
  return res;
}


