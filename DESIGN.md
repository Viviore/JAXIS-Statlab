# JAXIS StatLab — Design System & Interface Architecture

This document specifies the UI/UX design tokens, visual aesthetics, color systems, and layout architectures for all 6 role interfaces in **JAXIS StatLab**.

---

## 1. Design Aesthetics & Visual Tokens

JAXIS StatLab utilizes a high-end, modern dark-mode aesthetic with glassmorphism effects, crisp typography, and semantic status indicators.

### 🎨 Color Palette (HSL Tailored)

```css
:root {
  /* Surface & Background */
  --bg-dark: hsl(224, 25%, 6%);
  --surface-card: hsl(222, 20%, 10%);
  --surface-glass: rgba(15, 23, 42, 0.75);
  --border-glass: rgba(255, 255, 255, 0.08);

  /* Primary Brand Accents */
  --primary-indigo: hsl(239, 84%, 67%);
  --primary-cyan: hsl(188, 94%, 53%);

  /* Semantic Status Colors */
  --status-emerald: hsl(160, 84%, 39%); /* Fully Paid, Approved, Released */
  --status-amber: hsl(38, 92%, 50%);    /* Awaiting Payment, In Review, Pending */
  --status-crimson: hsl(350, 89%, 60%);  /* Blocked, QA Rejected, Ethical Flag */
  --status-purple: hsl(271, 91%, 65%);   /* Advanced / Premium Tag */
}
```

### 💎 Glassmorphic Card Styling
- **Background:** `background: var(--surface-glass);`
- **Backdrop Filter:** `backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);`
- **Border:** `1px solid var(--border-glass)`
- **Border Radius:** `12px` (Cards), `8px` (Buttons & Badges)

---

## 2. Status Badge Tokens Matrix

All project and operational statuses across the 9 stages must use standard visual badges:

| Status Key | Display Name | Background / Border Token |
| :--- | :--- | :--- |
| `DRAFT_QUOTE` | Draft Quote | Muted Slate (`--surface-card`) |
| `QUOTE_SENT` | Quote Issued | Primary Cyan (`--primary-cyan`) |
| `AWAITING_PAYMENT`| Awaiting Payment | Warning Amber (`--status-amber`) |
| `PAYMENT_SUBMITTED`| Payment Verification Pending | Warning Amber (`--status-amber`) |
| `DOWNPAYMENT_CONFIRMED`| Downpayment Paid | Indigo Accent (`--primary-indigo`) |
| `FULLY_PAID` | Fully Paid | Success Emerald (`--status-emerald`) |
| `IN_ANALYSIS` | Analysis In Progress | Indigo Accent (`--primary-indigo`) |
| `FOR_QA` | Pending QA Review | Purple Accent (`--status-purple`) |
| `QA_APPROVED` | QA Approved | Success Emerald (`--status-emerald`) |
| `RELEASED` | Deliverables Released | Success Emerald (`--status-emerald`) |
| `BLOCKED_UNPAID` | Release Blocked | Crimson Alert (`--status-crimson`) |
| `ETHICAL_BREACH` | Ethical Risk Escalated | Crimson Alert (`--status-crimson`) |

---

## 3. Interface Architectures (6 Role Desks)

### 1. Client Interface
- **Dashboard View:** Active project status card, countdown indicators, pending balance alerts.
- **Intake Portal:** Multi-step submission wizard, research objective inputs, dataset dropzone.
- **Quotation Viewer:** Interactive quote card with itemized breakdown and Accept/Decline actions.
- **Deliverables Hub:** Final verified report package, download manager, certificate viewer.

### 2. Admin Interface (Client Success Desk)
- **Executive Dashboard:** Global intake volume, operational bottleneck flags, release queues.
- **Quotation Studio:** Drag-and-drop package pricing builder, line-item calculator.
- **Payment Verification Desk:** Receipt preview panel, instant Approve/Reject controls.
- **Resource Allocation Panel:** Statistician and QA lead workload balancing desk.

### 3. Statistician Workspace
- **My Task Board:** Assigned active projects sorted by deadline countdown.
- **Analysis Workbench:** Scope brief container, dataset viewer, draft report uploader.
- **QA Feedback Center:** Review scorecard history, error feedback list, resubmission portal.

### 4. Senior QA Interface
- **QA Review Console:** Pending submission queue sorted by urgency/package level.
- **Dataset & Report Inspector:** Statistical assumption checklist, error logger (Minor/Major/Critical).
- **Risk Escalation Desk:** CEO notification trigger interface for ethical breaches.

### 5. Finance Officer Console
- **Financial Summary Dashboard:** Revenue inflow, allocated shares, platform fund balance, reserve pool.
- **Payout Processing Desk:** Eligible contractor payout list, disbursement verification controls.

### 6. CEO Risk Dashboard
- **Executive Risk Board:** Escalated QA issues, custom price override requests, refund disputes.

---

## 4. Shared UI Component Library Guidelines (`packages/ui`)

All shared React components inside `packages/ui` must:
1. Export type-safe props with default fallback states.
2. Support dark-mode glassmorphism out-of-the-box.
3. Be accessible (`aria-*` labels for file dropzones and status controls).
