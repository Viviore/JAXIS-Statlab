import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("==================================================================");
  console.log("🧹 JAXIS StatLab — Purging ALL Study Mockup Data");
  console.log("==================================================================");

  try {
    // 1. Purge all related project records in relational order
    const deliverables = await prisma.deliverable.deleteMany({});
    console.log(`  - Deleted ${deliverables.count} deliverables`);

    const analysisFiles = await prisma.analysisFile.deleteMany({});
    console.log(`  - Deleted ${analysisFiles.count} analysis files`);

    const projectFiles = await prisma.projectFile.deleteMany({});
    console.log(`  - Deleted ${projectFiles.count} project files`);

    const revisionRequests = await prisma.revisionRequest.deleteMany({});
    console.log(`  - Deleted ${revisionRequests.count} revision requests`);

    const scopeCreepLogs = await prisma.scopeCreepLog.deleteMany({});
    console.log(`  - Deleted ${scopeCreepLogs.count} scope creep logs`);

    const qaReviews = await prisma.qAReview.deleteMany({});
    console.log(`  - Deleted ${qaReviews.count} QA reviews`);

    const qaRejections = await prisma.qARejectionCount.deleteMany({});
    console.log(`  - Deleted ${qaRejections.count} QA rejections`);

    const defenseLabSessions = await prisma.defenseLabSession.deleteMany({});
    console.log(`  - Deleted ${defenseLabSessions.count} defense lab sessions`);

    const payouts = await prisma.payout.deleteMany({});
    console.log(`  - Deleted ${payouts.count} payouts`);

    const financialLedgers = await prisma.financialLedger.deleteMany({});
    console.log(`  - Deleted ${financialLedgers.count} financial ledger entries`);

    const disputes = await prisma.dispute.deleteMany({});
    console.log(`  - Deleted ${disputes.count} disputes`);

    const paymentProofs = await prisma.paymentProof.deleteMany({});
    console.log(`  - Deleted ${paymentProofs.count} payment proofs`);

    const payments = await prisma.payment.deleteMany({});
    console.log(`  - Deleted ${payments.count} payments`);

    const sows = await prisma.sOW.deleteMany({});
    console.log(`  - Deleted ${sows.count} SOWs`);

    const quoteItems = await prisma.quotationLineItem.deleteMany({});
    console.log(`  - Deleted ${quoteItems.count} quotation line items`);

    const quotations = await prisma.quotation.deleteMany({});
    console.log(`  - Deleted ${quotations.count} quotations`);

    const assignmentHistories = await prisma.assignmentHistory.deleteMany({});
    console.log(`  - Deleted ${assignmentHistories.count} assignment histories`);

    const assignments = await prisma.assignment.deleteMany({});
    console.log(`  - Deleted ${assignments.count} assignments`);

    const readReceipts = await prisma.messageReadReceipt.deleteMany({});
    console.log(`  - Deleted ${readReceipts.count} message read receipts`);

    const blockedMessages = await prisma.blockedMessageLog.deleteMany({});
    console.log(`  - Deleted ${blockedMessages.count} blocked messages`);

    const messages = await prisma.message.deleteMany({});
    console.log(`  - Deleted ${messages.count} messages`);

    const alerts = await prisma.inAppAlert.deleteMany({});
    console.log(`  - Deleted ${alerts.count} in-app alerts`);

    const notifications = await prisma.notificationLog.deleteMany({});
    console.log(`  - Deleted ${notifications.count} notification logs`);

    const archived = await prisma.archivedProject.deleteMany({});
    console.log(`  - Deleted ${archived.count} archived projects`);

    const projects = await prisma.project.deleteMany({});
    console.log(`  - Deleted ${projects.count} projects`);

    console.log("✅ Cleared all projects and relational data from PostgreSQL.");

    // 2. Clear dev local caches
    const devProjectsFile = path.join(process.cwd(), ".dev-projects.json");
    const devPaymentsFile = path.join(process.cwd(), "dev_data", "payments.json");

    if (fs.existsSync(devProjectsFile)) {
      fs.writeFileSync(devProjectsFile, JSON.stringify([], null, 2));
      console.log("✅ Cleared .dev-projects.json cache.");
    }
    if (fs.existsSync(devPaymentsFile)) {
      fs.writeFileSync(devPaymentsFile, JSON.stringify([], null, 2));
      console.log("✅ Cleared dev_data/payments.json cache.");
    }

    console.log("==================================================================");
    console.log("✨ ALL STUDY MOCKUP DATA HAS BEEN PERMANENTLY REMOVED");
    console.log("==================================================================");
  } catch (error) {
    console.error("❌ Error purging project data:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
