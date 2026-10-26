import type { AuthOptions } from "@workspace/auth/types"

/** The web app's own session cookie; the admin uses another so the two never share a session. */
export const AUTH_OPTIONS = {
  cookieName: "nmb-web-auth",
} as const satisfies AuthOptions
