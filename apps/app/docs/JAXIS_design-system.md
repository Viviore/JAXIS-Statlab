# JAXIS StatLab — Comprehensive Design System & UI Specifications

**Workspace:** `apps/app` & `@repo/ui`  
**Aesthetic Standard:** Dark Precision Terminal / Enterprise Brutalism  
**Primary Color Tokens:** Midnight Navy (`#010114`), Deep Ocean Glass (`#011B38`), Enterprise Orange (`#CC6600`)

---

## 1. Design Philosophy & Master Color Palette

JAXIS StatLab follows a high-precision, industrial-scientific design system tailored for academic researchers, PhD statisticians, and peer-review leads.

### 1.1. Core Color System
| Role | Token / Hex | Usage |
| :--- | :--- | :--- |
| **Master Canvas** | `#010114` | Unified background for Viewport, Topbar, Sidebar, and Main Canvas. |
| **Surface Card** | `rgba(1, 22, 46, 0.75)` | Elevated panel background for cards, tables, and inspection modals. |
| **Subtle Overlay** | `rgba(255, 255, 255, 0.02)` | Table headers, muted footers, and passive card hover states. |
| **Primary Accent** | `#CC6600` (Orange) | Active route tabs, primary CTA buttons, required asterisks, study ID highlights. |
| **Analytical Tone** | `#0284C7` / `#38BDF8` (Sky) | Methodology badges, statistical script outputs, dataset inspection badges. |
| **Verification Gate** | `#10B981` (Emerald) | QA approval seals, APA 7th verified badges, released escrow status. |
| **Escrow / Attention** | `#F59E0B` (Amber) | Escrow locked indicators, pending recalculation stages, urgent QA queue. |
| **Border Division** | `rgba(255, 255, 255, 0.08)` | Hairline dividers, table row borders, card perimeter lines. |

### 1.2. Iconography & Strict Visual Standard (NO EMOJIS)
- **Strict Prohibition on Emojis**: Emojis (e.g. 🔍, ⏸, ⛔, 📋, 🚀, 💡) are **strictly forbidden** across the entire UI codebase, dropdown menus, action items, notifications, toasts, table columns, and form labels.
- **Enterprise Precision SVGs**: All iconography must use crisp, vector inline SVGs (e.g. Lucide/Heroicon paths) or pure typographic uppercase badges.
- **Zero Glow Policy**: Blurry box-shadow glows (`shadow-[0_0_...px]`) are prohibited. Use high-contrast flat borders (`border-white/10` to `border-white/20`) and calibrated opacity tints (`bg-white/[0.04]` or `bg-sky-500/10`).

---

## 2. Global Layout Shell Architecture (`dashboard/layout.tsx`)

