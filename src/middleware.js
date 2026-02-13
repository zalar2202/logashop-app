import { NextResponse } from "next/server";
import { COOKIE_NAMES } from "@/constants/config";

/**
 * Middleware to protect routes and handle auth redirects
 */
export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Check for auth token in cookies
    const token = request.cookies.get(COOKIE_NAMES.TOKEN)?.value;

    // Define protected paths
    const isPanelPath = pathname.startsWith("/panel");
    const isAuthPath = pathname.startsWith("/login") || pathname.startsWith("/signup");

    // Case 1: Trying to access panel without token -> Redirect to login
    if (isPanelPath && !token) {
        const url = new URL("/login", request.url);
        // Save the original URL to redirect back after login
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
    }

    // Case 2: Trying to access login/signup while already logged in -> Redirect to dashboard
    if (isAuthPath && token) {
        return NextResponse.redirect(new URL("/panel/dashboard", request.url));
    }

    return NextResponse.next();
}

/**
 * Matcher configuration
 */
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - assets (public assets)
         */
        "/((?!api|_next/static|_next/image|favicon.ico|assets).*)",
    ],
};
