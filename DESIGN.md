# JAXIS StatLab — Enterprise Design System & Interface Architecture

This document specifies the reverse-engineered enterprise visual design system, color tokens, visual hierarchy, and layout architectures for **JAXIS StatLab**.

---

## 1. Visual Personality & Brand Positioning

The **JAXIS StatLab** design system projects an **Enterprise, High-Trust, Mission-Critical SaaS** visual personality. It is built for academic institutions, research leads, QA auditors, finance officers, and enterprise clients.

- **Personality:** Trustworthy, Corporate, Cyber/Government-grade Technology, Premium SaaS, Mission-Critical.
- **Vibe:** Deep ocean space, precise data analytics, high security, non-distracting contrast.

---

## 2. Reverse-Engineered Color System

```css
:root {
  /* 1. Primary Background — 95% Foundation */
  --bg-primary: #010114;           /* Midnight Navy */
  
  /* 2. Surface & Glassmorphism — Content Separation */
  --surface-secondary: #012E57;    /* Deep Ocean Blue */
  --surface-glass: rgba(1, 46, 87, 0.55);
  --border-glass: rgba(255, 255, 255, 0.12);
  --border-glass-hover: rgba(255, 255, 255, 0.25);

  /* 3. Brand Accent — 5-10% Max Usage Rule */
  --accent-orange: #CC6600;        /* Enterprise Orange */
  --accent-orange-hover: #E67300;
  --accent-orange-glow: rgba(204, 102, 0, 0.35);

  /* 4. Primary Content — High Legibility */
  --text-primary: #FFFFFF;         /* Pure White */
  --text-secondary: rgba(255, 255, 255, 0.72);
  --text-muted: rgba(255, 255, 255, 0.45);

  /* 5. Semantic Status Overlays */
  --status-emerald: #10B981;       /* Fully Paid, Approved, Released */
  --status-amber: #F59E0B;         /* Awaiting Payment, In Review */
  --status-crimson: #EF4444;       /* Blocked, QA Rejected, Ethical Risk */
}
```

---

## 3. Color Usage Rules & Visual Hierarchy

```
Background (#010114)
   │
   └── Surface (#012E57)
         │
         └── Accent (#CC6600)  ─── 5-10% Max Usage Rule
               │
               └── Content (#FFFFFF)
```

### 1. Midnight Navy (`#010114`) — Primary Foundation (95%)
- **Purpose:** Primary backdrop for the entire application.
- **Used For:** Entire page background, hero section, navbar, footer, modal backdrops, dark cards, and main dashboard shells.

### 2. Deep Ocean Blue (`#012E57`) — Surface Color
- **Purpose:** Content separation without relying on generic gray backgrounds.
- **Used For:** Secondary cards, feature sections, hover states, glassmorphism panels, active navigation items, code snippets, and pricing highlight cards.

### 3. Enterprise Orange (`#CC6600`) — Brand Accent
- **Purpose:** Draw high-intent visual focus to key interactions.
- **Strict Rule:** **5–10% of the UI maximum.** Never use orange as a large background container.
- **Used For:** Primary CTAs, main action buttons, active navigation indicator tabs, key icons, notification badges, statistical key metric highlights, and subtle progress bars.

### 4. Pure White (`#FFFFFF`) — Content Legibility
- **Used For:** Headlines, primary body typography, crisp icons, logos, form labels, and subtle card borders (`rgba(255, 255, 255, 0.12)`).

---

## 4. Status Badges & Semantic Tokens

All project and operational statuses across the 9 workflow stages utilize the enterprise palette:

| Status Key | Display Name | Background / Border Token | Text Color |
| :--- | :--- | :--- | :--- |
| `DRAFT_QUOTE` | Draft Quote | Surface (`#012E57`) + Border (`rgba(255,255,255,0.2)`) | White (`#FFFFFF`) |
| `QUOTE_SENT` | Quote Issued | Accent Glow (`rgba(204,102,0,0.2)`) | Enterprise Orange (`#CC6600`) |
| `AWAITING_PAYMENT`| Awaiting Payment | Amber Muted (`rgba(245,158,11,0.2)`) | Warning Amber (`#F59E0B`) |
| `PAYMENT_SUBMITTED`| Proof Under Review | Amber Muted (`rgba(245,158,11,0.2)`) | Warning Amber (`#F59E0B`) |
| `FULLY_PAID` | Fully Paid | Emerald Muted (`rgba(16,185,129,0.2)`) | Success Emerald (`#10B981`) |
| `IN_ANALYSIS` | Analysis Active | Surface Accent (`#012E57`) | White (`#FFFFFF`) |
| `FOR_QA` | Pending QA Review | Surface Accent (`#012E57`) | White (`#FFFFFF`) |
| `QA_APPROVED` | QA Approved | Emerald Muted (`rgba(16,185,129,0.2)`) | Success Emerald (`#10B981`) |
| `RELEASED` | Deliverables Released | Emerald Muted (`rgba(16,185,129,0.2)`) | Success Emerald (`#10B981`) |
| `BLOCKED_UNPAID` | Release Blocked | Crimson Muted (`rgba(239,68,68,0.2)`) | Crimson Alert (`#EF4444`) |
| `ETHICAL_BREACH` | Ethical Risk Escalated | Crimson Solid (`#EF4444`) | White (`#FFFFFF`) |

