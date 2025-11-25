// app/(auth)/register/middleware.ts
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
    });

    const isAuth = !!token;
    const { pathname } = req.nextUrl;

    const isProtected =
        pathname.startsWith("/dashboard") || pathname.startsWith("/settings");

    if (isProtected && !isAuth) {
        const loginUrl = new URL("/login", req.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/settings/:path*"],
};
