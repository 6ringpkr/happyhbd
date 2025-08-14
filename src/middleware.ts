import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'admin_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = pathname.startsWith('/admin') || pathname.startsWith('/api/generate-invite') || pathname.startsWith('/api/updates/post') || pathname.startsWith('/api/bulk-invites');
  if (isProtected) {
    const session = request.cookies.get(COOKIE_NAME)?.value;
    if (!session) {
      const url = new URL('/', request.url);
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/generate-invite', '/api/updates/post', '/api/bulk-invites'],
};


