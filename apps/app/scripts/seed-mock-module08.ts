import { PrismaClient, RoleName, ProjectStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seedMockModule08() {
  console.log("🚀 Starting Module 08 Mock Data Seeding for QA Simulation...");

  const saltRounds = 10;
  const defaultPassword = await bcrypt.hash("JaxisTest2026!", saltRounds);

  // 1. Roles mapping
  const roles = await prisma.role.findMany();
  const roleMap = new Map(roles.map((r) => [r.name, r.id]));

  const statRoleId = roleMap.get(RoleName.STATISTICIAN);
  const qaRoleId = roleMap.get(RoleName.SENIOR_QA_LEAD);
  const clientRoleId = roleMap.get(RoleName.CLIENT);
  const adminUser = await prisma.user.findFirst({ where: { email: "admin@jaxis.dev" } });

  if (!statRoleId || !qaRoleId || !clientRoleId || !adminUser) {
    throw new Error("Base roles or Admin user missing. Please run base seed first.");
  }

  // 2. Create Mock Statisticians with distinct specializations
  const mockStatisticians = [
    {
      fullName: "Dr. Eleanor Vance",
      email: "stat.bio@mock.jaxis.dev",
      specializations: ["Biostatistics", "Survival Analysis", "Clinical Trials", "R"],
      bio: "12+ years in clinical trial protocol design and Cox proportional hazards modeling.",
    },
    {
      fullName: "Dr. Marco Rossi",
      email: "stat.econ@mock.jaxis.dev",
      specializations: ["Econometrics", "Structural Equation Modeling", "Panel Data", "Stata"],
      bio: "Specialist in macroeconomic time-series, GMM, and latent variable path modeling.",
    },
    {
      fullName: "Prof. Sofia Benitez",
      email: "stat.psych@mock.jaxis.dev",
      specializations: ["Psychometrics", "Factor Analysis", "Item Response Theory", "SPSS"],
      bio: "Expert in scale reliability validation, exploratory factor analysis, and Rasch models.",
    },
    {
      fullName: "Engr. Liam Chen",
      email: "stat.ml@mock.jaxis.dev",
      specializations: ["Predictive Analytics", "Machine Learning", "Bayesian Statistics", "Python"],
      bio: "Focus on random forests, gradient boosting, and Markov Chain Monte Carlo estimations.",
    },
  ];

  const createdStats: Record<string, string> = {};

  for (const s of mockStatisticians) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: { fullName: s.fullName, status: "ACTIVE" },
      create: {
        fullName: s.fullName,
        email: s.email,
        passwordHash: defaultPassword,
        status: "ACTIVE",
        userRoles: {
          create: { roleId: statRoleId },
        },
        staffProfile: {
          create: {
            bio: s.bio,
            specializations: s.specializations,
          },
        },
      },
    });
    createdStats[s.email] = user.id;
  }
  console.log(`✅ Seeded ${mockStatisticians.length} Mock Statisticians.`);

  // 3. Create Mock QA Leads
  const mockQAs = [
    {
      fullName: "Dr. Clarissa Ocampo",
      email: "qa.apa@mock.jaxis.dev",
      specializations: ["APA 7th Format Audit", "Hypothesis Reproducibility", "Peer Review"],
      bio: "Editorial reviewer for international peer-reviewed journals. Zero tolerance for APA inconsistencies.",
    },
    {
      fullName: "Prof. Roland Reyes",
      email: "qa.meta@mock.jaxis.dev",
      specializations: ["Dual-Blind Calculation", "Meta-Analysis Verification", "Syntax Reproducibility"],
      bio: "Specializes in code rerun audits and independent re-estimation of inferential matrices.",
    },
  ];

  const createdQAs: Record<string, string> = {};

  for (const q of mockQAs) {
    const user = await prisma.user.upsert({
      where: { email: q.email },
      update: { fullName: q.fullName, status: "ACTIVE" },
      create: {
        fullName: q.fullName,
        email: q.email,
        passwordHash: defaultPassword,
        status: "ACTIVE",
        userRoles: {
          create: { roleId: qaRoleId },
        },
        staffProfile: {
          create: {
            bio: q.bio,
            specializations: q.specializations,
          },
        },
      },
    });
    createdQAs[q.email] = user.id;
  }
  console.log(`✅ Seeded ${mockQAs.length} Mock QA Leads.`);

  // 4. Create Mock Client User
  const mockClient = await prisma.user.upsert({
    where: { email: "client.research@mock.jaxis.dev" },
    update: { fullName: "Dr. Patricia Gomez", status: "ACTIVE" },
    create: {
      fullName: "Dr. Patricia Gomez",
      email: "client.research@mock.jaxis.dev",
      passwordHash: defaultPassword,
      status: "ACTIVE",
      userRoles: {
        create: { roleId: clientRoleId },
      },
      clientProfile: {
        create: {
          institutionSchool: "University of the Philippines Diliman",
          academicProgram: "Doctor of Public Health",
          contactNumber: "+639178889999",
          region: "NCR",
        },
      },
    },
  });

  const now = new Date();

  // Helper date generators
  const daysFromNow = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    return d;
  };
  const hoursFromNow = (hours: number) => {
    const d = new Date(now);
    d.setHours(d.getHours() + hours);
    return d;
  };
  const daysAgo = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d;
  };

  // 5. Mock Study Scenarios
  const mockProjects = [
    // Scenario 1: Awaiting Assignment (ACTIVE, Downpayment Cleared)
    {
      intakeId: "JAXIS-MOCK-0001",
      title: "Impact of Microfinance Intervention Models on Rural Household Economic Resilience",
      field: "Econometrics",
      package: "JX_03_CORE",
      status: ProjectStatus.ACTIVE,
      hasAssignment: false,
    },
    // Scenario 2: On Schedule (5 days remaining)
    {
      intakeId: "JAXIS-MOCK-0002",
      title: "Pharmacogenomic Biomarkers and Survival Rates in Pediatric Acute Leukemia",
      field: "Biostatistics",
      package: "JX_04_ADVANCED",
      status: ProjectStatus.EXPERT_ASSIGNED,
      hasAssignment: true,
      statEmail: "stat.bio@mock.jaxis.dev",
      qaEmail: "qa.apa@mock.jaxis.dev",
      slaStartAt: daysAgo(1),
      slaDueAt: daysFromNow(5),
      isPaused: false,
    },
    // Scenario 3: Pre-Deadline Urgent Alert (<24h remaining)
    {
      intakeId: "JAXIS-MOCK-0003",
      title: "Urban Housing Price Elasticity and Land Banking Speculation in Metro Manila",
      field: "Econometrics",
      package: "JX_03_CORE",
      status: ProjectStatus.IN_PROGRESS,
      hasAssignment: true,
      statEmail: "stat.econ@mock.jaxis.dev",
      qaEmail: "qa.meta@mock.jaxis.dev",
      slaStartAt: daysAgo(4),
      slaDueAt: hoursFromNow(16), // 16 hours left!
      isPaused: false,
    },
    // Scenario 4: Overdue Contractual Breach Alert
    {
      intakeId: "JAXIS-MOCK-0004",
      title: "Psychometric Invariance of the Academic Burnout Inventory Across ASEAN Universities",
      field: "Psychometrics",
      package: "JX_03_CORE",
      status: ProjectStatus.IN_PROGRESS,
      hasAssignment: true,
      statEmail: "stat.psych@mock.jaxis.dev",
      qaEmail: "qa.apa@mock.jaxis.dev",
      slaStartAt: daysAgo(8),
      slaDueAt: daysAgo(2), // 2 days overdue!
      isPaused: false,
    },
    // Scenario 5: SLA Paused (Timer Frozen)
    {
      intakeId: "JAXIS-MOCK-0005",
      title: "Real-Time Anomaly Detection in High-Frequency FinTech Streaming Architectures",
      field: "Predictive Analytics",
      package: "JX_04_ADVANCED",
      status: ProjectStatus.SLA_PAUSED,
      hasAssignment: true,
      statEmail: "stat.ml@mock.jaxis.dev",
      qaEmail: "qa.meta@mock.jaxis.dev",
      slaStartAt: daysAgo(5),
      slaDueAt: daysFromNow(3),
      isPaused: true,
      slaPausedAt: daysAgo(1),
      slaPauseReason: "Awaiting clean dataset with timestamped transaction identifiers from researcher.",
    },
  ];

  for (const p of mockProjects) {
    const project = await prisma.project.upsert({
      where: { intakeId: p.intakeId },
      update: {
        researchTitle: p.title,
        masterStatus: p.status,
        packageName: p.package,
      },
      create: {
        intakeId: p.intakeId,
        clientId: mockClient.id,
        researchTitle: p.title,
        researchQuestions: "1. What is the primary statistical effect? 2. Are variances homogeneous?",
        researchObjectives: "Establish empirical significance at alpha = 0.05.",
        hypotheses: "Null hypothesis: No significant variance between treatment arms.",
        deadlineRequested: daysFromNow(14),
        masterStatus: p.status,
        packageName: p.package,
      },
    });

    if (p.hasAssignment && p.statEmail && p.qaEmail) {
      const statId = createdStats[p.statEmail];
      const qaId = createdQAs[p.qaEmail];
      if (!statId || !qaId) continue;

      await prisma.assignment.upsert({
        where: { projectId: project.id },
        update: {
          statisticianId: statId,
          qaLeadId: qaId,
          assignedBy: adminUser.id,
          slaStartAt: p.slaStartAt,
          slaDueAt: p.slaDueAt,
          slaPausedAt: p.isPaused ? p.slaPausedAt : null,
          slaPauseReason: p.isPaused ? p.slaPauseReason : null,
          slaPausedBy: p.isPaused ? statId : null,
          slaApprovedBy: p.isPaused ? adminUser.id : null,
          isActive: true,
        },
        create: {
          projectId: project.id,
          statisticianId: statId,
          qaLeadId: qaId,
          assignedBy: adminUser.id,
          slaStartAt: p.slaStartAt,
          slaDueAt: p.slaDueAt,
          slaPausedAt: p.isPaused ? p.slaPausedAt : null,
          slaPauseReason: p.isPaused ? p.slaPauseReason : null,
          slaPausedBy: p.isPaused ? statId : null,
          slaApprovedBy: p.isPaused ? adminUser.id : null,
          isActive: true,
        },
      });
    }
  }

  console.log(`✅ Seeded ${mockProjects.length} Mock Studies across all SLA states.`);
  console.log("🎉 Module 08 Mock Data successfully populated!");
}

seedMockModule08()
  .catch((e) => {
    console.error("❌ Error seeding Module 08 mock data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
