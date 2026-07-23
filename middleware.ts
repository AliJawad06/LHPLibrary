import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Route protection is UX only (spec §8): it keeps signed-out users from
 * hitting dead ends. The real enforcement lives in the Convex functions
 * (requireUser / requireAdmin) — a crafted client call still fails there.
 *
 * This is Better Auth's documented middleware pattern: an optimistic
 * cookie-presence check. No network call, no next/headers — both are
 * unreliable in the middleware runtime. A present-but-expired cookie gets
 * through, and the page's own auth-gated queries handle it.
 */
export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const url = new URL("/signin", request.url);
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
