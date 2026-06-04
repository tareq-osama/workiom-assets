import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { findUserById } from '@/lib/appwrite-users'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    let role = payload.role
    let status = payload.status
    try {
      const liveUser = await findUserById(payload.id)
      if (liveUser) {
        role = liveUser.role
        status = liveUser.status
      }
    } catch {
      // use JWT values
    }

    return NextResponse.json({
      user: {
        id: payload.id,
        name: payload.name,
        email: payload.email,
        role,
        status,
      },
    })
  } catch (err) {
    console.error('Me error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
