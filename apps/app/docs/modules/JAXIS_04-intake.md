# JAXIS — Module 04: Project Intake & Submission

**Module Code:** `04-intake`\
**Domain:** Project Intake\
**Depends On:** `03-client-profile`\
**Blocks:** `05-quotation`, `09-messaging`

---

## 1. Module Identity

- **Primary Objective:** Clients submit research projects with required documents and information. Admin receives projects in a triage queue. Incomplete submissions are blocked from progressing. Admin requests missing information or marks intake complete for evaluation.
- **Core Responsibilities:** `Project` master record, `ProjectFile` uploads, status state machine initialization, client submission form, Admin triage queue.

---

## 2. Module Scope

### ✅ In Scope

| Feature ID | Feature |
|---|---|
| `INT-F01` | **Project submission form** — Multi-step intake: research title, questions, objectives, hypotheses, deadline, file uploads |
| `INT-F02` | **Research document upload** — DOCX, PDF, XLSX, CSV; MIME + size validated; pre-signed R2/S3 URLs |
| `INT-F03` | **Document replacement** — Client may replace uploaded docs before SOW is finalized |
| `INT-F04` | **Profile gate** — Incomplete client profile blocks project creation (server-side) |
| `INT-F05` | **Admin triage queue** — All `NEW_REQUEST` and `AWAITING_INFORMATION` projects listed for Admin review |
| `INT-F06` | **Request missing info** — Admin sets project → `AWAITING_INFORMATION` with reason; client notified |
| `INT-F07` | **Mark intake complete** — Admin sets project → `UNDER_EVALUATION` |
| `INT-F08` | **Role-scoped project list** — Client sees own; Admin/CEO sees all; Statistician/QA sees assigned (populated in Module 08) |
| `INT-F09` | **Project detail page** — Full intake data, status timeline, uploaded files |
| `INT-F10` | **Pending expiry** — 3 days with `AWAITING_PAYMENT` and no verified payment → `EXPIRED` (background job; full expiry logic implemented in Module 07) |
| `INT-F11` | **Project status state machine** — All valid status transitions defined and enforced; illegal transitions return 422 |
| `INT-F12` | **Intake ID generation** — Human-readable unique ID: `JAXIS-YYYYMM-XXXX` (e.g., `JAXIS-202608-0042`) |

### ❌ Explicitly Out of Scope

| Feature | Reason |
|---|---|
| Quotation building | Module 05 |
| Payment | Module 07 |
| File storage provider setup | Already done in Module 00 env vars; actual R2/S3 client initialized here |
| Messaging on intake | Module 09 |
| General inquiry without account | Not in MVP — all intakes require an account |

### 🎯 Expected Outputs (QA Verification Checklist)

- [ ] **Multi-Step Project Intake Submission:** Client can submit a project with research title, objectives, hypotheses, target deadline, and methodology notes.
- [ ] **Secure File & Dataset Upload:** Client can attach datasets, questionnaires, or draft chapters (DOCX, PDF, XLSX, CSV) via pre-signed storage URLs.
- [ ] **Automated Human-Readable Code:** System generates formatted project codes: `JAXIS-YYYYMM-XXXX`.
- [ ] **Admin Triage Queue:** Admin can review all incoming submissions in `NEW_REQUEST` status.
- [ ] **Request Missing Information:** Admin can transition status to `AWAITING_INFORMATION` with feedback; Client can provide updates and replace files.
- [ ] **Evaluation Approval:** Admin can advance complete submissions to `UNDER_EVALUATION` to initiate quotation modeling.

---

## 3. Database Schema

