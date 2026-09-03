# 00 — Master Study Lifecycle: Start to Finish

This document explains the complete, verified lifecycle of a research study inside JAXIS StatLab, detailing the **role, sidebar menu item, and screen tools** used at every step.

---

## 1. The Master Study Lifecycle (Verified ASCII Flowchart)

```
========================================================================================
                              YOUR STUDY, START TO FINISH
========================================================================================

 [1] SUBMIT REQUEST ──────────────────► CLIENT (Student / Researcher)
     Sidebar: "Submit New Request"
     Tools: 3-step intake form, file dropzone, calendar deadline picker
     Status: NEW_REQUEST
              │
              ▼
 [2] GET YOUR QUOTE ──────────────────► ADMIN (Operations Manager)
     Sidebar: "Intake Review"
     Tools: Scope inspector, package pricing calculator, quote dispatch engine
     Status: QUOTE_SENT (or AWAITING_INFORMATION if files missing)
              │
              ▼
 [3] SIGN & PAY 50% DEPOSIT ──────────► CLIENT & FINANCE OFFICER
     Sidebar (Client): "Quotes & Proposals" ──► Digital SOW & touch signature pad
     Sidebar (Finance): "Transactions" ───────► GCash/Bank check & Escrow Vault lock
     Status: SOW_SIGNED ──► AWAITING_CONFIRMATION ──► ACTIVE
              │
              ▼
 [4] WE ASSIGN YOUR STATISTICIAN ─────► ADMIN (Operations Manager)
     Sidebar: "Assignments Desk"
     Tools: Specialist topic matching matrix, workload capacity gauge (< 4 studies)
     Status: EXPERT_ASSIGNED
              │
              ▼
 [5] ANALYSIS IN PROGRESS ────────────► STATISTICIAN & CLIENT
     Sidebar (Statistician): "Workbench" + Topbar Duty Clock Widget
     Sidebar (Client): "Messages" ────► Direct private chat thread
     Tools: R / SPSS syntax modeling, data cleaning, APA 7th table builder
     Status: IN_PROGRESS
              │
              ▼
 [6] QUALITY CHECK ───────────────────► SENIOR QA LEAD (Quality Reviewer)
     Sidebar: "QA Review Queue"
     Tools: Side-by-side inspection desk, code re-run console, 4-point checklist
     Status: FOR_QA (Errors ──► QA_REVISION; 100% Verified ──► Approved!)
              │
              ▼
 [7] PAY BALANCE & DOWNLOAD ──────────► CLIENT & FINANCE OFFICER
     Sidebar (Client): "My Studies" ──► Watermarked preview & download package
     Sidebar (Finance): "Transactions" ➔ Final settlement clearance
     Bonus Tools: 3-day free warranty revisions, "DefenseLab Practice" booking
     Status: DELIVERED ──► CLOSED & ARCHIVED
========================================================================================
```

---

## 2. Sidebar Items & Tools Used at Every Step

