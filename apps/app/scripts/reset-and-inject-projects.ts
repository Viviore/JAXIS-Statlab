import {
  PrismaClient,
  DeliverableCategory,
  AnalysisFileCategory,
  FileCategory,
  ProjectStatus,
  PackageName,
} from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("==================================================================");
  console.log("🧹 JAXIS StatLab — Purging Existing Projects & Data");
  console.log("==================================================================");

  // 1. Purge all related project records in relational order
  await prisma.deliverable.deleteMany({});
  await prisma.analysisFile.deleteMany({});
  await prisma.projectFile.deleteMany({});
  await prisma.revisionRequest.deleteMany({});
  await prisma.scopeCreepLog.deleteMany({});
  await prisma.qAReview.deleteMany({});
  await prisma.qARejectionCount.deleteMany({});
  await prisma.defenseLabSession.deleteMany({});
  await prisma.payout.deleteMany({});
  await prisma.financialLedger.deleteMany({});
  await prisma.dispute.deleteMany({});
  await prisma.paymentProof.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.sOW.deleteMany({});
  await prisma.quotationLineItem.deleteMany({});
  await prisma.quotation.deleteMany({});
  await prisma.assignmentHistory.deleteMany({});
  await prisma.assignment.deleteMany({});
  await prisma.messageReadReceipt.deleteMany({});
  await prisma.blockedMessageLog.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.inAppAlert.deleteMany({});
  await prisma.notificationLog.deleteMany({});
  await prisma.archivedProject.deleteMany({});
  await prisma.project.deleteMany({});

  console.log("✅ Cleared all existing projects and relational records.");

  // 2. Clear dev caches
  const devProjectsFile = path.join(process.cwd(), ".dev-projects.json");
  const devPaymentsFile = path.join(process.cwd(), "dev_data", "payments.json");

  try {
    if (fs.existsSync(devProjectsFile)) {
      fs.writeFileSync(devProjectsFile, "[]", "utf-8");
      console.log("✅ Reset .dev-projects.json to empty array.");
    }
    if (fs.existsSync(devPaymentsFile)) {
      fs.writeFileSync(devPaymentsFile, "[]", "utf-8");
      console.log("✅ Reset dev_data/payments.json to empty array.");
    }
  } catch (err) {
    console.warn("Dev file reset warning:", err);
  }

  // 3. Resolve core users
  const clientUser = await prisma.user.findUnique({ where: { email: "client@jaxis.dev" } });
  const statUser = await prisma.user.findUnique({ where: { email: "stat@jaxis.dev" } });
  const qaUser = await prisma.user.findUnique({ where: { email: "qa@jaxis.dev" } });
  const adminUser = await prisma.user.findUnique({ where: { email: "admin@jaxis.dev" } });
  const financeUser = await prisma.user.findUnique({ where: { email: "finance@jaxis.dev" } });

  if (!clientUser || !statUser || !qaUser || !adminUser || !financeUser) {
    throw new Error("Core role users missing from database. Please ensure base seed is active.");
  }

  console.log("\n==================================================================");
  console.log("💉 Injecting Realistic Production-Grade Research Studies");
  console.log("==================================================================");

  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
  const daysFromNow = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

  // ─────────────────────────────────────────────────────────────────────────────
  // STUDY 1: DELIVERED (100% Paid, QA Approved, Ready to Download & Revise)
  // ─────────────────────────────────────────────────────────────────────────────
  const study1 = await prisma.project.create({
    data: {
      intakeId: "JAXIS-202609-0001",
      researchTitle: "Assessment of Digital Financial Literacy and FinTech Adoption Among Urban Households in Metro Manila",
      researchQuestions: "What is the demographic profile of respondents regarding digital literacy? Does financial literacy significantly predict mobile wallet adoption frequency?",
      researchObjectives: "1. Quantify digital financial literacy levels.\n2. Estimate multivariate logistic regression models for adoption likelihood.\n3. Validate construct reliability of the FinTech acceptance questionnaire.",
      hypotheses: "There is a statistically significant positive relationship between digital financial literacy and frequency of cashless transactions (p < 0.05).",
      chapters13: "Manuscript_Chapters1_3_Final.pdf",
      questionnaire: "Digital_Financial_Literacy_Scale_40Items.xlsx",
      deadlineRequested: daysFromNow(14),
      masterStatus: ProjectStatus.DELIVERED,
      packageName: "JX_03_CORE",
      qaApproved: true,
      deliveredAt: daysAgo(1),
      filesPurgeAt: daysFromNow(89),
      revisionWindowExpiresAt: daysFromNow(3), // 3-day active revision window
      createdAt: daysAgo(12),
      updatedAt: daysAgo(1),
      client: { connect: { id: clientUser.id } },
    },
  });

  // Study 1 Quotation
  const quote1 = await prisma.quotation.create({
    data: {
      project: { connect: { id: study1.id } },
      packageName: PackageName.JX_03_CORE,
      basePrice: 2750.0,
      totalAmount: 2750.0,
      downpaymentRequired: 1375.0,
      expiresAt: daysFromNow(30),
      status: "CLIENT_APPROVED",
      notes: "Commercial proposal for Core Inferential Analysis (Data Screening, Multiple Regression, APA 7th Report).",
      createdBy: adminUser.id,
      respondedAt: daysAgo(11),
      lineItems: {
        create: [
          {
            itemType: "PACKAGE",
            itemName: "JX_03_CORE",
            description: "Core Empirical Modeling & APA 7th Report",
            amount: 2750.0,
          },
        ],
      },
    },
  });

  // Study 1 SOW
  await prisma.sOW.create({
    data: {
      project: { connect: { id: study1.id } },
      packageName: "JX_03_CORE",
      totalAmount: 2750.0,
      downpaymentRequired: 1375.0,
      turnaroundDays: 7,
      generatedBy: adminUser.id,
      signedByName: "Client Ana Cruz",
      signedByUserId: clientUser.id,
      signedAt: daysAgo(10),
      contentSnapshot: {
        scopeOfWork: "Empirical regression modeling, hypothesis verification, and APA 7th statistical reporting.",
        deliverables: [
          "Curated Cleaned Survey Dataset (.csv, .xlsx)",
          "Statistical Regression Models & Summary Worksheets (.xlsx)",
          "Official Research Report with Method Interpretations (.pdf)",
        ],
      },
    },
  });

  // Study 1 Payments (100% Fully Paid)
  await prisma.payment.create({
    data: {
      project: { connect: { id: study1.id } },
      quotation: { connect: { id: quote1.id } },
      paymentType: "FULL",
      paymentMethod: "GCASH",
      amountSubmitted: 2750.0,
      balancePaidTotal: 2750.0,
      referenceNumber: "GCASH-20260901-88912",
      paymentStatus: "FULLY_PAID",
      verifiedBy: financeUser.id,
      verifiedAt: daysAgo(9),
    },
  });

  // Study 1 Assignment
  await prisma.assignment.create({
    data: {
      project: { connect: { id: study1.id } },
      statistician: { connect: { id: statUser.id } },
      qaLead: { connect: { id: qaUser.id } },
      assignedBy: adminUser.id,
      slaStartAt: daysAgo(9),
      slaDueAt: daysAgo(2),
      isActive: true,
    },
  });

  // Study 1 Analysis Files
  await prisma.analysisFile.createMany({
    data: [
      {
        projectId: study1.id,
        statisticianId: statUser.id,
        fileName: "FinTech_Adoption_Regression_Model_v1.xlsx",
        filePath: `analysis/${study1.id}/FinTech_Adoption_Regression_Model_v1.xlsx`,
        fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        fileSize: 245760,
        fileCategory: AnalysisFileCategory.EXCEL_WORKBOOK,
        version: 1,
        isCurrent: true,
        notes: "Multiple linear regression outputs, multicollinearity diagnostics (VIF < 2.5), and ANOVA summary.",
      },
      {
        projectId: study1.id,
        statisticianId: statUser.id,
        fileName: "JAXIS_Research_Report_APA7.pdf",
        filePath: `analysis/${study1.id}/JAXIS_Research_Report_APA7.pdf`,
        fileType: "application/pdf",
        fileSize: 1048576,
        fileCategory: AnalysisFileCategory.PDF_REPORT,
        version: 1,
        isCurrent: true,
        notes: "Complete Chapters 4 findings, descriptive summaries, APA tables, and narrative interpretations.",
      },
      {
        projectId: study1.id,
        statisticianId: statUser.id,
        fileName: "MetroManila_Cleaned_Survey_Matrix.csv",
        filePath: `analysis/${study1.id}/MetroManila_Cleaned_Survey_Matrix.csv`,
        fileType: "text/csv",
        fileSize: 48920,
        fileCategory: AnalysisFileCategory.RAW_DATASET,
        version: 1,
        isCurrent: true,
        notes: "Screened and anonymized dataset (N=384 respondents).",
      },
    ],
  });

  // Study 1 QA Review Record
  await prisma.qAReview.create({
    data: {
      project: { connect: { id: study1.id } },
      reviewer: { connect: { id: qaUser.id } },
      decision: "QA_APPROVED",
      comments: "Dual-blind calculations verified. Regression coefficients match raw SPSS matrix. APA 7th tables fully compliant.",
      reviewedAt: daysAgo(1),
    },
  });

  // Study 1 Released Deliverables
  await prisma.deliverable.createMany({
    data: [
      {
        projectId: study1.id,
        category: DeliverableCategory.STATISTICAL_OUTPUT,
        fileName: "FinTech_Adoption_Regression_Model_v1.xlsx",
        filePath: `analysis/${study1.id}/FinTech_Adoption_Regression_Model_v1.xlsx`,
        fileSize: 245760,
        fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        uploadedBy: statUser.id,
        isFinalReleased: true,
        releasedAt: daysAgo(1),
        releasedBy: qaUser.id,
        downloadCount: 0,
      },
      {
        projectId: study1.id,
        category: DeliverableCategory.PDF_REPORT,
        fileName: "JAXIS_Research_Report_APA7.pdf",
        filePath: `analysis/${study1.id}/JAXIS_Research_Report_APA7.pdf`,
        fileSize: 1048576,
        fileType: "application/pdf",
        uploadedBy: statUser.id,
        isFinalReleased: true,
        releasedAt: daysAgo(1),
        releasedBy: qaUser.id,
        downloadCount: 0,
      },
      {
        projectId: study1.id,
        category: DeliverableCategory.RAW_DATA_CLEANED,
        fileName: "MetroManila_Cleaned_Survey_Matrix.csv",
        filePath: `analysis/${study1.id}/MetroManila_Cleaned_Survey_Matrix.csv`,
        fileSize: 48920,
        fileType: "text/csv",
        uploadedBy: statUser.id,
        isFinalReleased: true,
        releasedAt: daysAgo(1),
        releasedBy: qaUser.id,
        downloadCount: 0,
      },
    ],
  });

  console.log(`  ✓ Seeded Study 1: [DELIVERED] ${study1.intakeId} — Ready for Client Deliverables Portal`);

  // ─────────────────────────────────────────────────────────────────────────────
  // STUDY 2: FOR_QA (Statistician Submitted, Waiting for QA Lead Evaluation)
  // ─────────────────────────────────────────────────────────────────────────────
  const study2 = await prisma.project.create({
    data: {
      intakeId: "JAXIS-202609-0002",
      researchTitle: "Clinical Efficacy of Telemedicine Interventions for Chronic Hypertension Management in Western Visayas",
      researchQuestions: "Does bi-weekly remote telemetry monitoring significantly improve blood pressure control compared to routine outpatient care?",
      researchObjectives: "1. Conduct paired-samples t-test across 12-week clinical cohort.\n2. Perform ANCOVA adjusting for baseline systolic blood pressure and medication adherence.",
      hypotheses: "Patients enrolled in remote telemetry will demonstrate significantly greater mean reduction in systolic BP (p < 0.01).",
      chapters13: "Clinical_Trial_Protocol_WesternVisayas.pdf",
      questionnaire: "Patient_Adherence_Scale.pdf",
      deadlineRequested: daysFromNow(10),
      masterStatus: ProjectStatus.FOR_QA,
      packageName: "JX_04_ADVANCED",
      qaApproved: false,
      createdAt: daysAgo(6),
      updatedAt: daysAgo(1),
      client: { connect: { id: clientUser.id } },
    },
  });

  const quote2 = await prisma.quotation.create({
    data: {
      project: { connect: { id: study2.id } },
      packageName: PackageName.JX_04_ADVANCED,
      basePrice: 5000.0,
      totalAmount: 5000.0,
      downpaymentRequired: 2500.0,
      expiresAt: daysFromNow(30),
      status: "CLIENT_APPROVED",
      notes: "Advanced Biostatistical Package (ANCOVA, Repeated Measures, Survival Analysis).",
      createdBy: adminUser.id,
      respondedAt: daysAgo(5),
      lineItems: {
        create: [
          {
            itemType: "PACKAGE",
            itemName: "JX_04_ADVANCED",
            description: "Advanced Biostatistical Clinical Trials Package",
            amount: 5000.0,
          },
        ],
      },
    },
  });

  await prisma.sOW.create({
    data: {
      project: { connect: { id: study2.id } },
      packageName: "JX_04_ADVANCED",
      totalAmount: 5000.0,
      downpaymentRequired: 2500.0,
      turnaroundDays: 10,
      generatedBy: adminUser.id,
      signedByName: "Client Ana Cruz",
      signedByUserId: clientUser.id,
      signedAt: daysAgo(5),
      contentSnapshot: {
        scopeOfWork: "ANCOVA modeling, hypothesis testing, and clinical data interpretations.",
        deliverables: ["Cleaned Clinical Matrix", "ANCOVA Models", "APA Report"],
      },
    },
  });

  await prisma.payment.create({
    data: {
      project: { connect: { id: study2.id } },
      quotation: { connect: { id: quote2.id } },
      paymentType: "DOWNPAYMENT",
      paymentMethod: "BANK_TRANSFER",
      amountSubmitted: 2500.0,
      balancePaidTotal: 2500.0,
      referenceNumber: "BDO-20260902-99014",
      paymentStatus: "VERIFIED",
      verifiedBy: financeUser.id,
      verifiedAt: daysAgo(4),
    },
  });

  await prisma.assignment.create({
    data: {
      project: { connect: { id: study2.id } },
      statistician: { connect: { id: statUser.id } },
      qaLead: { connect: { id: qaUser.id } },
      assignedBy: adminUser.id,
      slaStartAt: daysAgo(4),
      slaDueAt: daysFromNow(4),
      isActive: true,
    },
  });

  await prisma.analysisFile.createMany({
    data: [
      {
        projectId: study2.id,
        statisticianId: statUser.id,
        fileName: "Hypertension_ANCOVA_Estimations.xlsx",
        filePath: `analysis/${study2.id}/Hypertension_ANCOVA_Estimations.xlsx`,
        fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        fileSize: 312000,
        fileCategory: AnalysisFileCategory.EXCEL_WORKBOOK,
        version: 1,
        isCurrent: true,
        notes: "ANCOVA results with Levene's test of homogeneity of variance verified.",
      },
      {
        projectId: study2.id,
        statisticianId: statUser.id,
        fileName: "Clinical_Cohort_Anonymized.csv",
        filePath: `analysis/${study2.id}/Clinical_Cohort_Anonymized.csv`,
        fileType: "text/csv",
        fileSize: 78000,
        fileCategory: AnalysisFileCategory.RAW_DATASET,
        version: 1,
        isCurrent: true,
        notes: "De-identified Western Visayas patient registry (N=210).",
      },
    ],
  });

  console.log(`  ✓ Seeded Study 2: [FOR_QA] ${study2.intakeId} — Ready in Senior QA Review Queue`);

  // ─────────────────────────────────────────────────────────────────────────────
  // STUDY 3: IN_PROGRESS (Statistician Actively Analyzing Data)
  // ─────────────────────────────────────────────────────────────────────────────
  const study3 = await prisma.project.create({
    data: {
      intakeId: "JAXIS-202609-0003",
      researchTitle: "Predictive Modeling of Higher Education Student Retention Rates Using Random Forest Classifiers",
      researchQuestions: "Which academic and socioeconomic variables best predict 4-year degree completion among engineering freshmen?",
      researchObjectives: "1. Screen academic records.\n2. Train supervised machine learning models.\n3. Identify top feature importances.",
      hypotheses: "First-semester STEM grade point average exhibits highest predictive weight in retention outcomes.",
      deadlineRequested: daysFromNow(20),
      masterStatus: ProjectStatus.IN_PROGRESS,
      packageName: "JX_03_CORE",
      qaApproved: false,
      createdAt: daysAgo(4),
      updatedAt: daysAgo(2),
      client: { connect: { id: clientUser.id } },
    },
  });

  const quote3 = await prisma.quotation.create({
    data: {
      project: { connect: { id: study3.id } },
      packageName: PackageName.JX_03_CORE,
      basePrice: 3000.0,
      totalAmount: 3000.0,
      downpaymentRequired: 1500.0,
      expiresAt: daysFromNow(30),
      status: "CLIENT_APPROVED",
      notes: "Core ML classification and predictive analytics.",
      createdBy: adminUser.id,
      respondedAt: daysAgo(3),
      lineItems: {
        create: [
          {
            itemType: "PACKAGE",
            itemName: "JX_03_CORE",
            description: "Core Predictive Modeling Package",
            amount: 3000.0,
          },
        ],
      },
    },
  });

  await prisma.sOW.create({
    data: {
      project: { connect: { id: study3.id } },
      packageName: "JX_03_CORE",
      totalAmount: 3000.0,
      downpaymentRequired: 1500.0,
      turnaroundDays: 7,
      generatedBy: adminUser.id,
      signedByName: "Client Ana Cruz",
      signedByUserId: clientUser.id,
      signedAt: daysAgo(3),
      contentSnapshot: { scopeOfWork: "Random forest model training, confusion matrix, and reporting." },
    },
  });

  await prisma.payment.create({
    data: {
      project: { connect: { id: study3.id } },
      quotation: { connect: { id: quote3.id } },
      paymentType: "DOWNPAYMENT",
      paymentMethod: "GCASH",
      amountSubmitted: 1500.0,
      balancePaidTotal: 1500.0,
      referenceNumber: "GCASH-20260903-77123",
      paymentStatus: "VERIFIED",
      verifiedBy: financeUser.id,
      verifiedAt: daysAgo(2),
    },
  });

  await prisma.assignment.create({
    data: {
      project: { connect: { id: study3.id } },
      statistician: { connect: { id: statUser.id } },
      qaLead: { connect: { id: qaUser.id } },
      assignedBy: adminUser.id,
      slaStartAt: daysAgo(2),
      slaDueAt: daysFromNow(5),
      isActive: true,
    },
  });

  console.log(`  ✓ Seeded Study 3: [IN_PROGRESS] ${study3.intakeId} — Active Statistician Workbench`);

  // ─────────────────────────────────────────────────────────────────────────────
  // STUDY 4: AWAITING_PAYMENT (SOW Signed, Ready for Downpayment)
  // ─────────────────────────────────────────────────────────────────────────────
  const study4 = await prisma.project.create({
    data: {
      intakeId: "JAXIS-202609-0004",
      researchTitle: "Psychometric Validation of the Hybrid Instruction Teacher Resilience Scale",
      researchQuestions: "Does the 25-item Teacher Resilience Scale demonstrate unidimensionality and strong internal consistency?",
      researchObjectives: "Compute Cronbach's alpha, McDonald's omega, and conduct Exploratory Factor Analysis (EFA).",
      deadlineRequested: daysFromNow(12),
      masterStatus: ProjectStatus.AWAITING_PAYMENT,
      packageName: "JX_02_START",
      qaApproved: false,
      createdAt: daysAgo(2),
      updatedAt: daysAgo(1),
      client: { connect: { id: clientUser.id } },
    },
  });

  const quote4 = await prisma.quotation.create({
    data: {
      project: { connect: { id: study4.id } },
      packageName: PackageName.JX_02_START,
      basePrice: 1800.0,
      totalAmount: 1800.0,
      downpaymentRequired: 1800.0, // Upfront package
      expiresAt: daysFromNow(14),
      status: "CLIENT_APPROVED",
      notes: "Descriptive & Psychometric Scale Reliability Package.",
      createdBy: adminUser.id,
      respondedAt: daysAgo(1),
      lineItems: {
        create: [
          {
            itemType: "PACKAGE",
            itemName: "JX_02_START",
            description: "Psychometric Scale Reliability Package",
            amount: 1800.0,
          },
        ],
      },
    },
  });

  await prisma.sOW.create({
    data: {
      project: { connect: { id: study4.id } },
      packageName: "JX_02_START",
      totalAmount: 1800.0,
      downpaymentRequired: 1800.0,
      turnaroundDays: 5,
      generatedBy: adminUser.id,
      signedByName: "Client Ana Cruz",
      signedByUserId: clientUser.id,
      signedAt: daysAgo(1),
      contentSnapshot: { scopeOfWork: "Scale reliability analysis, factor extraction, and APA report." },
    },
  });

  console.log(`  ✓ Seeded Study 4: [AWAITING_PAYMENT] ${study4.intakeId} — Ready on Client Payment Desk`);

  // ─────────────────────────────────────────────────────────────────────────────
  // STUDY 5: UNDER_EVALUATION (New Request Intake, Ready for Admin Quotation)
  // ─────────────────────────────────────────────────────────────────────────────
  const study5 = await prisma.project.create({
    data: {
      intakeId: "JAXIS-202609-0005",
      researchTitle: "Supply Chain Vulnerabilities and Post-Harvest Grain Losses Among Rice Farming Cooperatives in Central Luzon",
      researchQuestions: "What logistic and storage variables contribute most to post-harvest grain spoilage?",
      researchObjectives: "Map logistical pinch points and perform multiple regression across 50 provincial rice mills.",
      hypotheses: "Storage moisture levels above 14% significantly increase fungal spoilage risk (p < 0.05).",
      chapters13: "Chapters1_3_Rice_Cooperative_Study.pdf",
      questionnaire: "Warehouse_Storage_Log.xlsx",
      deadlineRequested: daysFromNow(18),
      masterStatus: ProjectStatus.UNDER_EVALUATION,
      qaApproved: false,
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
      client: { connect: { id: clientUser.id } },
    },
  });

  await prisma.projectFile.createMany({
    data: [
      {
        projectId: study5.id,
        fileName: "Chapters1_3_Rice_Cooperative_Study.pdf",
        filePath: `intake-uploads/${study5.id}/Chapters1_3_Rice_Cooperative_Study.pdf`,
        fileType: "application/pdf",
        fileCategory: FileCategory.RESEARCH_DOCUMENT,
      },
      {
        projectId: study5.id,
        fileName: "Warehouse_Storage_Log.xlsx",
        filePath: `intake-uploads/${study5.id}/Warehouse_Storage_Log.xlsx`,
        fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        fileCategory: FileCategory.DATASET,
      },
    ],
  });

  console.log(`  ✓ Seeded Study 5: [UNDER_EVALUATION] ${study5.intakeId} — Ready in Admin Intake Review`);

  console.log("\n==================================================================");
  console.log("🎉 DATABASE REFRESH COMPLETE: 5 REALISTIC STUDIES READY ACROSS ALL ROLES");
  console.log("==================================================================");
  console.log("1. JAXIS-202609-0001 (DELIVERED)        -> Test Deliverables Portal & Revision Request");
  console.log("2. JAXIS-202609-0002 (FOR_QA)           -> Test Senior QA Lead Review & Approval");
  console.log("3. JAXIS-202609-0003 (IN_PROGRESS)      -> Test Statistician Analysis Workbench");
  console.log("4. JAXIS-202609-0004 (AWAITING_PAYMENT) -> Test Client Downpayment Flow");
  console.log("5. JAXIS-202609-0005 (UNDER_EVALUATION) -> Test Admin Commercial Proposal & SOW Creation");
}

main()
  .catch((e) => {
    console.error("❌ Error running script:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
