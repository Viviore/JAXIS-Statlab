# JAXIS StatLab — Agent & Developer Rules

This workspace configuration is anchored to the canonical design specification defined in [apps/app/docs/design-system.md](file:///c:/Users/ROG%20STRIX/Desktop/JAXIS%20StatLab/apps/app/docs/design-system.md).

All AI coding assistants and developers MUST strictly follow the design system and the mandatory guardrails below.

---

## 1. Master Design System Reference (MANDATORY)
- **Primary Source of Truth**: Always inspect and follow [apps/app/docs/design-system.md](file:///c:/Users/ROG%20STRIX/Desktop/JAXIS%20StatLab/apps/app/docs/design-system.md) when generating, styling, or refactoring any page, component, modal, table, or toast.
- **Aesthetic**: Dark Precision Terminal / Enterprise Scientific. Clean, modern, authoritative, and spacious.
- **Palette**: Master Canvas (`#010114`), Surface Card (`rgba(1, 22, 46, 0.75)` / `#01142B` / `#011B38`), Enterprise Orange Accent (`#CC6600`), Analytical Sky (`#38BDF8`), Verification Emerald (`#10B981`), Escrow Amber (`#F59E0B`), Border Division (`rgba(255, 255, 255, 0.08)` / `border-white/10`).
- **Zero Glow Policy**: Never use blurry box-shadow glows (`shadow-[0_0_...px]`). Use crisp, high-contrast flat borders (`border-white/10` to `border-white/20`) and calibrated opacity tints.
- **No Awkward Gradients**: Do not use heavy gradient fills (`bg-gradient-to-r`) on action bars, banners, or modal headers. Rely on solid substrates (`#01142B` / `#011B38`) with calibrated borders.

---

## 2. Spacing, Margins & Padding Standard (ANTI-DOUBLE-PADDING & ANTI-CRAMPED MANDATE)
- **Zero Squished/Cramped Layouts Policy**: Never generate components or pages with zero margin or microscopic padding.
- **Root Layout vs. Inner Page Containers (Anti-Double-Padding Rule)**:
  - The root layout shell (`DashboardShell.tsx`) already applies `padding: clamp(2rem, 4vw, 3.5rem)` on `<main>`.
  - Inner page routes inside `/dashboard` **MUST NOT add redundant outer padding** (NO `px-4 sm:px-8 lg:px-12 py-8`).
  - Standard page wrapper format:
    ```tsx
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-24 w-full animate-content-fade">
    ```
    *(or `max-w-5xl mx-auto` for focused legal contract / SOW document desks).*
- **Cards & Document Sheets**:
  - Standard cards: `p-6 sm:p-8 md:p-10`, never `p-1` or `p-2`.
  - Document/Contract sheets: `p-8 sm:p-12 lg:p-16` with generous vertical rhythm (`mb-10` to `mb-12`, `space-y-6`).
- **Typography & Readability**:
  - **Sans-Serif First**: All readable content, prose, summaries, research objectives, legal terms, form labels, and table cells must use clean **Sans-Serif (`font-sans`)**.
  - **No Monospace Overkill**: `font-mono` is strictly reserved for actual code, IDs (e.g. `JAXIS-202608-0001`), financial sums, and telemetry metrics. Never set whole paragraphs or descriptions in monospace.
  - **Font Sizing**: Body text must be `text-sm` (14px) or `text-base` (16px) with comfortable line height (`leading-relaxed`). Microscopic `text-[0.688rem]` is only permitted for micro-badges, NEVER for general reading content.

---

## 3. Button, Dropdown & Interaction Standards
- **Button Corner Radius**: Precision `rounded-[2px]` across all primary and secondary buttons.
- **Button Casing**: Use Title Case or Clean Sentence Case (e.g. `"Review & Sign Contract →"`, `"Download All"`, `"+ Configure Services"`), never aggressive all-caps shouting.
- **Button Loading States**: Use `<IconLoader2 size={16} stroke={2.5} className="animate-spin text-white/90" />` centered directly in the main flex container with high contrast.
- **Dropdown & Interactive Lists**: Zero orange outline/rings on focus or hover. Use `outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 border-0 ring-0` with subtle background tinting (`hover:bg-white/[0.06]`).
- **Tabs & Segmented Controls**: Use `<Tabs>`, `<TabsList>`, `<TabsTrigger>`, `<TabsContent>` from `@repo/ui`. Precision `rounded-[2px]`, Title Case Sans-Serif labels, and `#CC6600` Enterprise Orange active indicator (`data-[state=active]:bg-[#CC6600]`). Never write ad-hoc unstyled button rows.
- **File Row Actions**: Compact `h-9 w-9 rounded-[2px]` icon action buttons.

---

## 4. Telemetry & Loading States (NO CLUNKY BOXES / NO PING BLOBS)
- **Standard Component**: All data retrieval and async states must use `<LoadingState variant="page" | "table" | "card" | "inline" />` from `@repo/ui`.
- **Orbital Loader Standard**: Uses the dual-layer calibrated orbital track with active sweep arc and glowing center micro-emitter node (`OrbitalSpinner`).
- **Standardized KPI Metric Cards (`<KpiCard />`)**: All telemetry, financial, and operational metric cards across all roles and pages **MUST** use `<KpiCard />` from `@repo/ui`. Ad-hoc raw cards or custom div layouts for KPIs are strictly forbidden. Header labels are uppercase monospace (`font-mono text-xs text-white/50 tracking-wider font-semibold`), metric values are bold monospace (`font-mono font-bold text-2xl sm:text-3xl`), unit labels are `text-xs text-white/40 font-mono`, and descriptions are `text-xs font-sans text-white/50`.
- **Typography**: Clean Sans-Serif title and subtitle with zero robotic double slashes.

---

## 5. Iconography & Visual Standard (CRITICAL)
- **Mandatory Icon Library**: Use **Tabler Icons (`@tabler/icons-react`) exclusively** across `@repo/ui` and `apps/app`.
- **Zero Emojis Policy**: Emojis (e.g. 🔍, ⏸, ⛔, 📋, 🚀, 💡, 📁, 📄, 🔒) are **strictly forbidden** anywhere in the UI, labels, menus, tables, buttons, or toasts.
- **No Ad-Hoc Raw SVGs**: When an icon is needed, always import the appropriate `Icon*` component from `@tabler/icons-react`.
- **Styling**: Use `stroke={1.5}` or `stroke={2}`, specify `size={16|18|20|24}`, and use Tailwind classes for colors.

---

## 6. Copywriting & Tone Standard (CRITICAL)
- **Zero Double Slashes Policy**: Double slashes (`//`) are **strictly forbidden** anywhere in UI copy, loading states, badges, alert headers, and toasts.
- **Simple & Human-Friendly Language**: Keep all words simple, natural, and accessible. Avoid robotic, overly technical, or sci-fi jargon (e.g. NEVER use `"SYNCING TELEMETRY // RETRIEVING DATA"`, `"ESTABLISHING SECURE PROTOCOL"`, `"CALCULATING COMPUTE STATE"`).
- **Clear, Direct Phrasing**: Use straightforward phrasing such as `"Loading research studies..."`, `"Verifying profile..."`, `"Loading workspace..."`, `"Please wait a moment"`.
- **Terminology**: Never use "Principal Investigator" / "Investigator" — use **"Lead Researcher"** and **"Research Study"**.

---

## 7. Toast Notification Protocol (DESIGN-SYSTEM.MD Section 6.1)
- Always trigger a Toast on: (1) Server Action mutations, (2) 1-Click Clipboard Copies, (3) File Uploads / Limits / Downloads.
- Strictly use the 4 standard variants: `info` (Sky Blue), `success` (Emerald), `warning` (Amber), `danger` (Crimson).
- Zero emojis in toast messages or descriptions.
- Render portaled via `<Toast message="..." description="..." variant="..." onClose={...} />`.

---

## 8. Monorepo Architecture & Verification
- Shared UI components belong in `packages/ui` and must be exported from `packages/ui/src/index.ts`.
- `apps/app` uses Next.js 16 (Turbopack, Tailwind CSS v4, React 19).
- After any edits, run `npm run check-types` and `npm run lint` across the monorepo to ensure zero errors and zero warnings.

---

## 9. Philippine Peso (`₱`) Currency Typography & Harmonization Standard (CRITICAL)
- **Problem**: Monospace font stacks (`font-mono` / `Disket Mono`) lack custom glyphs for `₱` (U+20B1), causing operating systems to fall back to clunky, disproportionately bolded or double-stroke glyphs.
- **Mandatory Policy**:
  1. Never render a raw `₱` character directly inside a `font-mono font-bold` container.
  2. Always use the canonical `<Peso className="..." />` component from `@repo/ui` or `<MoneyDisplay amount={...} />`.
  3. The `₱` symbol must always be rendered in **Sans-Serif (`font-sans font-normal opacity-85 select-none inline-block mr-0.5`)** to ensure consistent, balanced optical weight alongside monospace numerals.
  4. In numeric formatters, use `formatPeso(amount)` from `@/lib/formatters`.

---

## 10. Standardized PageHeader & Navigation Breadcrumbs (CRITICAL)
- **Mandatory Policy**:
  1. All pages across `apps/app` **MUST** exclusively use the canonical `<PageHeader />` from `@repo/ui`. Raw `<h1>` tags or ad-hoc unstyled headers are strictly forbidden.
  2. **Breadcrumb Hierarchy**: The root breadcrumb must always be `{ label: "WORKSPACE", href: "/dashboard" }`.
  3. **Fast Client-Side Routing**: Breadcrumbs must use Next.js `<Link>` for instantaneous SPA navigation.
  4. **Order of Elements**: (1) Breadcrumbs, (2) Title & optional Status Badge, (3) Informative Description, and (4) Responsive Action Toolbar.


