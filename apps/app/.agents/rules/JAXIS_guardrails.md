# JAXIS — Agent & Developer Guardrails

**App:** `apps/app` (SaaS Dashboard Workspace)\
**Stack:** Next.js 16 App Router · React 19 · TypeScript · Tailwind CSS v4 · Prisma ORM · PostgreSQL · NextAuth.js v5 · Zod\
**Authority:** These rules are non-negotiable. They encode JAXIS business policy directly into development constraints. No feature implementation may relax, bypass, or silently omit any rule below.

---

## 0. Hierarchy of Truth

When in conflict, apply this priority order:

1. **Business Rules** (this document, `JAXIS_scope.md`) — highest authority
2. **Type system** — TypeScript + Zod schemas enforce contracts at compile and runtime
3. **Architecture** (`ARCHITECTURE.md`) — structural decisions
4. **Design system** (`JAXIS_design-system.md`) — visual decisions
5. **Code conventions** (this document, Section 8) — implementation style

---

## 1. Non-Negotiable Business Rule Enforcement

These rules map directly from `JAXIS_scope.md`. Every API route, Server Action, and component that touches the relevant domain **must enforce these rules server-side**. Client-side checks are supplementary only.

### 🚫 Release Gates (RULE_REL)

```ts
// RULE_REL_01 — Never release deliverables unless FULLY_PAID
// Location: PATCH /api/v1/deliverables/:id/release
if (project.payment_status !== 'FULLY_PAID') {
  return Response.json({
    error: {
      code: 'PAYMENT_REQUIRED',
      message: 'Deliverables cannot be released until the remaining balance is paid in full.',
      status: 402,
    }
  }, { status: 402 });
}

// RULE_REL_02 — Tier 2 packages require QA approval before release
// Tier 2: JX_03_CORE, JX_04_ADVANCED, DEFENSELAB
const TIER_2_PACKAGES = ['JX_03_CORE', 'JX_04_ADVANCED', 'DEFENSELAB'] as const;
if (TIER_2_PACKAGES.includes(project.package) && project.qa_status !== 'QA_APPROVED') {
  return Response.json({
    error: {
      code: 'QA_APPROVAL_REQUIRED',
      message: 'Deliverables for Tier 2 packages cannot be released without QA approval.',
      status: 403,
    }
  }, { status: 403 });
}
```

### 💰 Quotation Authorization (RULE_QUO)

```ts
// RULE_QUO_01 — Only Admin or CEO may create/modify quotes. Statisticians CANNOT.
// Location: POST /api/v1/quotations, PATCH /api/v1/quotations/:id
const QUOTE_AUTHORIZED_ROLES = ['ADMIN', 'CEO'] as const;
if (!QUOTE_AUTHORIZED_ROLES.includes(session.user.role)) {
  return Response.json({
    error: { code: 'FORBIDDEN', message: 'Quotation management requires Admin or CEO authorization.', status: 403 }
  }, { status: 403 });
}

// RULE_QUO_02 — Small packages (JX-01, JX-02) require 100% upfront.
// Enforce in quote builder: downpayment_required === total_amount for these packages.

// RULE_QUO_03 — Scope creep halts work immediately.
// On scope creep flag: set project.master_status = 'SCOPE_CREEP_HALTED'
// No analysis uploads permitted until supplemental quote accepted and paid.
```

### 👥 Role Boundaries (RULE_ROL)

```ts
// RULE_ROL_01 — Statisticians CANNOT confirm payments, release deliverables, alter scope, or issue refunds.
// RULE_ROL_02 — Only Admin, Finance Officer, or CEO may verify/reject payment proof.
const PAYMENT_VERIFY_ROLES = ['ADMIN', 'FINANCE_OFFICER', 'CEO'] as const;

// Enforce via requireRole() in every relevant route.
// Never assume the session role matches the action permission — always check.
```

### 🛡️ Ethical Integrity (RULE_ETH)

```ts
// RULE_ETH_01 — Ethical manipulation requests must be REJECTED and escalated immediately.
// Any message, file, or project note containing indicators of p-hacking, data fabrication,
// or ghostwriting must:
//   1. Block the action immediately.
//   2. Set project.master_status = 'ETHICAL_BREACH'.
//   3. Trigger CEO notification.
//   4. Log to audit trail with full context.
// This rule CANNOT be softened, bypassed, or deferred to "later" by any implementation.
```

### 💳 Payout Gates (RULE_PAY)

