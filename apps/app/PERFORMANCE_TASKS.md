# JAXIS StatLab — Performance & Optimization Master Tasks

**Focus:** Enterprise Speed, Sub-100ms Perceived Latency, RSC Boundary Optimization, Memory & Bundle Efficiency  
**Stack:** Next.js 16 App Router · React 19 · Prisma ORM · Turbopack · Tailwind CSS v4  
**Design Standard:** Dark Precision Terminal / Enterprise Scientific (`design-system.md` & `.agents/AGENTS.md`)  
**Gate:** `npm run check-types` + `npm run lint` + `npm run build` must all pass cleanly.

---

## 🎯 Target Architecture & Benchmark Goals

| Metric | Current Baseline | Target Benchmark | Optimization Strategy |
| :--- | :--- | :--- | :--- |
| **Login Bundle Size** | ~850 KB+ | **< 220 KB** (-74%) | Lazy-load Three.js via `next/dynamic` |
| **First Contentful Paint (FCP)** | Delayed (Blank + Spinner) | **< 200 ms** (Instant HTML) | Server Components (RSC) data streaming |
| **Soft Page Navigation** | ~400–800 ms (Cache nuked) | **< 80 ms** (Instant) | Preserve router cache & hover pre-fetching |
| **Idle Background Requests** | ~120 POSTs/hour per user | **0 when tab is hidden** | `document.visibilityState` tab sleeping |
| **Database Query Memory** | O(N) (Loads all rows) | **O(1)** (Flat 10-row chunks) | SQL-level `take` / `skip` pagination |
| **Table Scrolling FPS** | Drops with 50+ rows | **Locked 60 FPS** | CSS `content-visibility: auto` |

---

## Phase 1 — Quick Wins & Bundle Optimization (Immediate Relief)

### Task 1.1 — Lazy-Load Three.js in Auth Layout
- [ ] Convert `import AuthParticleGlobe` in `app/(auth)/layout.tsx` to dynamic import:
  ```tsx
  const AuthParticleGlobe = dynamic(
    () => import("@/components/ui/AuthParticleGlobe"),
    { ssr: false }
  );
  ```
- [ ] Ensure login form renders and becomes interactive immediately without waiting for WebGL.
- [ ] Verify `/login` and `/register` client bundles drop by ~600KB.

### Task 1.2 — Compiler Tree-Shaking: Add `@tabler/icons-react` to `next.config.js`
- [ ] Update `experimental.optimizePackageImports` in `apps/app/next.config.js`:
  - Add `"@tabler/icons-react"`
  - Remove unused `"lucide-react"`
- [ ] Verify faster Turbopack dev server compilation and smaller client chunk sizes.

### Task 1.3 — Silent Tab-Aware Background Polling in `NotificationDrawer.tsx`
- [ ] Add `document.visibilityState === "visible"` guard to `setInterval` poll in `NotificationDrawer.tsx`.
- [ ] Remove `setIsLoading(true)` on interval refreshes to eliminate the 30-second UI flicker when the drawer is open.
- [ ] Add window focus listener to refresh immediately when the user returns to the tab.

### Task 1.4 — Stop Indiscriminate Cache Nuking (`revalidatePath("/", "layout")`)
- [ ] Audit `src/features/staff/actions.ts` (lines 978-986, 1048-1056, 1188-1196, 1246-1254).
- [ ] Remove `revalidatePath("/", "layout")` calls that purge the entire application's client router cache.
- [ ] Replace with targeted path revalidation (e.g. only `/dashboard/staff/hr`, `/dashboard/finance/leaves`).

---

## Phase 2 — Perceived Speed & Instant Navigation (Senior UX Polish)

### Task 2.1 — Micro Topbar Route Progress Indicator (`#CC6600` Laser Line)
- [ ] Create `<RouteProgressBar />` component in `apps/app/app/components/layout/`.
- [ ] Implement a slim 2px `#CC6600` Enterprise Orange progress line that animates on route transition.
- [ ] Mount in `app/layout.tsx` or `DashboardShell.tsx` with zero layout shift and instant feedback.

