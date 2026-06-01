/**
 * middleware.ts — Auth guard for all dashboard routes
 * Checks for ajis_session cookie (iron-session encrypted)
 */
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get('ajis_session');
  const isAuth  = !!session?.value;
  const isLogin = pathname.startsWith('/login');

  if (!isAuth && !isLogin) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (isAuth && isLogin) {
    return NextResponse.redirect(new URL('/', request.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
