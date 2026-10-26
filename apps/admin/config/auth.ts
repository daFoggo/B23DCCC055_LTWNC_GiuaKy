import type { AuthOptions } from "@workspace/auth/types"

/** The admin's own session cookie; the web app uses another so the two never share a session. */
export const AUTH_OPTIONS = {
  cookieName: "nmb-admin-auth",
} as const satisfies AuthOptions
