---
name: industrial-brutalist-ui
description: Master Enterprise Scientific & Statistical Consultation UI standard for JAXIS StatLab. Anchored strictly to apps/app/docs/design-system.md and canonical reference photos. Enforces deep navy substrates (#010114, #01142B, #011B38), enterprise orange accents (#CC6600), spacious card padding (p-6 to p-12), Tabler icons exclusively, orbital loading states, and clean sans-serif typography.
---

# SKILL: JAXIS StatLab Enterprise Scientific Design System

## 1. Master Reference Directive (MANDATORY)
This skill directly enforces the canonical visual design specifications from **[`apps/app/docs/design-system.md`](../../apps/app/docs/design-system.md)** and the official reference interfaces:
1. **Intake Flow Reference:** Multi-stage stepper (`01 SCOPE & DETAILS`, `02 DOCUMENT UPLOADS`, `03 REVIEW & SUBMIT`), dark inputs (`#010915`), uppercase mono labels with orange required asterisks (`<span className="text-[#CC6600]">*</span>`), and prominent enterprise orange CTAs (`PROCEED TO ATTACHMENTS →`).
2. **Client Portal Reference:** Spacious KPI metric ribbon, clean data tables with orange ID badges (`JAXIS-202608-XXXX`), status pill indicators, and high-contrast action buttons (`View Study Details →`).
3. **Admin Triage Reference:** Top status action bar (`CURRENT MASTER STATUS: UNDER EVALUATION`), balanced 2-column problem scope and institutional profile dossiers, and structured document/dataset cards with 1-click preview and download actions.

---

## 2. Palette & Surface Hierarchy
- **Master Canvas (95% Foundation):** `#010114` (Midnight Deep Space Navy).
- **Surface Elevation Cards:** `rgba(1, 22, 46, 0.75)` or `#01142B` / `#011B38` with crisp 1px borders (`border-white/10` to `border-white/15`).
- **Primary Brand Accent (5–10% Max Rule):** `#CC6600` (Enterprise Orange) / Hover: `#FFA040` / `#E67300`. Used strictly for high-priority CTAs, active stepper tabs, and important badges.
- **Analytical Deliverable Sky:** `#38BDF8` (Deliverable metrics, secondary data points).
- **Verification Emerald:** `#10B981` (Paid, accepted, approved, complete).
- **Escrow Amber:** `#F59E0B` (Awaiting client review, pending SOW, payment due).
- **Danger Crimson:** `#EF4444` (Disputed, missing info, expired).
- **Zero Glow Rule:** Blurry box-shadow glows (`shadow-[0_0_...px]`) are **strictly forbidden**. Rely on crisp 1px borders (`border-white/10`).
- **No Awkward Gradients:** Do not use heavy gradient fills (`bg-gradient-to-r`) on action bars, banners, or modal headers. Rely on solid substrates (`#01142B` / `#011B38`) with calibrated borders.

---

## 3. Spacing & Container Standard (ANTI-DOUBLE-PADDING MANDATE)
- **Root Shell vs. Inner Pages:** `DashboardShell.tsx` provides `padding: clamp(2rem, 4vw, 3.5rem)` on `<main>`. Inner page routes inside `/dashboard` **must NOT add redundant outer padding** (NO `px-4 sm:px-8 lg:px-12 py-8`).
- **Standard Page Container:**
  ```tsx
  <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-24 w-full animate-content-fade">
  ```
  *(or `max-w-5xl mx-auto` for focused legal contract / SOW document desks).*
- **Cards & Containers:** Standard card padding is **`p-6 sm:p-8 md:p-10`** (or `p-8 sm:p-12 lg:p-16` for contract/SOW sheets). Microscopic `p-1`, `p-2`, or `p-3` cards are strictly banned.
- **Nested Boxes:** Never nest dark tight border boxes inside cards with 0 margin. Give all text and lists generous breathing room (`space-y-4`, `p-5` to `p-6`).

---

## 4. Button, Dropdown & Interaction Standards
- **Button Corner Radius:** Crisp precision `rounded-[2px]` across all primary and secondary buttons.
- **Button Casing:** Use Title Case or Clean Sentence Case (e.g. `"Review & Sign Contract →"`, `"Download All"`, `"+ Configure Services"`), never aggressive all-caps shouting.
- **Button Loading Spinner:** Centered `<IconLoader2 size={16} stroke={2.5} className="animate-spin text-white/90" />` directly inside button flex container.
- **Dropdown & Menu Items:** Zero orange outline/rings on focus or hover. Use `outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 border-0 ring-0` with subtle background tinting (`hover:bg-white/[0.06]`).
- **Tabs & Segmented Controls:** Use `<Tabs>`, `<TabsList>`, `<TabsTrigger>`, `<TabsContent>` from `@repo/ui`. Precision `rounded-[2px]`, Title Case Sans-Serif labels, and `#CC6600` Enterprise Orange active indicator (`data-[state=active]:bg-[#CC6600]`).
- **File Row Actions:** Compact `h-9 w-9 rounded-[2px]` icon buttons using standard Tabler icons.

---

## 5. Telemetry & Loading States (NO CLUNKY BOXES / NO PING BLOBS)
- **Standard Component:** All data retrieval and async states must use `<LoadingState variant="page" | "table" | "card" | "inline" />` from `@repo/ui`.
- **Orbital Loader Standard:** High-precision orbital sweep gauge with dual-layer calibrated track (`border-white/[0.08]` + `border-t-[#CC6600] border-r-[#FFA040]/60`) and glowing center micro-emitter node (`OrbitalSpinner`).
- **Typography:** Clean Sans-Serif title and subtitle with zero robotic double slashes.

---

## 6. Typography Hierarchy
- **Readable Content & Prose:** Clean **Sans-Serif (`font-sans`)** for all titles, descriptions, research objectives, legal terms, form inputs, and table cells.
- **Monospace Usage:** `font-mono` is strictly reserved for study IDs (e.g. `JAXIS-202608-0001`), financial sums (`₱1,000`), status codes, and telemetry metrics. Never render paragraphs or sentences in monospace.
- **Font Sizes:** Body text must be `text-sm` (14px) or `text-base` (16px) with `leading-relaxed`. Microscopic `text-[0.688rem]` is only permitted for micro-badges.

---

## 7. Iconography & Copy Tone
- **Icon Library:** **Tabler Icons (`@tabler/icons-react`) exclusively** with `stroke={1.5}` or `stroke={2}` and standard sizing (`size={16|18|20|24}`).
- **Zero Emojis Policy:** Emojis are strictly banned anywhere in the application.
- **Zero Double Slashes Policy:** Double slashes (`//`) are strictly forbidden in UI copy, loading states, and badges. Use simple, natural human language (e.g. *"Loading research studies..."*, *"Preparing Statement of Work..."*).
- **Terminology:** Always use **"Lead Researcher"** and **"Research Study"** (never "Principal Investigator" or "Investigator").