```ts
// RULE_PAY_01 — Payout only allowed when: RELEASED/ARCHIVED + FULLY_PAID + no active disputes/refunds.
const PAYOUT_ELIGIBLE_STATUSES = ['RELEASED', 'ARCHIVED'] as const;
const isPayoutEligible =
  PAYOUT_ELIGIBLE_STATUSES.includes(project.master_status) &&
  project.payment_status === 'FULLY_PAID' &&
  !project.has_active_dispute &&
  !project.has_pending_refund;

if (!isPayoutEligible) {
  return Response.json({
    error: { code: 'PAYOUT_NOT_ELIGIBLE', message: 'Project does not meet payout eligibility criteria.', status: 403 }
  }, { status: 403 });
}
```

---

## 2. Error Response Contract

All API routes must return errors in this exact shape. No custom formats, no empty 500s, no string-only errors:

```ts
type ApiError = {
  error: {
    code: string;      // SCREAMING_SNAKE_CASE business code
    message: string;   // Human-readable, safe for client display
    status: number;    // HTTP status code
    details?: unknown; // Optional: Zod validation errors, field-level info
  };
};

// Example codes:
// PAYMENT_REQUIRED (402)
// FORBIDDEN (403)
// QA_APPROVAL_REQUIRED (403)
// PAYOUT_NOT_ELIGIBLE (403)
// SOW_LOCKED (403)
// SCOPE_LOCKED (403)
// VALIDATION_ERROR (422)
// NOT_FOUND (404)
// INTERNAL_ERROR (500)
```

**Never do this:**
```ts
// ❌ Swallowed error
catch (e) { return null; }

// ❌ Empty catch
catch (_) {}

// ❌ console.error only
catch (e) { console.error(e); }

// ❌ String-only response
return Response.json({ message: 'Something went wrong' }, { status: 500 });
```

---

## 3. Input Validation Requirements

Every API route and Server Action that accepts body data **must validate with Zod before any DB call**:

```ts
import { z } from 'zod';

const CreateProjectSchema = z.object({
  researchTitle: z.string().min(5).max(500),
  researchObjectives: z.string().min(10),
  deadlineRequested: z.string().datetime(),
  // ...
});

const parsed = CreateProjectSchema.safeParse(await request.json());
if (!parsed.success) {
  return Response.json({
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Invalid request data.',
      status: 422,
      details: parsed.error.flatten(),
    }
  }, { status: 422 });
}
```

**No raw `request.json()` access without prior Zod validation. Ever.**

---

## 4. File Upload Guardrails

Every file upload endpoint must enforce:

```ts
// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',       // XLSX
  'text/csv',
  'image/jpeg',  // Payment proof
  'image/png',   // Payment proof
] as const;

// Max file sizes (enforce per category)
const MAX_FILE_SIZE_BYTES = {
  RESEARCH_DOCUMENT: 50 * 1024 * 1024,   // 50MB
  DATASET:           100 * 1024 * 1024,  // 100MB
  PAYMENT_PROOF:     10 * 1024 * 1024,   // 10MB
  ANALYSIS_OUTPUT:   100 * 1024 * 1024,  // 100MB
  RECORDING:         500 * 1024 * 1024,  // 500MB (DefenseLab)
};

// Validate on server before any S3/R2 upload
// Never trust Content-Type header alone — validate magic bytes server-side for sensitive uploads
```

---

## 5. Project Status Transition Rules

Status transitions are strictly enforced. An invalid transition must return a 422 error. No shortcuts.

```ts
// Valid forward transitions only (simplified — full graph in ARCHITECTURE.md)
const VALID_TRANSITIONS: Record<string, string[]> = {
  NEW_REQUEST:         ['AWAITING_INFORMATION', 'UNDER_EVALUATION'],
  AWAITING_INFORMATION:['UNDER_EVALUATION'],
  UNDER_EVALUATION:    ['QUOTE_SENT', 'REJECTED'],
  QUOTE_SENT:          ['CLIENT_APPROVED', 'QUOTE_DECLINED', 'QUOTE_EXPIRED'],
  CLIENT_APPROVED:     ['SOW_PENDING'],
  SOW_PENDING:         ['SOW_SIGNED'],
  SOW_SIGNED:          ['AWAITING_PAYMENT'],
  AWAITING_PAYMENT:    ['ACTIVE', 'EXPIRED'],
  ACTIVE:              ['EXPERT_ASSIGNED'],
  EXPERT_ASSIGNED:     ['IN_PROGRESS'],
  IN_PROGRESS:         ['FOR_QA', 'SCOPE_CREEP_HALTED', 'SLA_PAUSED'],
  FOR_QA:              ['QA_REVISION', 'DELIVERED'],
  QA_REVISION:         ['FOR_QA'],
  DELIVERED:           ['REVISION_REQUESTED', 'CLOSED'],
  REVISION_REQUESTED:  ['IN_PROGRESS'],
  // Exception states can be entered from multiple states:
  // HALTED (chargeback), CANCELLED, DISPUTED, ETHICAL_BREACH, REASSIGNED
};
```