| Step | Role in Charge | Sidebar Menu Item | Screen Tools & Sidetools Used |
|:---:|:---|:---|:---|
| **[1] Submit Request** | **Client** *(Student / Researcher)* | **`Submit New Request`**<br>`/dashboard/client/projects/new` | • **3-Step Intake Wizard:** Title & research questions (SOPs).<br>• **File Dropzone:** Drag & drop raw survey Excel (`.xlsx`, `.csv`, `.sav`) + questionnaire.<br>• **Calendar Picker:** Select required delivery deadline. |
| **[2] Get Your Quote** | **Admin** *(Operations Manager)* | **`Intake Review`**<br>`/dashboard/admin/intake` | • **Scope Inspector:** Verify questions and open attached files.<br>• **"Request Info" Modal:** Triggers if files are corrupted (`AWAITING_INFORMATION`).<br>• **Pricing Calculator:** Selects package tier & turnaround speed.<br>• **Quote Dispatcher:** Generates digital SOW agreement with 7-day timer. |
| **[3] Sign & 50% Deposit** | **Client** & **Finance Officer** | Client: **`Quotes & Proposals`**<br>Finance: **`Transactions`** | • **Digital Contract Viewer:** Inspect legal scope & terms.<br>• **Touch Signature Pad:** Sign agreement using mouse or finger.<br>• **GCash QR & Bank Details:** Official payment instructions.<br>• **Verification Modal:** Finance inspects slip & locks funds into **Escrow Vault**. |
| **[4] Assign Statistician** | **Admin** *(Operations Manager)* | **`Assignments Desk`**<br>`/dashboard/admin/assignments` | • **Specialist Topic Matcher:** Filters experts by field (Health, Business, Education, etc.).<br>• **Workload Capacity Gauge:** Live load tracker (strictly capped at max 4 studies).<br>• **1-Click Dispatcher:** Opens private message room and queues study in Workbench. |
| **[5] Analysis in Progress** | **Statistician** & **Client** | Specialist: **`Workbench`**<br>Client: **`Messages`** | • **Topbar Duty Clock Widget:** Clock In, Break, Clock Out timer.<br>• **Data Cleaning Checklist:** Missing value imputation, reverse-coding.<br>• **Analysis Software:** RStudio / IBM SPSS / SmartPLS script generation.<br>• **In-App Messenger:** Direct chat between client and specialist with file sharing. |
| **[6] Quality Check** | **Senior QA Lead** *(Quality Reviewer)* | **`QA Review Queue`**<br>`/dashboard/qa` | • **Side-by-Side Inspection Desk:** Compare report against raw script.<br>• **Code Re-run Console:** Re-execute script to verify math reproducibility.<br>• **APA 7th Audit Checklist:** Verify 3 horizontal rules, italic symbols, decimals.<br>• **Revision Loop Modal:** Return with specific line notes (`QA_REVISION`). |
| **[7] Pay Balance & Download** | **Client** & **Finance Officer** | Client: **`My Studies`**<br>Finance: **`Transactions`** | • **Watermarked Previewer:** Review draft results before final payment.<br>• **1-Click Download Button:** Unlocks clean Word (`.docx`), Excel, and R code.<br>• **Free Revision Desk:** 3-day warranty button for thesis adviser tweaks.<br>• **DefenseLab Practice:** Sidebar link to book 45-min mock defense rehearsal. |

---

## 3. Super Accurate Step-by-Step Breakdown

### [1] SUBMIT REQUEST
- **Who Acts:** Client (Student / Researcher)
- **Sidebar Menu:** `Submit New Request` (`/dashboard/client/projects/new`)
- **Tools on Screen:**
  1. 3-step stepper header (1. Scope ➔ 2. Attachments ➔ 3. Review).
  2. Research study title and research questions text area.
  3. Drag-and-drop file upload zone accepting `.xlsx`, `.csv`, `.sav`, `.docx`, `.pdf`.
  4. Interactive calendar deadline selector.
- **System Status:** `NEW_REQUEST`

---

### [2] GET YOUR QUOTE
- **Who Acts:** Operations Admin
- **Sidebar Menu:** `Intake Review` (`/dashboard/admin/intake`)
- **Tools on Screen:**
  1. Intake table with status filters and quick search.
  2. Document viewer to preview client survey files.
  3. Package selector (Descriptive & Correlations, Regression & ANOVA, Advanced SEM).
  4. Turnaround speed toggle (Standard: 7–10 days, Rush: 3–5 days, Emergency: 24–48 hours).
  5. If files are missing: "Request Missing Info" button transitions status to `AWAITING_INFORMATION`.
- **System Status:** `QUOTE_SENT`

---

### [3] SIGN & PAY 50% DEPOSIT
- **Who Acts:** Client ➔ Finance Officer
- **Sidebar Menu:**
  - Client: `Quotes & Proposals` (`/dashboard/client/quotations`)
  - Finance: `Transactions Desk` (`/dashboard/finance/transactions`)
