import { pgTable, uuid, text, timestamp, integer, boolean, jsonb } from 'drizzle-orm/pg-core';

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
}).enableRLS();

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash'),
  role: text('role').default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
}).enableRLS();

export const admins = pgTable('admins', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull().unique(),
  superAdmin: boolean('super_admin').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}).enableRLS();

export const plans = pgTable('plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  description: text('description'),
  price: integer('price').notNull(),
  billingPeriod: text('billing_period').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}).enableRLS();

export const planFeatures = pgTable('plan_features', {
  id: uuid('id').primaryKey().defaultRandom(),
  planId: uuid('plan_id').references(() => plans.id).notNull(),
  featureKey: text('feature_key').notNull(),
  featureValue: jsonb('feature_value').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}).enableRLS();

export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  stripeCustomerId: text('stripe_customer_id'),
  billingEmail: text('billing_email'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
}).enableRLS();

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  customerId: uuid('customer_id').references(() => customers.id).notNull(),
  planId: uuid('plan_id').references(() => plans.id).notNull(),
  status: text('status').notNull(),
  currentPeriodStart: timestamp('current_period_start').notNull(),
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
}).enableRLS();

export const licenses = pgTable('licenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  subscriptionId: uuid('subscription_id').references(() => subscriptions.id),
  planId: uuid('plan_id').references(() => plans.id).notNull(),
  keyHash: text('key_hash').notNull().unique(),
  status: text('status', { enum: ['active', 'revoked', 'expired', 'frozen'] }).notNull(),
  durationDays: integer('duration_days').notNull(),
  gracePeriodDays: integer('grace_period_days').default(0).notNull(),
  maxSeats: integer('max_seats').notNull(),
  maxDevices: integer('max_devices').notNull(),
  internalNotes: text('internal_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
}).enableRLS();

export const licenseActivations = pgTable('license_activations', {
  id: uuid('id').primaryKey().defaultRandom(),
  licenseId: uuid('license_id').references(() => licenses.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  status: text('status').notNull(),
  activatedAt: timestamp('activated_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
}).enableRLS();

export const licenseDevices = pgTable('license_devices', {
  id: uuid('id').primaryKey().defaultRandom(),
  activationId: uuid('activation_id').references(() => licenseActivations.id).notNull(),
  deviceId: text('device_id').notNull(),
  deviceName: text('device_name'),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  lastSeenAt: timestamp('last_seen_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}).enableRLS();

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  userId: uuid('user_id').references(() => users.id),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id'),
  metadata: jsonb('metadata'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}).enableRLS();

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  userId: uuid('user_id').references(() => users.id).notNull(),
  token: text('token').notNull().unique(),
  deviceId: text('device_id'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}).enableRLS();

export const webhookEvents = pgTable('webhook_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  source: text('source').notNull(), // e.g., 'stripe'
  type: text('type').notNull(),
  payload: jsonb('payload').notNull(),
  status: text('status', { enum: ['pending', 'processed', 'failed'] }).default('pending').notNull(),
  retries: integer('retries').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  processedAt: timestamp('processed_at'),
}).enableRLS();
