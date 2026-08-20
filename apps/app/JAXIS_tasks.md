# JAXIS — Task List

**Active Module:** `01-auth` — Authentication & RBAC\
**Stack:** Next.js 16 App Router · Turborepo · Tailwind CSS v4 · Prisma · Supabase PostgreSQL · Cloudflare R2 · Resend · Trigger.dev · NextAuth.js v5\
**Spec Reference:** [`docs/modules/JAXIS_01-auth.md`](./docs/modules/JAXIS_01-auth.md)\
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

- [ ] Enums defined (`UserStatus`, `RoleName`, `AuthEvent`)
- [ ] `User` model with correct fields and indexes
- [ ] `Role` model with correct fields
- [ ] `UserRole` junction with composite PK and indexes
- [ ] `AuthAuditLog` model with nullable `userId` and all audit fields
- [ ] Migration runs cleanly with zero errors

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

- [ ] All 6 roles seeded
- [ ] All 6 dev users seeded with hashed passwords
- [ ] `UserRole` records correctly linking each user to their role
- [ ] Seed is idempotent (running twice does not error or duplicate)
- [ ] `npm run seed` command documented in `README.md`

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

- [ ] `src/lib/auth.ts` created with full NextAuth config
- [ ] `authorize()` correctly handles wrong password, suspended, and terminated states
- [ ] JWT and session callbacks embed `userId`, `role`, `fullName`
- [ ] Auth audit log writes on login success, login failure, and logout
- [ ] `requireRole()` implemented and typed
- [ ] Session type augmentation — `session.user.role` has no TypeScript errors
- [ ] `.env.example` updated

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

- [ ] `LoginSchema` and `RegisterSchema` defined in `schemas.ts`
- [ ] `registerClient()` Server Action with all validation and error cases
- [ ] `/login` page renders with correct design tokens
- [ ] `/login` shows per-error messages (invalid, suspended, terminated)
- [ ] `/register` page renders with correct design tokens
- [ ] `/register` shows field-level validation errors
- [ ] Post-login redirect sends each role to the correct URL
- [ ] Authenticated users visiting `/login` or `/register` are redirected

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

- [ ] `src/middleware.ts` created with session check and role routing
- [ ] `config.matcher` scoped correctly — does not block `/api/*`, `/login`, `/register`, `/unauthorized`
- [ ] Unauthenticated `/dashboard/*` visit → redirect to `/login`
- [ ] CLIENT visiting `/dashboard/admin/` → redirect to `/unauthorized`
- [ ] `/unauthorized` page renders with role context and back link
- [ ] All 6 role dashboard shells render at their correct routes
- [ ] Topbar shows full name and working logout button

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

- [ ] `POST /api/v1/auth/register` route created and validated
- [ ] Returns 422 on schema failure with field-level error detail
- [ ] Returns 409 on duplicate email
- [ ] Returns 201 on success (no sensitive data in response)
- [ ] `REGISTRATION` event in `AuthAuditLog` after successful register
- [ ] `LOGIN_SUCCESS` event after correct login
- [ ] `LOGIN_FAILED` event (userId=null) after wrong password
- [ ] `ACCOUNT_SUSPENDED_BLOCK` event when suspended user attempts login
- [ ] `npm run check-types` → 0 errors
- [ ] `npm run lint` → 0 warnings
- [ ] `npm run build` → clean

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
12. Update this file: mark all Task 1–7 items `[x]`, set Active Module to `02-client-profile`

**Acceptance:** Every acceptance criterion in `JAXIS_01-auth.md` Section 10 is checked. Build is clean. Module 02 can begin.

- [ ] All 6 roles can log in and land on the correct desk
- [ ] Register flow works end-to-end
- [ ] RBAC enforcement verified for all role/route combinations
- [ ] Audit log verified for all 5 event types
- [ ] `npm run check-types` → 0 errors
- [ ] `npm run lint` → 0 warnings/errors
- [ ] `npm run build` → clean
- [ ] `JAXIS_01-auth.md` Section 10 checklist fully marked
- [ ] Active module updated to `02-client-profile`

---

## Upcoming Modules (Roadmap v2)

| # | Module | Status |
|---|---|---|
| `00` | `00-foundation` — Project Foundation & Infrastructure | ✅ Completed |
| `01` | `01-auth` — Authentication & RBAC | 🔄 Active / Ready for Execution |
| `02` | `02-staff` — Expert Provisioning & Staff Management | ⏳ Blocked — awaiting `01` |
| `03` | `03-client-profile` — Client Profile & Account | ⏳ Blocked — awaiting `01` |
| `04` | `04-intake` — Project Intake & Submission | ⏳ Blocked — awaiting `03` |
| `05` | `05-quotation` — Quotation & Pricing | ⏳ Blocked — awaiting `04` |
| `06` | `06-sow` — SOW Generation & Signing | ⏳ Blocked — awaiting `05` |
| `07` | `07-payments` — Payment & Installments | ⏳ Blocked — awaiting `06` |
| `08` | `08-assignment` — Expert Assignment & Workload | ⏳ Blocked — awaiting `07`, `02` |
| `09` | `09-messaging` — Messaging & Communication Firewall | ⏳ Blocked — awaiting `04`, `08` |
| `10` | `10-analysis` — Analysis Workbench | ⏳ Blocked — awaiting `08`, `09` |
| `11` | `11-qa` — Quality Assurance | ⏳ Blocked — awaiting `10` |
| `12` | `12-deliverables` — Deliverables, Release & Revisions | ⏳ Blocked — awaiting `11` |
| `13` | `13-defenselab` — DefenseLab Scheduling | ⏳ Blocked — awaiting `07`, `08` |
| `14` | `14-finance` — Finance, Payouts & Ledger | ⏳ Blocked — awaiting `12`, `13` |
| `15` | `15-disputes` — Disputes, Refunds & Chargebacks | ⏳ Blocked — awaiting `14` |
| `16` | `16-notifications` — Email Notifications | ⏳ Blocked — awaiting `07–15` |
| `17` | `17-reporting` — Reporting, Analytics & Archive | ⏳ Blocked — awaiting all |
