import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { workiomUsers } from '@/lib/workiom-users'

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

    // Fetch live user data so role changes in Workiom take effect without re-login.
    // Falls back to JWT data if Workiom is unavailable.
    let role = payload.role
    let status = payload.status
    try {
      const liveUser = await workiomUsers.findById(payload.id)
      if (liveUser) {
        role = liveUser.role
        status = liveUser.status
      }
    } catch {
      // Workiom unavailable — use JWT values
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
