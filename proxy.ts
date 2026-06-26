import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const adminSession = request.cookies.get('ts_admin_session')?.value;
  const teamSession = request.cookies.get('ts_team_session')?.value;

  if (pathname.startsWith('/admin') && !adminSession) {
    return NextResponse.redirect(new URL('/admin-login', request.url));
  }

  if (pathname.startsWith('/team') && !teamSession) {
    return NextResponse.redirect(new URL('/team-login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/team/:path*'],
};
