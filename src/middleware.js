import { NextResponse } from 'next/server';

export async function middleware(request) {
    const token = request.cookies.get('token');

    // If no token is present and trying to access protected routes
    if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}
