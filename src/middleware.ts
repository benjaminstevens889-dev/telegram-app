import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Set CSP header
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: data:;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob: https:;
    media-src 'self' blob: data: https:;
    connect-src 'self' https: wss: blob: data:;
    font-src 'self' data:;
    object-src 'none';
    frame-src 'self' https:;
    worker-src 'self' blob:;
  `.replace(/\s{2,}/g, ' ').trim();
  
  response.headers.set('Content-Security-Policy', cspHeader);
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/(.*)',
  ],
};
