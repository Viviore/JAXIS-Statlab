# JAXIS — Design System

**App:** `apps/app` (SaaS Dashboard Workspace)\
**Stack:** Next.js 16 App Router · React 19 · Tailwind CSS v4\
**Philosophy:** Utilitarian, data-dense, mission-critical SaaS. Every pixel earns its place. No decorative noise.

---

## 1. Design Philosophy

The JAXIS dashboard is a **command-and-control interface** for a high-trust statistical services platform. The design system prioritizes:

- **Information density over decoration** — data tables, status grids, and audit trails are first-class citizens.
- **Role-contextual clarity** — each role's desk surfaces only what they need. No visual clutter.
- **Zero ambiguity** — every status badge, action button, and alert must be instantly legible.
- **Sharp brutalism** — `0px` or `2px` border-radius maximum. Hard, terminal-like edges. No soft card shadows.

---

## 2. Color Tokens

All tokens are defined as CSS custom properties on `:root` and mapped to Tailwind via `globals.css`.

```css
/* globals.css — :root */
:root {
  /* Backgrounds */
  --bg-base:          #010114;   /* Midnight Navy — page canvas (95% coverage)   */
  --bg-surface:       #012E57;   /* Deep Ocean Blue — card / panel surface        */
  --bg-surface-hover: #013d70;   /* Surface hover lift                            */
  --bg-overlay:       rgba(1, 1, 20, 0.85);  /* Modal / drawer backdrop           */

  /* Glass / Border */
  --border-default:   rgba(255, 255, 255, 0.10);
  --border-hover:     rgba(255, 255, 255, 0.22);
  --border-focus:     rgba(204, 102, 0, 0.60);   /* Orange ring on focused inputs  */

  /* Brand Accent (5-10% max) */
  --accent:           #CC6600;   /* Enterprise Orange — primary CTAs, active tabs */
  --accent-hover:     #E67300;
  --accent-muted:     rgba(204, 102, 0, 0.18);  /* Subtle glow backgrounds        */
  --accent-glow:      rgba(204, 102, 0, 0.35);

  /* Typography */
  --text-primary:     #FFFFFF;
  --text-secondary:   rgba(255, 255, 255, 0.72);
  --text-muted:       rgba(255, 255, 255, 0.45);
  --text-disabled:    rgba(255, 255, 255, 0.25);

  /* Semantic Status */
  --status-success:   #10B981;   /* Emerald — Approved, Paid, Released            */
  --status-warning:   #F59E0B;   /* Amber — Pending, Under Review                 */
  --status-danger:    #EF4444;   /* Crimson — Blocked, Rejected, Ethical Breach   */
  --status-info:      #3B82F6;   /* Blue — Informational, neutral states          */

  --status-success-bg: rgba(16, 185, 129, 0.12);
  --status-warning-bg: rgba(245, 158, 11, 0.12);
  --status-danger-bg:  rgba(239, 68, 68, 0.12);
  --status-info-bg:    rgba(59, 130, 246, 0.12);

  /* Spacing Scale (8px base grid) */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
}
```

### Color Usage Rules

| Token | Where to Use |
|---|---|
| `--bg-base` | Page canvas, sidebar, topbar background |
| `--bg-surface` | Cards, panels, dropdowns, modals, table rows (alt) |
| `--accent` | Primary action buttons, active nav indicator, key metric highlights |
| `--border-default` | All card/panel borders at rest |
| `--border-focus` | Input focus ring |
| `--status-*` | Status badges only — never for large backgrounds |

> **Rule:** `--accent` (`#CC6600`) must never cover more than 10% of any given viewport.

---

## 3. Typography System

### Font Families

```
--font-sans: 'Inter', system-ui, -apple-system, sans-serif   // UI / body
--font-mono: 'Disket Mono', 'JetBrains Mono', monospace      // data / codes
```

**Inter** — All navigation, headers, body copy, form labels, and CTAs.\
**Disket Mono** — Package codes (`JX-01`), timestamps, metric values, status stamps, IDs.

### Type Scale

| Token | rem | px | Line Height | Usage |
|---|---|---|---|---|
| `text-xs` | `0.563rem` | ~9px | 1.4 | Micro-badges, forensic tags, timestamps |
| `text-sm` | `0.75rem` | 12px | 1.4 | Captions, metadata, table secondary text |
| `text-base` | `1.000rem` | 16px | 1.5 | Body copy, nav links, form inputs |
| `text-lg` | `1.188rem` | 19px | 1.4 | Card titles, panel subheadings |
| `text-xl` | `1.625rem` | 26px | 1.3 | Section headings, modal titles |
| `text-2xl` | `2.000rem` | 32px | 1.25 | Major dashboard titles |
| `text-3xl` | `2.625rem` | 42px | 1.2 | Page-level hero labels (used sparingly) |

### Font Weight Rules

- `font-normal` (400) — Body text, descriptions
- `font-medium` (500) — Nav links, labels, table column headers
- `font-semibold` (600) — Card titles, modal headings, active states
- `font-bold` (700) — Page-level titles, KPI numbers only

---

## 4. Spacing & Layout Grid

