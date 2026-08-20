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

### 🧠 Client-Side Memory Safety (Non-Negotiable)

These rules exist because the dev environment runs on memory-constrained hardware. Violations cause system-level freezes.

- **`RULE_MEM_01` — Mandatory Effect Cleanup:** Every `useEffect` that registers event listeners, timers (`setTimeout`/`setInterval`), `requestAnimationFrame` loops, `ResizeObserver`, `IntersectionObserver`, WebSocket connections, or Supabase realtime subscriptions **MUST** return a cleanup function that tears them down. No exceptions.
- **`RULE_MEM_02` — Zero Allocation in Animation Loops:** Code inside `requestAnimationFrame`, `gsap.ticker`, or any per-frame callback **MUST NOT** create new objects, arrays, `Map`/`Set` instances, or call `.map()`, `.filter()`, `.sort()` on arrays. Pre-allocate typed arrays (`Float32Array`, `Int32Array`) or reuse mutable objects outside the loop.
- **`RULE_MEM_03` — No Unbounded Caches:** Module-level `Map`, `Set`, or array caches that grow with user interaction (e.g., memoizing per-request data) **MUST** have a bounded size with eviction (LRU) or use `WeakMap`/`WeakRef`.
- **`RULE_MEM_04` — Three.js / WebGL Disposal:** Any component that creates `THREE.WebGLRenderer`, `THREE.BufferGeometry`, `THREE.Material`, or `THREE.Texture` **MUST** call `.dispose()` on all of them in the `useEffect` cleanup. Failure to dispose leaks GPU memory.
- **`RULE_MEM_05` — Dev Script Integrity:** The `dev` scripts in `apps/web/package.json` and `apps/app/package.json` **MUST** include `NODE_OPTIONS=--max-old-space-size=1024`. Never remove this cap. It prevents a single Node.js process from consuming more than 1 GB of RAM.

---

## 5. Pre-Commit Quality Checklist

Before submitting code or declaring a task complete, verify:
1. `npm run check-types` passes with **0 TypeScript errors**.
2. `npm run lint` passes with **0 ESLint warnings/errors**.
3. `npm run build` succeeds cleanly for both `apps/web` and `apps/app`.

---

## 6. Agent Skills & Usage

All AI agents MUST utilize the appropriate custom **Skills** when working on this workspace.
Skills are scoped per-app using `.agents/skills/` directories inside each app, registered via the root [`.agents/skills.json`](./../.agents/skills.json).

### Skill Discovery Structure

```
JAXIS StatLab/
├── .agents/
│   ├── AGENTS.md
│   └── skills.json          ← registers both app skill dirs
├── apps/
│   ├── web/.agents/skills/  ← 33 skills (Landing Page)
│   └── app/.agents/skills/  ← 12 skills (SaaS Dashboard)
```

---

### `apps/web` — Landing Page Skills (33 total)

When building, auditing, or refactoring the landing page, agents MUST use the relevant skills below. These enforce the premium, cinematic, anti-generic aesthetic required for the Corporate Midnight Enterprise design system.

#### From `emilkowalski/skill` (8 skills)
> Install: `npx skills add emilkowalski/skill`

| Skill | Purpose |
|---|---|
| `animation-vocabulary` | Reverse-lookup glossary for animation/motion effect terminology |
| `apple-design` | Apple's interface design philosophy: gestures, springs, depth, materials |
| `emil-design-eng` | Emil Kowalski's UI polish philosophy, component design, invisible details |
| `find-animation-opportunities` | Scan codebase for places that should animate but don't |
| `improve-animations` | Audit existing motion code and produce prioritized fix plans |
| `pick-ui-library` | Evaluate and recommend UI component libraries |
| `prototype` | Rapid prototyping workflows and patterns |
| `review-animations` | Review animation diffs for quality and correctness |

#### From `greensock/gsap-skills` (8 skills)
> Install: `npx skills add https://github.com/greensock/gsap-skills`

