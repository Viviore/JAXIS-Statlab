# JAXIS — Task List

**Active Module:** `05-quotation` — Quotation & Pricing\
**Stack:** Next.js 16 App Router · Turborepo · Tailwind CSS v4 · Prisma · Supabase PostgreSQL · Cloudflare R2 · Resend · Trigger.dev · NextAuth.js v5\
**Spec Reference:** [`docs/modules/JAXIS_05-quotation.md`](./docs/modules/JAXIS_05-quotation.md)\
**Gate:** `npm run check-types` + `npm run lint` + `npm run build` must all pass before closing this module.

---

## Module 00 — Project Foundation & Infrastructure (Completed)

---

### Task 1 — Turborepo Workspace & Package Structure

**Objective:** Verify or establish the full monorepo workspace so all packages are wired and recognized by Turborepo.

**Steps:**

1. Confirm `turbo.json` defines `build`, `dev`, `lint`, `check-types` pipelines with correct inputs/outputs
2. Confirm `packages/ui`, `packages/typescript-config`, `packages/eslint-config` exist and are referenced in root `package.json` workspaces
3. Confirm `apps/app` and `apps/web` are recognized workspace members
4. Run `npm run dev` — verify `apps/app` starts on port 3001
5. Run `npm run build` across all workspaces — fix any build errors

**Acceptance:** `turbo run build` completes with zero errors. All workspace packages resolve.

- [x] `turbo.json` pipelines defined
- [x] All 5 workspace members recognized
- [x] `npm run dev` starts `apps/app` on port 3001
- [x] `npm run build` clean across all workspaces

---

### Task 2 — Design Tokens & Font Setup

**Objective:** Populate `globals.css` with all design system tokens and load the two required fonts.

**Steps:**

1. Open `src/app/globals.css` in `apps/app`
2. Add all CSS custom properties from `JAXIS_design-system.md` Section 2 (color tokens, typography scale, spacing, border-radius)
3. Open `src/app/layout.tsx` — import `Inter` (sans) + `Disket Mono` (mono) from `next/font/google`
4. Apply font variables as CSS custom properties on `<html>` element
5. Verify Tailwind v4 can reference all tokens in component files

**Acceptance:** All CSS custom properties render. Fonts load without FOUT in dev.

- [x] All color tokens from design system in `globals.css`
- [x] Inter and Disket Mono loaded via `next/font`
- [x] Font variables applied to `<html>` element
- [x] Tailwind v4 utility classes resolve

---

### Task 3 — Environment Schema & Infrastructure Clients

**Objective:** Implement the full Zod env schema and all infrastructure client stubs as specified in `JAXIS_00-foundation.md` Section 6.

**Steps:**

1. Install all required packages:
   ```bash
   npm install @supabase/supabase-js @aws-sdk/client-s3 @aws-sdk/s3-request-presigner resend @trigger.dev/sdk zod
   ```
2. Create `src/lib/env.ts` with the complete Zod schema from the spec (all 13 env vars: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL, RESEND_API_KEY, TRIGGER_API_KEY)
3. Create `src/lib/db.ts` — Prisma client singleton with global dev-mode caching
4. Create `src/lib/supabase.ts` — `supabaseClient` (browser) + `supabaseAdmin` (service role)
5. Create `src/lib/storage.ts` — R2 S3 client + `getR2UploadUrl()` + `getR2DownloadUrl()`
6. Create `src/lib/email/index.ts` — `sendEmail()` abstraction using Resend
7. Create `.env.example` with all vars documented
8. Create `.env.local` with actual dev credentials from Supabase + R2 + Resend dashboards

**Acceptance:** `src/lib/env.ts` throws on startup if any var is missing. All 4 clients initialize without error.

- [x] All packages installed
- [x] `src/lib/env.ts` Zod schema — all 13 vars validated
- [x] `src/lib/db.ts` Prisma singleton
- [x] `src/lib/supabase.ts` browser + admin clients
- [x] `src/lib/storage.ts` R2 client + pre-signed URL helpers
- [x] `src/lib/email/index.ts` `sendEmail()` abstraction
- [x] `.env.example` complete
- [x] `.env.local` populated with real credentials

---

### Task 4 — Prisma Schema Init & Supabase Connection

**Objective:** Initialize the Prisma schema with generator + datasource and verify connection to Supabase PostgreSQL.

**Steps:**

1. Open `prisma/schema.prisma`
2. Set `provider = "postgresql"`, `url = env("DATABASE_URL")`, `directUrl = env("DIRECT_URL")`
3. Add `DIRECT_URL` to `.env.example` and `.env.local` (Supabase direct URL, port 5432)
4. Run `npx prisma db push` — verify connection succeeds to Supabase
5. Run `npx prisma generate` — verify Prisma client generates cleanly
6. Wire seed script: add `"prisma": { "seed": "tsx prisma/seed.ts" }` to `package.json`
7. Create empty `prisma/seed.ts` stub (actual seed data added in Module 01)

