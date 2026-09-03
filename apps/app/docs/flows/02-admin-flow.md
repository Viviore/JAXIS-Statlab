# 02 — Simple Administrator & Operations Guide

Welcome, Admin! As an Operations Administrator at JAXIS StatLab, you are the conductor of the laboratory. Your job is to make sure every thesis request is reviewed quickly, priced fairly, matched with the best statistician, and delivered on time.

---

## 1. What You Do Every Day (ASCII Flowchart)

```
STEP 1: CHECK NEW INTAKE REQUESTS
┌─────────────────────────────────────────────────────────┐
│ • Open your Intake Queue (/dashboard/admin/intake)      │
│ • Read the student's research questions & check files   │
│ • If anything is missing: click "Request Info"          │
└────────────────────────────┬────────────────────────────┘
                             │ Everything looks complete!
                             ▼
STEP 2: CREATE & SEND A PRICE QUOTE
┌─────────────────────────────────────────────────────────┐
│ • Choose the package tier (Simple, Medium, Advanced)    │
│ • Choose the speed (Standard, Rush, Emergency)          │
│ • Click "Dispatch Quote" to send it to the client       │
└────────────────────────────┬────────────────────────────┘
                             │ Client signs & pays deposit!
                             ▼
STEP 3: ASSIGN THE BEST STATISTICIAN
┌─────────────────────────────────────────────────────────┐
│ • Go to Assignments (/dashboard/admin/assignments)      │
│ • Pick a specialist who knows the topic well            │
│ • Make sure the specialist has fewer than 4 studies     │
│ • Click "Assign Specialist"                             │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
STEP 4: WATCH THE TIMERS (SLA MONITORING)
┌─────────────────────────────────────────────────────────┐
│ • Keep an eye on delivery deadlines                     │
│ • Green = Plenty of time                                │
│ • Yellow = Halfway through                              │
│ • Red = Urgent! Follow up with the analyst              │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Step-by-Step Screen Guide

### Screen 1: The Intake Review Desk (`/dashboard/admin/intake`)

This is where all new student requests arrive:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ INTAKE TRIAGE QUEUE                                                     │
│                                                                         │
│ ID               STUDY TITLE                           STATUS   ACTION  │
│ ─────────────────────────────────────────────────────────────────────── │
│ JAXIS-5622       Predictors of Patient Readmission     NEW      [Review]│
│ JAXIS-5623       Online Shopping Behavior in Gen Z     NEW      [Review]│
└─────────────────────────────────────────────────────────────────────────┘
```

1. Click **"Review"** on any new study.
2. Check the 4 things:
   - **Questions:** Can you understand what the student wants to test?
   - **Data File:** Can you open the Excel file? Are there enough rows of answers?
   - **Questionnaire:** Did they include a copy of the survey questionnaire?
   - **Target Date:** Is their requested deadline realistic?
3. **If a file is missing or corrupted:**
   - Click **"Request Missing Information"**.
   - Type a polite note (e.g., *"Please attach the survey questionnaire so our analyst knows what each column measures"*).
   - Click Send. The client will be asked to upload it.
4. **If everything is complete:**
   - Click **"Proceed to Quotation →"**.

---

### Screen 2: Creating a Price Quote (`/dashboard/admin/projects/[id]/quote`)

Here you set the pricing for the study:

1. **Pick the Package Tier:**
   - **Tier 1 (Descriptive & Correlations):** Mean, Standard Deviation, Percentages, Pearson $r$. (Most common for basic undergrad papers).
   - **Tier 2 (Comparisons & Predictions):** T-tests, ANOVA, Multiple Linear Regression. (Most common for Master's theses).
   - **Tier 3 (Advanced Models):** Structural Equation Modeling (SEM), Logistic Regression, Mediation/Moderation. (PhD dissertations).
2. **Select Turnaround Speed:**
   - **Standard:** 7 to 10 days (normal price).
   - **Rush:** 3 to 5 days (+35% rush fee).
   - **Emergency:** 24 to 48 hours (+75% emergency fee).
3. **Optional Add-ons:**
   - Check **"DefenseLab Mock Rehearsal"** if the client requested defense coaching.
4. **Click "Dispatch Quotation"**:
   - The system formats a clean proposal and sends an email to the client with a 7-day timer.

---

### Screen 3: Assigning a Statistician (`/dashboard/admin/assignments`)

Once Finance verifies the client's 50% deposit, the study enters **"Pending Assignment"**:

1. Open the Assignments desk.
2. Look at the candidate specialists:
   - Match by subject: (e.g. pick a specialist tagged with `Healthcare` for medical papers, or `SmartPLS` for marketing papers).
   - **Capacity Rule:** Look at their active study count. Standard specialists can only have **up to 4 active studies**. Never assign a 5th study to an overloaded specialist.
3. Click **"Assign Specialist"**.
4. The specialist is instantly notified and can begin work immediately.

---

### Screen 4: Monitoring Deadlines (`/dashboard/admin/reports`)

Keep an eye on active turnaround timers:
- **Green Light:** More than 50% of the allowed time remains. Everything is on schedule.
- **Yellow Light:** More than 50% of time has elapsed. Check in on the study.
- **Red Alert:** Over 75% of time elapsed and the specialist has not submitted to QA yet. Send a quick chat message to the specialist: *"Hi, checking in on JAXIS-5622. Is everything on track for Friday?"*

---

## 3. Important Admin Rules

1. **4-Hour Review Rule:** Never let a new request sit unreviewed for more than 4 business hours. Students are stressed about deadlines; fast responses win their trust!
2. **Wait for Finance Clearance:** Never assign a statistician to start work until Finance has verified the client's deposit.
3. **Fairness to Staff:** Distribute studies fairly so all statisticians get steady income without burning out.
