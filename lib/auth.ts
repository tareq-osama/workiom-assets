import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import type { JWTPayload, UserRole } from '@/types/user'

export const ADMIN_ROLES: UserRole[] = ['Marketing Team', 'Admin']
export const CONTRIBUTOR_ROLES: UserRole[] = ['Marketing Team', 'Admin', 'Design Team']

export function isAdmin(role: UserRole): boolean {
  return ADMIN_ROLES.includes(role)
}

export function isContributor(role: UserRole): boolean {
  return CONTRIBUTOR_ROLES.includes(role)
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET environment variable is not set')
  return new TextEncoder().encode(secret)
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as UserRole,
      status: payload.status as JWTPayload['status'],
    }
  } catch {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}