---

## 5. Role Interface Architectures (6 Desks)

All 6 interface desks are built upon the Midnight Navy foundation with Deep Ocean Blue surface layering:

1. **Client Portal:**
   - Background: Midnight Navy (`#010114`)
   - Project Cards: Deep Ocean Blue (`#012E57`) with White text
   - Action Buttons: Enterprise Orange (`#CC6600`)

2. **Admin Executive Desk:**
   - High-density data grids framed in Deep Ocean Blue (`#012E57`)
   - Triage action triggers highlighted in Enterprise Orange (`#CC6600`)

3. **Statistician Workspace:**
   - Focused analytical workbench with dark navy backdrop to reduce eye strain
   - Upload action buttons styled in Enterprise Orange (`#CC6600`)

4. **Senior QA Studio:**
   - Audit scorecard checklists in Deep Ocean Blue (`#012E57`)
   - Risk escalation badges styled in Crimson (`#EF4444`) or Enterprise Orange (`#CC6600`)

5. **Finance Officer Console:**
   - Financial breakdown cards using Deep Ocean Blue (`#012E57`) with Emerald indicators for cleared funds

6. **CEO Risk Dashboard:**
   - Executive overview desk with high-level KPI cards and instant action overrides

---

## 6. Shared Component Library Specifications (`packages/ui`)

Shared components inside `packages/ui` must follow these styling tokens:

- **Button Primary:** `background: #CC6600; color: #FFFFFF; hover: #E67300; border-radius: 2px;`
- **Button Secondary:** `background: #012E57; color: #FFFFFF; border: 1px solid rgba(255,255,255,0.15); border-radius: 2px;`
- **Card Container:** `background: #012E57; border: 1px solid rgba(255,255,255,0.1); border-radius: 2px;`
- **Page Wrapper:** `background: #010114; min-height: 100vh; color: #FFFFFF;`

---

## 7. Landing Page & Visual Presentation Paradigms

The public-facing marketing and landing pages (like the Hero section) employ a specialized cinematic aesthetic designed to project enterprise scale and scientific rigor. All new landing page sections must adhere to these exact paradigms:

### A. Data-Driven Visualization (No Generic Assets)
- Never use generic stock photography, flat vector illustrations, or simple isometric SVGs.
- Backgrounds and visual anchors must be highly technical, utilizing WebGL/Three.js data visualizations (like the `ParticleGlobe`), code-styled data arrays, or hardware-accelerated particle systems.
- Visuals should live *behind* or frame the typography, heavily masked by radial gradients (`bg-radial-glow`) and vignettes to preserve pure readability.

### B. Typography Scale & Framing
- **Primary Headlines:** Must be massive, lightweight, and tightly tracked. Use `font-weight: 300`, `letter-spacing: -0.02em`, and fluid `clamp()` sizing (e.g., `clamp(2.6rem, 7vw, 5.5rem)`).
- **Secondary Accents:** Frame large typography with small, monospaced "technical data" annotations (Courier New, `0.62rem`, highly transparent) positioned at the absolute edges of the container to create structural texture.
- **Microcopy:** Body text max-width should rarely exceed `400px` for captions, keeping line lengths editorial and short.

### C. Motion & Animation Standards
- **Easing:** Standardize all CSS reveals on a cinematic ease-out curve: `cubic-bezier(0.22, 1, 0.36, 1)` with durations between `1.0s` and `1.3s`.
- **Staggering:** Elements must never appear simultaneously. Use strict, delayed cascading (e.g., Hero headline lines staggering in, followed by background data snippets, followed by the CTA) utilizing CSS `animationDelay` inline offsets (e.g. `0.15s`, `0.30s`).
- **Scroll Reveals:** For content below the fold, use lightweight native CSS animations (e.g. `.scroll-fade-up` using `translateY(50px)`) triggered via native `IntersectionObserver`. Avoid importing heavy JS layout libraries (GSAP ScrollTrigger) for simple fade/slide-up sequences.
- **Reduced Motion:** ALL animations (CSS and WebGL) must be rigorously gated behind `@media (prefers-reduced-motion: reduce)`. WebGL loops must freeze, and CSS elements must instantly resolve to their final `opacity: 1` state.

### D. Layout & Interaction Mechanics (The Anti-Generic Rules)
- **Sharp Brutalism:** Avoid soft, generic SaaS styling. No heavy drop shadows. Use strict `0px` or `2px` maximum border radii for hard, technical edges that feel like command terminals or data dashboards.
- **Hover Reveals:** Use "invisible" layouts where grids, tabs, and layout sections rely on `transparent` borders/backgrounds that only reveal themselves on hover (e.g., `border: 1px solid var(--border-glass-hover)`). This creates a responsive, highly interactive terminal-like feel without visual clutter.
- **Flush Grids:** Continuous vertical or horizontal elements (like feature grids) should snap flush (`gap: 0` on specific axes) to form tight, continuous data bands rather than floating distinct islands.
- **Typewriter/Console Text:** Use strict monospace fonts (`Courier New`) with wide tracking for accents and section kickers to reinforce the intelligence/developer tool theme, rather than standard uppercase sans-serifs. Always orchestrate typewriter effects carefully to prevent layout shifts (e.g. lock container `max-width` and `overflow: hidden`).
