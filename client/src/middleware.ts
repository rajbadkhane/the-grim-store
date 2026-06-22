import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.get("grim_auth_status")?.value === "true";

  // Protected paths that require authentication
  const protectedPaths = ["/account", "/checkout", "/wishlist"];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  // Authentication path (/login)
  const isAuthPath = pathname === "/login";

  if (isProtected && !isAuthenticated) {
    // Redirect to login with callback redirect query param
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPath && isAuthenticated) {
    // Redirect authenticated users away from login page to account
    const redirectUrl = new URL("/account", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

// Config to specify matching routes
export const config = {
  matcher: ["/account/:path*", "/checkout/:path*", "/wishlist/:path*", "/login"]
};
