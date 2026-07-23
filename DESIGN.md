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
  --surface-glass: rgba(1, 46, 87, 0.65);
  --border-glass: rgba(255, 255, 255, 0.12);

  /* 3. Brand Accent — 5-10% Max Usage Rule */
  --accent-primary: #CC6600;       /* Enterprise Orange */
  --accent-hover: #E67300;
  --accent-glow: rgba(204, 102, 0, 0.25);

  /* 4. Primary Content — High Legibility */
  --text-primary: #FFFFFF;         /* Pure White */
  --text-muted: rgba(255, 255, 255, 0.70);
  --text-dim: rgba(255, 255, 255, 0.45);

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

- **Button Primary:** `background: #CC6600; color: #FFFFFF; hover: #E67300;`
- **Button Secondary:** `background: #012E57; color: #FFFFFF; border: 1px solid rgba(255,255,255,0.15);`
- **Card Container:** `background: #012E57; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;`
- **Page Wrapper:** `background: #010114; min-height: 100vh; color: #FFFFFF;`