```prisma
enum ProjectStatus {
  NEW_REQUEST
  AWAITING_INFORMATION
  UNDER_EVALUATION
  QUOTE_SENT
  CLIENT_APPROVED
  SOW_PENDING
  SOW_SIGNED
  AWAITING_PAYMENT
  ACTIVE
  EXPERT_ASSIGNED
  IN_PROGRESS
  SCOPE_CREEP_HALTED
  SLA_PAUSED
  FOR_QA
  QA_REVISION
  DELIVERED
  REVISION_REQUESTED
  CLOSED
  HALTED          // Chargeback
  CANCELLED
  DISPUTED
  ETHICAL_BREACH
  EXPIRED
  REASSIGNMENT_NEEDED
}

model Project {
  id                  String        @id @default(cuid())
  intakeId            String        @unique  // JAXIS-YYYYMM-XXXX
  clientId            String
  researchTitle       String
  researchQuestions   String
  researchObjectives  String
  hypotheses          String?
  chapters13          String?       // URL or text reference to uploaded chapters
  questionnaire       String?       // URL or reference
  deadlineRequested   DateTime
  masterStatus        ProjectStatus @default(NEW_REQUEST)
  packageName         String?       // Populated in Module 05
  missingInfoReason   String?       // Set when Admin requests missing info
  deliveredAt         DateTime?
  filesPurgeAt        DateTime?     // Set on delivery: deliveredAt + 90 days
  filesPurged         Boolean       @default(false)
  hasActiveDispute    Boolean       @default(false)
  hasPendingRefund    Boolean       @default(false)
  createdAt           DateTime      @default(now())
  updatedAt           DateTime      @updatedAt

  client     User          @relation("ClientProjects", fields: [clientId], references: [id])
  files      ProjectFile[]
  // Relations added by subsequent modules:
  // quotations, sow, payments, assignments, analysisFiles, qaReviews, deliverables, messages, revisions, disputes, ledger, payouts

  @@index([clientId])
  @@index([masterStatus])
  @@index([intakeId])
  @@index([createdAt])
  @@map("projects")
}

model ProjectFile {
  id           String   @id @default(cuid())
  projectId    String
  fileName     String
  filePath     String   // R2/S3 object key
  fileType     String   // MIME type
  fileCategory FileCategory
  uploadedAt   DateTime @default(now())

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId])
  @@map("project_files")
}

enum FileCategory {
  RESEARCH_DOCUMENT  // Chapters 1-3, research paper
  DATASET            // CSV, XLSX dataset
  QUESTIONNAIRE      // Survey instrument
  PAYMENT_PROOF      // Added in Module 07
  ANALYSIS_OUTPUT    // Added in Module 10
  DELIVERABLE        // Added in Module 12
  DISPUTE_EVIDENCE   // Added in Module 15
}
```

### Status Transition Validator (`src/lib/project-rules.ts`)

```ts
export const VALID_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  NEW_REQUEST:          ['AWAITING_INFORMATION', 'UNDER_EVALUATION', 'CANCELLED'],
  AWAITING_INFORMATION: ['UNDER_EVALUATION', 'CANCELLED'],
  UNDER_EVALUATION:     ['QUOTE_SENT', 'CANCELLED'],
  QUOTE_SENT:           ['CLIENT_APPROVED', 'CANCELLED'],
  CLIENT_APPROVED:      ['SOW_PENDING'],
  SOW_PENDING:          ['SOW_SIGNED'],
  SOW_SIGNED:           ['AWAITING_PAYMENT'],
  AWAITING_PAYMENT:     ['ACTIVE', 'EXPIRED', 'HALTED'],
  ACTIVE:               ['EXPERT_ASSIGNED', 'CANCELLED'],
  EXPERT_ASSIGNED:      ['IN_PROGRESS'],
  IN_PROGRESS:          ['FOR_QA', 'SCOPE_CREEP_HALTED', 'SLA_PAUSED', 'REASSIGNMENT_NEEDED'],
  SLA_PAUSED:           ['IN_PROGRESS'],
  SCOPE_CREEP_HALTED:   ['IN_PROGRESS', 'CANCELLED'],
  FOR_QA:               ['QA_REVISION', 'DELIVERED', 'ETHICAL_BREACH'],
  QA_REVISION:          ['FOR_QA'],
  DELIVERED:            ['REVISION_REQUESTED', 'CLOSED', 'DISPUTED'],
  REVISION_REQUESTED:   ['IN_PROGRESS'],
  DISPUTED:             ['HALTED', 'CLOSED'],
  HALTED:               ['CLOSED', 'DISPUTED'],
  ETHICAL_BREACH:       ['CANCELLED'],
  REASSIGNMENT_NEEDED:  ['IN_PROGRESS'],
  CLOSED:               [],
  CANCELLED:            [],
  EXPIRED:              [],
};
```

