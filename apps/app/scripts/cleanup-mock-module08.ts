import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanupMockModule08() {
  console.log("🧹 Starting Module 08 Mock Data Cleanup...");

  // 1. Delete all mock assignments
  const mockProjects = await prisma.project.findMany({
    where: {
      intakeId: { startsWith: "JAXIS-MOCK-" },
    },
    select: { id: true, intakeId: true },
  });

  const projectIds = mockProjects.map((p) => p.id);

  if (projectIds.length > 0) {
    const deletedHistory = await prisma.assignmentHistory.deleteMany({
      where: { projectId: { in: projectIds } },
    });
    console.log(`🗑️ Deleted ${deletedHistory.count} mock assignment history records.`);

    const deletedAssignments = await prisma.assignment.deleteMany({
      where: { projectId: { in: projectIds } },
    });
    console.log(`🗑️ Deleted ${deletedAssignments.count} mock assignment records.`);

    const deletedProjects = await prisma.project.deleteMany({
      where: { id: { in: projectIds } },
    });
    console.log(`🗑️ Deleted ${deletedProjects.count} mock projects.`);
  } else {
    console.log("ℹ️ No mock projects found.");
  }

  // 2. Delete all mock staff & client users
  const mockUsers = await prisma.user.findMany({
    where: {
      email: { endsWith: "@mock.jaxis.dev" },
    },
    select: { id: true, email: true },
  });

  const userIds = mockUsers.map((u) => u.id);

  if (userIds.length > 0) {
    // Delete roles, profiles, logs
    await prisma.userRole.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.staffProfile.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.clientProfile.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.authAuditLog.deleteMany({ where: { userId: { in: userIds } } });

    const deletedUsers = await prisma.user.deleteMany({
      where: { id: { in: userIds } },
    });
    console.log(`🗑️ Deleted ${deletedUsers.count} mock users.`);
  } else {
    console.log("ℹ️ No mock users found.");
  }

  console.log("✨ Cleanup completed! Workspace is restored to pristine production state.");
}

cleanupMockModule08()
  .catch((e) => {
    console.error("❌ Error cleaning up mock data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
