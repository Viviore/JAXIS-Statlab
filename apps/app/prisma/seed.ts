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
    fullName: "Super Admin",
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
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
