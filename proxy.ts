import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Only these paths require a valid session
const PROTECTED_PATHS = ['/upload', '/api/upload']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Static assets and auth API never need a token check
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  const token = request.cookies.get('auth-token')?.value
  const payload = token ? await verifyToken(token) : null

  // Enforce auth only on upload routes
  const requiresAuth = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )

  if (requiresAuth && !payload) {
    if (pathname.startsWith('/api/')) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Inject user headers for server components whenever a valid session exists
  const res = NextResponse.next()
  if (payload) {
    res.headers.set('x-user-id', payload.id)
    res.headers.set('x-user-email', payload.email)
    res.headers.set('x-user-name', payload.name)
    res.headers.set('x-user-role', payload.role)
  }
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|workiom-logo.png|workiom-icon.png).*)'],
}
