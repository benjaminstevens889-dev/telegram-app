import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Set Content Security Policy - very permissive for development
  const cspHeader = "default-src 'self' 'unsafe-eval' 'unsafe-inline' https: blob: data:; script-src 'self' 'unsafe-eval' 'unsafe-inline' 'unsafe-hashes' https: blob:; style-src 'self' 'unsafe-inline' https:; img-src 'self' https: data: blob:; font-src 'self' https: data:; connect-src 'self' https: wss: ws:; media-src 'self' https: blob: data:; object-src 'none'; frame-src 'self' https:;";

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

// Apply to all routes
export const config = {
  matcher: '/:path*',
};
