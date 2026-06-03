import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { hashPassword, signToken } from '@/lib/auth'
import { workiomUsers } from '@/lib/workiom-users'
import type { JWTPayload } from '@/types/user'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, confirmPassword } = body as {
      name?: string
      email?: string
      password?: string
      confirmPassword?: string
    }

    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (!email.toLowerCase().endsWith('@workiom.com')) {
      return NextResponse.json(
        { error: 'Only @workiom.com email addresses are allowed' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const existing = await workiomUsers.findByEmail(email)
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    const passwordHash = await hashPassword(password)

    const user = await workiomUsers.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'Viewer',
      status: 'Active',
    })

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

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          avatarUrl: user.avatarUrl,
        },
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('Signup error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
