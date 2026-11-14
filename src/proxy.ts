// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — API EDGE GUARD (Next.js 16 Proxy)
// ==============================================================================
// The browser never talks to NASA, NOAA, Groq or Supabase administration
// directly: every credentialed call is made inside a same-origin Route Handler.
// This proxy makes that boundary explicit.
//
//  • Cross-site browser calls to /api/* are rejected, so another website cannot
//    use a visitor's session (or our inference quota) through their browser.
//  • No wildcard CORS headers are emitted anywhere in the app.
//  • API responses are marked no-store and get defensive security headers.
//
// Server-to-server callers (health probes, cron) send no Origin header and are
// therefore unaffected.
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';

const APP_ORIGINS = new Set(
  [process.env.NEXT_PUBLIC_APP_URL, 'http://localhost:3000', 'http://127.0.0.1:3000']
    .filter(Boolean)
    .map(url => {
      try {
        return new URL(url as string).origin;
      } catch {
        return null;
      }
    })
    .filter((origin): origin is string => Boolean(origin))
);

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const fetchSite = request.headers.get('sec-fetch-site');

  // Non-browser clients and same-origin navigations do not send Origin.
  if (!origin) return true;

  if (APP_ORIGINS.has(origin)) return true;

  const host = request.headers.get('host');
  try {
    if (host && new URL(origin).host === host) return true;
  } catch {
    return false;
  }

  // Explicit cross-site marker is always rejected, even if Origin parse fails.
  if (fetchSite === 'cross-site') return false;

  return false;
}

export function proxy(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { error: 'Cross-origin API access is not allowed.' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Frame-Options', 'DENY');
  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};
