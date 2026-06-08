# Implement Next-Level SaaS Infrastructure

This plan outlines the architecture and execution steps to implement all four major initiatives requested to elevate Vero into a premium, secure SaaS platform.

## User Review Required

> [!IMPORTANT]
> **Meta API Integration**: To implement the Facebook Graph API OAuth flow, you will need to create a Facebook Developer App and provide the `FACEBOOK_CLIENT_ID` and `FACEBOOK_CLIENT_SECRET`. I will set up the code so that it works seamlessly once you plug those into your `.env`.

> [!WARNING]
> **Design Overhaul**: The UI changes will completely strip away the glowing gradients and purple/blue orbs on the auth pages in favor of a stark, monochrome, enterprise-grade aesthetic (black, white, grays, and crisp typography). Please confirm you are okay with abandoning the previous gradient aesthetic.

## Open Questions

1. **Meta App Setup**: Do you already have a Facebook Developer app created for this project, or will you need instructions on how to set one up?
2. **Admin Dashboard Permissions**: Currently, anyone with a valid license accesses `/dashboard`. Should the "Seat Management" page be restricted to a specific "admin" role, or is the user who originally activated the license considered the "Owner" of that team?

## Proposed Changes

---

### 1. Premium UX Polish (CRO)
Complete redesign of the authentication and activation flows to match top-tier enterprise SaaS aesthetics.

#### [MODIFY] [src/app/login/page.tsx](file:///c:/Users/Student/Desktop/ad%20analyser/src/app/login/page.tsx)
Remove `framer-motion` heavy animations, delete the glowing blur circles, and implement a stark monochrome card with high-contrast text and crisp borders.
#### [MODIFY] [src/app/signup/page.tsx](file:///c:/Users/Student/Desktop/ad%20analyser/src/app/signup/page.tsx)
Match the new design language of the login page.
#### [MODIFY] [src/app/activation/page.tsx](file:///c:/Users/Student/Desktop/ad%20analyser/src/app/activation/page.tsx)
Apply the clean enterprise styling and improve the layout of the key entry form.

---

### 2. Seat Management Dashboard
Create a comprehensive admin portal to manage active team devices.

#### [NEW] [src/app/dashboard/settings/team/page.tsx](file:///c:/Users/Student/Desktop/ad%20analyser/src/app/dashboard/settings/team/page.tsx)
A data table UI showing active seats, user emails, device fingerprints, and an action column to "Revoke Access".
#### [NEW] [src/app/api/admin/seats/route.ts](file:///c:/Users/Student/Desktop/ad%20analyser/src/app/api/admin/seats/route.ts)
A protected REST API endpoint to fetch all active devices for the current organization and manually revoke specific sessions via DELETE request.
#### [MODIFY] [src/server/services/license.service.ts](file:///c:/Users/Student/Desktop/ad%20analyser/src/server/services/license.service.ts)
Add `getTeamActivations(organizationId)` and `revokeActivation(activationId)` helper functions.

---

### 3. Upstash Rate Limiting
Prevent brute-force attacks against the activation system.

#### [MODIFY] [src/middleware.ts](file:///c:/Users/Student/Desktop/ad%20analyser/src/middleware.ts)
Import `@upstash/ratelimit` and initialize an edge-compatible rate limiter. 
Intercept POST requests to `/api/license/activate`. Allow a maximum of 5 requests per 10 minutes per IP address. If exceeded, return HTTP 429 Too Many Requests.

---

### 4. Meta Ads Graph API Integration
Build the OAuth flow to securely capture the Facebook user token for ad analysis.

#### [NEW] [src/app/dashboard/connect/page.tsx](file:///c:/Users/Student/Desktop/ad%20analyser/src/app/dashboard/connect/page.tsx)
A dedicated page prompting the user to "Connect Meta Ads Account" with a button that triggers the OAuth flow.
#### [NEW] [src/app/api/auth/meta/route.ts](file:///c:/Users/Student/Desktop/ad%20analyser/src/app/api/auth/meta/route.ts)
Endpoint that constructs the `https://www.facebook.com/v19.0/dialog/oauth` URL and redirects the user to Facebook.
#### [NEW] [src/app/api/auth/meta/callback/route.ts](file:///c:/Users/Student/Desktop/ad%20analyser/src/app/api/auth/meta/callback/route.ts)
Handles the OAuth redirect from Facebook, exchanges the `code` for a long-lived access token, and securely stores it against the user's organization in the database.

## Verification Plan

### Automated Tests
- Run `npm run build` and `npx tsc --noEmit` to ensure type safety across the new API routes and `@upstash/ratelimit` integration.

### Manual Verification
- Attempt to spam the `/activation` endpoint to verify the Edge rate limiter blocks the 6th request.
- Manually trigger a "Revoke Access" call from the new Team Dashboard and verify the database status changes to `revoked`.
- Review the new UI in the browser to guarantee all gradients and "AI vibes" are gone.
