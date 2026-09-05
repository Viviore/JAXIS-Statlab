import { PrismaClient } from "@prisma/client";
import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
  type ListObjectsV2CommandOutput,
} from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const prisma = new PrismaClient();

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

async function main() {
  console.log("==================================================================");
  console.log("🧹 JAXIS StatLab — Purging ALL Study Mockup Data & Cloudflare Storage");
  console.log("==================================================================");

  try {
    // 1. Purge all Cloudflare R2 bucket objects
    console.log("☁️ Purging Cloudflare R2 Object Storage...");
    const bucketName = process.env.R2_BUCKET_NAME;
    if (bucketName && process.env.R2_ACCESS_KEY_ID) {
      let continuationToken: string | undefined = undefined;
      let totalR2Deleted = 0;

      do {
        const listRes: ListObjectsV2CommandOutput = await r2Client.send(
          new ListObjectsV2Command({
            Bucket: bucketName,
            ContinuationToken: continuationToken,
          })
        );

        const keysToDelete = (listRes.Contents || [])
          .map((c) => c.Key)
          .filter((k): k is string => Boolean(k));

        if (keysToDelete.length > 0) {
          await r2Client.send(
            new DeleteObjectsCommand({
              Bucket: bucketName,
              Delete: {
                Objects: keysToDelete.map((Key) => ({ Key })),
                Quiet: true,
              },
            })
          );
          totalR2Deleted += keysToDelete.length;
          console.log(`  - Deleted batch of ${keysToDelete.length} objects from R2 bucket "${bucketName}"`);
        }

        continuationToken = listRes.NextContinuationToken;
      } while (continuationToken);

      console.log(`✅ Cleared ${totalR2Deleted} total objects from Cloudflare R2 bucket "${bucketName}".`);
    } else {
      console.warn("⚠️ Cloudflare R2 credentials missing, skipping R2 bucket deletion.");
    }

    // 2. Purge all related project records in relational order from PostgreSQL
    console.log("\n🗄️ Purging PostgreSQL database records...");
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

    // 3. Clear dev local caches
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
    console.log("✨ ALL STUDY MOCKUP DATA & CLOUD STORAGE OBJECTS PERMANENTLY REMOVED");
    console.log("==================================================================");
  } catch (error) {
    console.error("❌ Error purging project data:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
