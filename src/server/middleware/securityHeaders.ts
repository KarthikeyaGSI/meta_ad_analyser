// src/server/middleware/securityHeaders.ts
import { NextResponse } from "next/server";

export function securityHeaders() {
  const csp = [
    "default-src 'self'", // only self by default
    "script-src 'self'", // no inline scripts; use nonce later if needed
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // allow Google Fonts CSS
    "font-src 'self' https://fonts.gstatic.com", // Google Fonts
    "img-src 'self' data: https://*.vercel.app https://*.appwrite.io https://*.facebook.com",
    "connect-src 'self' https://*.vercel.app https://*.appwrite.io https://graph.facebook.com https://graph.facebook.com/v12.0 https://sentry.io",
    "frame-src https://*.facebook.com https://*.vercel.app",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  const response = NextResponse.next();
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "geolocation=() camera=() microphone=()");
  return response;
}

// Usage: export const middleware = securityHeaders; // in /app/api/*/route.ts or global middleware file