All spacing uses an **8px base grid**. Use multiples of 4 for fine-grained control.

```
4px  → micro-gap (icon margin, badge padding)
8px  → tight (between related inline elements)
12px → small (form group gaps)
16px → base (card padding, between sections in a panel)
24px → medium (between cards in a grid)
32px → large (between major page sections)
48px → xlarge (page section vertical padding)
64px → xxlarge (top-level layout padding)
```

### Page Layout Structure

```
+------------------------------------------------------------------+
| Topbar (h-14, bg-base, border-bottom)                            |
+------------------+-----------------------------------------------+
| Sidebar          | Main Content Area                             |
| (w-60, bg-base)  | (flex-1, p-8, bg-base)                        |
|                  |                                               |
|  Nav Links       |  Page Header (title + breadcrumb + actions)  |
|  Role Badge      |  -------------------------------------------  |
|  User Card       |  Content Grid / Table / Form                  |
+------------------+-----------------------------------------------+
```

### Grid Conventions

- **Dashboard KPI Grid:** `grid-cols-2 md:grid-cols-4 gap-6`
- **Feature Content Grid:** `grid-cols-1 lg:grid-cols-3 gap-6`
- **Data Tables:** Full-width `w-full`, no outside padding squeeze
- **Form Layouts:** Single-column on mobile, `grid-cols-2 gap-6` on `lg`

---

## 5. Border Radius & Shadow

Following the **sharp brutalism** rule:

```
--radius-none:  0px
--radius-sm:    2px   // Default for cards, buttons, inputs, badges
--radius-md:    4px   // Exception: avatars and pill tags only
--radius-full:  9999px // Circular indicators only
```

No heavy drop shadows. Border-only separation is preferred:

```css
/* Standard card border */
border: 1px solid var(--border-default);

/* Hover card border */
border: 1px solid var(--border-hover);

/* Focus state */
outline: 2px solid var(--border-focus);
outline-offset: 2px;
```

---

## 6. Component Primitives

### 6.1 Button Variants

```tsx
// Primary — Orange CTA
className="bg-[#CC6600] hover:bg-[#E67300] text-white font-medium px-4 py-2 rounded-sm transition-colors duration-150"

// Secondary — Surface
className="bg-[#012E57] hover:bg-[#013d70] text-white border border-white/10 hover:border-white/22 font-medium px-4 py-2 rounded-sm transition-colors duration-150"

// Ghost — No background
className="text-white/72 hover:text-white hover:bg-white/5 font-medium px-4 py-2 rounded-sm transition-colors duration-150"

// Danger — Destructive
className="bg-[rgba(239,68,68,0.12)] hover:bg-[rgba(239,68,68,0.20)] text-[#EF4444] border border-[rgba(239,68,68,0.25)] font-medium px-4 py-2 rounded-sm transition-colors duration-150"
```

Sizes: `sm` (px-3 py-1.5 text-sm) · `md` (px-4 py-2 text-base) · `lg` (px-5 py-2.5 text-lg)

---

### 6.2 Card / Panel

```tsx
// Standard card
className="bg-[#012E57] border border-white/10 rounded-sm p-6 hover:border-white/22 transition-colors duration-200"

// KPI Card variant
className="bg-[#012E57] border border-white/10 rounded-sm p-4"
// Inside:
// <p className="text-white/45 text-xs font-mono uppercase tracking-widest">Label</p>
// <p className="text-white text-2xl font-bold font-mono mt-1">₱142,500</p>
// <p className="text-emerald-400 text-sm mt-1">+12.4% this month</p>
```

---

### 6.3 Status Badge Map

```ts
const statusConfig = {
  FULLY_PAID:         { label: 'Fully Paid',         bg: 'var(--status-success-bg)', color: 'var(--status-success)' },
  AWAITING_PAYMENT:   { label: 'Awaiting Payment',    bg: 'var(--status-warning-bg)', color: 'var(--status-warning)' },
  PAYMENT_SUBMITTED:  { label: 'Proof Under Review',  bg: 'var(--status-warning-bg)', color: 'var(--status-warning)' },
  DRAFT_QUOTE:        { label: 'Draft Quote',         bg: 'rgba(255,255,255,0.05)',   color: '#FFFFFF'               },
  QUOTE_SENT:         { label: 'Quote Issued',        bg: 'var(--accent-muted)',      color: 'var(--accent)'         },
  IN_ANALYSIS:        { label: 'In Analysis',         bg: 'rgba(255,255,255,0.05)',   color: '#FFFFFF'               },
  FOR_QA:             { label: 'Pending QA',          bg: 'rgba(59,130,246,0.12)',    color: '#3B82F6'               },
  QA_APPROVED:        { label: 'QA Approved',         bg: 'var(--status-success-bg)', color: 'var(--status-success)' },
  RELEASED:           { label: 'Released',            bg: 'var(--status-success-bg)', color: 'var(--status-success)' },
  BLOCKED_UNPAID:     { label: 'Release Blocked',     bg: 'var(--status-danger-bg)',  color: 'var(--status-danger)'  },
  HALTED:             { label: 'Halted',              bg: 'var(--status-danger-bg)',  color: 'var(--status-danger)'  },
  ETHICAL_BREACH:     { label: 'Ethical Risk',        bg: 'var(--status-danger)',     color: '#FFFFFF'               },
  CANCELLED:          { label: 'Cancelled',           bg: 'rgba(255,255,255,0.05)',   color: 'var(--text-muted)'     },
  EXPIRED:            { label: 'Expired',             bg: 'rgba(255,255,255,0.05)',   color: 'var(--text-muted)'     },
};
// Badge base class: px-2 py-0.5 text-xs font-mono font-medium rounded-sm uppercase tracking-wider
```

