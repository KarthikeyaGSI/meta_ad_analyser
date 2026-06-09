# Secure Meta Graph API Architecture

- `[x]` **Database Schema Updates**
  - `[x]` Add `metaAccessToken` to `organizations` table in `src/server/db/schema.ts`
  - `[x]` Add `metaAccountId` to `organizations` table in `src/server/db/schema.ts`
  - `[x]` Run DB migration / schema update

- `[x]` **Authentication Flow Fixes**
  - `[x]` Update `/api/auth/meta/callback/route.ts` to save token into DB

- `[x]` **Backend Service Creation**
  - `[x]` Create `src/server/services/meta.service.ts`
  - `[x]` Delete `src/services/metaDirect.ts`

- `[x]` **Internal API Routes**
  - `[x]` Create `/api/meta/route.ts` proxy endpoint

- `[x]` **Frontend Dashboard Updates**
  - `[x]` Refactor `src/app/dashboard/analytics/page.tsx` to call internal `/api/meta`
  
- `[x]` **Verification**
  - `[x]` Run Type check
  - `[x]` Ensure app builds properly
