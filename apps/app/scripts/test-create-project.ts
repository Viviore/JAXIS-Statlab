import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const prisma = new PrismaClient();

async function main() {
  console.log("Testing project creation directly in PostgreSQL...");

  const user = await prisma.user.findFirst({
    where: { email: "s.sudario.negie@cmu.edu.ph" },
  });
  console.log("Client user:", user);

  if (!user) {
    console.error("User not found!");
    return;
  }

  // Check client profile
  let profile = await prisma.clientProfile.findUnique({
    where: { userId: user.id },
  });
  console.log("Existing profile:", profile);

  if (!profile) {
    console.log("Creating profile for user...");
    profile = await prisma.clientProfile.create({
      data: {
        userId: user.id,
        institutionSchool: "Central Mindanao University",
        academicProgram: "BS Agriculture",
        contactNumber: "+63 917 123 4567",
        region: "Region X - Northern Mindanao",
      },
    });
    console.log("Created profile:", profile);
  }

  // Test creating a project in transaction like createProject does
  try {
    const intakeId = `JAXIS-202609-${Math.floor(1000 + Math.random() * 9000)}`;
    const deadlineDate = new Date(Date.now() + 7 * 86400000);

    const project = await prisma.$transaction(async (tx) => {
      const createdProj = await tx.project.create({
        data: {
          intakeId,
          clientId: user.id,
          researchTitle: "Diagnostic Speed Evaluation Test Study",
          researchQuestions: "1. What is the impact?\n2. What is the difference?",
          researchObjectives: "1. To evaluate the impact.\n2. To measure the difference.",
          hypotheses: "There is a significant difference.",
          deadlineRequested: deadlineDate,
          masterStatus: "NEW_REQUEST",
          files: {
            create: [
              {
                fileName: "draft_manuscript.docx",
                filePath: "studies/intake/draft_manuscript.docx",
                fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                fileCategory: "RESEARCH_DOCUMENT",
              },
            ],
          },
        },
      });

      console.log("Successfully created project in tx:", createdProj.id, createdProj.intakeId);

      // In-app alert
      const adminUsers = await tx.user.findMany({
        where: {
          userRoles: {
            some: {
              role: {
                name: { in: ["ADMIN", "CEO"] },
              },
            },
          },
        },
        select: {
          id: true,
          email: true,
          userRoles: { select: { role: { select: { name: true } } } },
        },
      });

      console.log("Found admin users for alerts:", adminUsers.length);

      if (adminUsers.length > 0) {
        await tx.inAppAlert.createMany({
          data: adminUsers.map((admin) => ({
            recipientId: admin.id,
            recipientRole: (admin.userRoles[0]?.role.name || "ADMIN") as any,
            alertType: "NEW_INTAKE",
            projectId: createdProj.id,
            message: `New study intake received: ${createdProj.intakeId} — "${createdProj.researchTitle}"`,
            linkUrl: "/dashboard/admin/intake",
            isRead: false,
          })),
        });
        console.log("Created in-app alerts for admins.");
      }

      // Audit log
      await tx.auditLog.create({
        data: {
          projectId: createdProj.id,
          actorId: user.id,
          actorRole: "CLIENT",
          action: "INTAKE_SUBMITTED",
          newValue: "NEW_REQUEST",
          reason: "Client submitted new research study specifications",
          metadata: {
            intakeId: createdProj.intakeId,
            researchTitle: createdProj.researchTitle,
          },
        },
      });
      console.log("Created audit log.");

      return createdProj;
    });

    console.log("Transaction succeeded! Project ID:", project.id, project.intakeId);

    // Verify querying project as client
    const clientProjects = await prisma.project.findMany({
      where: { clientId: user.id },
    });
    console.log("Queried projects for client:", clientProjects.length);

    // Verify querying project as admin
    const adminProjects = await prisma.project.findMany({
      where: { masterStatus: { in: ["NEW_REQUEST", "AWAITING_INFORMATION"] } },
    });
    console.log("Queried projects for admin triage:", adminProjects.length);

  } catch (err) {
    console.error("Transaction FAILED:", err);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
