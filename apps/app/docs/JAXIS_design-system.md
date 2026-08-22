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

### 1.2. Iconography & Strict Visual Standard (TABLER ICONS ONLY — NO EMOJIS)
- **Mandatory Icon Library — Tabler Icons (`@tabler/icons-react`)**: All icons across the entire project (in `@repo/ui` and `apps/app`) **must exclusively use Tabler Icons** from `@tabler/icons-react` (e.g., `IconDownload`, `IconEye`, `IconEyeOff`, `IconFileDescription`, `IconSearch`, `IconCheck`, `IconUser`, `IconTrash`, `IconFolder`, etc.).
- **Strict Prohibition on Emojis**: Emojis (e.g. 🔍, ⏸, ⛔, 📋, 🚀, 💡, 📁, 📄, 🔒) are **strictly forbidden** across the entire UI codebase, dropdown menus, action items, buttons, notifications, toasts, table columns, and form labels.
- **No Ad-Hoc Inline SVGs or Other Icon Libraries**: Do not introduce miscellaneous icon packages or sprawling raw inline SVGs when a Tabler icon is available. Always import standard icons from `@tabler/icons-react`.
- **Icon Styling Standards**:
  - Use `stroke={1.5}` or `stroke={2}` for consistent optical weight.
  - Scale with `size={16}` (micro/badges), `size={18}` / `size={20}` (standard buttons/inputs), or `size={24}` (featured cards).
  - Use Tailwind color classes (e.g., `className="text-[#CC6600]"`, `className="text-sky-400"`, `className="text-white/60"`).
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

---

## 6. Component Selection & Usage Guide (`@repo/ui`)

Use this matrix to select the correct UI component pattern for each interaction type, layout context, and telemetry state across JAXIS StatLab.

### 6.1. Notification Matrix: `Toast` vs. `Alert` vs. Form Inline Errors

| Component | Scope & Lifetime | Screen Placement | Trigger Context | Example Usage |
| :--- | :--- | :--- | :--- | :--- |
| **`Toast`** | **Transient / Auto-Dismiss**<br>• `7000ms` for `success` & `info`<br>• `Persistent` for `danger` & `warning` | Viewport Bottom-Right (`z-[9999]`) via React Portal (`document.body`) | Post-action confirmations spanning redirects, asynchronous job status changes, global success receipts. | • *"Study Intake Submitted — Assigned ID: JAXIS-202608-1877"*<br>• *"Quotation Proposal Approved"*<br>• *"Syntax Verification Package Ready for Download"* |
| **`Alert`** | **Persistent In-Page Banner**<br>Remains until condition resolves or user dismisses. | In-flow directly above tables, forms, or headers. | Blocking prerequisite warnings, critical workflow notices, form validation summaries. | • *"Profile Verification Required before submitting study intake"*<br>• *"Escrow Payment Locked pending QA verification seal"*<br>• Form submission payload errors. |
| **Field Error** | **Instant Micro-Validation**<br>Appears below invalid control. | Under specific `FormInput` / `FormTextarea` / `FormSelect`. | Field-level Zod schema validation errors. | • *"Research Title must be at least 3 characters"*<br>• *"Target deadline must be in the future"* |

#### `Toast` Usage Pattern & Features:
```tsx
import { Toast } from "@repo/ui";

// Inside page or dashboard component:
{toast && (
  <Toast
    variant={toast.variant} // "success" | "danger" | "warning" | "info"
    message={toast.message}
    description={toast.description}
    onClose={() => setToast(null)}
  />
)}
```
- **Sticky React Portal**: Renders directly to `document.body` — stays pinned to viewport during scrolling, unaffected by parent CSS animation wrappers.
- **7-Second Auto-Dismiss**: Runs a 60fps hardware-accelerated bottom countdown line. When the countdown completes, it triggers a smooth exit transition before unmounting.
- **Hover to Pause**: Pauses the timer whenever the user hovers over the toast (e.g. to read or copy an ID).
- **Responsive Inset**: `fixed bottom-4 left-4 right-4` on mobile devices; `sm:bottom-6 sm:right-6 sm:left-auto` on tablet/desktop.

---

### 6.2. Data Display: `DataTable` vs. Custom Card Grids vs. `KpiCard`

