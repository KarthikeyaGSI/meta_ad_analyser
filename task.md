# SaaS Infrastructure Upgrades

- `[x]` **Premium UX Polish (CRO)**
  - `[x]` Refactor `src/app/login/page.tsx` to monochrome enterprise design
  - `[x]` Refactor `src/app/signup/page.tsx` to monochrome enterprise design
  - `[x]` Refactor `src/app/activation/page.tsx` to monochrome enterprise design
  
- `[x]` **Upstash Rate Limiting**
  - `[x]` Install `@upstash/ratelimit`
  - `[x]` Integrate rate limiting into `src/middleware.ts` for `/api/license/activate`

- `[x]` **Seat Management Dashboard**
  - `[x]` Update `src/server/services/license.service.ts` to identify the license owner and list seats
  - `[x]` Create `/api/admin/seats/route.ts` API endpoint
  - `[x]` Create `src/app/dashboard/settings/team/page.tsx` UI

- `[x]` **Meta Ads Graph API Integration**
  - `[x]` Create `/api/auth/meta/route.ts` for OAuth redirect
  - `[x]` Create `/api/auth/meta/callback/route.ts` for OAuth callback
  - `[x]` Create `src/app/dashboard/connect/page.tsx` for users to trigger the flow