---

## 4. API Routes & Server Actions

| Method | Route | Role | Description |
|---|---|---|---|
| `POST` | `/api/v1/projects` | CLIENT | Create project (profile gate + field validation) |
| `GET` | `/api/v1/projects` | All roles | List (role-scoped) |
| `GET` | `/api/v1/projects/:id` | All roles | Project detail (role-scoped field visibility) |
| `PATCH` | `/api/v1/projects/:id/status` | ADMIN, CEO | Status transition (state machine validated) |
| `POST` | `/api/v1/projects/:id/files` | CLIENT | Upload research file (pre-SOW only) |
| `DELETE` | `/api/v1/projects/:id/files/:fileId` | CLIENT | Remove file (pre-SOW only) |
| `GET` | `/api/v1/projects/:id/files` | All authorized | List project files |

---

## 5. File Upload Rules

```ts
const ALLOWED_INTAKE_MIME = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
];
const MAX_RESEARCH_DOC_SIZE = 50 * 1024 * 1024;  // 50MB
const MAX_DATASET_SIZE      = 100 * 1024 * 1024; // 100MB
```

---

## 6. Page Views

| Page | Route | Role | Description |
|---|---|---|---|
| Project List | `/dashboard/client/projects` | Client | Cards with status badge, intake ID, deadline |
| New Project | `/dashboard/client/projects/new` | Client | Multi-step form: intake info → file uploads → review |
| Project Detail | `/dashboard/client/projects/:id` | Client | Status timeline, intake data, uploaded files, next steps |
| Triage Queue | `/dashboard/admin/intake` | Admin, CEO | Table: all NEW_REQUEST + AWAITING_INFORMATION with action buttons |
| Admin Project Detail | `/dashboard/admin/projects/:id` | Admin, CEO | Full project detail, status controls, client profile panel |

---

## 7. Seed Data Requirements

```ts
const seedProjects = [
  {
    intakeId:           'JAXIS-202608-0001',
    clientEmail:        'client@jaxis.dev',
    researchTitle:      'Impact of Study Habits on Academic Performance Among State University Students',
    researchQuestions:  'Does study frequency significantly affect GPA? Is there a gender difference?',
    researchObjectives: 'Determine relationship between study habits and GPA; identify moderating variables.',
    deadlineRequested:  new Date('2026-09-15'),
    masterStatus:       'UNDER_EVALUATION',
  },
];
```

---

## 8. Acceptance Criteria (Done Checklist)

### Submission
- [ ] Client with complete profile can submit a project → `intakeId` auto-generated
- [ ] Client with incomplete profile gets 422 `PROFILE_INCOMPLETE`
- [ ] Required fields (title, questions, objectives, deadline) validated — missing fields return 422
- [ ] Client can upload DOCX, PDF, XLSX, CSV files via pre-signed URL
- [ ] Invalid MIME type rejected with 422
- [ ] File exceeding size limit rejected with 422
- [ ] Client can replace a file before SOW is finalized

### Status Machine
- [ ] PATCH with valid transition → status updated, `updatedAt` refreshed
- [ ] PATCH with invalid transition → 422 `INVALID_STATUS_TRANSITION`
- [ ] Non-Admin attempting PATCH on project status → 403

### Admin Triage
- [ ] All `NEW_REQUEST` projects appear in Admin intake queue
- [ ] Admin can request missing info → status → `AWAITING_INFORMATION`, `missingInfoReason` stored
- [ ] Admin can mark intake complete → status → `UNDER_EVALUATION`
- [ ] `AWAITING_INFORMATION` projects appear in triage queue alongside `NEW_REQUEST`

### Role Scoping
- [ ] Client list shows own projects only
- [ ] Admin list shows all projects
- [ ] Statistician list shows only assigned (empty until Module 08)

### Quality Gates
- [ ] `npm run check-types` → 0 errors
- [ ] `npm run lint` → 0 warnings/errors
- [ ] `npm run build` → clean