| Component Pattern | Primary Purpose | Responsive Behavior | When to Use |
| :--- | :--- | :--- | :--- |
| **`DataTable`** (`<table>` inside `<Card className="p-0">`) | Multi-attribute, sortable, tabular dataset records. | Wrapped in `<div className="w-full overflow-x-auto">` with `min-w-[680px]` (standard) or `min-w-[850px]` (dense). | • Primary Study Registries (Client Portal, Statistician Workbench, QA Review Desk).<br>• Escrow Transactions & Payout Ledger.<br>• Staff User Management.<br>• QA Audit Logs. |
| **Custom Card Grid** | Distinct entity inspection or document intake slots. | Single column on mobile (`grid-cols-1`), multi-column on desktop (`md:grid-cols-2 lg:grid-cols-3 gap-6`). | • Document upload intake slots (Chapters 1-3, Raw Dataset, Survey Instrument).<br>• Deliverable Package download bundles.<br>• Quotation pricing tier cards. |
| **`KpiCard`** (`variant="kpi"`) | Single high-impact metric with trend indicator. | 1-col on mobile, 2-col on phablets, 4-col on desktop (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`). | • Dashboard summary counters (Active Studies, Awaiting Information, QA Review Queue, Closed Studies). |

#### `DataTable` Implementation Standard:
```tsx
<Card className="p-0 overflow-hidden">
  <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between">
    <h2 className="text-base font-bold text-white">Active Research Studies</h2>
  </div>
  <div className="w-full overflow-x-auto">
    <table className="w-full min-w-[700px] text-left border-collapse text-sm">
      <thead>
        <tr className="border-b border-white/[0.08] bg-white/[0.02] text-xs font-mono text-white/50 uppercase">
          <th className="py-3 px-4">Study ID</th>
          <th className="py-3 px-4">Research Title</th>
          <th className="py-3 px-4">Target Deadline</th>
          <th className="py-3 px-4">Status</th>
          <th className="py-3 px-4 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/[0.04]">
        {/* Table Rows with Tabler icon buttons */}
      </tbody>
    </table>
  </div>
</Card>
```

---

### 6.3. Overlays & Windows: `Modal` vs. `Drawer`

| Component | Architecture & Dimensions | Content Capacity | When to Use |
| :--- | :--- | :--- | :--- |
| **`Modal`** (`Modal.tsx`) | Centered dialog (`max-w-md` to `max-w-4xl`) with `max-h-[70vh]` body scroll & `Escape` key cleanup. | Focused, discrete task or inspection view. | • Study Specifications Inspector modal.<br>• Quotation calculation review popup.<br>• Destructive action confirmations (suspend staff, revoke access).<br>• File preview or syntax modal. |
| **`Drawer`** (`Drawer.tsx`) | Full-height off-canvas slide-out sheet from viewport edge. | Deep multi-section navigation or dense parameter configuration. | • Mobile navigation sidebar (`<lg`).<br>• Multi-variable statistical model setup sidebar.<br>• Live audit event stream panel. |

---

### 6.4. Action Primitives: `Button` Hierarchy & Sizing Standards

| Size Prop | Dimensions & Padding | Typography | When to Use |
| :--- | :--- | :--- | :--- |
| **`size="sm"`** | `min-h-[30px]`, `padding: 0.35rem 0.875rem` | `text-[0.688rem]` / `11px`, `font-bold tracking-wider` | **Primary standard across all dashboard desks**: Topbar actions (`+ NEW PROJECT INTAKE`), table row actions, form wizard footers (`PROCEED TO ATTACHMENTS →`, `SUBMIT INTAKE →`). |
| **`size="md"`** | `min-h-[38px]`, `padding: 0.55rem 1.25rem` | `text-xs` / `12px`, `font-semibold` | Modal action footers, authentication forms. |
| **`size="lg"`** | `min-h-[46px]`, `padding: 0.75rem 1.75rem` | `text-sm` / `14px`, `font-bold` | Public landing page marketing hero CTAs. |

#### `FormFooter` Responsive Button Rule:
All action buttons placed in form footers must use `className="w-full sm:w-auto font-bold tracking-wider"`:
- **Mobile (`< 640px`)**: Form footer automatically stacks buttons (`flex-col-reverse`) where every button expands to **100% full width** with identical touch targets.
- **Desktop (`>= 640px`)**: Buttons sit side-by-side (`justify-between` or `justify-end`) with compact natural widths.

---

### 6.5. Process Guidance: `Stepper`
- **When to Use**: Linear multi-step workflows (e.g. Project Intake: `01. Scope & Details` → `02. Document Uploads` → `03. Review & Submit`).
- **Visual Design**: Borderless top profile (zero top glow lines), dark navy glass cards, `#CC6600` active step badges.
- **Interactive State**: Supports `onStepClick` for bidirectional step navigation when previously completed.

---

### 6.6. Status Telemetry: `StatusBadge` & `Badge`
- **Mandatory Icon Standard**: Always pair status labels with appropriate `@tabler/icons-react` components (`IconCircleCheck`, `IconClock`, `IconAlertTriangle`, `IconLock`). Zero emojis.
- **Color Coding**:
  - `ACTIVE` / `IN_PROGRESS` / `OPEN`: Sky Blue (`#38BDF8` / `bg-sky-500/10`)
  - `FOR_QA` / `AWAITING_INFORMATION`: Amber (`#F59E0B` / `bg-amber-500/10`)
  - `APPROVED` / `DELIVERED` / `PAID`: Verification Emerald (`#10B981` / `bg-emerald-500/10`)
  - `SUSPENDED` / `REJECTED` / `CANCELLED`: Danger Red (`#EF4444` / `bg-red-500/10`)

