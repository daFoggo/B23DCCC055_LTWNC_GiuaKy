export const HOME_PATH = "/"
export const SIGN_IN_PATH = "/sign-in"
export const SIGN_UP_PATH = "/sign-up"
/** Signed-in accounts without a staff role wait here until an admin grants one. */
export const PENDING_PATH = "/pending-access"
/** Clears the session cookie, then goes to sign-in (breaks proxy/DAL redirect loops). */
export const SESSION_EXPIRED_PATH = "/auth/expired"

/** Pages reachable without a session. */
export const PUBLIC_PATHS = [
  SIGN_IN_PATH,
  SIGN_UP_PATH,
  SESSION_EXPIRED_PATH,
] as const
/** Pages a signed-in user is sent away from. */
export const AUTH_PAGES = [SIGN_IN_PATH, SIGN_UP_PATH] as const
