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
        status: "ACTIVE",
      },
      create: {
        email: user.email,
        fullName: user.fullName,
        passwordHash,
        status: "ACTIVE",
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
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
