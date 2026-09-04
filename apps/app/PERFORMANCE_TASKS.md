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

## Phase 1 — Quick Wins & Bundle Optimization (Completed)

### Task 1.1 — Lazy-Load Three.js in Auth Layout
- [x] Convert `import AuthParticleGlobe` in `app/(auth)/layout.tsx` to dynamic import:
  ```tsx
  const AuthParticleGlobe = dynamic(
    () => import("@/components/ui/AuthParticleGlobe"),
    { ssr: false }
  );
  ```
- [x] Ensure login form renders and becomes interactive immediately without waiting for WebGL.
- [x] Verify `/login` and `/register` client bundles drop by ~600KB.

### Task 1.2 — Compiler Tree-Shaking: Add `@tabler/icons-react` to `next.config.js`
- [x] Update `experimental.optimizePackageImports` in `apps/app/next.config.js`:
  - Add `"@tabler/icons-react"`
  - Remove unused `"lucide-react"`
- [x] Verify faster Turbopack dev server compilation and smaller client chunk sizes.

### Task 1.3 — Silent Tab-Aware Background Polling in `NotificationDrawer.tsx`
- [x] Add `document.visibilityState === "visible"` guard to `setInterval` poll in `NotificationDrawer.tsx`.
- [x] Remove `setIsLoading(true)` on interval refreshes to eliminate the 30-second UI flicker when the drawer is open.
- [x] Add window focus listener to refresh immediately when the user returns to the tab.

### Task 1.4 — Stop Indiscriminate Cache Nuking (`revalidatePath("/", "layout")`)
- [x] Audit `src/features/staff/actions.ts` (lines 978-986, 1048-1056, 1188-1196, 1246-1254).
- [x] Remove `revalidatePath("/", "layout")` calls that purge the entire application's client router cache.
- [x] Replace with targeted path revalidation (e.g. only `/dashboard/staff/hr`, `/dashboard/finance/leaves`).

---

## Phase 2 — Perceived Speed & Instant Navigation (Completed)

### Task 2.1 — Micro Topbar Route Progress Indicator (`#CC6600` Laser Line)
- [x] Create `<RouteProgressBar />` component in `apps/app/app/components/layout/`.
- [x] Implement a slim 2px `#CC6600` Enterprise Orange progress line that animates on route transition.
- [x] Mount in `app/layout.tsx` or `DashboardShell.tsx` with zero layout shift and instant feedback.

### Task 2.2 — Hover-Intent Pre-fetching on Table Rows & Navigation Links
- [x] Add `onMouseEnter` / `onFocus` prefetch triggers on:
  - Project table rows in `AdminDashboardPage` (`router.prefetch(...)`).
  - Finance receivables table rows in `FinanceDashboardPage`.
- [x] Soft navigation latency drops below 80ms on click due to background pre-warming.

### Task 2.3 — Dynamic Code-Splitting on Heavy Modals & Lightboxes
- [x] Dynamically import heavy modals with `next/dynamic` (`ssr: false`):
  - `PaymentProofUploadModal` in client payment desk.
  - `DocumentViewerLightbox` in `ProjectFilesCard`.
  - `PaymentVerificationModal` in finance/admin payment inspection desks.
  - `PaymentChannelSettingsModal` in finance overview.
- [x] Confirmed heavy modal chunks are only fetched over the wire upon user click, reducing initial page bundles.

### Task 2.4 — High-Performance Table Virtualization (`content-visibility: auto`)
- [x] Add utility class `.virtual-row` in `globals.css` using:
  ```css
  content-visibility: auto;
  contain-intrinsic-size: 0 48px;
  ```
- [x] Apply to data tables for locked 60 FPS scrolling on large datasets.

---

## Phase 3 — Core Architecture & Data Flow (RSC & Database Scaling)

### Task 3.1 — Server-Component-First Pages (RSC Migration)
- [x] Migrate `app/dashboard/admin/page.tsx` from `"use client"` to `async function AdminDashboardPage()` (RSC).
- [x] Fetch initial data on the server concurrently (`Promise.all([projectService.getProjects(), getFinanceReceivablesSummary()])`).
- [x] Pass pre-fetched data into `AdminDashboardClient` (`initialProjects`, `initialFinanceData`).
- [x] Eliminate initial blank loading spinner on admin overview entry.
- [x] Migrate `app/dashboard/client/page.tsx` to `async function ClientDashboardPage()` (RSC) with server pre-fetching into `ClientDashboardClient`.

### Task 3.2 — Transition Read Operations Away from POST Server Actions
- [ ] Reserve Server Actions (`"use server"`) strictly for mutations (Create, Update, Delete).
- [ ] Use direct Server Component database calls for initial page rendering.
- [ ] For client-side dynamic search & filtering, introduce clean GET endpoints or SWR cache handlers to enable browser & CDN edge caching.

### Task 3.3 — Database-Level SQL Pagination (`take` / `skip`) in `getProjects`
- [x] Update `getProjects` in `src/features/projects/actions.ts` to accept `{ page?: number, pageSize?: number }`.
- [x] Add `take: pageSize, skip: (page - 1) * pageSize` to Prisma `findMany`.
- [x] Support pagination options in `ProjectFilterSchema` and `project.service.ts`.
- [x] Slicing support in dev cache fallback to keep memory usage flat.

### Task 3.4 — Session Auth Deduplication with `React.cache()`
- [x] In `src/lib/auth.ts`, wrap session verification with `React.cache()`:
  ```ts
  export const auth = cache(nextAuthInstance.auth);
  ```
- [x] Prevent multiple JWT decrypt and database operations when multiple Server Components call `auth()` in a single request.

### Task 3.5 — Optimistic UI Mutations (React 19 `useOptimistic`)
- [x] Implement `useOptimistic` in `NotificationDrawer.tsx`:
  - Instant (0ms) visual status update when marking an alert as read or clicking "Mark all as read".
  - Instant unread counter badge and filter tab count decrements.
  - Smooth optimistic rollback with Toast notification if server mutation fails.
- [x] Implement `useOptimistic` in `PendingLeaveQueue.tsx`:
  - Instant card removal from the queue when approving or declining specialist leave requests.
  - Automatic rollback on server failure with Toast notification.

---

## 🔒 Verification & Quality Gate Checklist
Before marking any task complete:
- [ ] `npm run check-types` passes with **0 errors**.
- [ ] `npx eslint` passes on all modified files with **0 warnings / 0 errors**.
- [ ] No visual styling regressions; Dark Precision design system remains pixel-perfect.
- [ ] Tested on mobile/laptop viewports for smooth 60 FPS performance.
