import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'admin_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = pathname.startsWith('/admin') || pathname.startsWith('/v0/admin') || pathname.startsWith('/api/generate-invite') || pathname.startsWith('/api/bulk-invites');
  
  if (isProtected) {
    const session = request.cookies.get(COOKIE_NAME)?.value;
    if (!session) {
      const url = new URL('/', request.url);
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }
  
  // Add no-cache headers to all responses
  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};