- **Tools on Screen:**
  1. **Client Side:**
     - Digital Statement of Work (SOW) viewer with deliverables breakdown.
     - Canvas signature pad to draw legal signature (`SOW_SIGNED`).
     - Payment modal showing official GCash QR and BDO/BPI bank account details.
     - Receipt screenshot uploader with reference number field (`AWAITING_CONFIRMATION`).
  2. **Finance Side:**
     - Verification modal showing uploaded receipt slip side-by-side with reference number.
     - "Approve & Lock Funds" button locks deposit into the **JAXIS Escrow Vault** (`ESCROW_LOCKED`).
- **System Status:** `ACTIVE`

---

### [4] WE ASSIGN YOUR STATISTICIAN
- **Who Acts:** Operations Admin
- **Sidebar Menu:** `Assignments Desk` (`/dashboard/admin/assignments`)
- **Tools on Screen:**
  1. Study assignment card showing topic methodology (e.g. Healthcare, Regression).
  2. Specialist dropdown list filtered by matching subject expertise.
  3. Workload capacity meter showing current active studies per specialist (strictly capped at 4/4).
  4. "Assign Specialist" button: dispatches study to analyst and opens private chat thread.
- **System Status:** `EXPERT_ASSIGNED`

---

### [5] ANALYSIS IN PROGRESS
- **Who Acts:** Assigned Lead Statistician & Client
- **Sidebar Menu:**
  - Specialist: `Statistician Workbench` (`/dashboard/statistician`) & Topbar
  - Client: `My Studies` (`/dashboard/client`) & `Messages` (`/dashboard/client/messages`)
- **Tools on Screen:**
  1. **Topbar Duty Clock Widget:** Active duty timer (`[ 🟢 Duty: 02h 15m ]`, Break, Clock Out).
  2. **Workbench Desk:** Raw data download button, data cleaning protocol checklist.
  3. **External Statistical Software:** Specialist runs RStudio, IBM SPSS, or SmartPLS.
  4. **In-App Messaging Window:** Secure Messenger-style chat for client questions with zero personal cell number exchange.
  5. **QA Package Submission Modal:** Uploader for Word Report (`.docx`), Clean Data (`.xlsx`), and Syntax (`.R` / `.sps`).
- **System Status:** `IN_PROGRESS`

---

### [6] QUALITY CHECK
- **Who Acts:** Senior QA Lead (Quality Reviewer)
- **Sidebar Menu:** `QA Review Queue` (`/dashboard/qa`)
- **Tools on Screen:**
  1. QA Queue list showing submitted studies awaiting verification.
  2. Side-by-side inspection console (`/dashboard/qa/[id]/inspect`).
  3. 4-Pillar QA Verification Checklist:
     - Math code re-execution (confirming 100% numerical match).
     - APA 7th table standards (3 horizontal rules, italic symbols, exact p-values).
     - Scope check (all research questions answered).
     - Narrative logic and clarity.
  4. "Request Revisions" modal: returns study to analyst with specific line notes (`QA_REVISION`).
  5. "Approve & Stamp" button: applies official quality seal and generates watermarked preview (`DELIVERABLE_WATERMARKED`).
- **System Status:** `FOR_QA` ➔ Approved

---

### [7] PAY BALANCE & DOWNLOAD
- **Who Acts:** Client ➔ Finance Officer
- **Sidebar Menu:**
  - Client: `My Studies` (`/dashboard/client`)
  - Finance: `Transactions Desk` (`/dashboard/finance/transactions`)
- **Tools on Screen:**
  1. **Client Side:**
     - Watermarked draft previewer to inspect findings before final payment.
     - Final 50% payment modal (GCash / Bank).
     - "Download Deliverables" button: downloads clean Word file, clean Excel, and R code.
     - "Request Free Revision" button: unlocks 3-day warranty period for panel feedback.
     - `DefenseLab Practice` link: sidebar link to book mock defense rehearsal with a panelist.
  2. **Finance Side:**
     - Settlement verification button.
     - Specialist commission credit to 15th/30th payday statement.
- **System Status:** `DELIVERED` ➔ `CLOSED`
