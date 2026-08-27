# JAXIS StatLab — Comprehensive Design System & UI Specifications

**Workspace:** `apps/app` & `@repo/ui`  
**Aesthetic Standard:** Dark Precision Terminal / Enterprise Scientific  
**Primary Color Tokens:** Midnight Navy (`#010114`), Deep Ocean Glass (`#011B38`), Enterprise Orange (`#CC6600`)

---

## 1. Design Philosophy & Master Color Palette

JAXIS StatLab follows a high-precision, industrial-scientific design system tailored for academic researchers, PhD statisticians, and peer-review leads.

### 1.1. Core Color System
| Role | Token / Hex | Usage |
| :--- | :--- | :--- |
| **Master Canvas** | `#010114` | Unified background for Viewport, Topbar, Sidebar, and Main Canvas. |
| **Surface Card** | `rgba(1, 22, 46, 0.75)` / `#01142B` / `#011B38` | Elevated panel background for cards, tables, and inspection modals. |
| **Subtle Overlay** | `rgba(255, 255, 255, 0.04)` | Table headers, muted footers, and passive card hover states. |
| **Primary Accent** | `#CC6600` (Orange) | Active route tabs, primary CTA buttons, required asterisks, study ID highlights. |
| **Analytical Tone** | `#0284C7` / `#38BDF8` (Sky) | Methodology badges, statistical script outputs, dataset inspection badges. |
| **Verification Gate** | `#10B981` (Emerald) | QA approval seals, APA 7th verified badges, released escrow status. |
| **Escrow / Attention** | `#F59E0B` (Amber) | Escrow locked indicators, pending recalculation stages, urgent QA queue. |
| **Border Division** | `rgba(255, 255, 255, 0.08)` / `border-white/10` | Hairline dividers, table row borders, card perimeter lines. |

### 1.2. Iconography & Strict Visual Standard (TABLER ICONS ONLY — NO EMOJIS)
- **Mandatory Icon Library — Tabler Icons (`@tabler/icons-react`)**: All icons across the entire project (in `@repo/ui` and `apps/app`) **must exclusively use Tabler Icons** from `@tabler/icons-react` (e.g., `IconDownload`, `IconEye`, `IconFileDescription`, `IconSearch`, `IconCheck`, `IconUser`, `IconTrash`, `IconFolder`, `IconClock`, `IconAlertTriangle`, etc.).
- **Strict Prohibition on Emojis**: Emojis (e.g. 🔍, ⏸, ⛔, 📋, 🚀, 💡, 📁, 📄, 🔒) are **strictly forbidden** across the entire UI codebase, dropdown menus, action items, buttons, notifications, toasts, table columns, and form labels.
- **No Ad-Hoc Inline SVGs or Other Icon Libraries**: Do not introduce miscellaneous icon packages or raw inline SVGs when a Tabler icon is available. Always import standard icons from `@tabler/icons-react`.
- **Icon Styling Standards**:
  - Use `stroke={1.5}` or `stroke={2}` for consistent optical weight.
  - Scale with `size={16}` (micro/badges), `size={18}` / `size={20}` (standard buttons/inputs), or `size={24}` (featured cards).
  - Use Tailwind color classes (e.g., `className="text-[#CC6600]"`, `className="text-sky-400"`, `className="text-white/60"`).
- **Zero Glow Policy**: Blurry box-shadow glows (`shadow-[0_0_...px]`) are prohibited. Use crisp, high-contrast flat borders (`border-white/10` to `border-white/20`) and calibrated opacity tints (`bg-white/[0.04]` or `bg-sky-500/10`).
- **No Awkward Gradients**: Do not use heavy gradient fills (`bg-gradient-to-r`) on action bars, banners, or modal headers. Rely on solid substrates (`#01142B` / `#011B38`) with calibrated borders.

### 1.3. Copywriting, Tone & Labeling Standards (SIMPLE & HUMAN-FRIENDLY)
- **Zero Double Slashes Policy**: Double slashes (`//`) are **strictly prohibited** in all UI copy, loading states, badges, alert titles, and toasts.
- **Simple, Direct English**: All interface wording must be simple, concise, and human-friendly. Never use robotic, artificial sci-fi jargon (e.g. NEVER use `"SYNCING TELEMETRY // RETRIEVING DATA"`, `"ESTABLISHING SECURE PROTOCOL"`, `"CALCULATING COMPUTE STATE"`).
- **Standard Phrasing Examples**:
  - `Loading research studies...` (not `SYNCING RESEARCH REGISTRY // FETCHING STUDIES...`)
  - `Loading workspace...` (not `INITIALIZING WORKSPACE TELEMETRY // JAXIS v1.0`)
  - `Verifying profile...` (not `VERIFYING INSTITUTIONAL CLEARANCE...`)
  - `Please wait a moment` (not `Awaiting real-time analytical pipeline response`)
