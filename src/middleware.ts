import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from 'jose';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || 'https://mock-redis-url.upstash.io',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || 'mock-token',
});

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, '10 m'),
  analytics: true,
});

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_development_only');

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("better-auth.session_token") || request.cookies.get("__Secure-better-auth.session_token");
  const licenseToken = request.cookies.get("vero.license_jwt");

  const path = request.nextUrl.pathname;
  const isProtected = path.startsWith('/dashboard') || path.startsWith('/api') && !path.startsWith('/api/auth') && !path.startsWith('/api/license');
  const isActivationRoute = path === '/activation';
  const isApiActivation = path === '/api/license/activate';

  if (isApiActivation && request.method === 'POST') {
    // Rate Limit: 5 requests per 10 minutes per IP
    const ip = request.ip || request.headers.get('x-forwarded-for') || '127.0.0.1';
    const { success } = await ratelimit.limit(`ratelimit_${ip}`);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Too many activation attempts. Please try again later.' },
        { status: 429 }
      );
    }
  }

  if (isProtected) {
    if (!sessionToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    
    // Phase 14: Edge License JWT Validation
    if (!licenseToken) {
      return NextResponse.redirect(new URL("/activation", request.url));
    }

    try {
      // Offline verification at the Edge! No DB hit required.
      const { payload } = await jwtVerify(licenseToken.value, JWT_SECRET);
      
      // If token is near expiration or we need hard DB/Redis check, we could do it here
      // But for high performance, if JWT is valid, we let them through.
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-license-id', payload.licenseId as string);
      requestHeaders.set('x-organization-id', payload.organizationId as string);
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (err) {
      // JWT is expired, tampered, or invalid.
      return NextResponse.redirect(new URL("/activation", request.url));
    }
  }

  // Prevent users with valid licenses from accessing the activation page again
  if (isActivationRoute && sessionToken && licenseToken) {
    try {
      await jwtVerify(licenseToken.value, JWT_SECRET);
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } catch {
      // Let them activate if token is invalid
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/activation', '/api/:path*'],
};
