# JAXIS — Module 02: Expert Provisioning & Staff Management

**Module Code:** `02-staff`\
**Domain:** Identity / Governance\
**Depends On:** `01-auth`\
**Blocks:** `08-assignment` (cannot assign staff that don't exist)

---

## 1. Module Identity

- **Primary Objective:** Admin can provision and manage Statistician, Senior QA Lead, and Finance Officer accounts. Each staff member maintains a professional profile with specializations. Admin can suspend; CEO can permanently terminate. Active projects are flagged for reassignment on suspension/termination.
- **Core Responsibilities:** Staff account provisioning, `StaffProfile` with specializations, suspension lifecycle, `SuspensionLog` audit, expert roster views.

---

## 2. Module Scope

### ✅ In Scope

| Feature ID | Feature |
|---|---|
| `STF-F01` | **Admin staff provisioning** — Admin creates Statistician, QA Lead, Finance Officer accounts via form (not self-registration) |
| `STF-F02` | **Staff profile with specializations** — `StaffProfile` record: bio, specialization tags, joined date |
| `STF-F03` | **Specialization taxonomy** — Predefined list: Regression, ANOVA, SEM, Factor Analysis, Time Series, Instrument Validation, Descriptive Statistics, Mixed Methods |
| `STF-F04` | **Staff roster view** — Admin sees all staff with role, status badge, specialization tags, active project count |
| `STF-F05` | **Staff profile detail** — Admin views full profile: suspension history, active assignments, violation log |
| `STF-F06` | **Profile self-edit** — Statistician/QA Lead can edit own bio and specializations |
| `STF-F07` | **Temporary suspension** — Admin suspends staff; reason required; `SuspensionLog` entry created |
| `STF-F08` | **Permanent termination** — CEO only; logs violation type; account status → `TERMINATED` |
| `STF-F09` | **Reassignment flag on suspension/termination** — Active assignments flagged `REASSIGNMENT_NEEDED`; Admin notified |
| `STF-F10` | **Violation classification** — Serious violations result in payout forfeiture flag |
| `STF-F11` | **Payout forfeiture on serious violations** — Pending payouts voided when violation = serious |
| `STF-F12` | **Suspension lift** — Admin can lift a suspension; SuspensionLog `lifted_at` set |

### ❌ Explicitly Out of Scope

| Feature | Reason |
|---|---|
| Staff self-registration | Admin-provisioned only. Staff cannot self-register. |
| Password reset email | Module 16 (Notifications). Deferred. |
| Performance reviews / KPI scorecards | Future/out-of-MVP. |
| Payroll processing | Module 14 handles payout disbursement only — not payroll. |
| Leave management / attendance | Not in JAXIS scope. |
| Assigning staff to projects | Module 08 (`08-assignment`). |



---

## 3. Database Schema

```prisma
model StaffProfile {
  id              String   @id @default(cuid())
  userId          String   @unique
  bio             String?
  specializations String[] // e.g. ["Regression", "ANOVA", "SEM"]
  joinedAt        DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("staff_profiles")
}

enum ViolationType {
  ETHICAL_BREACH
  DIRECT_PAYMENT_BYPASS
  DATA_FALSIFICATION
  GHOSTWRITING
  POLICY_VIOLATION
}

model SuspensionLog {
  id           String         @id @default(cuid())
  userId       String
  action       SuspensionAction
  reason       String
  violationType ViolationType?
  performedBy  String         // Admin or CEO userId
  performedAt  DateTime       @default(now())
  liftedAt     DateTime?
  liftedBy     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([performedAt])
  @@map("suspension_logs")
}

enum SuspensionAction {
  SUSPENDED
  SUSPENSION_LIFTED
  TERMINATED
}
```

### Relationships

| Relationship | Type | Notes |
|---|---|---|
| `User` → `StaffProfile` | One-to-One | Only exists for STATISTICIAN, SENIOR_QA_LEAD, FINANCE_OFFICER roles |
| `User` → `SuspensionLog` | One-to-Many | Full audit history per user |

---

## 4. API Routes & Server Actions

| Method | Route | Role | Description |
|---|---|---|---|
| `POST` | `/api/v1/admin/staff` | ADMIN, CEO | Provision new staff account |
| `GET` | `/api/v1/admin/staff` | ADMIN, CEO | List all staff (filter by role, status) |
| `GET` | `/api/v1/admin/staff/:id` | ADMIN, CEO | Staff profile detail + suspension history |
| `PATCH` | `/api/v1/admin/staff/:id/profile` | ADMIN, CEO | Update staff specializations/bio |
| `PATCH` | `/api/v1/admin/staff/:id/suspend` | ADMIN, CEO | Suspend with reason |
| `PATCH` | `/api/v1/admin/staff/:id/lift-suspension` | ADMIN, CEO | Lift active suspension |
| `PATCH` | `/api/v1/admin/staff/:id/terminate` | CEO only | Permanent termination + violation type |
| `GET` | `/api/v1/staff/profile` | Any staff role | Own profile (self-view) |
| `PATCH` | `/api/v1/staff/profile` | Any staff role | Own bio + specialization edit |

### Zod Schemas

```ts
export const ProvisionStaffSchema = z.object({
  fullName:        z.string().min(2).max(100),
  email:           z.string().email(),
  role:            z.enum(['STATISTICIAN', 'SENIOR_QA_LEAD', 'FINANCE_OFFICER']),
  specializations: z.array(z.string()).optional(),
});

export const SuspendStaffSchema = z.object({
  reason:        z.string().min(10).max(500),
  violationType: z.nativeEnum(ViolationType).optional(),
});

export const TerminateStaffSchema = z.object({
  reason:        z.string().min(10).max(500),
  violationType: z.nativeEnum(ViolationType),
  forfeitPayouts: z.boolean(),
});
```

---

## 5. Business Rules

| Rule | Enforcement |
|---|---|
| Staff cannot self-register — Admin creates accounts | `POST /api/v1/admin/staff` requires ADMIN/CEO role |
| Only CEO can permanently terminate | `requireRole('CEO')` on terminate route |
| Termination requires a violation type | `TerminateStaffSchema` enforces `violationType` required |
| Serious violations → payout forfeiture flag set | `forfeitPayouts: true` triggers payout voiding in DB |
| Active assignments flagged on suspension/termination | `PATCH` on project assignments → `REASSIGNMENT_NEEDED` |
| Provisioned staff receive temporary password | Password = `JAXIS-{random 8 chars}` — must be changed on first login (Module 01 extension) |

---

## 6. Page Views

| Page | Route | Role | Description |
|---|---|---|---|
| Staff Roster | `/dashboard/admin/staff` | Admin, CEO | Table: name, role badge, status, specializations, active projects, actions |
| Staff Detail | `/dashboard/admin/staff/:id` | Admin, CEO | Profile card, specializations, suspension history, assignments |
| Provision Staff | `/dashboard/admin/staff/new` | Admin, CEO | Form: fullName, email, role, specializations |
| Suspend Modal | (modal on staff detail) | Admin, CEO | Reason textarea, violation type select |
| Terminate Modal | (modal on staff detail) | CEO only | Reason, violation type, forfeit payouts toggle |
| Own Profile | `/dashboard/statistician/profile` | Statistician | Bio edit, specialization tag editor |
| Own Profile | `/dashboard/qa/profile` | Senior QA Lead | Bio edit, specialization tags |

---

## 7. Seed Data Requirements

```ts
// All 4 seed staff users get StaffProfile entries:
const seedStaffProfiles = [
  {
    email: 'stat@jaxis.dev',
    specializations: ['Regression', 'ANOVA', 'SEM', 'Factor Analysis'],
    bio: 'Senior statistician specializing in quantitative research methods.',
  },
  {
    email: 'qa@jaxis.dev',
    specializations: ['Instrument Validation', 'Descriptive Statistics'],
    bio: 'QA Lead with expertise in research instrument validation.',
  },
  {
    email: 'finance@jaxis.dev',
    specializations: [],
    bio: 'Finance Officer managing JAXIS payout and ledger operations.',
  },
];
```

### 🎯 Expected Output (What you should be able to do now)

- [x] **Admin Staff Provisioning:** Admin can provision internal staff accounts (`STATISTICIAN`, `SENIOR_QA_LEAD`, `FINANCE_OFFICER`, `CEO`) with name, email, role, and temporary password at `/dashboard/admin/staff`.
- [x] **Staff Roster Workbench:** Admin can view the staff roster directory with role badges, status indicators, specializations, and active project counters.
- [x] **Specialization Taxonomy:** Staff profiles support standardized specialization tags (Regression, ANOVA, SEM, Factor Analysis, Time Series, Instrument Validation, Mixed Methods).
- [x] **Staff Profile Management:** Statisticians and QA Leads can view and edit their own bio and specialization areas.
- [x] **Staff Suspension & Audit:** Admin can temporarily suspend staff with mandatory reason logging in `SuspensionLog`.
- [x] **CEO Account Termination:** CEO can permanently terminate staff accounts, auto-flagging active projects for `REASSIGNMENT_NEEDED`.
- [x] **Suspension Reversal:** Admin can lift suspensions, restoring active status and recording `liftedAt` timestamp.

#### QA Verification Guide:
1. **Access Staff Roster**: Log in as Admin (`admin@jaxis.dev` / `JaxisAdmin2026!`) and navigate to `/dashboard/admin/staff`.
2. **Provision New Staff**: Click **"+ PROVISION STAFF"**, select role (e.g. `STATISTICIAN`), enter full name, email, and select specializations. Submit and verify credentials modal displays generated login password.
3. **Inspect Roster & Filters**: Filter roster by role (Statistician, Senior QA Lead, etc.) and verify status indicators.
4. **Test Suspension**: Click **"SUSPEND"** on a staff member, input mandatory suspension reason, and confirm. Attempt to log in with suspended account to verify access block.
5. **Lift Suspension**: Click **"LIFT SUSPENSION"** as Admin to restore account back to `ACTIVE`.
6. **CEO Termination Authority**: Log in as CEO (`ceo@jaxis.dev` / `JaxisCeo2026!`) to verify permanent termination authority and violation logging.

---

## 8. Acceptance Criteria (Done Checklist)

### Provisioning
- [x] Admin can provision a Statistician account with email + role + specializations
- [x] Provisioned account receives a temporary password (hashed via bcrypt)
- [x] Duplicate email returns 409 `EMAIL_TAKEN`
- [x] Statistician cannot self-register at `/register`

### Profile
- [x] `StaffProfile` created on provisioning for all staff roles
- [x] Statistician can edit own bio and specializations
- [x] Admin can view full staff profile with suspension history
- [x] Specialization tags display correctly in roster and profile views

### Suspension & Termination
- [x] Admin can suspend with reason → account status `SUSPENDED` → login blocked
- [x] Admin can lift suspension → status `ACTIVE` → `SuspensionLog.liftedAt` set
- [x] CEO can terminate with violation type → status `TERMINATED` → login permanently blocked
- [x] Non-CEO Admin gets 403 on termination endpoint
- [x] Active assignments flagged `REASSIGNMENT_NEEDED` on suspension/termination
- [x] Serious violation + `forfeitPayouts: true` → pending payout records voided

### Roster Views
- [x] Staff roster table renders with correct role badge, status, specialization count, active project count
- [x] Filter by role works
- [x] Filter by status (ACTIVE, SUSPENDED) works

### Quality Gates
- [x] `npm run check-types` → 0 errors
- [x] `npm run lint` → 0 warnings/errors
- [x] `npm run build` → clean
