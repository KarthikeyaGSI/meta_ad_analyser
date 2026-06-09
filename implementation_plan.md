# Secure Meta Graph API Architecture

Migrate the Meta Ads Graph API integration from a completely client-side implementation (which exposes access tokens to the browser via `localStorage`) to a secure, server-side implementation utilizing Next.js Server API Routes and the Neon Database.

## User Review Required

> [!IMPORTANT]
> **Database Schema Changes**: This plan requires modifying the `organizations` table in your Postgres database to store the `metaAccessToken` securely. We will need to run a database migration after these code changes.

## Proposed Changes

---

### Database Schema Updates
We need to add columns to the `organizations` table to store the Meta credentials.

#### [MODIFY] [schema.ts](file:///c:/Users/Student/Desktop/ad%20analyser/src/server/db/schema.ts)
Add the following fields to `organizations`:
- `metaAccessToken`: `text('meta_access_token')`
- `metaAccountId`: `text('meta_account_id')`

---

### Authentication Flow Fixes
The OAuth callback needs to save the generated Long-Lived Token into the database.

#### [MODIFY] [route.ts (Callback)](file:///c:/Users/Student/Desktop/ad%20analyser/src/app/api/auth/meta/callback/route.ts)
- Extract the user's session cookie (`better-auth.session_token`).
- Look up the user's `organizationId` from the DB.
- `await db.update(organizations).set({ metaAccessToken: longLivedToken }).where(...)`

---

### Backend Service Creation
We will migrate `metaDirect.ts` from a browser utility to a backend secure service.

#### [NEW] [meta.service.ts](file:///c:/Users/Student/Desktop/ad%20analyser/src/server/services/meta.service.ts)
- Port over all logic from `metaDirect.ts` (Overview, Campaigns, Adsets, Charts, Creatives).
- Modify the `fetchGraph` method to fetch the token directly from the database using `organizationId` instead of reading from `localStorage`.

#### [DELETE] [metaDirect.ts](file:///c:/Users/Student/Desktop/ad%20analyser/src/services/metaDirect.ts)
- Remove the insecure client-side library completely.

---

### Internal API Routes
We will build secure Next.js API routes that the dashboard will hit. These routes will be protected by our existing Edge JWT middleware.

#### [NEW] [route.ts (Meta API)](file:///c:/Users/Student/Desktop/ad%20analyser/src/app/api/meta/route.ts)
- Create a unified `GET` endpoint that accepts an `action` query parameter (e.g., `?action=overview` or `?action=campaigns`).
- Automatically extracts `x-organization-id` from the secure request headers.
- Proxies the request to `meta.service.ts`.

---

### Frontend Dashboard Updates
The UI needs to point to our new secure internal API instead of making direct external Facebook API requests.

#### [MODIFY] [page.tsx (Analytics Dashboard)](file:///c:/Users/Student/Desktop/ad%20analyser/src/app/dashboard/analytics/page.tsx)
- Replace all `MetaDirectApi.getXXX(...)` calls with `fetch('/api/meta?action=XXX')`.
- Remove references to `localStorage` checking.

## Verification Plan

### Automated Tests
- Run `npm run build` and `tsc --noEmit` to ensure no Type errors.

### Manual Verification
- Re-run the Meta OAuth Flow from `/dashboard/connect`.
- Verify the token is securely stored in Neon.
- Load the `/dashboard/analytics` page and verify it fetches data via `/api/meta` rather than direct `graph.facebook.com` requests.
