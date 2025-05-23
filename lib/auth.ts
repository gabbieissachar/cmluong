import { auth } from '@clerk/nextjs/server'
import { useAuth } from '@clerk/nextjs'

export type UserRole = 'accountant' | 'staff'

/**
 * Get the current user's role on the server.
 */
export function getServerUserRole(): UserRole | undefined {
  const { sessionClaims } = auth()
  return sessionClaims?.role as UserRole | undefined
}

/**
 * React hook to read the role claim on the client.
 */
export function useUserRole(): UserRole | undefined {
  const { sessionClaims } = useAuth()
  return sessionClaims?.role as UserRole | undefined
}

/**
 * Helper to check if the current user matches a role.
 */
export function hasServerRole(role: UserRole): boolean {
  return getServerUserRole() === role
}
