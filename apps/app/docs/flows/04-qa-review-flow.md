# 04 — Simple Senior QA Lead Guide (Quality Reviewer)

Welcome, QA Lead! As a Senior QA Reviewer at JAXIS StatLab, you are the quality guardian of the laboratory. Your job is to make sure every thesis table has 100% accurate math, looks beautiful according to university standards, and has zero errors before the client sees it.

---

## 1. Your Inspection Routine (ASCII Flowchart)

```
STEP 1: OPEN THE QA QUEUE
┌─────────────────────────────────────────────────────────┐
│ • Go to /dashboard/qa                                   │
│ • Pick up studies submitted by our statisticians        │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
STEP 2: THE 4-POINT QUALITY CHECK
┌─────────────────────────────────────────────────────────┐
│ 1. Re-run the math code: Do the numbers match 100%?     │
│ 2. Table formatting: Are tables in APA 7th style?       │
│ 3. Scope check: Did the analyst answer every question?  │
│ 4. Clear explanation: Is the written narrative logical? │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
STEP 3: MAKE YOUR DECISION
┌────────────────────────────┴────────────────────────────┐
│                                                         │
▼                                                         ▼
IF TYPO OR MATH ERROR FOUND:               IF 100% PERFECT & VERIFIED:
┌───────────────────────────────┐         ┌───────────────────────────────┐
│ Click "Request Revisions"     │         │ Click "Approve & Release"     │
│ Type clear notes for analyst  │         │ Official quality seal applied │
│ Analyst fixes within 12 hours │         │ Client receives clean files!  │
└───────────────────────────────┘         └───────────────────────────────┘
```

---

## 2. Step-by-Step Screen Guide

### Screen 1: The QA Inspection Desk (`/dashboard/qa`)

1. Open your QA Review Desk:
   ```
   ┌─────────────────────────────────────────────────────────────────────┐
   │ SENIOR QA PEER REVIEW QUEUE                                         │
   │                                                                     │
   │ ID         STUDY TITLE                  SPECIALIST    ACTION        │
   │ ─────────────────────────────────────────────────────────────────── │
   │ JAXIS-5622 Predictors of Readmission    Dr. Reyes     [Inspect →]   │
   │ JAXIS-5623 Gen Z Online Shopping        Prof. Santos  [Inspect →]   │
   └─────────────────────────────────────────────────────────────────────┘
   ```
2. Click **"Inspect →"** to open the side-by-side review window.
3. Download the specialist's uploaded files:
   - Formatted Word Report (`.docx`)
   - Cleaned Master Excel File (`.xlsx`)
   - Statistical Code Script (`.R` or `.sps`)

---

### Screen 2: The 4-Point Inspection Checklist

Take your time and verify these 4 things:

#### Check 1: Mathematical Accuracy (Re-Running the Code)
- Open the analyst's script in R, SPSS, or Python and press **Run**.
- Look at the numbers produced on your screen:
  - Is the Mean and SD identical to the numbers typed in Table 1?
  - Is the $F$-value or $t$-value identical to Table 2?
  - If the script says $r = .42$ but the Word table says $r = .52$, that is a typo! Flag it for revision.

#### Check 2: APA 7th Table Styling
- Look at the Word tables:
  - **No vertical lines:** Are there only 3 clean horizontal borders?
  - **Italics:** Are all statistical letters italicized ($M, SD, t, F, p, r, \beta$)?
  - **Decimals:** Are percentages and descriptive stats rounded to 2 decimal places? Are $p$-values rounded to 3 decimal places without a leading zero (e.g., $p = .014$)?

#### Check 3: Contract Scope (Did we answer everything?)
- Open the client's original agreement.
- If the student asked 4 specific Research Questions in Chapter 1, check that the report has tables and findings answering all 4 questions!

#### Check 4: Clear Narrative
- Read the findings paragraph under each table.
- Does it clearly say whether the relationship is positive or negative?
- Does it use polite, academic, and humble language?

---

### Screen 3: Making Your Review Decision

#### If you find an issue:
1. Click **"Request Revisions"**.
2. Type a clear, helpful note for the statistician:
   > *"Hi Dr. Reyes! In Table 3, the regression beta for Stress is typed as .38, but the R console output shows .34. Please adjust the table and the paragraph below it. Thanks!"*
3. The analyst will fix it promptly and resubmit.

#### If everything is 100% verified:
1. Check off all boxes on your verification checklist.
2. Click **"Approve & Release"**.
3. **What happens next:**
   - The system stamps your official quality clearance.
   - A watermarked preview is released for the client.
   - Once final payment is confirmed by Finance, clean unwatermarked files unlock for the client!

---

## 3. QA Standards to Remember

1. **You Have Final Authority:** If you see bad math or sloppy work, you have the full power to reject it. We never deliver incorrect math to a thesis student.
2. **Be Specific in Notes:** Never just say *"Fix this"*. Always say which table number, which row, and what the number should be.
3. **Zero Plagiarism:** Make sure interpretations are original and written specifically for the student's dataset.
