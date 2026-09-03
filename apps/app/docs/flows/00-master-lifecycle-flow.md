# 00 — How a Research Study Moves from Start to Finish

This document explains the full life story of a research study inside JAXIS StatLab, from the first day a client signs up to the day they download their finished thesis tables.

---

## 1. The 7 Simple Steps (ASCII Flowchart)

```
STEP 1: CLIENT SIGNS UP & SUBMITS REQUEST
┌─────────────────────────────────────────────────────────┐
│ • Client creates account & tells us their school name   │
│ • Client submits research questions and raw data files  │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
STEP 2: ADMIN CHECKS THE REQUEST & GIVES A PRICE
┌─────────────────────────────────────────────────────────┐
│ • Admin reads the questions and looks at the data files │
│ • Admin sends a price quote (e.g., ₱12,000)             │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
STEP 3: CLIENT SIGNS CONTRACT & PAYS 50% DEPOSIT
┌─────────────────────────────────────────────────────────┐
│ • Client clicks "Accept Quote" and signs online         │
│ • Client sends 50% downpayment via GCash or Bank        │
│ • Finance confirms payment and locks money safely       │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
STEP 4: ADMIN ASSIGNS A LEAD STATISTICIAN
┌─────────────────────────────────────────────────────────┐
│ • Admin picks the best analyst for the client's topic   │
│ • Specialist gets the study on their computer screen    │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
STEP 5: STATISTICIAN CLEANS DATA & RUNS THE FORMULAS
┌─────────────────────────────────────────────────────────┐
│ • Statistician clocks in on the topbar timer            │
│ • Cleans Excel sheet, fixes missing numbers             │
│ • Runs formulas in R or SPSS, formats neat APA tables   │
│ • Chats with the client if anything needs clarifying    │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
STEP 6: SENIOR QA CHECKS ALL THE MATH (QUALITY CONTROL)
┌─────────────────────────────────────────────────────────┐
│ • Senior reviewer re-runs the code to ensure 100% truth │
│ • If something is wrong: sends back to analyst to fix   │
│ • If 100% perfect: gives official stamp of approval     │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
STEP 7: FINAL PAYMENT & DELIVERABLES UNLOCKED
┌─────────────────────────────────────────────────────────┐
│ • Client sees preview and pays remaining 50% balance    │
│ • Clean Word report and Excel data unlock for download  │
│ • Statistician gets paid their commission               │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Detailed Walkthrough of Each Step

### Step 1: Client Signs Up & Submits Request
- **What the client does:**
  1. Opens the portal, clicks "Submit New Study Request".
  2. Types the thesis title, the specific questions the thesis wants to answer, and the date the thesis must be finished.
  3. Uploads raw data (like survey responses in Excel or Google Sheets) and the survey questionnaire.
- **What happens next:** The system gives the request a tracking number (for example: `JAXIS-202608-5622`) and puts it on the Admin's desk.

---

### Step 2: Admin Checks the Request & Sends a Quote
- **What the Admin does:**
  1. Opens the new request and reads it carefully.
  2. Checks if the files can be opened and if all survey questions are clear.
  3. Chooses the fair price package based on how complex the math is (simple correlations vs. advanced medical predictive models).
  4. Clicks "Dispatch Quotation".
- **What happens next:** The client gets an email and a notification on their dashboard: *"Your quote is ready to review"*.

---

### Step 3: Client Approves, Signs & Deposits
- **What the client does:**
  1. Reviews the price and turnaround days.
  2. Clicks "Accept Quote", reads the simple agreement, and signs with their mouse or finger.
  3. Sends the 50% deposit using GCash or online bank transfer and uploads a screenshot of the receipt.
- **What Finance does:**
  - Finance checks that the money actually arrived in the bank.
  - Finance clicks "Approve". The money is now locked safely in the **JAXIS Escrow Vault**.
- **What happens next:** Work is officially cleared to start!

---

### Step 4: Admin Assigns the Statistician
- **What the Admin does:**
  1. Looks at the list of available statisticians.
  2. Checks who is good at the specific topic (for example: nursing studies vs. business marketing).
  3. Checks that the specialist is not too busy (no specialist is allowed to take more than 4 studies at the same time, so they never rush or do sloppy work).
  4. Clicks "Assign Specialist".
- **What happens next:** A private message room opens between the client and the specialist, and the study appears in the specialist's workbench.

---

### Step 5: Statistician Does the Work & Chats with Client
- **What the statistician does:**
  1. Clicks the "Clock In" button on the topbar to track their work hours.
  2. Downloads the client's Excel file and cleans up typos, missing answers, or bad columns.
  3. Runs the exact formulas needed to answer the client's thesis questions.
  4. Types out the results in clean Word tables following university APA 7th standards.
  5. If anything is confusing in the survey, the specialist clicks "Message Client" to ask directly.
- **What happens next:** When the report is completely finished, the specialist clicks "Submit for QA Review".

---

### Step 6: Senior QA Double Checks the Math
- **What the Senior QA Lead does:**
  1. Picks up the finished report.
  2. Re-runs the math from scratch using the raw data to see if the answers match 100%.
  3. Checks that the tables look clean and pretty (no messy vertical lines, clear titles, correct decimals).
  4. **If there is any mistake:** Sends it back to the specialist with clear notes on what to fix.
  5. **If everything is correct:** Clicks "Approve & Release".
- **What happens next:** A watermarked preview copy is prepared so the client can inspect the results.

---

### Step 7: Final Payment & Download
- **What happens:**
  1. Client looks at the preview to see that all their questions were answered.
  2. Client pays the second half (50%) of the fee.
  3. Finance confirms the payment.
  4. The client can now click **"Download Deliverables"** to get the clean Word file (`.docx`), the clean Excel sheet (`.xlsx`), and the math code.
  5. The statistician gets their study earnings added to their payday statement.
  6. The client has **3 days of free warranty revisions** if their thesis adviser requests minor formatting tweaks.

---

## 3. Simple Status Guide (What the Tags on Screen Mean)

When you look at a study on your screen, you will see a status badge. Here is what every badge means in plain English:

| Status Badge | What it Means in Plain English | Who Needs to Act? |
|:---|:---|:---|
| **New Request** | Client just submitted the study. Waiting for Admin to read it. | Admin |
| **Awaiting Information** | Admin or Statistician needs an extra file or clarification from the client. | Client |
| **Quote Sent** | Price quote is ready for the client to review and sign. | Client |
| **Awaiting Payment** | Client signed the contract. Waiting for 50% deposit. | Client |
| **Awaiting Confirmation** | Client uploaded payment receipt. Waiting for Finance to verify funds. | Finance Officer |
| **Pending Assignment** | Payment verified! Waiting for Admin to assign the right specialist. | Admin |
| **In Progress** | Statistician is actively cleaning data and running the calculations. | Statistician |
| **For QA Review** | Specialist finished the work. Senior reviewer is checking the math. | Senior QA Lead |
| **QA Revision** | QA found a small typo or math issue. Specialist is fixing it. | Statistician |
| **Delivered** | QA passed 100%! Ready for client to download final clean files. | Client |
| **Closed** | Everything is finished and verified. Payouts released. | Archive |
| **Disputed** | Client or staff reported a problem. Management is reviewing it. | Admin / CEO |