- **Proper Terminology**: Always use **"Lead Researcher"** and **"Research Study"** (never "Principal Investigator" or "Investigator").
- **Button Casing**: Use Title Case or Clean Sentence Case for buttons (e.g. `"Review & Sign Contract →"`, `"Download All"`, `"Configure Services"`), never aggressive all-caps shouting.

---

## 2. Global Layout Shell Architecture (`DashboardShell.tsx`)

Every dashboard page and future module (`/dashboard/*`) runs inside the unified `DashboardShell`:

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Topbar (h-14 / 56px) — [#010114] with px-clamp(1.25rem, 2.5vw, 2rem)     │
├─────────────────┬────────────────────────────────────────────────────────┤
│ Sidebar         │ Main Content Container (<main>)                        │
│ Width: 296px    │ Background: #010114 | overflow-y-auto overflow-x-hidden│
│ Fixed on Desktop│ Padding: clamp(2rem, 4vw, 3.5rem) (Handled by Shell)  │
│ Slide-out Drawer│ Inner Content: max-w-7xl mx-auto pb-24 w-full          │
│ on Mobile (<lg) │                                                        │
└─────────────────┴────────────────────────────────────────────────────────┘
```

### 2.1. Viewport Lock & Anti-Double-Padding Rules
- **Container Constraint**: Root container is strictly locked to `100dvh` (`max-h-[100dvh] overflow-hidden`).
- **Independent Scrolling**: `<main>` is the **only** scrollable element in the workspace. The Topbar and Sidebar stay fixed at all times.
- **Universal Shell Padding**: `<main>` enforces `padding: clamp(2rem, 4vw, 3.5rem)` with `box-sizing: border-box`.
- **Anti-Double-Padding Mandate**: Page routes inside `/dashboard` **must NEVER add redundant outer horizontal padding** (NO `px-4 sm:px-8 lg:px-12 py-8`). All inner page containers must use the uniform standard:
  ```tsx
  <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-24 w-full animate-content-fade">
  ```
  *(or `max-w-5xl` for focused legal contract / SOW document desks).*
- **Guaranteed Consistency**: This standard guarantees that switching between tabs (Intake Triage, Quotation Desk, Staff Directory, Admin Command Center) maintains 100% pixel-perfect horizontal alignment without jumping.

---

## 3. Responsive Breakpoints & Multi-Device Standards

| Breakpoint | Width | Behavior & Rules |
| :--- | :--- | :--- |
| **Mobile (`< 640px`)** | Phones (360px – 430px) | Single column vertical flow. Topbar hides user full name (profile avatar only). Sidebar becomes off-canvas slide-out drawer toggled via right hamburger. |
| **`sm` (`640px`)** | Large phones / phablets | 2-column KPI grids. User full name appears beside avatar in Topbar. |
| **`md` (`768px`)** | Tablets / iPads | Dual-column form fields, multi-button toolbars wrap cleanly. |
| **`lg` (`1024px`)** | Laptops (13" – 14") | Desktop Sidebar pinned permanently (296px). Split auth layout active. |
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
3. **Field Dimensions**: Standard `3rem` (48px) height with crisp `3px`–`4px` border-radius.
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
| **`Toast`** | **Transient / Auto-Dismiss**<br>• `5000ms–7000ms` countdown bar<br>• Pause on hover | Viewport Bottom-Right (`z-[9999]`) via React Portal (`document.body`) | Post-action confirmations, 1-click clipboard copies, file upload/delete/download events, async server mutations. | • *"Study Submitted — Assigned ID: JAXIS-202608-1877"*<br>• *"Copied to Clipboard"*<br>• *"Information Request Sent"* |
| **`Alert`** | **Persistent In-Page Banner**<br>Remains until condition resolves or user dismisses. | In-flow directly above tables, forms, or headers. | Blocking prerequisite warnings, critical workflow notices, form validation summaries. | • *"Profile Verification Required before submitting study intake"*<br>• *"Escrow Payment Locked pending QA verification seal"*<br>• Form submission payload errors. |
| **Field Error** | **Instant Micro-Validation**<br>Appears below invalid control. | Under specific `FormInput` / `FormTextarea` / `FormSelect`. | Field-level Zod schema validation errors. | • *"Research Title must be at least 3 characters"*<br>• *"Target deadline must be in the future"* |

#### The 4 Semantic Toast Variants

| Variant | Accent Color | Border & Gradient Surface | Icon (`@tabler/icons-react`) | Primary Use Cases |
| :--- | :--- | :--- | :--- | :--- |
| `info` | Analytical Sky (`#38BDF8`) | `bg-gradient-to-r from-sky-950/90 to-[#010D1F] border-sky-500/35` | `<IconInfoCircle size={18} stroke={2} />` | Clipboard copies, download starts, non-destructive notifications, session events. |
| `success` | Verification Emerald (`#10B981`) | `bg-gradient-to-r from-emerald-950/90 to-[#010D1F] border-emerald-500/35` | `<IconCircleCheck size={18} stroke={2} />` | Form saves, project creation, profile updates, file attachments, QA approvals, status advancements. |
| `warning` | Enterprise Amber (`#CC6600` / `#FBBF24`) | `bg-gradient-to-r from-amber-950/90 to-[#010D1F] border-amber-500/35` | `<IconAlertTriangle size={18} stroke={2} />` | Missing information requests sent, staff suspensions, revision requests returned to statistician. |
| `danger` | Crimson Alert (`#EF4444` / `#F87171`) | `bg-gradient-to-r from-rose-950/90 to-[#010D1F] border-rose-500/35` | `<IconAlertCircle size={18} stroke={2} />` | Action failures, network errors, file size >15MB limit exceeded, invalid file formats, account termination. |

#### The 5 Golden Rules of Toasts (Mandatory for All Future Desks)

1. **Rule 1: Asynchronous Mutation Rule (Save / Submit / Delete)**
   - Every user-initiated Server Action (`create*`, `update*`, `delete*`, `resolve*`, `transition*`) MUST trigger a Toast upon completion.
   - On `res.success === true` → Fire `success` or `warning` (if request/hold) Toast.
   - On `res.success === false` → Fire `danger` Toast with `res.error.message`.

2. **Rule 2: 1-Click Clipboard Copy Rule**
   - Every copy button across tables, headers, and modals (e.g. Study ID, Credentials, Tokens) MUST trigger an `info` Toast (`"Copied to Clipboard"`).

3. **Rule 3: File System & Deliverables Rule**
   - **Upload Finished:** Fire `success` Toast (`"File Uploaded Successfully"`).
   - **Upload Rejected (Size / Format):** Fire `danger` Toast (`"File Limit Exceeded"` or `"Unsupported File Format"`).
   - **File Removed:** Fire `info` Toast (`"File Removed"`).
   - **Download Initiated:** Fire `info` Toast (`"Download Started"`).

4. **Rule 4: Zero Emojis Policy**
   - Never use emojis in `message` or `description`. Icons are handled automatically by the `Toast` component using `@tabler/icons-react`.

5. **Rule 5: Concise & Meaningful Copy**
   - `message`: 2 to 4 words, Title Case (e.g. `Profile Saved Successfully`, `Information Request Sent`).
   - `description`: 1 concise sentence explaining what changed and what happens next.

#### `Toast` Usage Pattern & Features:
```tsx
import { Toast } from "@repo/ui";

const [toastMessage, setToastMessage] = useState<{
  message: string;
  description?: string;
  variant: "info" | "success" | "warning" | "danger";
} | null>(null);

// Triggering Toast:
setToastMessage({
  message: "Study Submitted for Review",
  description: `Assigned Study ID: ${assignedId}. Your project is now queued for feasibility triage.`,
  variant: "success",
});

// Rendering in JSX:
{toastMessage && (
  <Toast
    message={toastMessage.message}
    description={toastMessage.description}
    variant={toastMessage.variant}
    onClose={() => setToastMessage(null)}
  />
)}
```
- **Sticky React Portal**: Renders directly to `document.body` at `z-[9999]` — stays pinned to viewport during scrolling, unaffected by parent CSS animation wrappers.
- **Hardware-Accelerated Countdown**: 60fps bottom countdown line with smooth exit transition.
- **Hover to Pause**: Automatically pauses the timer whenever the user hovers over the toast.
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

### 6.3. Overlays & Windows: `Modal` vs. `Drawer` vs. `ModalFooter`

| Component | Architecture & Dimensions | Content Capacity | When to Use |
| :--- | :--- | :--- | :--- |
| **`Modal`** (`Modal.tsx`) | Centered dialog (`max-w-md` to `max-w-7xl` / `sm` to `5xl`) with scrollable body, backdrop blur (`bg-black/80`), and `Escape` key capture. | Focused, discrete task or inspection view. | • Study Specifications Inspector modal.<br>• Quotation calculation review popup.<br>• Destructive action confirmations (suspend staff, revoke access).<br>• File upload / preview or syntax modal. |
| **`ModalFooter`** (`Modal.tsx` / `@repo/ui`) | Standardized bottom action container with generous top spacing (`mt-6 pt-5`), hairline divider (`border-t border-white/[0.08]`), and responsive stacking. | Action buttons (`Cancel`, `Submit`, `Confirm`). | • Any modal containing interactive action buttons.<br>• Form submission footers inside modal dialogs. |
| **`Drawer`** (`Drawer.tsx`) | Full-height off-canvas slide-out sheet from viewport edge. | Deep multi-section navigation or dense parameter configuration. | • Mobile navigation sidebar (`<lg`).<br>• Multi-variable statistical model setup sidebar.<br>• Live audit event stream panel. |

#### Modal & ModalFooter Standard Specifications

Every modal across the workspace must strictly comply with the following structural layout and spacing tokens:

```
┌────────────────────────────────────────────────────────┐
│ Modal Sticky Header (p-4 sm:p-5 border-b border-white/[0.08]) │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Modal Content Body (p-5 sm:p-6 overflow-y-auto)        │
│                                                        │
├────────────────────────────────────────────────────────┤
│ ModalFooter (mt-6 pt-5 pb-4 px-5 sm:px-6 border-t)     │
│ [Cancel / Ghost] [Secondary]   [Primary Action CTA →]  │
└────────────────────────────────────────────────────────┘
```

1. **Standardized Spacing & Padding Tokens:**
   - **Small Screen / Mobile Inset (Viewport Margin):** Outer overlay container applies `padding: clamp(1rem, 5vw, 1.5rem)` (`p-4 sm:p-6`) with `mx-auto`, guaranteeing clean left and right screen gutters on mobile devices so modals never touch the viewport edges.
   - **Top Margin:** `marginTop: "1.5rem"` / `mt-6` (guarantees clear visual breathing room between form fields/content and buttons).
   - **Top Padding:** `paddingTop: "1.25rem"` / `pt-5`
   - **Horizontal Padding:** `paddingLeft/Right: "1.5rem"` / `px-5 sm:px-6`
   - **Border Separation:** `1px solid rgba(255, 255, 255, 0.08)` / `border-t border-white/[0.08]`
   - **Footer Background:** `rgba(1, 18, 38, 0.98)` / `bg-[#011226]/98 backdrop-blur-md`

2. **Action Alignment & Responsive Stacking:**
   - **Small Screen Mobile (`< 640px`):** Stacks vertically (`flex-col-reverse items-stretch`) where every action button automatically expands to **100% full width** (`w-full`) for accessible touch targets. Primary CTA sits on top, Cancel / Back sits below.
   - **Desktop (`>= 640px`):** Arranges horizontally (`sm:flex-row items-center`) with natural compact widths (`sm:w-auto`).
   - **Default (`align="right"`):** Primary CTA on the far right, Cancel / Ghost button on the left of the group.
   - **Split (`align="between"`):** Contextual metadata / auxiliary button on the left; Action buttons grouped on the right.

3. **Usage Example (Subcomponent Pattern):**
```tsx
import { Modal, ModalFooter, Button } from "@repo/ui";

<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Institutional Affiliation Verification"
  description="Provide your academic credentials to unlock research intake."
  size="md"
>
  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
    {/* Form inputs */}
    <FormInput label="University / Institution" required />
    <FormInput label="Primary Contact Number" required />

    {/* Standardized Modal Footer */}
    <ModalFooter>
      <Button type="button" variant="outline" size="sm" onClick={onClose}>
        Cancel
      </Button>
      <Button type="submit" variant="primary" size="sm">
        Save & Unlock Intake →
      </Button>
    </ModalFooter>
  </form>
</Modal>
```

4. **Usage Example (Prop Pattern):**
```tsx
<Modal
  open={isOpen}
  onClose={onClose}
  title={`Study Inspection: ${study.id}`}
  size="lg"
  footer={
    <div className="flex items-center justify-between w-full">
      <Button variant="secondary" size="sm" onClick={onClose}>
        Close Inspector
      </Button>
      <Link href={`/dashboard/client/projects/${study.id}`}>
        <Button variant="primary" size="sm">
          Open Project Desk →
        </Button>
      </Link>
    </div>
  }
>
  {/* Inspection content */}
</Modal>
```

---

### 6.4. Action Primitives: `Button` Hierarchy & Sizing Standards

| Size Prop | Dimensions & Padding | Typography | When to Use |
| :--- | :--- | :--- | :--- |
| **`size="sm"`** | `min-h-[30px]`, `padding: 0.35rem 0.875rem` | `text-[0.688rem]` / `11px`, `font-bold tracking-wider` | **Primary standard across all dashboard desks**: Topbar actions (`+ New Project Intake`), table row actions, form wizard footers (`Proceed to Attachments →`, `Submit Intake →`). |
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

---

### 6.7. Enterprise Scientific Loading System: `LoadingState`

Generic shimmering grey skeletons and clunky square boxes with pinging blobs are **strictly banned** across the workspace. In their place, all asynchronous data fetching and route transitions use the high-precision **`<LoadingState>`** component from `@repo/ui`.

```
┌────────────────────────────────────────────────────────┐
│ [Table / Card Shell Pinned]                            │
│                 [OrbitalLoader Gauge]                  │
│               (High-Precision Sweep Ring)              │
│               Loading research studies...              │
│         Please wait while telemetry synchronizes       │
└────────────────────────────────────────────────────────┘
```

#### **The Precision Orbital Loader (`OrbitalSpinner`):**
- **Dual-Layer Calibrated Track:** Ultra-thin background radial track (`border-white/[0.08]`) with an active high-contrast gradient sweep arc (`border-t-[#CC6600] border-r-[#FFA040]/60 animate-spin`).
- **Center Micro-Emitter Node:** Glowing core node (`bg-[#CC6600] shadow-[0_0_8px_#CC6600]`) conveying authoritative statistical telemetry.
- **Calibrated Typography:** Crisp Sans-Serif title (`text-base font-semibold text-white tracking-tight`) + soft secondary reading text (`text-xs text-white/50 leading-relaxed max-w-sm`). Zero double slashes.

#### **The 4 Standard Loading Variants:**

| Variant | Container Dimensions | Primary Visual Elements | Use Case |
| :--- | :--- | :--- | :--- |
| **`variant="table"`** | `py-16 px-4` inside `<tr><td colSpan={N}>` | `OrbitalSpinner size="md"` + Sans-serif typography (`text-sm font-semibold` + `text-xs text-white/45`). | Table bodies (`DataTable`, Study Registries, Payout Ledgers) while fetching records. Preserves table headers with **Zero CLS**. |
| **`variant="card"`** | `min-h-[160px]` | Centered `OrbitalSpinner` + Sans-serif label & description (`text-sm font-semibold`). | Inside KPI matrix cards, verification guardrail loading cards, and inspector containers. |
| **`variant="page"`** | `min-h-[50vh]` | Large `OrbitalSpinner size="lg"` + Sans-serif status heading and subtext. | Full-page route transitions (`loading.tsx`), initial desk boots, and full-screen auth/error boundaries. |
| **`variant="inline"`** | Compact inline row | `OrbitalSpinner size="sm"` + concise sans-serif string. | Inside button micro-interactions, modal sub-headers, or search bars. |

#### **Usage Examples:**
```tsx
import { LoadingState } from "@repo/ui";

// Inside a table:
<LoadingState
  variant="table"
  label="Loading research studies..."
  description="Please wait a moment"
/>

// Inside a card / KPI:
<Card variant="kpi">
  <LoadingState variant="card" label="Loading QA queue..." />
</Card>

// Inside loading.tsx:
<LoadingState
  variant="page"
  label="Loading workspace..."
  description="Please wait while we load your dashboard"
/>
```

---

### 6.8. Empty State Telemetry: `EmptyState`

Raw character placeholders (such as `∅`) and plain unstyled text are **strictly banned**. All registry tables and empty data views must render the standardized **`<EmptyState />`** primitive from `@repo/ui`.

```
┌────────────────────────────────────────────────────────┐
│                        ┌─────┐                         │
│                        │ [⚑] │  (Tactical Emblem)       │
│                        └─────┘                         │
│               No Research Studies Found                │
│   You have not submitted any study intake requests yet.│
│                                                        │
│            [ + Submit Your First Intake → ]            │
└────────────────────────────────────────────────────────┘
```

#### **Props & Standards:**
* **`icon`**: Tabler Icon component (`IconFolderOff`, `IconFileSearch`, `IconReceiptOff`, `IconInbox`). Defaults to `IconFolderOff`.
* **`title`**: Clear, concise status header (e.g., `"No Research Studies Found"`).
* **`description`**: Context-aware subtext explaining how to resolve or why the list is empty.
* **`action`**: Optional primary CTA button directing the researcher to action (e.g. `+ Submit Study Intake →`).

---

### 6.9. View Navigation & Filter Controls: `Tabs`

For switching between sub-views, nested records, or segmented catalog categories within a module or modal, use the standardized **`<Tabs>`** primitive from `@repo/ui` (built on `@radix-ui/react-tabs`):

```
┌────────────────────────────────────────────────────────┐
│ [ Service Packages (4) ] [ Priority Add-Ons (2) ]      │
├────────────────────────────────────────────────────────┤
│ Active Tab Content Area (animate-content-fade)         │
│                                                        │
└────────────────────────────────────────────────────────┘
```

#### **Standard Specifications:**
- **Container (`TabsList`):**
  - **`variant="default"` (Segmented / Pill):** Dark glass substrate (`bg-[#01142B]/90 border border-white/[0.08]`), height `h-10`, precision `rounded-[2px]`, padding `p-1`, gap `gap-1`.
  - **`variant="underline"`:** Flat hairline bottom border (`border-b border-white/10 bg-transparent px-1 gap-6 w-full`).
- **Trigger Button (`TabsTrigger`):**
  - **Typography:** Clean Sans-Serif (`font-sans text-xs font-medium`). Title Case copy (never aggressive all-caps shouting).
  - **Active State (`variant="default"`):** High-contrast Enterprise Orange (`data-[state=active]:bg-[#CC6600] data-[state=active]:text-white data-[state=active]:font-semibold data-[state=active]:shadow-sm`).
  - **Active State (`variant="underline"`):** Hairline bottom border in Enterprise Orange (`data-[state=active]:border-[#CC6600] data-[state=active]:text-white`).
  - **Hover & Passive:** `text-white/60 hover:text-white hover:bg-white/[0.04]` with smooth transition.
  - **Iconography:** Optional leading Tabler Icon scaled to `size={16}` with `stroke={1.5}`.
- **Content Panel (`TabsContent`):** Automatically applies `mt-4 animate-content-fade` for smooth content swapping without layout jitter.

#### **Usage Example (Segmented / Pill Standard):**
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@repo/ui";
import { IconPackage, IconBolt } from "@tabler/icons-react";

<Tabs defaultValue="packages" className="w-full">
  <TabsList>
    <TabsTrigger value="packages">
      <IconPackage size={16} stroke={1.5} />
      <span>Service Packages</span>
    </TabsTrigger>
    <TabsTrigger value="addons">
      <IconBolt size={16} stroke={1.5} />
      <span>Priority Add-Ons</span>
    </TabsTrigger>
  </TabsList>

  <TabsContent value="packages">
    {/* Package catalog list */}
  </TabsContent>
  <TabsContent value="addons">
    {/* Addon catalog list */}
  </TabsContent>
</Tabs>
```

#### **Usage Example (Underline Standard for In-Page Sub-Navigation):**
```tsx
<Tabs defaultValue="overview" className="w-full">
  <TabsList variant="underline">
    <TabsTrigger variant="underline" value="overview">Overview</TabsTrigger>
    <TabsTrigger variant="underline" value="dataset">Dataset Inspection</TabsTrigger>
    <TabsTrigger variant="underline" value="history">Audit History</TabsTrigger>
  </TabsList>

  <TabsContent value="overview">...</TabsContent>
  <TabsContent value="dataset">...</TabsContent>
  <TabsContent value="history">...</TabsContent>
</Tabs>
```



