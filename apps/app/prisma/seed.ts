import { PrismaClient, RoleName } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

interface SeedRole {
  id: number;
  name: RoleName;
  label: string;
}

interface SeedUser {
  fullName: string;
  email: string;
  role: RoleName;
  password: string;
  status?: "ACTIVE" | "SUSPENDED" | "TERMINATED";
}

const roles: SeedRole[] = [
  { id: 1, name: "CLIENT", label: "Client" },
  { id: 2, name: "STATISTICIAN", label: "Statistician" },
  { id: 3, name: "SENIOR_QA_LEAD", label: "Senior QA Lead" },
  { id: 4, name: "ADMIN", label: "Admin / Manager" },
  { id: 5, name: "FINANCE_OFFICER", label: "Finance Officer" },
  { id: 6, name: "CEO", label: "CEO / Owner" },
];

const seedUsers: SeedUser[] = [
  {
    fullName: "Operations Manager",
    email: "admin@jaxis.dev",
    role: "ADMIN",
    password: "JaxisAdmin2026!",
  },
  {
    fullName: "CEO Owner",
    email: "ceo@jaxis.dev",
    role: "CEO",
    password: "JaxisCeo2026!",
  },
  {
    fullName: "Finance Officer",
    email: "finance@jaxis.dev",
    role: "FINANCE_OFFICER",
    password: "JaxisFin2026!",
  },
  {
    fullName: "Dr. Juan Reyes",
    email: "stat@jaxis.dev",
    role: "STATISTICIAN",
    password: "JaxisStat2026!",
  },
  {
    fullName: "QA Lead Maria",
    email: "qa@jaxis.dev",
    role: "SENIOR_QA_LEAD",
    password: "JaxisQA2026!",
  },
  {
    fullName: "Client Ana Cruz",
    email: "client@jaxis.dev",
    role: "CLIENT",
    password: "JaxisClient2026!",
  },
  {
    fullName: "Suspended Test User",
    email: "suspended@jaxis.dev",
    role: "CLIENT",
    password: "JaxisSuspended2026!",
    status: "SUSPENDED",
  },
];

