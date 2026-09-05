import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const prisma = new PrismaClient();

async function runDiagnostic() {
  console.log("==================================================================");
  console.log("⚡ JAXIS StatLab — Database & Query Performance Diagnostic");
  console.log("==================================================================");
  const startTotal = Date.now();

  // 1. Inspect existing indexes on key operational tables in PostgreSQL
  console.log("\n[1] Current Database Indexes in PostgreSQL:");
  const indexes: any[] = await prisma.$queryRaw`
    SELECT tablename, indexname, indexdef
    FROM pg_indexes
    WHERE schemaname = 'public' 
      AND tablename IN ('projects', 'in_app_alerts', 'payments', 'audit_logs', 'deliverables', 'quotations', 'messages', 'assignments')
    ORDER BY tablename, indexname;
  `;
  
  const indexesByTable: Record<string, string[]> = {};
  for (const idx of indexes) {
    const list = indexesByTable[idx.tablename] ?? [];
    list.push(idx.indexname);
    indexesByTable[idx.tablename] = list;
  }

  for (const [tbl, list] of Object.entries(indexesByTable)) {
    console.log(`  Table '${tbl}' (${list.length} indexes):`);
    for (const name of list) {
      console.log(`    - ${name}`);
    }
  }

  // 2. Measure raw Project query latency
  console.log("\n[2] Benchmarking Project Queries:");
  const t0 = Date.now();
  const projectCount = await prisma.project.count();
  const tCount = Date.now() - t0;
  console.log(`  project.count(): ${projectCount} rows in ${tCount}ms`);

  const t1 = Date.now();
  const sampleProjects = await prisma.project.findMany({
    take: 20,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      intakeId: true,
      masterStatus: true,
      createdAt: true,
      client: { select: { id: true, fullName: true, email: true } },
      files: { select: { id: true, fileName: true, fileCategory: true } },
      payments: { select: { id: true, paymentStatus: true, createdAt: true }, take: 1, orderBy: { createdAt: "desc" } }
    }
  });
  const tSample = Date.now() - t1;
  console.log(`  project.findMany (with nested client, files, payments): ${sampleProjects.length} rows in ${tSample}ms`);

  // 3. Measure InAppAlert query latency
  console.log("\n[3] Benchmarking InAppAlert Queries:");
  const t2 = Date.now();
  const alertCount = await prisma.inAppAlert.count();
  const tAlertCount = Date.now() - t2;
  console.log(`  inAppAlert.count(): ${alertCount} rows in ${tAlertCount}ms`);

  const t3 = Date.now();
  const alertsSample = await prisma.inAppAlert.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      project: { select: { intakeId: true } }
    }
  });
  const tAlertSample = Date.now() - t3;
  console.log(`  inAppAlert.findMany (take 50 with project join): ${alertsSample.length} rows in ${tAlertSample}ms`);

  // 4. Test explain analyze on projects query
  console.log("\n[4] Query Plan (EXPLAIN ANALYZE) for Projects order by createdAt DESC:");
  try {
    const explainPlan: any[] = await prisma.$queryRawUnsafe(`
      EXPLAIN ANALYZE
      SELECT id, "intakeId", "masterStatus", "createdAt"
      FROM projects
      ORDER BY "createdAt" DESC
      LIMIT 20;
    `);
    for (const row of explainPlan) {
      console.log(`  ${row["QUERY PLAN"]}`);
    }
  } catch (err: any) {
    console.log("  Explain failed:", err.message);
  }

  // 5. Check missing composite indexes
  console.log("\n[5] Bottleneck & Optimization Analysis:");
  console.log("  - Missing compound index on projects(clientId, createdAt DESC) -> forces seq scan or bitmap index scan when filtering client studies");
  console.log("  - Missing compound index on projects(masterStatus, createdAt DESC) -> forces filter scan on admin status tabs");
  console.log("  - Missing compound index on in_app_alerts(recipientId, isRead, createdAt DESC) -> slows notification drawer badge count");
  console.log("  - Missing compound index on payments(projectId, createdAt DESC) -> slows subquery in project cards");
  console.log("  - Redundant double-fetch in /api/v1/projects (calling getProjects + getKPIs which re-executes full project findMany)");
  console.log(`  Total diagnostic runtime: ${Date.now() - startTotal}ms`);
}

runDiagnostic()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
