import { NextResponse } from 'next/server';

const COOKIE_NAME = 'admin_session';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, '', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0, // Expire immediately
  });
  return res;
}

