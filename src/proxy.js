import { NextResponse } from "next/server";
import { COOKIE_NAMES } from "@/constants/config";

/**
 * Proxy: protect routes and handle auth redirects (runs at the edge).
 */
export function proxy(request) {
    const { pathname } = request.nextUrl;

    const token = request.cookies.get(COOKIE_NAMES.TOKEN)?.value;

    const isPanelPath = pathname.startsWith("/panel");
    const isAuthPath = pathname.startsWith("/login") || pathname.startsWith("/signup");

    if (isPanelPath && !token) {
        const url = new URL("/login", request.url);
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
    }

    if (isAuthPath && token) {
        return NextResponse.redirect(new URL("/panel/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|assets).*)"],
};