---

## 6. Authentication & Route Protection

```ts
// src/middleware.ts — every dashboard route protected
// Pattern: all routes under /dashboard/* require valid session
// Role mismatch → redirect to /unauthorized (not 401 bare JSON in browser)

// In Server Actions and API routes: always re-verify session server-side
import { auth } from '@/lib/auth';

export async function requireRole(...roles: Role[]) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('UNAUTHENTICATED');
  }
  if (!roles.includes(session.user.role as Role)) {
    throw new Error('FORBIDDEN');
  }
  return session;
}

// Usage:
const session = await requireRole('ADMIN', 'CEO');
```

**Never trust role information from the client request body or URL params. Always derive from session.**

---

## 7. Communication Firewall Implementation

```ts
// src/lib/communication-firewall.ts

const BLOCKED_PATTERNS = [
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,         // email
  /(\+?\d[\d\s\-().]{7,}\d)/,                                         // phone numbers
  /\b(gcash|paymaya|maya|paypal)\b/i,                                 // payment platforms
  /\b(whatsapp|viber|telegram|messenger|facebook|fb|instagram|tiktok)\b/i, // social/messaging
  /\bhttps?:\/\/(?!jaxis\.)[\w\-.]+(\/\S*)?\b/i,                     // external URLs
];

export function scanMessageContent(content: string): { blocked: boolean; reason?: string } {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(content)) {
      return { blocked: true, reason: `Prohibited contact information detected.` };
    }
  }
  return { blocked: false };
}

// On block: message is SAVED with is_blocked=true (for Admin audit), NOT delivered.
// Sender receives: "Your message was blocked. External contact information is not permitted."
// Do NOT edit or sanitize the message — block it entirely.
```

---

## 8. TypeScript & Code Conventions

### Strict Rules

```ts
// 1. The `any` type is FORBIDDEN. Always.
//    Use `unknown` and narrow, or define explicit types.

// 2. All functions, API route handlers, and Server Actions must have explicit return types.
export async function POST(request: Request): Promise<Response> { ... }

// 3. Prisma query results must be typed — use generated Prisma types.
import type { Project, User, Quotation } from '@prisma/client';

// 4. Environment variables must be accessed through a validated schema:
// src/lib/env.ts
import { z } from 'zod';
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  // ...
});
export const env = envSchema.parse(process.env);
// Never use process.env.* directly outside of this file.

// 5. Unused imports and variables: zero tolerance. ESLint `no-unused-vars` is error-level.
```

### File Naming Conventions

```
src/app/                          → Next.js App Router pages (kebab-case directories)
src/app/dashboard/[role]/page.tsx → Role-scoped dashboard pages
src/app/api/v1/[resource]/route.ts → API routes

src/features/[module-name]/       → Feature sandbox (e.g., features/intake/)
  ├── actions.ts                  → Server Actions for this feature
  ├── components/                 → Feature-specific UI components
  ├── schemas.ts                  → Zod input schemas
  └── types.ts                    → Feature-scoped TypeScript types

src/components/ui/                → Shared primitives from @repo/ui or local
src/lib/                          → Shared utilities (db.ts, auth.ts, email.ts, env.ts)
```

### Import Order (enforced by ESLint)

```ts
// 1. React / Next.js
import { useState } from 'react';
import { redirect } from 'next/navigation';

// 2. Third-party packages
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

// 3. Internal aliases (@/...)
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';

// 4. Relative imports
import { ProjectCard } from './components/ProjectCard';
import type { ProjectWithQuote } from './types';
```

---

## 9. Database & Prisma Rules

```ts
// 1. Never instantiate PrismaClient multiple times.
//    Use the singleton in src/lib/db.ts with global caching for dev.

// 2. All DB mutations in Server Actions or API routes — never in Client Components.

// 3. Select only needed fields. Never blindly return full Prisma objects.
const project = await db.project.findUnique({
  where: { id: projectId },
  select: { id: true, masterStatus: true, paymentStatus: true, clientId: true },
});

// 4. Use transactions for multi-table mutations.
await db.$transaction([
  db.project.update({ ... }),
  db.payout.update({ ... }),
]);

// 5. Never expose password_hash, internal audit fields, or system IDs to the client.
```

