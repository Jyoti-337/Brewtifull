import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');

    if (isAdminRoute && token?.role !== 'ADMIN' && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  },
  {
    secret: process.env.NEXTAUTH_SECRET || 'brew-tiful-coffee-super-secret-key-32-chars-long',
    pages: {
      signIn: '/login',
    },
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        if (path.startsWith('/admin') || path.startsWith('/orders')) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/orders/:path*'],
};