| Skill | Purpose |
|---|---|
| `gsap-core` | Core GSAP API — tweens, easing, stagger, matchMedia |
| `gsap-frameworks` | GSAP in Vue, Svelte, Nuxt — lifecycle, scoping, cleanup |
| `gsap-performance` | Performance optimization — transforms, batching, will-change |
| `gsap-plugins` | Plugin registration — ScrollSmoother, Flip, Draggable, SplitText |
| `gsap-react` | GSAP in React/Next.js — useGSAP hook, refs, context, cleanup |
| `gsap-scrolltrigger` | ScrollTrigger — scroll-linked animations, pinning, scrub |
| `gsap-timeline` | Timelines — sequencing, position parameter, nesting, playback |
| `gsap-utils` | Utility helpers — clamp, mapRange, snap, toArray, wrap, pipe |

#### From `vercel-labs/agent-skills` (9 skills)
> Install: `npx skills add vercel-labs/agent-skills`

| Skill | Purpose |
|---|---|
| `deploy-to-vercel` | Deploy applications to Vercel |
| `vercel-cli-with-tokens` | Vercel CLI with token-based authentication |
| `vercel-composition-patterns` | React composition patterns that scale |
| `vercel-optimize` | Vercel cost and performance optimization |
| `vercel-react-best-practices` | React/Next.js performance guidelines from Vercel Engineering |
| `vercel-react-native-skills` | React Native and Expo best practices |
| `vercel-react-view-transitions` | React View Transition API implementation |
| `web-design-guidelines` | Web Interface Guidelines compliance review |
| `writing-guidelines` | Documentation and prose style review |

#### From `Leonxlnx/taste-skill` (7 skills)
> Install: `npx skills add Leonxlnx/taste-skill`

| Skill | Purpose |
|---|---|
| `brandkit` | Premium brand-kit image generation — logos, identity, visual-world |
| `full-output-enforcement` | Overrides LLM truncation — enforces complete unabridged output |
| `image-to-code` | Generate design images, analyze them, then implement to match |
| `imagegen-frontend-mobile` | Premium mobile app screen concept generation |
| `imagegen-frontend-web` | Web design reference image generation (one image per section) |
| `redesign-existing-projects` | Audit and upgrade existing sites to premium quality |
| `stitch-design-taste` | Generate agent-friendly DESIGN.md design system files |

#### Pre-existing (1 skill)

| Skill | Purpose |
|---|---|
| `impeccable` | Comprehensive frontend UI design, audit, polish, motion, accessibility |

---

### `apps/app` — SaaS Dashboard Skills (12 total)

Prioritize **`minimalist-ui`** or **`industrial-brutalist-ui`** for utilitarian, fast, data-dense interfaces. Use code review and Vercel skills for quality and deployment.

#### From `awesome-skills/code-review-skill` (1 skill)
> Install: `npx skills add https://github.com/awesome-skills/code-review-skill`

| Skill | Purpose |
|---|---|
| `code-review-skill` | Comprehensive code review for React 19, TypeScript, Next.js, and 20+ ecosystems |

#### From `vercel-labs/agent-skills` (9 skills)
> Install: `npx skills add vercel-labs/agent-skills`

| Skill | Purpose |
|---|---|
| `deploy-to-vercel` | Deploy applications to Vercel |
| `vercel-cli-with-tokens` | Vercel CLI with token-based authentication |
| `vercel-composition-patterns` | React composition patterns that scale |
| `vercel-optimize` | Vercel cost and performance optimization |
| `vercel-react-best-practices` | React/Next.js performance guidelines from Vercel Engineering |
| `vercel-react-native-skills` | React Native and Expo best practices |
| `vercel-react-view-transitions` | React View Transition API implementation |
| `web-design-guidelines` | Web Interface Guidelines compliance review |
| `writing-guidelines` | Documentation and prose style review |

#### Pre-existing (2 skills)

| Skill | Purpose |
|---|---|
| `minimalist-ui` | Clean editorial interfaces — warm monochrome, typographic contrast, flat bento |
| `industrial-brutalist-ui` | Raw mechanical interfaces — Swiss type, military terminal, rigid grids |

---

### ❌ Failed Installations

| Source | Reason |
|---|---|
| `anthropics/claude-code-security-review` | No valid `SKILL.md` files found — repo structured for Claude Code's own format |


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