---

## 10. Pre-Commit Checklist

Before marking any task complete or opening a PR:

- [ ] `npm run check-types` → **0 TypeScript errors**
- [ ] `npm run lint` → **0 ESLint warnings or errors**
- [ ] `npm run build` → **clean build** (no Next.js build errors)
- [ ] All business rules in Section 1 enforced for any modified domain
- [ ] No `any` types introduced
- [ ] No commented-out code left in files
- [ ] No silent `catch` blocks
- [ ] Zod validation present on all new API routes accepting body data
- [ ] File upload MIME type + size validation present on all new upload endpoints
- [ ] Role gate (`requireRole`) present on all new protected routes
- [ ] Status transition validation enforced on all `PATCH` project status routes

---

## 11. Strictly Forbidden Patterns

```ts
// ❌ ANY type
const data: any = await fetch(...);

// ❌ Silent catch
try { ... } catch (_) {}

// ❌ Client-side-only role check (must ALSO be on server)
if (user.role === 'ADMIN') { showButton(); }  // alone is insufficient

// ❌ Releasing deliverables without checking payment_status
await db.deliverable.update({ where: { id }, data: { isFinalReleased: true } });
// ^ Always check RULE_REL_01 and RULE_REL_02 before this line.

// ❌ Direct process.env access outside env.ts
const url = process.env.DATABASE_URL;

// ❌ Hardcoded payout rates
const expertPayout = amount * 0.65; // Must reference package payout config

// ❌ Exposing QA status to client-facing API responses
return { status: 'QA_APPROVED' }; // Client must only see 'IN_ANALYSIS' during QA

// ❌ Editing a blocked message (must block entirely, not sanitize)
content = content.replace(phoneRegex, '[REDACTED]'); // WRONG — block the whole message

// ❌ Editing a signed SOW
await db.sow.update({ where: { id }, data: { content: newContent } }); // WRONG if isLocked=true
```

---

## 12. GSAP / Animation Policy (apps/app)

> Per `ARCHITECTURE.md` and `JAXIS_scope.md`:

- **GSAP, Lenis, Three.js are BANNED in `apps/app`.**
- Use only native CSS transitions (`transition-*` Tailwind utilities).
- Standard dashboard transitions: 150ms, `ease-in-out`.
- No scroll hijacking. No scroll-linked animations. Standard browser scroll only.
- All animations must be gated behind `@media (prefers-reduced-motion: reduce)`.

Heavy animation libraries belong **only in `apps/web`** (the public landing page).

---

## 13. Monorepo Package Boundaries

```
packages/ui    → Shared React UI primitives only. No business logic, no DB calls, no auth.
packages/db    → Prisma client singleton + generated types. No UI, no business logic.
apps/app       → Business logic, API routes, Server Actions, role dashboards.
apps/web       → Public landing page only. No auth, no internal APIs, no Prisma direct access.
```

Components in `packages/ui` must be:
- Stateless or locally-stateful only (no global store dependencies)
- Style-token aware (accepts className overrides)
- Zero dependency on `@/lib/*` internal paths

---

## 14. Database & Mutation Performance Guardrails (RULE_PERF)

```ts
// RULE_PERF_01 — Selective Projections over Deep Includes
// ❌ NEVER pull full unconstrained relations:
const allData = await prisma.project.findMany({ include: { files: true, user: true } });
// ✅ ALWAYS specify explicit 'select' projections for active table columns:
const fastData = await prisma.project.findMany({
  where: { status },
  select: {
    id: true,
    intakeId: true,
    researchTitle: true,
    status: true,
    deadlineRequested: true,
    user: { select: { fullName: true, email: true } },
    _count: { select: { files: true } }
  },
  take: 20
});

// RULE_PERF_02 — Concurrent Independent Reads (Zero Waterfalls)
// ❌ NEVER execute independent reads in sequence:
const user = await prisma.user.findUnique({ where: { id } });
const stats = await getKpis();
// ✅ ALWAYS parallelize with Promise.all:
const [user, stats] = await Promise.all([
  prisma.user.findUnique({ where: { id } }),
  getKpis()
]);

// RULE_PERF_03 — Atomic Multi-Model Transactions
// Multi-step mutations (create project + attach files + log audit event) must be wrapped in prisma.$transaction.

// RULE_PERF_04 — Non-Blocking External Side-Effects
// Never block HTTP responses awaiting email dispatches or webhooks. Dispatch asynchronously in background.

// RULE_PERF_05 — Reactive UI Transitions
// All client-side server action mutations must use React 19 useTransition or useOptimistic.
```