### Task 2.2 — Hover-Intent Pre-fetching on Table Rows & Navigation Links
- [ ] Add `onMouseEnter` / `onFocus` prefetch triggers on:
  - Project table rows in `AdminDashboardPage` (`router.prefetch(...)`).
  - Finance receivables table rows in `FinanceDashboardPage`.
  - Quotation and SOW action buttons.
- [ ] Verify soft navigation latency drops below 80ms on click.

### Task 2.3 — Dynamic Code-Splitting on Heavy Modals & Lightboxes
- [ ] Dynamically import heavy modals with `next/dynamic` (`ssr: false`):
  - `PaymentProofUploadModal` in payment desks.
  - `DocumentViewerLightbox` in project deliverables.
  - SOW Generator and contract preview modals.
  - `PaymentChannelSettingsModal` in finance overview.
- [ ] Confirm heavy modal chunks are only fetched over the wire upon user click.

### Task 2.4 — High-Performance Table Virtualization (`content-visibility: auto`)
- [ ] Add utility class `.virtual-row` in `globals.css` using:
  ```css
  content-visibility: auto;
  contain-intrinsic-size: 0 48px;
  ```
- [ ] Apply to data tables:
  - Audit Log table (`/dashboard/admin/audit`).
  - Staff Timesheet ledger (`/dashboard/finance/attendance`).
  - Project Archive (`/dashboard/admin/archive`).
- [ ] Verify buttery 60 FPS scrolling on large datasets.

---

## Phase 3 — Core Architecture & Data Flow (RSC & Database Scaling)

### Task 3.1 — Server-Component-First Pages (RSC Migration)
- [ ] Migrate key dashboard routes from `"use client"` to `async function Page()`:
  - `app/dashboard/admin/page.tsx`
  - `app/dashboard/finance/page.tsx`
  - `app/dashboard/client/page.tsx`
- [ ] Fetch initial data on the server concurrently (`Promise.all`).
- [ ] Pass pre-fetched data into client container components (`initialProjects`, `initialKpis`).
- [ ] Eliminate initial blank loading spinner on page entry.

### Task 3.2 — Transition Read Operations Away from POST Server Actions
- [ ] Reserve Server Actions (`"use server"`) strictly for mutations (Create, Update, Delete).
- [ ] Use direct Server Component database calls for initial page rendering.
- [ ] For client-side dynamic search & filtering, introduce clean GET endpoints or SWR cache handlers to enable browser & CDN edge caching.

### Task 3.3 — Database-Level SQL Pagination (`take` / `skip`) in `getProjects`
- [ ] Update `getProjects` in `src/features/projects/actions.ts` to accept `{ page?: number, pageSize?: number }`.
- [ ] Add `take: pageSize, skip: (page - 1) * pageSize` to Prisma `findMany`.
- [ ] Execute `db.project.count({ where })` concurrently to return `{ items, totalCount, totalPages }`.
- [ ] Remove in-memory `.slice()` on the client to keep RAM usage flat.

### Task 3.4 — Session Auth Deduplication with `React.cache()`
- [ ] In `src/lib/auth.ts`, wrap session verification with `React.cache()`:
  ```ts
  import { cache } from "react";
  export const getCachedSession = cache(async () => auth());
  ```
- [ ] Prevent multiple JWT decrypt and database operations when multiple Server Components call `auth()` in a single request.

### Task 3.5 — Optimistic UI Mutations (React 19 `useOptimistic`)
- [ ] Implement `useOptimistic` for:
  - Dismissing / marking read in `NotificationDrawer`.
  - Toggling staff timesheet approval states.
  - Immediate badge updates upon status changes.
- [ ] Add smooth rollback with toast notification if server action encounters an error.

---

## 🔒 Verification & Quality Gate Checklist
Before marking any task complete:
- [ ] `npm run check-types` passes with **0 errors**.
- [ ] `npx eslint` passes on all modified files with **0 warnings / 0 errors**.
- [ ] No visual styling regressions; Dark Precision design system remains pixel-perfect.
- [ ] Tested on mobile/laptop viewports for smooth 60 FPS performance.
