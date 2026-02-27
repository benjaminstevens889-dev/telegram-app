import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Set a very permissive CSP that allows everything including eval
  // This is needed for some libraries that use eval() or new Function()
  response.headers.set(
    'Content-Security-Policy',
    "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval' data: blob:; style-src * 'unsafe-inline' data:; img-src * data: blob:; connect-src * data: blob:; font-src * data:;"
  );

  return response;
}

// Apply to all routes
export const config = {
  matcher: '/:path*',
};
