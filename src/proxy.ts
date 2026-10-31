import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Optimistic guard: only checks for the presence of a Better Auth session
 * cookie (no database call). Real authorization happens in server code via
 * `requireUser()` / `requireAdmin()`.
 *
 * Next.js 16 calls this file `proxy.ts` (formerly `middleware.ts`).
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  // Forward the current path so server components can build accurate
  // `next` redirect links without guessing.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", `${pathname}${search}`);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/checkout/:path*"],
};
