import { isStaff, type Role } from "@workspace/auth/permissions"

import {
  AUTH_PAGES,
  HOME_PATH,
  PENDING_PATH,
  PUBLIC_PATHS,
  SESSION_EXPIRED_PATH,
  SIGN_IN_PATH,
} from "@/config/routes"

type GateInput = {
  pathname: string
  isAuthenticated: boolean
  role: Role | null
}

const isOneOf = (pathname: string, paths: readonly string[]) =>
  paths.includes(pathname)

/**
 * Optimistic routing for the proxy: where to send this request, or `null` to let it through. Pages and actions
 * still authorize through the DAL, and RLS through the token.
 */
export function adminGate({
  pathname,
  isAuthenticated,
  role,
}: GateInput): string | null {
  if (pathname === SESSION_EXPIRED_PATH) return null
  if (!isAuthenticated) {
    return isOneOf(pathname, PUBLIC_PATHS) ? null : SIGN_IN_PATH
  }
  const staff = role !== null && isStaff(role)
  if (staff) {
    return isOneOf(pathname, AUTH_PAGES) || pathname === PENDING_PATH
      ? HOME_PATH
      : null
  }
  return pathname === PENDING_PATH ? null : PENDING_PATH
}
