import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

const PUBLIC_PATHS = ['/login', '/signup']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths and API auth routes and static files
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/'
  ) {
    return NextResponse.next()
  }

  const token = request.cookies.get('auth-token')?.value
  const payload = token ? await verifyToken(token) : null

  if (!payload) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Inject user info into headers for server components
  const res = NextResponse.next()
  res.headers.set('x-user-id', payload.id)
  res.headers.set('x-user-email', payload.email)
  res.headers.set('x-user-name', payload.name)
  res.headers.set('x-user-role', payload.role)
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|workiom-logo.png|workiom-icon.png).*)'],
}
