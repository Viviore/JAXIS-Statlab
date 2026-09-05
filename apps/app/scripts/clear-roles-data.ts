import { PrismaClient } from "@prisma/client";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const prisma = new PrismaClient();

const CORE_EMAILS = [
  "admin@jaxis.dev",
  "ceo@jaxis.dev",
  "finance@jaxis.dev",
  "stat@jaxis.dev",
  "qa@jaxis.dev",
  "client@jaxis.dev",
];

async function deleteFromR2(keys: string[]) {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME || "jaxis-vault";

  if (!accountId || !accessKeyId || !secretAccessKey) {
    console.log("⚠️ Cloudflare R2 credentials not set. Skipping physical R2 deletion.");
    return 0;
  }

  const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  let count = 0;
  for (const key of keys) {
    if (!key) continue;
    try {
      await s3.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key }));
      count++;
    } catch (err) {
      console.warn(`Could not delete R2 object ${key}:`, err);
    }
  }
  return count;
}

async function main() {
  console.log("==================================================================");
  console.log("🧹 JAXIS StatLab — Comprehensive Data Cleanup Across All Roles");
  console.log("==================================================================");

  try {
    // 1. Gather R2 storage file paths from ProjectFile and Deliverable
    console.log("🔍 Checking cloud file storage keys...");
    const projectFiles = await prisma.projectFile.findMany({ select: { filePath: true } });
    const deliverables = await prisma.deliverable.findMany({ select: { filePath: true } });
    const allKeys = [
      ...projectFiles.map((f) => f.filePath),
      ...deliverables.map((d) => d.filePath),
    ].filter(Boolean);

    if (allKeys.length > 0) {
      console.log(`📦 Found ${allKeys.length} files in R2 storage. Purging objects...`);
      const r2Deleted = await deleteFromR2(allKeys);
      console.log(`✅ Deleted ${r2Deleted} raw files from Cloudflare R2.`);
    } else {
      console.log("✅ Cloudflare R2 is already clean (0 files).");
    }

    // 2. Clear Operations, Projects, and Deliverables
    console.log("\n🧹 Purging project deliverables, analysis outputs, and files...");
    const delDeliverables = await prisma.deliverable.deleteMany({});
    const delProjectFiles = await prisma.projectFile.deleteMany({});
    const delAnalysisFiles = await prisma.analysisFile.deleteMany({});
    const delRevisionReqs = await prisma.revisionRequest.deleteMany({});
    const delScopeCreep = await prisma.scopeCreepLog.deleteMany({});
    const delQAReviews = await prisma.qAReview.deleteMany({});
    const delQARejections = await prisma.qARejectionCount.deleteMany({});
    const delDefenseLab = await prisma.defenseLabSession.deleteMany({});

    console.log(`  - Deliverables removed: ${delDeliverables.count}`);
    console.log(`  - Project files removed: ${delProjectFiles.count}`);
    console.log(`  - QA reviews removed: ${delQAReviews.count}`);
    console.log(`  - DefenseLab sessions removed: ${delDefenseLab.count}`);

    // 3. Clear Financials, Invoices, Ledgers, and Disputes
    console.log("\n💰 Purging financial ledgers, payouts, payments, and disputes...");
    const delPayouts = await prisma.payout.deleteMany({});
    const delLedgers = await prisma.financialLedger.deleteMany({});
    const delPaymentProofs = await prisma.paymentProof.deleteMany({});
    const delPayments = await prisma.payment.deleteMany({});
    const delDisputes = await prisma.dispute.deleteMany({});
    const delSows = await prisma.sOW.deleteMany({});
    const delLineItems = await prisma.quotationLineItem.deleteMany({});
    const delQuotations = await prisma.quotation.deleteMany({});

    console.log(`  - Payouts removed: ${delPayouts.count}`);
    console.log(`  - Financial ledgers removed: ${delLedgers.count}`);
    console.log(`  - Payments removed: ${delPayments.count}`);
    console.log(`  - Disputes removed: ${delDisputes.count}`);
    console.log(`  - Quotations & SOWs removed: ${delQuotations.count + delSows.count}`);

    // 4. Clear Specialist Assignments & Timesheets
    console.log("\n📋 Purging specialist assignments and attendance timesheets...");
    const delAssignHist = await prisma.assignmentHistory.deleteMany({});
    const delAssignments = await prisma.assignment.deleteMany({});
    const delAttendanceCorr = await prisma.attendanceCorrectionRequest.deleteMany({});
    const delAttendance = await prisma.staffAttendanceLog.deleteMany({});

    console.log(`  - Assignments removed: ${delAssignments.count}`);
    console.log(`  - Assignment history removed: ${delAssignHist.count}`);
    console.log(`  - Attendance timesheet logs removed: ${delAttendance.count}`);

    // 5. Clear Communications, Alerts, and Logs
    console.log("\n💬 Purging chat messages, in-app alerts, and notification logs...");
    const delReadReceipts = await prisma.messageReadReceipt.deleteMany({});
    const delBlockedMsg = await prisma.blockedMessageLog.deleteMany({});
    const delMessages = await prisma.message.deleteMany({});
    const delInAppAlerts = await prisma.inAppAlert.deleteMany({});
    const delNotifLogs = await prisma.notificationLog.deleteMany({});
    const delAuditLogs = await prisma.auditLog.deleteMany({});
    const delArchived = await prisma.archivedProject.deleteMany({});
    const delDataDeletion = await prisma.dataDeletionRequest.deleteMany({});

    console.log(`  - Chat messages removed: ${delMessages.count}`);
    console.log(`  - In-app alerts removed: ${delInAppAlerts.count}`);
    console.log(`  - Notification logs removed: ${delNotifLogs.count}`);
    console.log(`  - Audit logs removed: ${delAuditLogs.count}`);

    // 6. Delete all Projects
    console.log("\n📁 Purging all project records...");
    const delProjects = await prisma.project.deleteMany({});
    console.log(`  - Projects removed: ${delProjects.count}`);

    // 7. Clean up non-core test users
    console.log("\n👥 Cleaning test/mock accounts (preserving 6 primary core roles)...");
    const extraUsers = await prisma.user.findMany({
      where: { email: { notIn: CORE_EMAILS } },
      select: { id: true, email: true },
    });

    const extraUserIds = extraUsers.map((u) => u.id);
    if (extraUserIds.length > 0) {
      await prisma.userRole.deleteMany({ where: { userId: { in: extraUserIds } } });
      await prisma.staffProfile.deleteMany({ where: { userId: { in: extraUserIds } } });
      await prisma.clientProfile.deleteMany({ where: { userId: { in: extraUserIds } } });
      await prisma.authAuditLog.deleteMany({ where: { userId: { in: extraUserIds } } });
      await prisma.suspensionLog.deleteMany({ where: { userId: { in: extraUserIds } } });

      const delUsers = await prisma.user.deleteMany({
        where: { id: { in: extraUserIds } },
      });
      console.log(`  - Removed ${delUsers.count} extra test accounts.`);
    } else {
      console.log("  - No extra accounts to remove.");
    }

    // 8. Restore the 6 core users to pristine ACTIVE status
    console.log("\n🔒 Ensuring all 6 core role accounts are ACTIVE and ready...");
    await prisma.user.updateMany({
      where: { email: { in: CORE_EMAILS } },
      data: { status: "ACTIVE" },
    });

    const coreUsers = await prisma.user.findMany({
      where: { email: { in: CORE_EMAILS } },
      select: { fullName: true, email: true },
    });

    console.log("==================================================================");
    console.log("✨ ALL ROLES DATA SUCCESSFULLY CLEARED!");
    console.log("==================================================================");
    console.log("The following 6 core role logins remain 100% active with empty desks:");
    coreUsers.forEach((u) => console.log(`  ✓ ${u.fullName} (${u.email})`));
    console.log("\nEvery dashboard (CEO, Admin, Finance, Statistician, QA, Client) is now completely clean.");
  } catch (err) {
    console.error("❌ Error during data cleanup:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
