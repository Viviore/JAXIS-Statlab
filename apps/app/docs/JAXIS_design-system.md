# JAXIS — Industrial Command-and-Control Design System

**App:** `apps/app` (SaaS Dashboard Workspace) & `packages/ui`\
**Stack:** Next.js 16 App Router · React 19 · Tailwind CSS v4\
**Aesthetic:** Elevated Industrial Brutalism & Tactical Telemetry (Mission-Critical Command & Control).

---

## 1. Core Design Philosophy

The JAXIS dashboard is a **command-and-control interface** for a high-trust statistical governance and academic verification platform. The design system prioritizes:

- **Information Density over Decoration:** Data tables, telemetry feeds, and audit trails are first-class citizens. Every pixel earns its operational place.
- **Sharp Geometry (Zero / 2px Brutalism):** `0px` or `2px` (`rounded-[2px]` / `rounded-none`) border-radius maximum. Hard, razor-sharp precision edges. **No soft, blurry card shadows.**
- **Visible Compartmentalization:** Razor-thin 1px structural wireframe borders (`border-white/[0.08]` to `border-white/[0.15]`) and dividing rules that delineate operational zones.
- **Role-Contextual Clarity:** Each role surfaces only what they need. No visual clutter.
- **Zero Ambiguity:** Every status badge, action button, and alert is instantly legible with high-contrast text.
- **Zero-Emoji Policy (`RULE_UI_01`):** Emojis are strictly banned. Only precision vector SVGs (`<svg>`) with explicit theme classes are permitted.

---

## 2. Color System & Substrates

```css
:root {
  /* Canvas & Surface Substrates */
  --bg-base:          #010114;   /* Midnight Navy — 95% canvas coverage */
  --bg-surface:       #01162E;   /* Deep Ocean Terminal — panel/card surface */
  --bg-surface-hover: #012247;   /* Interactive hover state */
  --bg-overlay:       rgba(1, 1, 20, 0.85); /* Modal / drawer backdrop */

  /* Structural Wireframe Borders (1px Precision) */
  --border-default:   rgba(255, 255, 255, 0.09);
  --border-hover:     rgba(255, 255, 255, 0.20);
  --border-focus:     rgba(204, 102, 0, 0.60);

  /* Brand Accent (5–8% Max Viewport Usage) */
  --accent:           #CC6600;   /* Enterprise Orange — primary CTAs, active highlights */
  --accent-hover:     #E67300;
  --accent-muted:     rgba(204, 102, 0, 0.15);

  /* High-Contrast Typography */
  --text-primary:     #FFFFFF;   /* Primary headings, titles, active data */
  --text-secondary:   rgba(255, 255, 255, 0.78); /* Subtitles, body, table content */
  --text-muted:       rgba(255, 255, 255, 0.48); /* Metadata, column headers, timestamps */
  --text-disabled:    rgba(255, 255, 255, 0.25);

  /* Semantic Status Signals */
  --status-success:   #10B981;   /* Emerald — QA Approved, Paid, Released */
  --status-warning:   #F59E0B;   /* Amber — Pending QA, Escrow Locked */
  --status-danger:    #EF4444;   /* Red — Blocked, Ethical Breach */
  --status-info:      #38BDF8;   /* Sky Blue — Dual-Blind Queue, Telemetry */
}
```

---

## 3. Typographic Architecture

The interface uses dual-type hierarchy: **Inter** for structural UI and **Monospace** for forensic data.

```
--font-sans: 'Inter', system-ui, -apple-system, sans-serif
--font-mono: 'JetBrains Mono', 'Disket Mono', monospace
```

### Legible Type Scale

| Token | Size | Font | Weight | Usage |
|---|---|---|---|---|
| `text-2xs` | `0.688rem` (11px) | Sans / Mono | Semibold | Section group headers, micro tags, status stamps |
| `text-xs` | `0.750rem` (12px) | Sans / Mono | Medium / Semibold | Status badges, timestamps, table column headers, IDs |
| `text-sm` | `0.875rem` (14px) | Sans | Regular / Medium | Table cells, body copy, navigation labels |
| `text-base` | `1.000rem` (16px) | Sans | Semibold / Bold | Panel headers, card titles, form inputs |
| `text-lg` | `1.125rem` (18px) | Sans | Bold | Drawer / modal titles |
| `text-xl` | `1.250rem` (20px) | Sans | Bold | Section titles |
| `text-2xl` | `1.500rem` (24px) | Sans | Bold | Page `<h1>` titles |
| `text-3xl` | `2.000rem` (32px) | Sans / Mono | Bold | Macro KPI counters (`24`, `7`, `142`) |

---

## 4. Geometry & Edge Precision

- **Border Radius:** Maximum `2px` (`rounded-[2px]`) or `0px` (`rounded-none`). No round/pill cards.
- **Shadows:** Hard structural separation via `1px solid rgba(255, 255, 255, 0.09)`. Soft drop shadows are replaced by thin borders and specular top rules.
- **Indicators:** Active states use sharp 2px geometric left bars or crisp background highlights.

---

## 5. Component Standards

### 5.1 Buttons
- **Primary:** `bg-[#CC6600] hover:bg-[#E67300] text-white font-medium px-4 py-2 rounded-[2px] transition-colors`
- **Secondary:** `bg-[#011B38] hover:bg-[#012E57] text-white border border-white/10 hover:border-white/20 font-medium px-4 py-2 rounded-[2px] transition-colors`

### 5.2 Cards & Command Panels
- `bg-[#01162E]/80 border border-white/[0.09] rounded-[2px] p-5`
- Header: `border-b border-white/[0.08] pb-3 mb-4`
- Specular Top Line: `h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent`

### 5.3 Status Badges
- Base: `px-2 py-0.5 text-xs font-mono font-semibold rounded-[2px] uppercase tracking-wider border`
- `FULLY_PAID`: `bg-emerald-500/15 text-emerald-400 border-emerald-500/30`
- `FOR_QA`: `bg-amber-500/15 text-amber-400 border-amber-500/30`
- `QA_APPROVED`: `bg-emerald-500/15 text-emerald-400 border-emerald-500/30`
- `AWAITING_PAYMENT`: `bg-amber-500/15 text-amber-400 border-amber-500/30`

### 5.4 Data Tables
- `w-full border-collapse text-sm`
- Header: `text-xs font-mono uppercase tracking-wider text-white/45 border-b border-white/10 bg-white/[0.02]`
- Row hover: `hover:bg-white/[0.04] transition-colors border-b border-white/[0.06]`
- IDs: `font-mono text-xs text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-[2px]`
