// src/server/middleware/securityHeaders.ts
import { NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Security Headers middleware.
 * Adds CSP with a per‑request nonce, HSTS, DNS‑prefetch control, and other common headers.
 */
export function securityHeaders() {
  // Generate a random nonce for inline scripts (if ever needed)
  const nonce = crypto.randomBytes(16).toString("base64");

  const cspDirectives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`, // nonce allows safe inline scripts
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https://*.vercel.app https://*.appwrite.io https://*.facebook.com",
    "connect-src 'self' https://*.vercel.app https://*.appwrite.io https://graph.facebook.com https://graph.facebook.com/v12.0 https://sentry.io",
    "frame-src https://*.facebook.com https://*.vercel.app",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join("; ");

  const response = NextResponse.next();

  response.headers.set("Content-Security-Policy", cspDirectives);
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "geolocation=() camera=() microphone=()");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  // Expose the nonce for any inline script that may need it (optional)
  response.headers.set("CSP-Nonce", nonce);

  return response;
}

// Usage example (can be placed in src/app/middleware.ts)
// export const middleware = securityHeaders;
