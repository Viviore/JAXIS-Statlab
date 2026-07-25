# JAXIS StatLab — Agent & Developer Rules of Engagement

This document defines the strict operational rules, architectural constraints, business logic enforcement, type safety standards, and coding conventions for all AI agents and human developers contributing to **JAXIS StatLab**.

---

## 1. Core Principles & Anti-Over-Engineering

1. **Simplicity First:** Write clean, idiomatic TypeScript and Next.js React code. Avoid unnecessary abstraction layers, custom wrapper classes around Prisma/NextAuth, or premature patterns.
2. **Explicit Contracts:** Every function, API route, component prop, and database query must be explicitly typed. The `any` type is strictly forbidden.
3. **No Hidden Logic:** Business rules (payment checks, release gates, role checks) must be enforced explicitly on the server-side, never solely on the client-side.
4. **Preserve Integrity:** Never modify or relax business rules to make a feature "easier" to implement.

---

## 2. Mandatory Business Rules (Non-Negotiable)

Derived directly from the official **JAXIS StatSpecification Document**:

### 🚫 Deliverable & Release Gates
- **`RULE_REL_01` — Payment Release Gate:** Final project deliverable files **MUST NEVER** be released or made downloadable unless `payment_status == 'FULLY_PAID'`.
- **`RULE_REL_02` — Senior QA Gate:** Complex, high-tier, or rush projects **MUST NOT** be released without explicit `QA_APPROVED` status from a Senior QA Lead.

### 💰 Quotation & Pricing Authorization
- **`RULE_QUO_01` — Quote Authorization:** Final quote creation and price modifications require **Admin** or **CEO** authorization. **Statisticians CANNOT create or modify quotes**.
- **`RULE_QUO_02` — Small Package Upfront Payment:** Small service packages require a 100% upfront payment structure. Custom or complex packages allow downpayments.
- **`RULE_QUO_03` — Scope Creep Requote:** If a request introduces new variables, objectives, or methods outside the original intake, work halts immediately until a supplemental quote is issued and paid.

### 👥 Role & Permission Boundaries
- **`RULE_ROL_01` — Statistician Limits:** Statisticians **CANNOT** confirm payments, release final deliverables, alter project scope, or issue refunds.
- **`RULE_ROL_02` — Payment Verification:** Only **Admin**, **Finance Officer**, or **CEO** can verify or reject proof of payment uploads.

### 🛡️ Ethical Integrity Guardrail
- **`RULE_ETH_01` — Zero Tolerance for Fraud:** Unethical manipulation requests (e.g., forcing statistically significant p-values, fabricating survey data, or altering test output) **MUST BE REJECTED IMMEDIATELY** and escalated to the CEO.

### 💳 Payout Processing Gates
- **`RULE_PAY_01` — Payout Eligibility:** Payout processing **CANNOT** occur unless the project status is `RELEASED` / `ARCHIVED`, `FULLY_PAID`, and free of active disputes or pending refunds.

---

## 3. Tech Stack & Architecture Conventions

- **Monorepo Structure:**
  - `apps/web`: Public Landing Page & Marketing Site (Optimized for SSR/SSG & SEO).
  - `apps/app`: SaaS Application Workspace (Client, Admin, Statistician, QA, Finance, CEO Dashboards).
  - `packages/ui`: Shared React UI component library (`@repo/ui`).
- **Frameworks:** Next.js (App Router), React 19, TypeScript, Tailwind CSS with Enterprise color tokens.
- **Enterprise Palette Rules:**
  - Primary Background: Midnight Navy (`#010114`)
  - Secondary Surface: Deep Ocean Blue (`#012E57`)
  - Brand Accent: Enterprise Orange (`#CC6600`) — 5–10% max UI usage rule
  - Primary Content: Pure White (`#FFFFFF`)
- **Data Fetching:** TanStack Query for client server-state, Next.js Server Actions / API Routes (`/api/v1/...`).
- **ORM & DB:** Prisma ORM with PostgreSQL.
- **Animations, 3D & Scrolling:** `gsap`, `lenis`, and `three` (including `@react-three/fiber`) MUST ONLY be installed and used in the `apps/web` (Landing Page) workspace to achieve cinematic designs. The `apps/app` (SaaS Dashboard) workspace MUST remain lightweight and prioritize standard native scroll behaviors without scroll hijacking.

---

## 4. Code Quality & Error Handling

- **No Silent Try/Catch:** Never swallow exceptions or return dummy empty objects on error. Log errors with diagnostic context and return standardized API error responses:
  ```json
  {
    "error": {
      "code": "PAYMENT_REQUIRED",
      "message": "Deliverables cannot be released until the remaining balance is paid in full.",
      "status": 402
    }
  }
  ```
- **Form & Input Validation:** All API endpoints receiving body data must validate schema using `zod` prior to database execution.
- **File Upload Guardrails:** Uploaded datasets (CSV, XLSX, SAV) and payment proof receipts must be validated for MIME type, file size limits, and sanitized before storage (S3 / Cloudflare R2).

---

## 5. Pre-Commit Quality Checklist

Before submitting code or declaring a task complete, verify:
1. `npm run check-types` passes with **0 TypeScript errors**.
2. `npm run lint` passes with **0 ESLint warnings/errors**.
3. `npm run build` succeeds cleanly for both `apps/web` and `apps/app`.

---

## 6. Agent Skills & Usage

All AI agents MUST utilize the appropriate custom **Skills** when working on this workspace:
- **`apps/web` (Landing Page):** When building, auditing, or refactoring the landing page, you MUST use the **`impeccable`**, **`high-end-visual-design`**, **`design-taste-frontend`**, and **`gpt-taste`** skills. These enforce the premium, cinematic, anti-generic aesthetic required for the Corporate Midnight Enterprise design system.
- **`apps/app` (SaaS Dashboard):** Prioritize the **`minimalist-ui`** or **`industrial-brutalist-ui`** skills for utilitarian, fast, data-dense interfaces that avoid visual bloat.

---

# Antigravity Development & Agent Rules

## 🎯 Core Engineering Principles
- **No Over-Engineering:** Write clean code for current requirements only. Do not invent abstractions, utility wrappers, or config flags for theoretical future needs.
- **Zero Dead Code:** Delete unused variables, obsolete imports, dead helper functions, and commented-out code immediately. Never leave commented code in PRs.
- **Fail Fast & Loud:** Never silently ignore errors or leave empty `catch` blocks. Log errors with context or let them bubble up cleanly.

## 🤖 Agent Autonomy & Behavior Standards
- **Verify Before Completing:** Always run local tests or build checks (e.g., `npm run build` or `pytest`) before marking a task as completed.
- **Incremental Modifications:** Do not attempt massive multi-file rewrites in a single step. Make targeted changes and update the task list as you progress.
- **Minimal Surface Area:** Keep diffs as tight as possible. Do not reformat untouched files or introduce unrelated style churn.

## 🎨 Frontend & Styling Guidelines
- **Tailwind & Utility-First:** Prefer Tailwind utility classes over custom CSS blocks. Keep UI structures modular and readable.
- **Semantic Markup:** Use standard HTML tags (`<main>`, `<nav>`, `<article>`, `<button>`) to ensure accessibility and clear structure.
- **Component Boundaries:** Keep UI components focused on a single responsibility. Extract reusable sub-views only when reused at least twice.

## 🧪 Testing & Code Hygiene
- **Behavior-Driven Testing:** Write unit/integration tests that verify user behavior and API outputs rather than internal state implementation details.
- **Self-Documenting Code:** Choose clear variable and function names over redundant comments. Use comments strictly to explain non-obvious *why* decisions.
