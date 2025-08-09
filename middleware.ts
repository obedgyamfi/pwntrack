import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const publicRoutes = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
    const { nextUrl } = request;

    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET
    });

    const isAuthenticated = !!token;
    const isPublicRoute = publicRoutes.some(path => nextUrl.pathname.startsWith(path));

    if (!isAuthenticated && !isPublicRoute) {
        return NextResponse.redirect(new URL('/login', nextUrl));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};