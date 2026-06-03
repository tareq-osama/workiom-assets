import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { comparePassword, signToken } from '@/lib/auth'
import { workiomUsers } from '@/lib/workiom-users'
import type { JWTPayload } from '@/types/user'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body as { email?: string; password?: string }

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    if (!email.toLowerCase().endsWith('@workiom.com')) {
      return NextResponse.json(
        { error: 'Only @workiom.com email addresses are allowed' },
        { status: 400 }
      )
    }

    const rawRecord = await workiomUsers.findRawByEmail(email)
    if (!rawRecord) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const user = await workiomUsers.findByEmail(email)
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    if (user.status !== 'Active') {
      return NextResponse.json({ error: 'Account is not active' }, { status: 403 })
    }

    const passwordHash = rawRecord['Password Hash'] ?? ''
    const passwordValid = await comparePassword(password, passwordHash)
    if (!passwordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Update last login without blocking the response
    workiomUsers.updateLastLogin(user.id).catch(() => {})

    const jwtPayload: JWTPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    }

    const token = await signToken(jwtPayload)

    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatarUrl: user.avatarUrl,
        lastLogin: user.lastLogin,
      },
    })
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
