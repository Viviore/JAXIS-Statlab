# 05 — Simple Finance & Payroll Officer Guide

Welcome, Finance Officer! As the Finance & Payroll Manager at JAXIS StatLab, you are the cashier and escrow guardian of the company. Your job is to verify client payments, keep money safe while work is in progress, credit study commissions, and pay our staff on time every 15th and 30th of the month.

---

## 1. How Money Flows Through JAXIS (ASCII Flowchart)

```
STEP 1: CLIENT SENDS 50% DEPOSIT
┌─────────────────────────────────────────────────────────┐
│ • Client sends money via GCash or BDO/BPI Bank          │
│ • Client uploads screenshot of receipt                  │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
STEP 2: FINANCE VERIFIES & LOCKS IN ESCROW VAULT
┌─────────────────────────────────────────────────────────┐
│ • You open online bank or GCash to verify the funds     │
│ • Click "Approve Payment"                               │
│ • Money is locked safely in the JAXIS Escrow Vault      │
│ • Work is officially cleared to start!                  │
└────────────────────────────┬────────────────────────────┘
                             │ Specialist finishes & QA approves!
                             ▼
STEP 3: CLIENT PAYS FINAL 50% BALANCE
┌─────────────────────────────────────────────────────────┐
│ • You verify the second receipt                         │
│ • Clean Word report unlocks for the client              │
│ • Specialist's study commission is credited             │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
STEP 4: PAYDAY RUN (15th & 30th OF THE MONTH)
┌─────────────────────────────────────────────────────────┐
│ • Check staff clock-in hours from topbar timer          │
│ • Click "Generate Payroll Cycle"                        │
│ • System calculates: Base Pay + Hourly Pay + Study Fees │
│ • Click "Copy Details" to send money to staff GCash/Bank│
└─────────────────────────────────────────────────────────┘
```

---

## 2. Step-by-Step Screen Guide

### Screen 1: Verifying Client Payments (`/dashboard/finance/transactions`)

When a student pays their deposit:
1. Open the Transactions desk:
   ```
   ┌─────────────────────────────────────────────────────────────────────┐
   │ PENDING PAYMENT VERIFICATIONS                                       │
   │                                                                     │
   │ ID         CLIENT     AMOUNT   REF NUMBER     RECEIPT     ACTION    │
   │ ─────────────────────────────────────────────────────────────────── │
   │ JAXIS-5622 Ana Cruz   ₱6,000   102938475610   [View Slip] [Verify]  │
   └─────────────────────────────────────────────────────────────────────┘
   ```
2. Click **"[View Slip]"** to see the student's payment screenshot.
3. Open your company bank app (or GCash merchant portal) and verify:
   - Did the money actually arrive?
   - Does the Reference Number match?
   - Is the amount correct (e.g. exactly ₱6,000)?
4. If correct, click **"Approve & Clear Funds"**:
   - The money is locked in the **JAXIS Escrow Vault**.
   - The Admin is now allowed to assign a statistician to start work!
   - The client receives an official email receipt.

---

### Screen 2: Unlocking Final Deliverables

1. When QA approves the study, the student pays the remaining 50% balance.
2. You check the final receipt in your Transactions desk.
3. Click **"Confirm Final Settlement"**:
   - The watermarks are immediately removed from the client's portal.
   - The student can now download their clean APA 7th tables.
   - The specialist's earned commission is queued for the next payday!

---

### Screen 3: Checking Staff Timesheet Hours (`Attendance`)

Before running payday:
1. Go to **"Attendance & Timesheets"** in the sidebar.
2. You will see total hours logged by each specialist on the topbar timer:
   - For example: *Dr. Reyes logged 34.5 duty hours this period*.
3. If an analyst forgot to clock out because of an internet outage:
   - Review their adjustment note.
   - Click "Approve Adjustment" if the request is reasonable.

---

### Screen 4: Running Payday (15th & 30th of Every Month)

On the 15th and 30th:
1. Go to **"Payroll"** (`/dashboard/finance/payroll`).
2. Click the orange button: **"Generate Payroll Cycle"**.
3. The system automatically computes 3 things for every team member:
   ```
   Total Pay = (Half of Monthly Base) + (Duty Hours x Hourly Rate) + (Study Commissions)
   ```
   *(For example: ₱5,000 base + ₱3,450 duty hours + ₱7,200 study commissions = ₱15,650 gross pay)*.
4. **Sending Payments (1-Click Easy Copy):**
   - Click the **"Copy Details"** button beside each employee.
   - Paste their account number and amount directly into your BDO/BPI online banking or GCash app.
   - Send the money.
5. Click **"Mark as Disbursed"**.
6. An official digital payslip voucher is created for the employee to view anytime.

---

## 3. Financial Rules to Remember

1. **Never Clear Work Without Real Funds:** Never click "Approve" just because someone uploaded an image. Always verify on your actual bank app that the funds have cleared.
2. **Escrow Safety:** Client deposits belong to the client until Senior QA signs off on the analysis. We never spend client deposit money on office bills until the work is verified.
3. **Punctual Paydays:** Staff count on their 15th and 30th paychecks. Always run the batch cycle on time!