Every dashboard page and future module (`/dashboard/*`) runs inside the unified `DashboardShell`:

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Topbar (h-14 / 56px) — [#010114] with px-clamp(1.25rem, 2.5vw, 2rem)     │
├─────────────────┬────────────────────────────────────────────────────────┤
│ Sidebar         │ Main Content Container (<main>)                        │
│ Width: 296px    │ Background: #010114 | overflow-y-auto overflow-x-hidden│
│ Fixed on Desktop│ Padding: clamp(1.5rem, 3.5vw, 2.5rem)                  │
│ Slide-out Drawer│ Inner Content: max-w-7xl mx-auto                       │
│ on Mobile (<lg) │                                                        │
└─────────────────┴────────────────────────────────────────────────────────┘
```

### 2.1. Viewport Lock Rules
- **Container Constraint**: Root container is strictly locked to `100dvh` (`max-h-[100dvh] overflow-hidden`).
- **Independent Scrolling**: `<main>` is the **only** scrollable element in the workspace. The Topbar and Sidebar stay fixed at all times.
- **Universal Content Padding**: `<main>` enforces `padding: clamp(1.5rem, 3.5vw, 2.5rem)` with `box-sizing: border-box`. Future pages **never** need to manually add outer viewport margins.

---

## 3. Responsive Breakpoints & Multi-Device Standards

| Breakpoint | Width | Behavior & Rules |
| :--- | :--- | :--- |
| **Mobile (`< 640px`)** | Phones (360px – 430px) | Single column vertical flow. Topbar hides text search and user full name (profile icon only). Sidebar becomes off-canvas slide-out drawer toggled via right hamburger. |
| **`sm` (`640px`)** | Large phones / phablets | 2-column KPI grids. User full name appears beside avatar in Topbar. |
| **`md` (`768px`)** | Tablets / iPads | Dual-column form fields, multi-button toolbars wrap cleanly. |
| **`lg` (`1024px`)** | Laptops (13" – 14") | Desktop Sidebar pinned permanently (296px). Topbar command search bar becomes visible. Split auth layout active. |
| **`xl` (`1280px`)** | High-res monitors | 4-column KPI telemetry matrix, full data inspection tables. |
| **`2xl` (`1536px`)** | Ultra-wide displays | Content centered with max width bound (`max-w-7xl mx-auto`). |

---

## 4. Reusable Page Components (`@repo/ui`)

### 4.1. PageHeader Component
Standardized 3-tier vertical hierarchy for all future pages:

```tsx
<PageHeader
  title="Statistician Modeling Workbench"
  description="Execute analytical models, inspect cleaned dataset vectors, and upload verified R syntax."
  breadcrumbs={[
    { label: "WORKSPACE", href: "/dashboard" },
    { label: "Statistician Lab" },
  ]}
  badge={<StatusBadge status="ACTIVE" />}
  actions={
    <>
      <Button variant="outline" size="sm">EXPORT SYNTAX</Button>
      <Button variant="primary" size="sm">+ NEW RUN</Button>
    </>
  }
/>
```

**Order of Elements:**
1. **Breadcrumbs** (Optional navigation crumbs)
2. **Header** (`title` + optional `badge`)
3. **Description** (Summary paragraph explaining the page/desk)
4. **Actions** (Action buttons with `flex-wrap gap-2 sm:gap-3` positioned underneath)

---

### 4.2. KPI Metric Cards
Standardized telemetry cards for statistical indices and financial metrics:

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
  <Card variant="kpi" className="group">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-mono font-semibold text-white/50 uppercase">Active Studies</span>
      <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-[2px] border border-emerald-500/20">
        +14% MoM
      </span>
    </div>
    <span className="text-3xl font-bold font-mono text-white tracking-tight">24</span>
  </Card>
</div>
```

---

### 4.3. Responsive Data Tables
Every table rendered across all modules **must** adhere to horizontal scroll containment:

```tsx
<Card className="p-0 overflow-hidden">
  {/* Card Header */}
  <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between">
    <h2 className="text-base font-bold text-white font-sans">Active Studies Registry</h2>
  </div>

  {/* Responsive Table Scroll Container */}
  <div className="w-full overflow-x-auto">
    <table className="w-full min-w-[680px] text-left border-collapse font-sans text-sm">
      <thead>
        <tr className="border-b border-white/[0.08] bg-white/[0.02] text-xs font-mono text-white/50 uppercase">
          <th className="py-3 px-4">Study ID</th>
          <th className="py-3 px-4">Title</th>
          <th className="py-3 px-4">Methodology</th>
          <th className="py-3 px-4">Status</th>
          <th className="py-3 px-4 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/[0.04]">
        {/* Table Rows */}
      </tbody>
    </table>
  </div>
</Card>
```

**Table Rules:**
1. **Container**: Always wrap `<table>` inside `<div className="w-full overflow-x-auto">`.
2. **Min-Width**: Set `min-w-[620px]` (for 4–5 column tables) or `min-w-[800px]` (for 6+ column tables) so columns maintain comfortable spacing on mobile screens.
3. **Identifiers**: Format IDs in mono typography with `#CC6600` or `#38BDF8` styling.

---

### 4.4. Form Fields & Validation Controls
All inputs (`FormInput`, `FormSelect`, `FormTextarea`) strictly enforce:

1. **Labels**: Uppercase mono typography (`font-mono text-xs text-slate-200 uppercase tracking-wider`).
2. **Required Asterisk**: Preceded by space, rendered in `#CC6600` (`<span style={{ color: "#CC6600" }}>*</span>`).
3. **Field Dimensions**: Standard `3rem` (48px) height with brutalist `2px` border-radius.
4. **Focus Rings**: `focus:border-[#CC6600] focus:ring-1 focus:ring-[#CC6600]/40`.
5. **Box Sizing**: Strict `box-sizing: border-box` to prevent horizontal form overflow on mobile.

---

### 4.5. Modal & Drawer Inspection Windows
Modal dialogs (`Modal.tsx`) enforce responsive containment:

1. **Viewport Constraints**: `max-w-[94vw] sm:max-w-xl md:max-w-2xl lg:max-w-4xl`.
2. **Body Scroll**: Content container has `max-h-[70vh] overflow-y-auto` so large dataset inspectors or questionnaires never push modal headers/footers off-screen.
3. **Keyboard & Backdrop Cleanup**: Automatic `Escape` key listener cleanup on unmount (`RULE_MEM_01`).

---

## 5. Navigation & Identity Specifications

### 5.1. Topbar Navigation
- **Left**: Official logo mark (`/jaxislogo.png`) + `JAXIS STATLAB Workspace`.
- **Center**: Global command search bar (hidden on screens `< 1024px`).
- **Right**:
  - Profile Dropdown: Displays circular initial avatar (`[ C ]`), hides full name on screens `< 640px`, and opens a full dropdown menu containing Name, Role micro-badge, Email, Account Settings, and Sign Out action.
  - Mobile Hamburger Button: Positioned on the far right (visible `< 1024px`), toggles the mobile navigation drawer.

### 5.2. Sidebar & Mobile Drawer Navigation
- **Role-Scoping**: Dynamically renders role-tailored navigation items (`CLIENT`, `STATISTICIAN`, `SENIOR_QA_LEAD`, `FINANCE_OFFICER`, `CEO`, `ADMIN`).
- **Exact Active Matching**: Highlights active route with exact pathname matching (`pathname === item.href`) using `bg-[#CC6600]/15 text-white font-semibold`.
- **Drawer Behavior**: Smooth slide-in from left with `bg-black/70 backdrop-blur-sm` overlay and automatic dismiss when any link is clicked or when clicking the backdrop.
