import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-server";

/**
 * Route protection is UX only (spec §8): it keeps signed-out users from
 * hitting dead ends. The real enforcement lives in the Convex functions
 * (requireUser / requireAdmin) — a crafted client call still fails there.
 */
export async function middleware(request: NextRequest) {
  let authed = false;
  try {
    authed = await isAuthenticated();
  } catch {
    // Token endpoint unreachable (Convex down or not yet configured): treat as
    // signed out rather than 500. Convex functions remain the enforcement point.
  }
  if (!authed) {
    const url = new URL("/signin", request.url);
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
