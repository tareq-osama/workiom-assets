export type UserRole = 'Viewer' | 'Marketing Team' | 'Design Team' | 'Developer' | 'Admin'
export type UserStatus = 'Active' | 'Inactive' | 'Pending'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  avatarUrl?: string
  lastLogin?: string
}

export interface JWTPayload {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
}