async function main() {
  console.log("🌱 Seeding JAXIS StatLab core roles and accounts...");

  // 1. Upsert all 6 roles
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { label: role.label },
      create: {
        id: role.id,
        name: role.name,
        label: role.label,
      },
    });
  }
  console.log(`✅ Seeded ${roles.length} core roles.`);

  // 2. Fetch role mapping
  const roleRecords = await prisma.role.findMany();
  const roleMap = new Map(roleRecords.map((r) => [r.name, r.id]));

  // 3. Upsert all 6 test users with bcrypt saltRounds = 12
  const saltRounds = 12;

  for (const user of seedUsers) {
    const passwordHash = await bcrypt.hash(user.password, saltRounds);
    const roleId = roleMap.get(user.role);

    if (!roleId) {
      throw new Error(`Role ID not found for role name: ${user.role}`);
    }

    const upsertedUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        fullName: user.fullName,
        passwordHash,
        status: user.status ?? "ACTIVE",
      },
      create: {
        email: user.email,
        fullName: user.fullName,
        passwordHash,
        status: user.status ?? "ACTIVE",
      },
    });

    // Ensure UserRole junction entry exists
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: upsertedUser.id,
          roleId,
        },
      },
      update: {},
      create: {
        userId: upsertedUser.id,
        roleId,
      },
    });
  }

  console.log(`✅ Seeded ${seedUsers.length} test accounts across all 6 roles.`);

  // 4. Upsert StaffProfile for Statistician, QA Lead, and Finance Officer
  const seedStaffProfiles = [
    {
      email: "stat@jaxis.dev",
      specializations: ["Regression", "ANOVA", "SEM", "Factor Analysis", "Time Series"],
      bio: "Senior PhD statistician specializing in multivariate quantitative models, structural equation modeling, and APA-compliant statistical reporting.",
    },
    {
      email: "qa@jaxis.dev",
      specializations: ["Instrument Validation", "Descriptive Statistics", "Mixed Methods", "Reliability Analysis"],
      bio: "Senior QA Peer Review Lead ensuring data integrity, calculation verifiability, and methodological rigor across all statistical deliverables.",
    },
    {
      email: "finance@jaxis.dev",
      specializations: ["Escrow Management", "Ledger Auditing", "Disbursement Protocol"],
      bio: "Finance Officer overseeing institutional escrow vault release gates, dispute resolutions, and milestone disbursements.",
    },
  ];

  for (const staff of seedStaffProfiles) {
    const user = await prisma.user.findUnique({
      where: { email: staff.email },
    });

    if (user) {
      await prisma.staffProfile.upsert({
        where: { userId: user.id },
        update: {
          bio: staff.bio,
          specializations: staff.specializations,
        },
        create: {
          userId: user.id,
          bio: staff.bio,
          specializations: staff.specializations,
        },
      });
    }
  }

  console.log(`✅ Seeded ${seedStaffProfiles.length} staff profile records.`);

  // 5. Upsert ClientProfile for the main test Client
  const seedClientProfile = {
    email: "client@jaxis.dev",
    institutionSchool: "Stanford University",
    academicProgram: "Ph.D. in Organizational Psychology",
    contactNumber: "+15551234567",
    region: "NORTH_AMERICA",
  };

  const clientUser = await prisma.user.findUnique({
    where: { email: seedClientProfile.email },
  });

  if (clientUser) {
    await prisma.clientProfile.upsert({
      where: { userId: clientUser.id },
      update: {
        institutionSchool: seedClientProfile.institutionSchool,
        academicProgram: seedClientProfile.academicProgram,
        contactNumber: seedClientProfile.contactNumber,
        region: seedClientProfile.region,
      },
      create: {
        userId: clientUser.id,
        institutionSchool: seedClientProfile.institutionSchool,
        academicProgram: seedClientProfile.academicProgram,
        contactNumber: seedClientProfile.contactNumber,
        region: seedClientProfile.region,
      },
    });
    console.log(`✅ Seeded 1 client profile record.`);
  }

  // 6. Upsert Seed Project for Module 04
  if (clientUser) {
    await prisma.project.upsert({
      where: { intakeId: "JAXIS-202608-0001" },
      update: {
        researchTitle: "Impact of Study Habits on Academic Performance Among State University Students",
        researchQuestions: "Does study frequency significantly affect GPA? Is there a gender difference?",
        researchObjectives: "Determine relationship between study habits and GPA; identify moderating variables.",
        deadlineRequested: new Date("2026-09-15"),
        masterStatus: "UNDER_EVALUATION",
      },
      create: {
        intakeId: "JAXIS-202608-0001",
        clientId: clientUser.id,
        researchTitle: "Impact of Study Habits on Academic Performance Among State University Students",
        researchQuestions: "Does study frequency significantly affect GPA? Is there a gender difference?",
        researchObjectives: "Determine relationship between study habits and GPA; identify moderating variables.",
        deadlineRequested: new Date("2026-09-15"),
        masterStatus: "UNDER_EVALUATION",
      },
    });
    console.log(`✅ Seeded 1 sample project record for Module 04.`);
  }

  // 7. Upsert PackagePriceConfig for Module 05
  const packageConfigs = [
    {
      packageName: "JX_01_DATACHECK" as const,
      minPrice: 1000.0,
      maxPrice: 1000.0,
      isUpfront: true,
    },
    {
      packageName: "JX_02_START" as const,
      minPrice: 1500.0,
      maxPrice: 1800.0,
      isUpfront: true,
    },
    {
      packageName: "JX_03_CORE" as const,
      minPrice: 1800.0,
      maxPrice: 3000.0,
      isUpfront: false,
    },
    {
      packageName: "JX_04_ADVANCED" as const,
      minPrice: 3500.0,
      maxPrice: null,
      isUpfront: false,
    },
  ];

  for (const config of packageConfigs) {
    await prisma.packagePriceConfig.upsert({
      where: { packageName: config.packageName },
      update: {
        minPrice: config.minPrice,
        maxPrice: config.maxPrice,
        isUpfront: config.isUpfront,
      },
      create: {
        packageName: config.packageName,
        minPrice: config.minPrice,
        maxPrice: config.maxPrice,
        isUpfront: config.isUpfront,
      },
    });
  }

  console.log(`✅ Seeded ${packageConfigs.length} package price configuration guardrails.`);

  const philippineHolidays = [
    { date: new Date("2026-01-01T00:00:00Z"), name: "New Year's Day", type: "REGULAR" as const },
    { date: new Date("2026-04-02T00:00:00Z"), name: "Maundy Thursday", type: "REGULAR" as const },
    { date: new Date("2026-04-03T00:00:00Z"), name: "Good Friday", type: "REGULAR" as const },
    { date: new Date("2026-04-04T00:00:00Z"), name: "Black Saturday", type: "SPECIAL_NON_WORKING" as const },
    { date: new Date("2026-04-09T00:00:00Z"), name: "Araw ng Kagitingan", type: "REGULAR" as const },
    { date: new Date("2026-05-01T00:00:00Z"), name: "Labor Day", type: "REGULAR" as const },
    { date: new Date("2026-06-12T00:00:00Z"), name: "Independence Day", type: "REGULAR" as const },
    { date: new Date("2026-08-21T00:00:00Z"), name: "Ninoy Aquino Day", type: "SPECIAL_NON_WORKING" as const },
    { date: new Date("2026-08-31T00:00:00Z"), name: "National Heroes Day", type: "REGULAR" as const },
    { date: new Date("2026-11-01T00:00:00Z"), name: "All Saints' Day", type: "SPECIAL_NON_WORKING" as const },
    { date: new Date("2026-11-02T00:00:00Z"), name: "All Souls' Day", type: "SPECIAL_NON_WORKING" as const },
    { date: new Date("2026-11-30T00:00:00Z"), name: "Bonifacio Day", type: "REGULAR" as const },
    { date: new Date("2026-12-08T00:00:00Z"), name: "Feast of the Immaculate Conception", type: "SPECIAL_NON_WORKING" as const },
    { date: new Date("2026-12-24T00:00:00Z"), name: "Christmas Eve", type: "SPECIAL_NON_WORKING" as const },
    { date: new Date("2026-12-25T00:00:00Z"), name: "Christmas Day", type: "REGULAR" as const },
    { date: new Date("2026-12-30T00:00:00Z"), name: "Rizal Day", type: "REGULAR" as const },
    { date: new Date("2026-12-31T00:00:00Z"), name: "Last Day of the Year", type: "SPECIAL_NON_WORKING" as const },
  ];

  for (const holiday of philippineHolidays) {
    await prisma.philippineHoliday.upsert({
      where: { date: holiday.date },
      update: { name: holiday.name, type: holiday.type },
      create: holiday,
    });
  }

  console.log(`✅ Seeded ${philippineHolidays.length} Philippine holidays.`);

  // ─── Module 09: Demo Messages & Firewall Incidents ──────────────────────
  const sampleProject = await prisma.project.findFirst({
    where: { intakeId: "JAXIS-202608-0001" },
    include: { client: true },
  });

  const statUser = await prisma.user.findUnique({ where: { email: "stat@jaxis.dev" } });

  if (sampleProject && statUser) {
    const existingMsg = await prisma.message.findFirst({
      where: { projectId: sampleProject.id },
    });

    if (!existingMsg) {
      // 1. Initial Client Message
      await prisma.message.create({
        data: {
          projectId: sampleProject.id,
          senderId: sampleProject.clientId,
          senderRole: "CLIENT",
          content: "Hello! When can I expect the initial regression analysis to begin?",
          isBlocked: false,
          readReceipts: {
            create: [
              { userId: sampleProject.clientId },
              { userId: statUser.id },
            ],
          },
        },
      });

      // 2. Statistician Reply
      await prisma.message.create({
        data: {
          projectId: sampleProject.id,
          senderId: statUser.id,
          senderRole: "STATISTICIAN",
          content: "Hi Ana! I have thoroughly inspected your survey dataset and research objectives. I am starting the normality and regression diagnostics now.",
          isBlocked: false,
          readReceipts: {
            create: [
              { userId: statUser.id },
              { userId: sampleProject.clientId },
            ],
          },
        },
      });

        // 3. Blocked Message Incident (Firewall Demo)
        await prisma.message.create({
          data: {
            projectId: sampleProject.id,
            senderId: sampleProject.clientId,
            senderRole: "CLIENT",
            content: "Can we chat on WhatsApp or Telegram instead? My personal phone number is 09171234567.",
            isBlocked: true,
            blockedReason: "MESSAGING_APP",
            blockedLog: {
              create: {
                detectedPattern: "MESSAGING_APP",
                matchedText: "WhatsApp",
              },
            },
          },
        });
      }

      // ─── Module 10: Seed Analysis Files ──────────────────────────────────
      if (statUser) {
        await prisma.analysisFile.deleteMany({
          where: { projectId: sampleProject.id },
        });

        // 1. Excel Workbook v1 (Archived)
        await prisma.analysisFile.create({
          data: {
            projectId: sampleProject.id,
            statisticianId: statUser.id,
            fileName: "regression_output_v1.xlsx",
            filePath: `analysis/${sampleProject.id}/regression_output_v1.xlsx`,
            fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            fileSize: 45056,
            fileCategory: "EXCEL_WORKBOOK",
            version: 1,
            isCurrent: false,
            notes: "Initial regression run — pending review of outliers.",
            uploadedAt: new Date(Date.now() - 86400000),
          },
        });

        // 2. Excel Workbook v2 (Current)
        await prisma.analysisFile.create({
          data: {
            projectId: sampleProject.id,
            statisticianId: statUser.id,
            fileName: "regression_output_v2_corrected.xlsx",
            filePath: `analysis/${sampleProject.id}/regression_output_v2_corrected.xlsx`,
            fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            fileSize: 52224,
            fileCategory: "EXCEL_WORKBOOK",
            version: 2,
            isCurrent: true,
            notes: "Outliers addressed with robust standard errors. Regression + ANOVA complete.",
            uploadedAt: new Date(),
          },
        });

        // 3. R Script v1 (Current)
        await prisma.analysisFile.create({
          data: {
            projectId: sampleProject.id,
            statisticianId: statUser.id,
            fileName: "study_habits_analysis.R",
            filePath: `analysis/${sampleProject.id}/study_habits_analysis.R`,
            fileType: "text/x-r-source",
            fileSize: 12288,
            fileCategory: "R_OUTPUT",
            version: 1,
            isCurrent: true,
            notes: "Complete reproduction script with dplyr & ggplot2 diagnostic plots.",
            uploadedAt: new Date(),
          },
        });

        console.log("✅ Seeded Module 10 statistical analysis working files.");
      }

      // ─── Module 11: Seed Quality Assurance Data ──────────────────────────
      const qaUser = await prisma.user.findFirst({
        where: { userRoles: { some: { role: { name: "SENIOR_QA_LEAD" } } } },
      });

      if (qaUser) {
        // Set sample project to FOR_QA so it is active in the Senior QA queue
        await prisma.project.update({
          where: { id: sampleProject.id },
          data: {
            masterStatus: "FOR_QA",
          },
        });

        // Clean previous seed reviews
        await prisma.qAReview.deleteMany({
          where: { projectId: sampleProject.id },
        });

        console.log("✅ Seeded Module 11 QA verification data (Project set to FOR_QA).");
      }

      // ─── Module 12: Seed Deliverables & Released Project Data ────────────
      const adminUser = await prisma.user.findFirst({
        where: { email: "admin@jaxis.dev" },
      });

      if (adminUser && clientUser) {
        // 1. Packaged draft deliverables for sampleProject (JAXIS-202608-0001)
        await prisma.deliverable.deleteMany({
          where: { projectId: sampleProject.id },
        });

        await prisma.deliverable.createMany({
          data: [
            {
              projectId: sampleProject.id,
              category: "STATISTICAL_OUTPUT",
              fileName: "study_habits_regression_tables_final.xlsx",
              filePath: `deliverables/${sampleProject.id}/study_habits_regression_tables_final.xlsx`,
              fileSize: 64512,
              fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              uploadedBy: adminUser.id,
              isFinalReleased: false,
            },
            {
              projectId: sampleProject.id,
              category: "PDF_REPORT",
              fileName: "academic_performance_findings_report.pdf",
              filePath: `deliverables/${sampleProject.id}/academic_performance_findings_report.pdf`,
              fileSize: 1450000,
              fileType: "application/pdf",
              uploadedBy: adminUser.id,
              isFinalReleased: false,
            },
            {
              projectId: sampleProject.id,
              category: "RAW_DATA_CLEANED",
              fileName: "cleaned_survey_dataset_n250.csv",
              filePath: `deliverables/${sampleProject.id}/cleaned_survey_dataset_n250.csv`,
              fileSize: 88400,
              fileType: "text/csv",
              uploadedBy: adminUser.id,
              isFinalReleased: false,
            },
          ],
        });

        // 2. Upsert second completed & released project for Client Ana Cruz
        const deliveredProject = await prisma.project.upsert({
          where: { intakeId: "JAXIS-202608-0002" },
          update: {
            researchTitle: "Predictors of Patient Readmission in Tertiary Level Hospitals in Metro Manila",
            masterStatus: "DELIVERED",
            qaApproved: true,
            deliveredAt: new Date(Date.now() - 86400000), // 1 day ago
            filesPurgeAt: new Date(Date.now() + 89 * 86400000),
            revisionWindowExpiresAt: new Date(Date.now() + 2 * 86400000), // 2 days left
          },
          create: {
            intakeId: "JAXIS-202608-0002",
            clientId: clientUser.id,
            researchTitle: "Predictors of Patient Readmission in Tertiary Level Hospitals in Metro Manila",
            researchQuestions: "What clinical and socioeconomic variables predict 30-day unplanned readmissions?",
            researchObjectives: "Construct multivariable logistic regression model and evaluate receiver operating characteristics (ROC/AUC).",
            deadlineRequested: new Date("2026-08-20"),
            masterStatus: "DELIVERED",
            packageName: "JX_03_CORE",
            qaApproved: true,
            deliveredAt: new Date(Date.now() - 86400000),
            filesPurgeAt: new Date(Date.now() + 89 * 86400000),
            revisionWindowExpiresAt: new Date(Date.now() + 2 * 86400000),
          },
        });

        // Add released deliverables for JAXIS-202608-0002
        await prisma.deliverable.deleteMany({
          where: { projectId: deliveredProject.id },
        });

        await prisma.deliverable.createMany({
          data: [
            {
              projectId: deliveredProject.id,
              category: "STATISTICAL_OUTPUT",
              fileName: "patient_readmission_logistic_regression.xlsx",
              filePath: `deliverables/${deliveredProject.id}/patient_readmission_logistic_regression.xlsx`,
              fileSize: 84200,
              fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              uploadedBy: adminUser.id,
              isFinalReleased: true,
              releasedAt: new Date(Date.now() - 86400000),
              releasedBy: adminUser.id,
              downloadCount: 2,
            },
            {
              projectId: deliveredProject.id,
              category: "PDF_REPORT",
              fileName: "tertiary_hospital_readmission_study_report.pdf",
              filePath: `deliverables/${deliveredProject.id}/tertiary_hospital_readmission_study_report.pdf`,
              fileSize: 1850000,
              fileType: "application/pdf",
              uploadedBy: adminUser.id,
              isFinalReleased: true,
              releasedAt: new Date(Date.now() - 86400000),
              releasedBy: adminUser.id,
              downloadCount: 1,
            },
            {
              projectId: deliveredProject.id,
              category: "APPENDIX",
              fileName: "roc_curves_and_odds_ratios_appendix.pdf",
              filePath: `deliverables/${deliveredProject.id}/roc_curves_and_odds_ratios_appendix.pdf`,
              fileSize: 520000,
              fileType: "application/pdf",
              uploadedBy: adminUser.id,
              isFinalReleased: true,
              releasedAt: new Date(Date.now() - 86400000),
              releasedBy: adminUser.id,
              downloadCount: 0,
            },
          ],
        });

        // Seed sample Revision Request for JAXIS-202608-0002
        await prisma.revisionRequest.deleteMany({
          where: { projectId: deliveredProject.id },
        });

        await prisma.revisionRequest.create({
          data: {
            projectId: deliveredProject.id,
            clientId: clientUser.id,
            description: "Please re-label Table 3 Odds Ratios from 90% confidence intervals to standard 95% confidence intervals as requested by our thesis defense panel.",
            requestedSections: "Chapter 4 - Table 3 (Multivariable Odds Ratios)",
            status: "PENDING_REVIEW",
            createdAt: new Date(),
          },
        });

        console.log("✅ Seeded Module 12 Deliverables packaging and Revision triage records.");
      }
    }
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
