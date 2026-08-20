# JAXIS — Module 14: Finance, Payouts & Ledger

**Module Code:** `14-finance`\
**Domain:** Finance & Payout\
**Depends On:** `12-deliverables`, `13-defenselab`\
**Blocks:** `15-disputes`

---

## 1. Module Identity

- **Primary Objective:** Finance Officer manages the revenue ledger and processes Expert payout disbursements. RULE_PAY_01 strictly gates all disbursements: project must be DELIVERED/ARCHIVED + FULLY_PAID + no active disputes + no pending refunds. Expert payout rates are applied by package tier from a seeded config table.
- **Core Responsibilities:** `FinancialLedger`, `Payout`, `PayoutRateConfig` models; payout eligibility enforcement; disbursement workflow; ledger views for Finance and CEO.

---

## 2. Module Scope

### ✅ In Scope

| Feature ID | Feature |
|---|---|
| `FIN-F01` | **Revenue ledger** — Per-project financial record: gross revenue, platform fee, Expert share, net margin |
| `FIN-F02` | **Payout rate config** — Seeded rate table by package; Finance can update rates (CEO approval in future; MVP = seeded) |
| `FIN-F03` | **Payout calculation** — Compute Statistician and QA Lead payout from approved rate for package |
| `FIN-F04` | **Payout eligibility check (RULE_PAY_01)** — Project must be DELIVERED or ARCHIVED, FULLY_PAID, no active dispute, no pending refund |
| `FIN-F05` | **Payout disbursement** — Finance Officer marks payout as disbursed after sending via GCash/bank |
| `FIN-F06` | **Payout voiding on reassignment** — If Expert was reassigned, original payout voided before new payout computed |
| `FIN-F07` | **Chargeback payout hold** — Active chargeback/dispute → payout stays `PENDING` until resolved |
| `FIN-F08` | **JAXIS system error protection** — Payouts not voided if reassignment was caused by a JAXIS/platform error |
| `FIN-F09` | **Statistician payout history** — Statistician views own payout history (amount, rate, project, status) |
| `FIN-F10` | **Finance disbursement queue** — Finance sees all `PENDING`/`APPROVED` payouts awaiting disbursement |
| `FIN-F11` | **CEO financial overview** — Full ledger + payout override authority |
| `FIN-F12` | **DefenseLab revenue** — DefenseLab session revenue recorded at 80% payout rate to Expert |

### ❌ Explicitly Out of Scope

| Feature | Reason |
|---|---|
| Automated bank/GCash transfer via API | Manual disbursement with Finance recording the action |
| Payroll schedule (bi-monthly, monthly) | Payouts are per-project, not payroll-based |
| Tax withholding computation | Future feature |
| Multi-currency | PHP only |
| Partial refund processing | Module 15; full refunds only per policy |

---

## 3. Database Schema

```prisma
model PayoutRateConfig {
  id          Int         @id @default(autoincrement())
  packageName String      @unique // PackageName enum value as string
  ratePercent Decimal     @db.Decimal(5, 2) // e.g., 62.50 for 62.5%
  effectiveFrom DateTime  @default(now())
  approvedBy  String?     // Admin/CEO userId

  @@map("payout_rate_configs")
}

enum PayoutStatus {
  NOT_ELIGIBLE
  PENDING
  APPROVED
  DISBURSED
  VOIDED
}

enum PayoutRole {
  STATISTICIAN
  QA_LEAD
}

model Payout {
  id                String      @id @default(cuid())
  projectId         String
  recipientId       String      // Expert userId
  recipientRole     PayoutRole
  grossProjectAmount Decimal    @db.Decimal(10, 2)
  payoutRateApplied Decimal     @db.Decimal(5, 2)
  payoutAmount      Decimal     @db.Decimal(10, 2)
  payoutStatus      PayoutStatus @default(NOT_ELIGIBLE)
  voidReason        String?
  disbursedAt       DateTime?
  disbursedBy       String?     // Finance Officer userId
  approvedBy        String?     // Finance/CEO userId
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  project   Project @relation(fields: [projectId], references: [id])
  recipient User    @relation(fields: [recipientId], references: [id])

  @@index([projectId])
  @@index([recipientId])
  @@index([payoutStatus])
  @@map("payouts")
}

model FinancialLedger {
  id              String   @id @default(cuid())
  projectId       String   @unique
  grossRevenue    Decimal  @db.Decimal(10, 2)
  platformFee     Decimal  @db.Decimal(10, 2) // JAXIS margin
  statisticianShare Decimal @db.Decimal(10, 2)
  qaLeadShare     Decimal  @db.Decimal(10, 2)
  netMargin       Decimal  @db.Decimal(10, 2)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  project Project @relation(fields: [projectId], references: [id])

  @@map("financial_ledgers")
}
```

---

## 4. Payout Rate Reference (Seeded)

| Package | Rate Range | Seeded Rate |
|---|---|---|
| JX_01_DATACHECK | 40–50% | 45% |
| JX_02_START | 40–50% | 47% |
| JX_03_CORE | 60–65% | 62% |
| JX_04_ADVANCED | 70–75% | 72% |
| DEFENSELAB (add-on) | 80% | 80% |

