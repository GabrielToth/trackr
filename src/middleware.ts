import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const publicPaths = ['/login', '/_next', '/favicon.ico']
  if (publicPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const publicApis = ['/api/auth/login', '/api/track']
  if (publicApis.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const token = request.cookies.get('trackr_session')?.value
  if (!token || !token.includes('.')) {
    return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/stats/:path*',
    '/api/links',
    '/api/stats/:path*',
  ],
}
