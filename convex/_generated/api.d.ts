/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as ai from "../ai.js";
import type * as analytics from "../analytics.js";
import type * as billing from "../billing.js";
import type * as crm from "../crm.js";
import type * as crons from "../crons.js";
import type * as emails from "../emails.js";
import type * as flags from "../flags.js";
import type * as integrations from "../integrations.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_rbac from "../lib/rbac.js";
import type * as lib_tenant from "../lib/tenant.js";
import type * as lib_usage from "../lib/usage.js";
import type * as organizations from "../organizations.js";
import type * as premium from "../premium.js";
import type * as referrals from "../referrals.js";
import type * as storage from "../storage.js";
import type * as success from "../success.js";
import type * as users from "../users.js";
import type * as webhooks from "../webhooks.js";
import type * as workspaces from "../workspaces.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  ai: typeof ai;
  analytics: typeof analytics;
  billing: typeof billing;
  crm: typeof crm;
  crons: typeof crons;
  emails: typeof emails;
  flags: typeof flags;
  integrations: typeof integrations;
  "lib/auth": typeof lib_auth;
  "lib/rbac": typeof lib_rbac;
  "lib/tenant": typeof lib_tenant;
  "lib/usage": typeof lib_usage;
  organizations: typeof organizations;
  premium: typeof premium;
  referrals: typeof referrals;
  storage: typeof storage;
  success: typeof success;
  users: typeof users;
  webhooks: typeof webhooks;
  workspaces: typeof workspaces;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
