import { PrismaClient } from "@prisma/client";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
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
  console.log("=== DB PROJECTS ===");
  const projects = await prisma.project.findMany({
    select: {
      id: true,
      intakeId: true,
      researchTitle: true,
      masterStatus: true,
      filesPurged: true,
      deliveredAt: true,
      createdAt: true,
      _count: {
        select: {
          files: true,
          deliverables: true,
        },
      },
    },
  });
  console.log("Projects in DB:", JSON.stringify(projects, null, 2));

  console.log("\n=== DB PROJECT FILES ===");
  const projectFiles = await prisma.projectFile.findMany({
    select: {
      id: true,
      fileName: true,
      filePath: true,
      fileCategory: true,
      projectId: true,
    },
  });
  console.log("Total DB ProjectFiles:", projectFiles.length);
  console.log("ProjectFiles:", JSON.stringify(projectFiles, null, 2));

  console.log("\n=== DB DELIVERABLES ===");
  const deliverables = await prisma.deliverable.findMany({
    select: {
      id: true,
      fileName: true,
      filePath: true,
      projectId: true,
    },
  });
  console.log("Total DB Deliverables:", deliverables.length);
  console.log("Deliverables:", JSON.stringify(deliverables, null, 2));

  console.log("\n=== STORAGE RETENTION CONFIG ===");
  const config = await prisma.storageRetentionConfig.findUnique({
    where: { id: "default-config" },
  });
  console.log("Retention Config:", JSON.stringify(config, null, 2));

  console.log("\n=== CLOUDFLARE R2 BUCKET ===");
  try {
    const list = await r2Client.send(
      new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET_NAME,
      })
    );
    console.log("Bucket Name:", process.env.R2_BUCKET_NAME);
    console.log("Total Objects Count in R2:", list.KeyCount);
    console.log("Objects in R2:");
    (list.Contents || []).forEach((c, idx) => {
      console.log(`  ${idx + 1}. Key: ${c.Key} (${c.Size} bytes, Modified: ${c.LastModified})`);
    });
  } catch (err) {
    console.error("Failed to list R2:", err);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