> QA Lead payout: 10% of the Statistician payout (MVP flat rate — adjustable via config).

---

## 5. RULE_PAY_01 Enforcement

```ts
// src/lib/payout-rules.ts
export async function assertPayoutEligible(projectId: string): Promise<void> {
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      payments: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  if (!['DELIVERED', 'CLOSED', 'ARCHIVED'].includes(project?.masterStatus ?? '')) {
    throw new ApiError('PAYOUT_NOT_ELIGIBLE', 'Project must be delivered or archived before payout.', 403);
  }
  if (project?.payments[0]?.paymentStatus !== 'FULLY_PAID') {
    throw new ApiError('PAYOUT_NOT_ELIGIBLE', 'Project balance must be fully paid before payout.', 403);
  }
  if (project?.hasActiveDispute) {
    throw new ApiError('PAYOUT_NOT_ELIGIBLE', 'Payout is on hold due to an active dispute.', 403);
  }
  if (project?.hasPendingRefund) {
    throw new ApiError('PAYOUT_NOT_ELIGIBLE', 'Payout is on hold due to a pending refund.', 403);
  }
}
```

---

## 6. API Routes

| Method | Route | Role | Description |
|---|---|---|---|
| `GET` | `/api/v1/finance/ledger` | FINANCE_OFFICER, ADMIN, CEO | Full ledger with date/package filters |
| `POST` | `/api/v1/finance/payouts/calculate` | FINANCE_OFFICER, ADMIN, CEO | Compute payout for a project |
| `PATCH` | `/api/v1/finance/payouts/:id/approve` | FINANCE_OFFICER, CEO | Approve payout for disbursement |
| `PATCH` | `/api/v1/finance/payouts/:id/disburse` | FINANCE_OFFICER | Mark payout disbursed (RULE_PAY_01 enforced) |
| `PATCH` | `/api/v1/finance/payouts/:id/void` | ADMIN, CEO | Void payout with reason |
| `GET` | `/api/v1/finance/payouts` | FINANCE_OFFICER, ADMIN, CEO | All payouts with filter by status |
| `GET` | `/api/v1/statistician/payouts` | STATISTICIAN | Own payout history |

---

## 7. Page Views

| Page | Route | Role | Description |
|---|---|---|---|
| Disbursement Queue | `/dashboard/finance/payouts` | Finance, CEO | Pending/Approved payouts with disburse action and eligibility status |
| Ledger | `/dashboard/finance/ledger` | Finance, CEO | Full ledger table with margin breakdown per project |
| CEO Finance | `/dashboard/ceo/finance` | CEO | Executive summary + ledger + payout override |
| Statistician Payouts | `/dashboard/statistician/payouts` | Statistician | Own payout history: project, amount, rate, status |

---

## 8. Seed Data Requirements

```ts
const seedPayoutRates = [
  { packageName: 'JX_01_DATACHECK', ratePercent: 45.00 },
  { packageName: 'JX_02_START',     ratePercent: 47.00 },
  { packageName: 'JX_03_CORE',      ratePercent: 62.00 },
  { packageName: 'JX_04_ADVANCED',  ratePercent: 72.00 },
  { packageName: 'DEFENSELAB',      ratePercent: 80.00 },
];

const seedPayout = {
  projectIntakeId: 'JAXIS-202608-0001',
  recipientEmail:  'stat@jaxis.dev',
  recipientRole:   'STATISTICIAN',
  grossProjectAmount: 2800.00,
  payoutRateApplied: 62.00,
  payoutAmount:    1736.00, // 2800 × 0.62
  payoutStatus:    'PENDING',
};
```

---

## 9. Acceptance Criteria (Done Checklist)

### Payout Calculation
- [ ] Payout computed correctly: `grossRevenue × ratePercent`
- [ ] QA Lead payout = 10% of Statistician payout
- [ ] Payout rate pulled from `PayoutRateConfig` by package name
- [ ] `FinancialLedger` record created on project delivery with correct margin breakdown

### Disbursement (RULE_PAY_01)
- [ ] Project not DELIVERED/CLOSED → 403 `PAYOUT_NOT_ELIGIBLE`
- [ ] Project not FULLY_PAID → 403 `PAYOUT_NOT_ELIGIBLE`
- [ ] Active dispute → 403 `PAYOUT_NOT_ELIGIBLE`
- [ ] All 4 conditions met → Finance can approve and disburse
- [ ] `disbursedAt` and `disbursedBy` set on disbursement

### Voiding
- [ ] Expert reassignment → original payout voided with reason `REASSIGNMENT`
- [ ] `VOIDED` payout cannot be reinstated

### Ledger
- [ ] Finance ledger shows all projects with revenue, margin, payout amounts
- [ ] Date range filter works
- [ ] CEO ledger view shows all data + override button placeholder

### Statistician View
- [ ] Statistician sees own payouts only (not other Experts)
- [ ] Admin cannot see Statistician-only payout view as Statistician

### Quality Gates
- [ ] `npm run check-types` → 0 errors
- [ ] `npm run lint` → 0 warnings/errors
- [ ] `npm run build` → clean
