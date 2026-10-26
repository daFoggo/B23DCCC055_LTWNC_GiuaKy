import type { NextRequest } from "next/server"

import { redirectWithSession, updateSession } from "@workspace/auth/proxy"

import { AUTH_OPTIONS } from "@/config/auth"
import { adminGate } from "@/lib/gate"

/**
 * 1) Refresh the session (provider-specific) so Server Components see fresh tokens.
 * 2) Optimistic routing through `adminGate` (sign-in, waiting page, staff). Real authorization is in the DAL.
 * 3) Emits Server-Timing header for Chrome DevTools Network profiling.
 */
export async function proxy(request: NextRequest) {
  const start = performance.now()
  const { response, isAuthenticated, role } = await updateSession(
    request,
    AUTH_OPTIONS
  )
  const duration = Math.max(0, performance.now() - start).toFixed(2)
  response.headers.set(
    "Server-Timing",
    `proxy;dur=${duration};desc="Proxy Auth Check"`
  )

  const target = adminGate({
    pathname: request.nextUrl.pathname,
    isAuthenticated,
    role,
  })
  if (target) return redirectWithSession(new URL(target, request.url), response)
  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|__nextjs_font|favicon.ico|icon.svg|robots.txt|sitemap.xml).*)",
  ],
}