**Acceptance:** `npx prisma db push` succeeds. `npx prisma studio` opens and connects to Supabase.

- [x] `DATABASE_URL` = Supabase pooler URL (port 6543)
- [x] `DIRECT_URL` = Supabase direct URL (port 5432)
- [x] `npx prisma db push` succeeds with zero errors
- [x] `npx prisma generate` succeeds
- [x] Seed script wired (empty stub)

---

### Task 5 — `@repo/ui` Component Library

**Objective:** Build all 13 shared UI primitives in `packages/ui` per the spec.

**Steps:**

1. Create all 13 components in `packages/ui/src/`: `Button` (4 variants × 3 sizes), `Card`, `StatusBadge`, `FormInput`, `FormSelect`, `FormTextarea`, `Modal`, `Alert`, `Skeleton`, `DataTable`, `PageHeader`, `Badge`, `Toast`
2. Each component: accepts `className` prop, uses design token CSS variables, zero business logic
3. `Button`: variants `primary | secondary | ghost | danger`; `loading` prop shows spinner, disables click
4. `StatusBadge`: maps all 22 `ProjectStatus` values to correct semantic color tokens
5. `DataTable`: accepts `columns[]`, `rows[]`, `loading` (shows `Skeleton` rows), `emptyState`
6. Export all from `packages/ui/src/index.ts`
7. Verify `apps/app` can import via `@repo/ui` path alias

**Acceptance:** All 13 components render without TypeScript errors. No `any` types.

- [x] All 13 components created
- [x] `Button` — all 4 variants × 3 sizes render
- [x] `StatusBadge` — all 22 project statuses mapped
- [x] `DataTable` — loading skeleton and empty state work
- [x] No `any` types in any component
- [x] `@repo/ui` imports resolve in `apps/app`

---

### Task 6 — Base Layout Shell & Module Gate

**Objective:** Build the structural dashboard layout shell and run the full Module 00 gate.

**Steps:**

