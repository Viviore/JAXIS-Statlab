import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedDefenseLabForAnna() {
  console.log("🌱 Seeding DefenseLab mockup data for Client Ana Cruz...");

  // 1. Find Client Ana Cruz
  const clientUser = await prisma.user.findFirst({
    where: { email: "client@jaxis.dev" },
  });

  if (!clientUser) {
    console.error("❌ Client Ana Cruz (client@jaxis.dev) not found.");
    return;
  }

  // 2. Find Assigned Statistician (Dr. Juan Reyes)
  const statUser = await prisma.user.findFirst({
    where: { email: "stat@jaxis.dev" },
  });

  if (!statUser) {
    console.error("❌ Statistician Dr. Juan Reyes (stat@jaxis.dev) not found.");
    return;
  }

  // 3. Find or Create Project for Ana
  let project = await prisma.project.findFirst({
    where: { clientId: clientUser.id },
    include: { quotations: { include: { lineItems: true } }, assignment: true, payments: true },
  });

  if (!project) {
    project = await prisma.project.create({
      data: {
        intakeId: "JAXIS-202608-0001",
        clientId: clientUser.id,
        researchTitle: "Impact of Study Habits on Academic Performance Among State University Students",
        researchQuestions: "Does study frequency significantly affect GPA? Is there a gender difference?",
        researchObjectives: "Determine relationship between study habits and GPA; identify moderating variables.",
        deadlineRequested: new Date("2026-09-15"),
        masterStatus: "IN_PROGRESS",
      },
      include: { quotations: { include: { lineItems: true } }, assignment: true, payments: true },
    });
  }

  // 4. Ensure Quotation with DEFENSELAB Add-on exists
  let quote = project.quotations.find((q) =>
    q.lineItems.some((li) => li.itemName === "DEFENSELAB")
  );

  if (!quote) {
    quote = await prisma.quotation.create({
      data: {
        projectId: project.id,
        packageName: "JX_03_CORE",
        basePrice: 2500.0,
        totalAmount: 3000.0,
        downpaymentRequired: 1500.0,
        expiresAt: new Date(Date.now() + 86400000 * 7),
        status: "CLIENT_APPROVED",
        createdBy: "system-seed",
        lineItems: {
          create: [
            {
              itemType: "PACKAGE",
              itemName: "JX_03_CORE",
              description: "Core Quantitative Statistical Analysis",
              amount: 2500.0,
            },
            {
              itemType: "ADDON",
              itemName: "DEFENSELAB",
              description: "DefenseLab Mock Panel Oral Defense Rehearsal (2 Hours)",
              amount: 500.0,
            },
          ],
        },
      },
      include: { lineItems: true },
    });
  }

  // 5. Ensure Assignment exists
  if (!project.assignment) {
    await prisma.assignment.upsert({
      where: { projectId: project.id },
      update: {
        statisticianId: statUser.id,
        qaLeadId: (await prisma.user.findFirst({ where: { email: "qa@jaxis.dev" } }))?.id || statUser.id,
        assignedBy: "admin",
        slaStartAt: new Date(),
        slaDueAt: new Date(Date.now() + 86400000 * 10),
      },
      create: {
        projectId: project.id,
        statisticianId: statUser.id,
        qaLeadId: (await prisma.user.findFirst({ where: { email: "qa@jaxis.dev" } }))?.id || statUser.id,
        assignedBy: "admin",
        slaStartAt: new Date(),
        slaDueAt: new Date(Date.now() + 86400000 * 10),
      },
    });
  }

  // 6. Ensure Payment exists
  if (project.payments.length === 0) {
    await prisma.payment.create({
      data: {
        projectId: project.id,
        quotationId: quote.id,
        paymentType: "FULL",
        paymentMethod: "GCASH",
        amountSubmitted: 3000.0,
        balancePaidTotal: 3000.0,
        referenceNumber: "GCASH-9988223311",
        paymentStatus: "FULLY_PAID",
        verifiedAt: new Date(),
      },
    });
  }

  // 7. Clear old seed sessions for clean state
  await prisma.defenseLabSession.deleteMany({
    where: { projectId: project.id },
  });

  // 8. Seed Upcoming Rehearsal Session
  const upcomingDate = new Date();
  upcomingDate.setDate(upcomingDate.getDate() + 2);
  upcomingDate.setHours(14, 0, 0, 0);

  const session1 = await prisma.defenseLabSession.create({
    data: {
      projectId: project.id,
      clientId: clientUser.id,
      expertId: statUser.id,
      scheduledAt: upcomingDate,
      durationHours: 1,
      amountPaid: 250.0,
      status: "SCHEDULED",
      meetingUrl: "https://meet.google.com/jaxis-mock-defense-anna",
      notes: "Drill down on ANOVA assumptions, regression coefficient interpretation, and panel defense responses.",
    },
  });

  // 9. Seed Completed Rehearsal Session
  const completedDate = new Date();
  completedDate.setDate(completedDate.getDate() - 3);
  completedDate.setHours(10, 0, 0, 0);

  const session2 = await prisma.defenseLabSession.create({
    data: {
      projectId: project.id,
      clientId: clientUser.id,
      expertId: statUser.id,
      scheduledAt: completedDate,
      durationHours: 1,
      amountPaid: 250.0,
      status: "COMPLETED",
      meetingUrl: "https://meet.google.com/jaxis-mock-defense-anna-p1",
      recordingUrl: "https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9-jaxis-defense-rehearsal-anna/view",
      completedAt: completedDate,
      completedBy: statUser.id,
      notes: "Part 1 Rehearsal: Strong command of Chapter 3 methodology. Recommended refining rationale for purposive sampling.",
    },
  });

  console.log(`✅ Successfully seeded 2 DefenseLab mock defense sessions for Client Ana Cruz:`);
  console.log(`   - Session 1 (Upcoming): ${session1.id} on ${upcomingDate.toLocaleString()}`);
  console.log(`   - Session 2 (Completed with Recording): ${session2.id} on ${completedDate.toLocaleString()}`);
}

seedDefenseLabForAnna()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