---

### 6.4 Data Table Shell

```tsx
<div className="w-full overflow-x-auto">
  <table className="w-full border-collapse text-sm">
    <thead>
      <tr className="border-b border-white/10">
        <th className="text-left text-white/45 font-medium font-mono text-xs uppercase tracking-widest py-3 px-4">
          Column
        </th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
        <td className="py-3 px-4 text-white">Value</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

### 6.5 Form Input

```tsx
<div className="flex flex-col gap-1.5">
  <label className="text-sm font-medium text-white/72">Label</label>
  <input
    className="w-full bg-[#012E57] border border-white/10 rounded-sm px-3 py-2 text-white
               placeholder-white/30 text-base focus:outline-none focus:ring-2
               focus:ring-[rgba(204,102,0,0.60)] focus:border-transparent transition-all duration-150"
    placeholder="Placeholder"
  />
  <p className="text-xs text-white/45">Helper text</p>
</div>
```

---

### 6.6 Sidebar Navigation Item

```tsx
// Active: accent left border + accent-muted background
// Rest: transparent border, muted text
className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-sm
           border-l-2 border-transparent text-white/72
           hover:bg-white/5 hover:text-white hover:border-white/20
           data-[active=true]:bg-[var(--accent-muted)] data-[active=true]:text-white
           data-[active=true]:border-[var(--accent)] transition-all duration-150"
```

---

### 6.7 Modal / Dialog Shell

```tsx
// Overlay
className="fixed inset-0 bg-[rgba(1,1,20,0.85)] z-50 flex items-center justify-center p-4"

// Panel
className="w-full max-w-lg bg-[#012E57] border border-white/10 rounded-sm shadow-xl"

// Header (border-b), Body (px-6 py-5), Footer (border-t, flex justify-end gap-3)
```

---

### 6.8 Alert Banner Variants

```tsx
// Warning (Awaiting Payment, SLA alert)
className="flex items-start gap-3 px-4 py-3 rounded-sm border
           bg-[rgba(245,158,11,0.12)] border-[rgba(245,158,11,0.25)] text-[#F59E0B]"

// Danger (Blocked, Ethical Breach)
className="flex items-start gap-3 px-4 py-3 rounded-sm border
           bg-[rgba(239,68,68,0.12)] border-[rgba(239,68,68,0.25)] text-[#EF4444]"

// Success (Released, Paid)
className="flex items-start gap-3 px-4 py-3 rounded-sm border
           bg-[rgba(16,185,129,0.12)] border-[rgba(16,185,129,0.25)] text-[#10B981]"
```

---

## 7. Motion & Micro-Interactions

The dashboard is lightweight — **no scroll hijacking, no GSAP**. Native CSS transitions only.

```css
/* Standard transition */
transition: color 150ms ease-in-out, background-color 150ms ease-in-out,
            border-color 150ms ease-in-out, opacity 150ms ease-in-out;

/* Skeleton loading pulse */
@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.4; }
  50%       { opacity: 0.8; }
}
.skeleton { animation: skeleton-pulse 1.5s ease-in-out infinite; }

/* Toast slide-in */
@keyframes toast-in {
  from { transform: translateX(calc(100% + 16px)); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
}

/* Reduced motion gate (mandatory on ALL animations) */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 8. Role Desk Visual Identifiers

| Role | Sidebar Label | Contextual Accent | Notes |
|---|---|---|---|
| Client | Client Portal | Default — no extra accent | Minimal; only their own projects |
| Admin / Manager | Operations Desk | `--accent` on triage actions | High-density grids, full access |
| Statistician | Analysis Workspace | `--accent` on upload actions | Output-centric workbench |
| Senior QA Lead | QA Studio | `--status-warning` audit indicators | Scorecard-first layout |
| Finance Officer | Finance Console | `--status-success` for cleared funds | Ledger and payout tables |
| CEO / Owner | Executive Overview | Full-access KPI dashboard | Governance actions prominent |

---

## 9. Accessibility Baseline

- **Color contrast:** WCAG AA minimum — 4.5:1 body text, 3:1 large text.
- **Focus indicators:** `focus:ring-2 focus:ring-[var(--border-focus)]` — never `outline: none` without replacement.
- **Semantic HTML:** `<button>` for actions, `<a>` for navigation, `<table>` for tabular data.
- **ARIA labels:** All icon-only buttons must have `aria-label`. Status badges require accessible text.
- **Keyboard navigation:** Tab order follows reading order. Modals must trap focus.