1. Create `src/app/layout.tsx` — root layout with font variables, providers, `globals.css` import
2. Create `src/app/dashboard/layout.tsx` — dashboard shell with `<Topbar>` + `<Sidebar>` structural placeholders
3. `<Topbar>`: 56px height, bg-[#010114], JAXIS logo mark (left), user stub (right)
4. `<Sidebar>`: 240px width, bg-[#010114], border-right, role label badge (placeholder), nav links placeholder, user info card (bottom)
5. Create `src/app/page.tsx` — root page redirect stub (will be updated in Module 01)
6. Run all quality gates:
   - `npm run check-types` → 0 errors
   - `npm run lint` → 0 warnings/errors
   - `npm run build` → clean
7. Mark all checklist items in `JAXIS_00-foundation.md` Section 8 as `[x]`
8. Update this file: mark all Task 1–6 items `[x]`, set Active Module to `01-auth`

**Acceptance:** Dashboard shell renders. All 3 quality gates pass. Module 01 unblocked.

- [x] Root layout renders without error
- [x] `<Topbar>` structural shell correct (height, colors, font)
- [x] `<Sidebar>` structural shell correct (width, border, placement)
- [x] `npm run check-types` → 0 errors
- [x] `npm run lint` → 0 warnings/errors
- [x] `npm run build` → clean
- [x] `JAXIS_00-foundation.md` Section 8 checklist fully marked
- [x] Active module updated to `01-auth`

---

## Module 01 — Authentication & RBAC

### Task 1 — Prisma Schema: Identity Models & Migration

**Objective:** Define all database models for Module 01 and run the initial migration.

**Steps:**

1. Open `prisma/schema.prisma`
2. Add the `UserStatus` and `AuthEvent` enums, and `RoleName` enum (6 values: `CLIENT`, `STATISTICIAN`, `SENIOR_QA_LEAD`, `ADMIN`, `FINANCE_OFFICER`, `CEO`)
3. Add the `User` model with fields: `id` (cuid), `email` (unique), `passwordHash`, `fullName`, `phone?`, `status` (default `ACTIVE`), `createdAt`, `updatedAt`
4. Add the `Role` model with fields: `id` (autoincrement), `name` (unique RoleName), `label`
5. Add the `UserRole` junction model with composite PK `[userId, roleId]`, `assignedAt`, `assignedBy?`
6. Add the `AuthAuditLog` model with fields: `id`, `userId?`, `email`, `event` (AuthEvent enum), `ipAddress?`, `userAgent?`, `metadata?` (Json), `createdAt`
7. Add all indexes per the spec (email, status, userId, roleId, event, createdAt)
8. Run `npx prisma migrate dev --name init-auth-identity`
9. Verify migration succeeds and tables appear in the DB

**Acceptance:** `npx prisma migrate status` shows all migrations applied. `npx prisma studio` shows all 4 tables.

- [x] `UserStatus`, `RoleName`, `AuthEvent` enums defined
- [x] `User` model with indexes on `email`, `status`
- [x] `Role` model with unique `name`
- [x] `UserRole` junction with composite PK `[userId, roleId]`
- [x] `AuthAuditLog` model with indexes on `userId`, `email`, `event`, `createdAt`
- [x] Prisma client generated with new models

---

### Task 2 — Database Seed: Roles & All 6 Dev Users

**Objective:** Populate the database with all 6 roles and one seed user per role for local development and testing.

**Steps:**

1. Open `prisma/seed.ts`
2. Import `PrismaClient` and `bcryptjs`
3. Define the `roles` array with all 6 entries (id, name, label) and upsert them
4. Define the `seedUsers` array (one per role: fullName, email, password, role) per the spec seed data table
5. For each seed user: hash password with `bcrypt.hash(password, 12)`, upsert `User`, upsert `UserRole` linking to the correct `Role` id
6. Add seed script to `package.json`: `"seed": "tsx prisma/seed.ts"`
7. Run `npx prisma db seed`
8. Verify all 6 roles and 6 users appear in the database with hashed passwords (not plain text)

**Acceptance:** All seed users can be found via `npx prisma studio`. Password fields contain bcrypt hashes (start with `$2b$`).

- [x] All 6 roles seeded
- [x] All 6 dev users seeded with hashed passwords
- [x] `UserRole` records correctly linking each user to their role
- [x] Seed is idempotent (running twice does not error or duplicate)
- [x] `npm run seed` command wired in `package.json`

---

### Task 3 — NextAuth.js v5 Configuration & `requireRole()` Utility

**Objective:** Configure NextAuth.js v5 credentials provider, session callbacks, and implement the `requireRole()` guard utility.

**Steps:**

1. Install: `npm install next-auth@beta bcryptjs && npm install -D @types/bcryptjs`
2. Create `src/lib/auth.ts`:
   - Configure `NextAuth` with credentials provider
   - `authorize()` callback: find user by email, verify password with `bcrypt.compare`, check `status !== SUSPENDED/TERMINATED`, fetch role from `UserRole`, return `{ id, email, fullName, role }`
   - `jwt` callback: embed `userId`, `role`, `fullName` into token
   - `session` callback: expose `userId`, `role`, `fullName` on `session.user`
   - `events.signIn` callback: write `LOGIN_SUCCESS` to `AuthAuditLog`
   - `events.signOut` callback: write `LOGOUT` to `AuthAuditLog`
   - Failed authorize: write `LOGIN_FAILED` or `ACCOUNT_SUSPENDED_BLOCK` to `AuthAuditLog`, return null
3. Create `src/app/api/v1/auth/[...nextauth]/route.ts` — export `{ GET, POST }` from `auth` handlers
4. Add `NEXTAUTH_SECRET` and `NEXTAUTH_URL` to `src/lib/env.ts` Zod schema and `.env.example`
5. Implement `requireRole(...roles: Role[])` in `src/lib/auth.ts` — calls `auth()`, checks session, throws typed errors
6. Add TypeScript module augmentation to extend `Session` type with `role` and `fullName`

**Acceptance:** `requireRole('ADMIN')` with an admin session returns the session. With a client session, it throws `FORBIDDEN`. No TypeScript errors.

- [x] `src/lib/auth.ts` created with full NextAuth config
- [x] `authorize()` correctly handles wrong password, suspended, and terminated states
- [x] JWT and session callbacks embed `userId`, `role`, `fullName`
- [x] Auth audit log writes on login success, login failure, and logout
- [x] `requireRole()` implemented and typed
- [x] Session type augmentation — `session.user.role` has no TypeScript errors
- [x] `.env.example` updated

---

### Task 4 — Auth Pages: Login & Register UI

**Objective:** Build the `/login` and `/register` pages with proper form validation, error states, and post-auth redirects.

**Steps:**

1. Create `src/features/auth/schemas.ts` with `LoginSchema` and `RegisterSchema` (Zod) per the spec
2. Create `src/features/auth/actions.ts`:
   - `registerClient(data)`: validates with `RegisterSchema`, checks email uniqueness, hashes password, creates `User` + `UserRole` (CLIENT), writes `REGISTRATION` to `AuthAuditLog`, returns success or typed error
3. Create `src/app/(auth)/login/page.tsx`:
   - Form: email + password fields using `FormInput` from `@/components/ui/FormInput`
   - Submit calls `signIn('credentials', { email, password, redirectTo: ... })`
   - Post-login redirect: use `ROLE_HOME` map to send each role to their desk
   - Error states: `INVALID_CREDENTIALS` (401), `ACCOUNT_SUSPENDED` (403), `ACCOUNT_TERMINATED` (403)
   - Link to `/register` for new clients
4. Create `src/app/(auth)/register/page.tsx`:
   - Form: fullName, email, password, confirmPassword
   - Calls `registerClient()` Server Action
   - Success: redirect to `/login` with `?registered=true` toast query param
   - Error states: `EMAIL_TAKEN` (409), `VALIDATION_ERROR` (422) with field-level messages
5. Both pages: redirect to role desk if user is already authenticated (middleware handles this, but add client-side guard too)
6. Apply design system tokens: `bg-[#010114]` canvas, `bg-[#012E57]` form card, `--accent` CTA button, Disket Mono for JAXIS brand mark

**Acceptance:** Login and register forms render correctly. Form validation errors display per field. Each role logs in and lands on the correct desk. Register success redirects to login.

- [x] `LoginSchema` and `RegisterSchema` defined in `schemas.ts`
- [x] `src/features/auth/actions.ts` implemented with `registerClient()` Server Action
- [x] `/login` page renders with Corporate Midnight design system tokens
- [x] `/register` page renders with form validation and password confirmation
- [x] Validation errors displayed inline on form fields
- [x] Login error messages for wrong password, suspended, terminated accounts
- [x] Password hash never returned to client or logged
- [x] Post-login redirect map implemented (`ROLE_HOME`)
- [x] Authenticated users visiting `/login` or `/register` are redirected

---

### Task 5 — Route Protection Middleware & Unauthorized Page

**Objective:** Implement `src/middleware.ts` to enforce session presence and role-scoped access on all dashboard routes.

**Steps:**

1. Create `src/middleware.ts`:
   - Use NextAuth `auth` export as middleware
   - Check `request.nextUrl.pathname` — if matches `/dashboard/*`, verify session exists; if not, redirect to `/login`
   - Parse the role from the session token, validate the path prefix against the role map (e.g., `/dashboard/admin` requires `ADMIN`)
   - On role mismatch: redirect to `/unauthorized`
   - On no session: redirect to `/login?callbackUrl=...`
   - Export `config.matcher` to scope middleware to `/dashboard/:path*` only
2. Create `src/app/unauthorized/page.tsx`:
   - Display: "Access Denied", user's current role, the route they attempted
   - Link: "Go to your dashboard" (using role home map)
   - Apply design system: crimson status color for the alert, standard card layout
3. Create role-scoped dashboard shells (`/dashboard/client/page.tsx`, `/dashboard/admin/page.tsx`, etc.):
   - Each is a minimal stub with: Page title matching the role desk name, sidebar with role label + placeholder nav links, topbar with user's full name + logout button
   - No feature content — just the structural shell for subsequent modules to fill
4. Test all 6 role redirects manually + verify middleware does not interfere with `/api/*` routes or public pages

**Acceptance:** Middleware correctly blocks unauthenticated access. Cross-role access redirects to `/unauthorized`. Each role desk stub renders.

- [x] `src/middleware.ts` created with session check and role routing
- [x] `config.matcher` scoped correctly — does not block `/api/*`, `/login`, `/register`, `/unauthorized`
- [x] Unauthenticated `/dashboard/*` visit → redirect to `/login`
- [x] CLIENT visiting `/dashboard/admin/` → redirect to `/unauthorized`
- [x] `/unauthorized` page renders with role context and back link
- [x] All 6 role dashboard shells render at their correct routes
- [x] Topbar shows full name and working logout button

---

### Task 6 — Client Registration API Route & Audit Log Verification

**Objective:** Expose the client registration as a proper API route alongside the Server Action, and verify all audit log entries are being written correctly.

**Steps:**

1. Create `src/app/api/v1/auth/register/route.ts`:
   - `POST` handler: validates body with `RegisterSchema` via Zod `safeParse`
   - On invalid: return `VALIDATION_ERROR` (422) with `parsed.error.flatten()`
   - On valid: call `registerClient()` shared logic (extracted to a service function)
   - On `EMAIL_TAKEN`: return 409
   - On success: return 201 `{ message: 'Account created.' }`
   - No password or hash in response body — ever
2. Write a quick manual test script (`prisma/seed.ts` or a separate scratch file) to confirm:
   - `AuthAuditLog` has a `REGISTRATION` entry after registering
   - `AuthAuditLog` has a `LOGIN_SUCCESS` entry after logging in
   - `AuthAuditLog` has a `LOGIN_FAILED` entry with `userId: null` after a bad password attempt
   - `AuthAuditLog` has an `ACCOUNT_SUSPENDED_BLOCK` entry when a suspended user tries to log in
3. Add a temporary suspended-user to the seed for testing the block (mark `status: SUSPENDED`)
4. Confirm `npm run check-types`, `npm run lint`, `npm run build` all pass

**Acceptance:** API route returns correct status codes. All 5 audit event types are verifiable in the DB. Build is clean.

- [x] `POST /api/v1/auth/register` route created and validated
- [x] Returns 422 on schema failure with field-level error detail
- [x] Returns 409 on duplicate email
- [x] Returns 201 on success (no sensitive data in response)
- [x] `REGISTRATION` event in `AuthAuditLog` after successful register
- [x] `LOGIN_SUCCESS` event after correct login
- [x] `LOGIN_FAILED` event (userId=null) after wrong password
- [x] `ACCOUNT_SUSPENDED_BLOCK` event when suspended user attempts login
- [x] `npm run check-types` → 0 errors
- [x] `npm run lint` → 0 warnings
- [x] `npm run build` → clean

---

### Task 7 — Module Gate Verification & Handoff

**Objective:** Run the full acceptance checklist from `JAXIS_01-auth.md` Section 10, confirm all criteria pass, and mark the module complete.

**Steps:**

1. Run `npx prisma migrate status` — confirm all migrations applied
2. Run `npx prisma db seed` — confirm idempotent (no errors on second run)
3. Manually test login flow for all 6 seed roles — confirm each lands on the correct desk
4. Manually test register flow — valid, duplicate email, mismatched passwords
5. Manually test cross-role access — CLIENT → `/dashboard/admin/` → `/unauthorized`
6. Manually test unauthenticated access — `/dashboard/client/` → `/login`
7. Confirm audit log entries exist in DB for: REGISTRATION, LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT, ACCOUNT_SUSPENDED_BLOCK
8. Run `npm run check-types` → must be 0 errors
9. Run `npm run lint` → must be 0 warnings/errors
10. Run `npm run build` → must succeed cleanly
11. Mark all checklist items in `JAXIS_01-auth.md` Section 10 as `[x]`
12. Update this file: mark all Task 1–7 items `[x]`, set Active Module to `02-staff`

**Acceptance:** Every acceptance criterion in `JAXIS_01-auth.md` Section 10 is checked. Build is clean. Module 02 can begin.

- [x] All 6 roles can log in and land on the correct desk
- [x] Register flow works end-to-end
- [x] RBAC enforcement verified for all role/route combinations
- [x] Audit log verified for all 5 event types
- [x] `npm run check-types` → 0 errors
- [x] `npm run lint` → 0 warnings/errors
- [x] `npm run build` → clean
- [x] `JAXIS_01-auth.md` Section 10 checklist fully marked
- [x] Active module updated to `02-staff`

---

## Module 02 — Expert Provisioning & Staff Management

### Task 1 — Prisma Schema: `StaffProfile`, `SuspensionLog`, Enums & Migration

**Objective:** Define data models for staff specializations, suspension history, and run database migration.

**Steps:**
1. Open `prisma/schema.prisma`
2. Add `ViolationType` enum (`ETHICAL_BREACH`, `DIRECT_PAYMENT_BYPASS`, `DATA_FALSIFICATION`, `GHOSTWRITING`, `POLICY_VIOLATION`)
3. Add `SuspensionAction` enum (`SUSPENDED`, `SUSPENSION_LIFTED`, `TERMINATED`)
4. Add `StaffProfile` model with `userId`, `bio`, `specializations String[]`, `joinedAt`, `updatedAt`
5. Add `SuspensionLog` model with `userId`, `action`, `reason`, `violationType`, `performedBy`, `performedAt`, `liftedAt`, `liftedBy`
6. Run `npx prisma db push` and `npx prisma generate`

**Acceptance:** `npx prisma generate` succeeds with new models.

- [x] `ViolationType` and `SuspensionAction` enums defined
- [x] `StaffProfile` model defined and linked to `User`
- [x] `SuspensionLog` model defined with indexes on `userId` and `performedAt`
- [x] Prisma client generated

---

### Task 2 — Database Seed: Staff Profiles

**Objective:** Populate default specializations and bio data for seed staff accounts (`stat@jaxis.dev`, `qa@jaxis.dev`, `finance@jaxis.dev`).

**Steps:**
1. Update `prisma/seed.ts` to upsert `StaffProfile` for seed staff members
2. Run `npm run seed` or `npx tsx prisma/seed.ts`

**Acceptance:** All seed staff accounts have corresponding `StaffProfile` records.

- [x] `StaffProfile` seeded for Statistician (`stat@jaxis.dev`)
- [x] `StaffProfile` seeded for QA Lead (`qa@jaxis.dev`)
- [x] `StaffProfile` seeded for Finance Officer (`finance@jaxis.dev`)

---

### Task 3 — Server Actions & Zod Schemas (`src/features/staff/`)

**Objective:** Implement Zod schemas and service logic for staff provisioning, profile management, and suspension lifecycles.

**Steps:**
1. Create `src/features/staff/schemas.ts` (`ProvisionStaffSchema`, `SuspendStaffSchema`, `TerminateStaffSchema`, `UpdateStaffProfileSchema`)
2. Create `src/features/staff/actions.ts`:
   - `provisionStaff(data)`
   - `getStaffRoster(filters)`
   - `getStaffDetail(id)`
   - `suspendStaff(id, data)`
   - `liftSuspension(id)`
   - `terminateStaff(id, data)` (CEO only guard)
   - `updateOwnProfile(data)`

**Acceptance:** All staff operations validated via Zod and guarded by role requirements.

- [x] Zod schemas defined in `schemas.ts`
- [x] `provisionStaff` generates temporary password and creates profile
- [x] `suspendStaff` and `liftSuspension` update status and write `SuspensionLog`
- [x] `terminateStaff` enforces CEO role check and sets `TERMINATED`
- [x] `updateOwnProfile` updates bio and specializations

---

### Task 4 — Admin Staff API Routes

**Objective:** Expose REST API endpoints for staff management.

**Steps:**
1. Create `src/app/api/v1/admin/staff/route.ts` (`POST`, `GET`)
2. Create `src/app/api/v1/admin/staff/[id]/route.ts` (`GET`)
3. Create `src/app/api/v1/admin/staff/[id]/suspend/route.ts` (`PATCH`)
4. Create `src/app/api/v1/admin/staff/[id]/lift-suspension/route.ts` (`PATCH`)
5. Create `src/app/api/v1/admin/staff/[id]/terminate/route.ts` (`PATCH`)
6. Create `src/app/api/v1/staff/profile/route.ts` (`GET`, `PATCH`)

**Acceptance:** All routes return typed JSON and enforce role-based access.

- [x] `POST /api/v1/admin/staff` provisions staff
- [x] `GET /api/v1/admin/staff` lists staff with filters
- [x] `PATCH /api/v1/admin/staff/[id]/suspend` suspends staff
- [x] `PATCH /api/v1/admin/staff/[id]/terminate` enforces CEO role
- [x] `GET/PATCH /api/v1/staff/profile` handles self-profile

---

### Task 5 — Admin Staff Roster & Provisioning Views

**Objective:** Build high-precision UI for Admin staff management.

**Steps:**
1. Build `/dashboard/admin/staff` — responsive staff roster table with role badges, status, specializations, and action menus
2. Build `/dashboard/admin/staff/new` — staff provisioning form with role selection and specialization tags
3. Build suspend/terminate modal dialogs with reason tracking

**Acceptance:** Admin can view, provision, suspend, and manage staff members from the UI.

- [x] Staff Roster page rendered with search and role/status filters
- [x] Provision staff form with temporary password generation dialog
- [x] Suspend and terminate modals with audit reasons
- [x] Fully responsive on mobile, tablet, and desktop

---

### Task 6 — Staff Self-Profile Workbench Views

**Objective:** Build profile management views for Statisticians and QA Leads.

**Steps:**
1. Build `/dashboard/statistician/profile` — view/edit bio and specializations
2. Build `/dashboard/qa/profile` — view/edit bio and specializations

**Acceptance:** Staff can update their specializations and biographical profile.

- [x] Statistician profile editor with specialization tags
- [x] Senior QA Lead profile editor
- [x] Real-time validation and responsive layout

---

### Task 7 — Quality Gate & Verification

**Objective:** Execute all monorepo gates and verify end-to-end functionality.

**Steps:**
1. `npm run check-types` → 0 errors
2. `npm run lint` → 0 warnings
3. `npm run build` → clean

- [x] `npm run check-types` → 0 errors
- [x] `npm run lint` → 0 warnings
- [x] `npm run build` → clean
- [x] Module 02 completed

---

## Module 03: Client Profile & Account (`03-client-profile`)

### Task 1 — Database Schema & Seeding
**Objective:** Create `ClientProfile` model and seed data.
- [x] Add `ClientProfile` model linked 1:1 with `User`
- [x] Update `seed.ts` to include a sample ClientProfile
- [x] Run Prisma push and generate

### Task 2 — Backend Logic & Server Actions
**Objective:** Validation schemas and actions for client profiles.
- [x] Create `ClientProfileSchema` in Zod
- [x] Create `upsertClientProfile` action
- [x] Create profile completion gate check (`assertClientProfileComplete`)

### Task 3 — Client Profile Form UI
**Objective:** Form page for clients to input their institutional details.
- [x] Build `/dashboard/client/profile` utilizing `@repo/ui` components

### Task 4 — Profile Completion Banner & Gating
**Objective:** Visual enforcement of profile completion.
- [x] Add conditional banner in dashboard layout for incomplete profiles

### Task 5 — Client Dashboard Updates
**Objective:** Adjust client landing page to display profile status.
- [x] Add Profile Status card to `/dashboard/client`
- [x] Convert project table to padded layout

### Task 6 — Quality Gate & Verification
- [x] `npm run check-types`
- [x] `npm run lint`
- [x] `npm run build`

---

## Module 04: Project Intake & Submission (`04-intake`)

### Task 1 — Database Schema & Models
**Objective:** Add `Project`, `ProjectFile`, `ProjectStatus`, and `FileCategory` models to Prisma schema.
- [x] Add `ProjectStatus` enum (24 states including `NEW_REQUEST`, `AWAITING_INFORMATION`, `UNDER_EVALUATION`, etc.)
- [x] Add `FileCategory` enum (`RESEARCH_DOCUMENT`, `DATASET`, `QUESTIONNAIRE`, `PAYMENT_PROOF`, etc.)
- [x] Add `Project` model with `intakeId` (`JAXIS-YYYYMM-XXXX`), client relation, research fields, and masterStatus
- [x] Add `ProjectFile` model linked to Project with cascade delete
- [x] Update `prisma/seed.ts` with initial sample seed project
- [x] Run Prisma push and generate client types

### Task 2 — Status State Machine & Core Business Rules
**Objective:** Implement strict state transition validation and intake ID generator.
- [x] Implement `VALID_TRANSITIONS` state machine map in `src/lib/project-rules.ts`
- [x] Create `assertValidStatusTransition` transition assertion helper
- [x] Implement human-readable intake ID generator: `JAXIS-YYYYMM-XXXX`

### Task 3 — Validation Schemas & Server Actions
**Objective:** Create Zod schemas and backend server actions for project intake & triage.
- [x] Create `CreateProjectSchema`, `UpdateProjectStatusSchema`, `RequestMissingInfoSchema` in Zod
- [x] Create `createProject` action with `assertClientProfileComplete` server-side gate
- [x] Create `getProjects` action with role-scoped querying (Client sees own, Admin/CEO sees all)
- [x] Create `getProjectById` action
- [x] Create `updateProjectStatus` action enforcing state machine transitions
- [x] Create `requestMissingInfo` action (sets status to `AWAITING_INFORMATION` with reason)
- [x] Create `markIntakeComplete` action (sets status to `UNDER_EVALUATION`)

### Task 4 — Client Multi-Step Project Intake Form UI
**Objective:** Build multi-step project submission form for clients.
- [x] Build `/dashboard/client/projects/new` (Research Information → Document Attachments → Review & Submit)
- [x] Add file upload component with MIME and size validation (DOCX, PDF, XLSX, CSV)
- [x] Wire server action submission and redirect to `/dashboard/client/projects`

### Task 5 — Client Projects Workbench & Detail Views
**Objective:** Build client project list and project detail tracker.
- [x] Build `/dashboard/client/projects` (Project cards/table with status badges, intake IDs, and deadlines)
- [x] Build `/dashboard/client/projects/[id]` (Status timeline tracker, intake details, uploaded files, replace document modal)

### Task 6 — Admin Triage Queue & Project Inspection Views
**Objective:** Build Admin triage queue and governance controls.
- [x] Build `/dashboard/admin/intake` (Triage table for `NEW_REQUEST` and `AWAITING_INFORMATION` submissions)
- [x] Build `/dashboard/admin/projects/[id]` (Full project inspection desk, client profile panel, status controls, request missing info modal)
- [x] Add "Mark Intake Complete" action button to transition project to `UNDER_EVALUATION`

### Task 7 — Quality Gate & Verification
**Objective:** Run monorepo checks and verify end-to-end functionality.
- [x] `npm run check-types` → 0 errors
- [x] `npm run lint` → 0 warnings
- [x] `npm run build` → clean build
- [x] Module 04 completed

---

## Module 05: Quotation & Pricing (`05-quotation`)

### Task 1 — Database Schema & Prisma Models
**Objective:** Add `Quotation`, `QuotationLineItem`, `PackagePriceConfig`, and associated enums to `prisma/schema.prisma`.
- [ ] Add `PackageName` enum (`JX_01_DATACHECK`, `JX_02_START`, `JX_03_CORE`, `JX_04_ADVANCED`)
- [ ] Add `AddOnName` enum (`DEFENSELAB`, `RUSH`, `EXPRESS`, `EMERGENCY`)
- [ ] Add `QuotationStatus` enum (`DRAFT`, `QUOTE_SENT`, `CLIENT_APPROVED`, `QUOTE_DECLINED`, `QUOTE_EXPIRED`, `SUPERSEDED`)
- [ ] Add `LineItemType` enum (`PACKAGE`, `ADDON`)
- [ ] Add `Quotation` model with relation to `Project` and `QuotationLineItem`
- [ ] Add `QuotationLineItem` model with cascade delete
- [ ] Add `PackagePriceConfig` model for package price floor rules
- [ ] Add seed data in `prisma/seed.ts` (pricing configurations and initial test quote)
- [ ] Run `npx prisma db push` and `npx prisma generate`

### Task 2 — Pricing Guardrails & Core Business Rules
**Objective:** Implement pricing calculations and security constraints in `src/lib/pricing-rules.ts`.
- [ ] Enforce `RULE_QUO_01` — only ADMIN and CEO roles may create or modify quotations (Statisticians → 403)
- [ ] Enforce `RULE_QUO_02` — 100% upfront downpayment required for `JX_01_DATACHECK` and `JX_02_START` (`downpaymentRequired = totalAmount`)
- [ ] Implement package minimum price floor validation (reject bids below package minimums)
- [ ] Implement add-on restriction check (add-ons cannot be added if project `status >= ACTIVE`)
- [ ] Implement 3-day quotation expiry computation (`expiresAt = now + 3 days`)

### Task 3 — Validation Schemas & Server Actions
**Objective:** Create Zod schemas and server actions with `RULE_PERF` compliance.
- [ ] Create `CreateQuotationSchema`, `UpdateQuotationSchema`, `IssueQuotationSchema`, and `RespondQuotationSchema` in `src/features/quotations/schemas.ts`
- [ ] Create `createQuotation` action (Admin creates draft proposal in `UNDER_EVALUATION`)
- [ ] Create `updateQuotation` action (Modify draft quote prior to sending)
- [ ] Create `issueQuotation` action (Transitions quotation to `QUOTE_SENT`, updates project to `QUOTE_SENT`)
- [ ] Create `respondQuotation` action (Client accepts → `CLIENT_APPROVED` / project `SOW_PENDING`; or declines → `QUOTE_DECLINED`)
- [ ] Create `getQuotationByProject` action with role-based selective projections (`RULE_PERF_01`)
- [ ] Ensure all multi-model operations use atomic `prisma.$transaction` (`RULE_PERF_03`)

### Task 4 — Admin Commercial Quotation Builder UI
**Objective:** Build intuitive commercial proposal builder for Admin and CEO.
- [ ] Build `/dashboard/admin/quotations` and integration drawer on `/dashboard/admin/projects/[id]`
- [ ] Package selector with dynamic price range guidance and description cards
- [ ] Add-on checkboxes with real-time total and downpayment recalculation
- [ ] Notes and custom terms textarea
- [ ] "Save Draft" and "Issue Commercial Quote to Client" action controls with confirmation modal

### Task 5 — Client Commercial Proposal Review UI
**Objective:** Build client quote inspection and decision interface.
- [ ] Build `/dashboard/client/projects/[id]/quote` review view
- [ ] Itemized pricing breakdown table with base package and optional add-ons
- [ ] Milestone payment schedule card (downpayment amount vs deliverable release balance)
- [ ] 3-day quotation validity countdown timer and expiry notice
- [ ] "Accept Proposal & Proceed to SOW" and "Decline Proposal" decision buttons with feedback prompt

### Task 6 — Integration, Navigation & State Machine Wiring
**Objective:** Connect quotation flow seamlessly into project lifecycles.
- [ ] Update Admin intake and project views with direct link to Quote Builder when in `UNDER_EVALUATION`
- [ ] Update Client project timeline and dashboard to highlight pending quote responses
- [ ] Update Sidebar active/disabled badge indicators if appropriate
- [ ] Wire email notification trigger stubs for Quote Issued, Quote Accepted, and Quote Declined

### Task 7 — Quality Gate & Verification
**Objective:** Run monorepo validation scripts and generate verification report.
- [ ] `npm run check-types` → 0 errors
- [ ] `npm run lint` → 0 warnings
- [ ] `npm run build` → clean production build
- [ ] Generate `docs/modules/JAXIS_05-verification_report.md`
- [ ] Mark Module 05 completed

---

## Upcoming Modules (Roadmap v2)

| #    | Module                                                | Status                           |
| ---- | ----------------------------------------------------- | -------------------------------- |
| `00` | `00-foundation` — Project Foundation & Infrastructure | ✅ Completed                     |
| `01` | `01-auth` — Authentication & RBAC                     | ✅ Completed                     |
| `02` | `02-staff` — Expert Provisioning & Staff Management   | ✅ Completed                     |
| `03` | `03-client-profile` — Client Profile & Account        | ✅ Completed                     |
| `04` | `04-intake` — Project Intake & Submission             | ✅ Completed                     |
| `05` | `05-quotation` — Quotation & Pricing                  | 🔄 Active / In Progress          |
| `06` | `06-sow` — SOW Generation & Signing                   | ⏳ Blocked — awaiting `05`       |
| `07` | `07-payments` — Payment & Installments                | ⏳ Blocked — awaiting `06`       |
| `08` | `08-assignment` — Expert Assignment & Workload        | ⏳ Blocked — awaiting `07`, `02` |
| `09` | `09-messaging` — Messaging & Communication Firewall   | ⏳ Blocked — awaiting `04`, `08` |
| `10` | `10-analysis` — Analysis Workbench                    | ⏳ Blocked — awaiting `08`, `09` |
| `11` | `11-qa` — Quality Assurance                           | ⏳ Blocked — awaiting `10`       |
| `12` | `12-deliverables` — Deliverables, Release & Revisions | ⏳ Blocked — awaiting `11`       |
| `13` | `13-defenselab` — DefenseLab Scheduling               | ⏳ Blocked — awaiting `07`, `08` |
| `14` | `14-finance` — Finance, Payouts & Ledger              | ⏳ Blocked — awaiting `12`, `13` |
| `15` | `15-disputes` — Disputes, Refunds & Chargebacks       | ⏳ Blocked — awaiting `14`       |
| `16` | `16-notifications` — Email Notifications              | ⏳ Blocked — awaiting `07–15`    |
| `17` | `17-reporting` — Reporting, Analytics & Archive       | ⏳ Blocked — awaiting all        |


