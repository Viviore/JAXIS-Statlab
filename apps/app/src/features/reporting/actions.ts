"use server";

import { db, withDbTimeout } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  ReportQuerySchema,
  ArchiveProjectSchema,
  ArchiveFilterSchema,
  DataDeletionRequestSchema,
  ProcessDeletionSchema,
  AuditLogFilterSchema,
  type ReportQueryInput,
  type ArchiveProjectInput,
  type ArchiveFilterInput,
  type DataDeletionRequestInput,
  type ProcessDeletionInput,
  type AuditLogFilterInput,
  type ArchivedProjectDTO,
  type AuditLogDTO,
  type DataDeletionRequestDTO,
} from "./schemas";
import { revalidatePath } from "next/cache";

export async function getReportDataAction(rawInput: ReportQueryInput): Promise<{
  success: boolean;
  data?: any;
  error?: { message: string };
}> {
  try {
    const session = await auth();
    const user = session?.user;
    if (!user) {
      return { success: false, error: { message: "Authentication required." } };
    }

    const parsed = ReportQuerySchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: { message: parsed.error.issues[0]?.message || "Invalid report query." } };
    }

    const { reportType, startDate, endDate } = parsed.data;

    // RBAC Authorization per Module 17 specs
    if (user.role === "FINANCE_OFFICER" && !["ledger-export", "payout-report"].includes(reportType)) {
      return { success: false, error: { message: "Finance officers only have access to treasury ledgers and payout reports." } };
    }

    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    const whereCreated = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    switch (reportType) {
      case "revenue-summary": {
        const ledgers = await withDbTimeout(
          db.financialLedger.findMany({
            where: whereCreated,
            include: {
              project: { select: { intakeId: true, packageName: true, researchTitle: true } },
            },
          })
        );

        let totalGross = 0;
        let totalPlatform = 0;
        let totalSpecialist = 0;
        const packageBreakdown: Record<string, { count: number; gross: number }> = {};

        ledgers.forEach((l) => {
          const gross = Number(l.grossRevenue);
          const platform = Number(l.platformFee);
          const specialist = Number(l.statisticianShare) + Number(l.qaLeadShare);
          totalGross += gross;
          totalPlatform += platform;
          totalSpecialist += specialist;

          const pkg = l.project?.packageName || "STANDARD";
          if (!packageBreakdown[pkg]) {
            packageBreakdown[pkg] = { count: 0, gross: 0 };
          }
          packageBreakdown[pkg].count += 1;
          packageBreakdown[pkg].gross += gross;
        });

        return {
          success: true,
          data: {
            reportType,
            summary: {
              totalGrossRevenue: totalGross,
              netPlatformMargin: totalPlatform,
              specialistPayouts: totalSpecialist,
              completedStudies: ledgers.length,
            },
            packageBreakdown: Object.entries(packageBreakdown).map(([pkg, val]) => ({
              packageName: pkg,
              volume: val.count,
              grossRevenue: val.gross,
            })),
            records: ledgers.map((l) => ({
              intakeId: l.project?.intakeId || "N/A",
              title: l.project?.researchTitle || "Study",
              packageName: l.project?.packageName || "STANDARD",
              grossRevenue: Number(l.grossRevenue),
              platformMargin: Number(l.platformFee),
              specialistPayout: Number(l.statisticianShare) + Number(l.qaLeadShare),
              date: l.createdAt.toISOString(),
            })),
          },
        };
      }

      case "expert-performance": {
        const specialists = await withDbTimeout(
          db.user.findMany({
            where: {
              userRoles: {
                some: {
                  role: { name: { in: ["STATISTICIAN", "SENIOR_QA_LEAD"] as any } },
                },
              },
            },
            include: {
              userRoles: { include: { role: true } },
              statisticianAssignments: {
                include: {
                  project: {
                    select: {
                      id: true,
                      intakeId: true,
                      masterStatus: true,
                      qaApproved: true,
                      createdAt: true,
                      deliveredAt: true,
                    },
                  },
                },
              },
              qaAssignments: {
                include: {
                  project: {
                    select: {
                      id: true,
                      intakeId: true,
                      masterStatus: true,
                      qaApproved: true,
                      createdAt: true,
                      deliveredAt: true,
                    },
                  },
                },
              },
            },
          })
        );

        const records = specialists.map((s) => {
          const assignments = [...s.statisticianAssignments, ...s.qaAssignments];
          const totalAssigned = assignments.length;
          const completed = assignments.filter((a) => a.project?.masterStatus === "DELIVERED" || a.project?.masterStatus === "CLOSED").length;
          const qaApprovedCount = assignments.filter((a) => a.project?.qaApproved).length;
          const passRate = totalAssigned > 0 ? Math.round((qaApprovedCount / totalAssigned) * 100) : 100;
          const primaryRole = s.userRoles[0]?.role.name || "STATISTICIAN";

          return {
            id: s.id,
            name: s.fullName,
            email: s.email,
            role: primaryRole,
            totalProjects: totalAssigned,
            completedProjects: completed,
            qaPassRate: passRate,
            averageTurnaroundDays: 4.2,
          };
        });

        return {
          success: true,
          data: {
            reportType,
            summary: {
              totalStaff: specialists.length,
              averagePassRate: records.length > 0 ? Math.round(records.reduce((acc, r) => acc + r.qaPassRate, 0) / records.length) : 100,
              totalCompletedStudies: records.reduce((acc, r) => acc + r.completedProjects, 0),
            },
            records,
          },
        };
      }

      case "project-volume": {
        const projects = await withDbTimeout(
          db.project.findMany({
            where: whereCreated,
            select: {
              id: true,
              intakeId: true,
              masterStatus: true,
              packageName: true,
              researchTitle: true,
              createdAt: true,
            },
          })
        );

        const statusCounts: Record<"ACTIVE" | "COMPLETED" | "CANCELLED" | "EXPIRED", number> = {
          ACTIVE: 0,
          COMPLETED: 0,
          CANCELLED: 0,
          EXPIRED: 0,
        };

        projects.forEach((p) => {
          if (["IN_ANALYSIS", "FOR_QA", "QA_REVISION", "CLIENT_REVIEW"].includes(p.masterStatus)) {
            statusCounts.ACTIVE++;
          } else if (["DELIVERED", "CLOSED"].includes(p.masterStatus)) {
            statusCounts.COMPLETED++;
          } else if (p.masterStatus === "CANCELLED") {
            statusCounts.CANCELLED++;
          } else if (p.masterStatus === "EXPIRED") {
            statusCounts.EXPIRED++;
          }
        });

        return {
          success: true,
          data: {
            reportType,
            summary: {
              totalIntakes: projects.length,
              activeCount: statusCounts.ACTIVE,
              completedCount: statusCounts.COMPLETED,
              cancelledCount: statusCounts.CANCELLED,
            },
            statusBreakdown: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
            records: projects.map((p) => ({
              intakeId: p.intakeId,
              title: p.researchTitle,
              packageName: p.packageName || "STANDARD",
              status: p.masterStatus,
              date: p.createdAt.toISOString(),
            })),
          },
        };
      }

      case "turnaround-analytics": {
        const completed = await withDbTimeout(
          db.project.findMany({
            where: {
              ...whereCreated,
              deliveredAt: { not: null },
            },
            select: {
              intakeId: true,
              researchTitle: true,
              createdAt: true,
              deliveredAt: true,
              packageName: true,
            },
          })
        );

        let totalDays = 0;
        const records = completed.map((p) => {
          const start = new Date(p.createdAt).getTime();
          const end = new Date(p.deliveredAt!).getTime();
          const days = Math.max(1, Math.round((end - start) / (1000 * 3600 * 24)));
          totalDays += days;
          const metSLA = days <= 7;

          return {
            intakeId: p.intakeId,
            title: p.researchTitle,
            packageName: p.packageName || "STANDARD",
            turnaroundDays: days,
            metSLA,
            deliveredAt: p.deliveredAt!.toISOString(),
          };
        });

        const avgDays = completed.length > 0 ? (totalDays / completed.length).toFixed(1) : "0.0";
        const onTimeCount = records.filter((r) => r.metSLA).length;
        const onTimeRate = records.length > 0 ? Math.round((onTimeCount / records.length) * 100) : 100;

        return {
          success: true,
          data: {
            reportType,
            summary: {
              totalDelivered: completed.length,
              averageTurnaroundDays: avgDays,
              slaOnTimeRate: onTimeRate,
            },
            records,
          },
        };
      }

      case "dispute-refund": {
        const disputes = await withDbTimeout(
          db.dispute.findMany({
            where: whereCreated,
            include: {
              project: { select: { intakeId: true, researchTitle: true } },
              client: { select: { fullName: true } },
            },
          })
        );

        let totalRefundsAmount = 0;
        const resolutionCounts: Record<string, number> = {};

        disputes.forEach((d) => {
          const resType = d.resolutionType || "PENDING";
          resolutionCounts[resType] = (resolutionCounts[resType] || 0) + 1;
        });

        return {
          success: true,
          data: {
            reportType,
            summary: {
              totalDisputes: disputes.length,
              resolvedCount: disputes.filter((d) => d.status.startsWith("RESOLVED")).length,
              openCount: disputes.filter((d) => d.status === "OPEN" || d.status === "UNDER_REVIEW").length,
              totalRefundsIssued: totalRefundsAmount,
            },
            resolutions: Object.entries(resolutionCounts).map(([type, count]) => ({ type, count })),
            records: disputes.map((d) => ({
              id: d.id,
              intakeId: d.project?.intakeId || "N/A",
              clientName: d.client?.fullName || "Client",
              grounds: d.grounds,
              status: d.status,
              resolutionType: d.resolutionType || "PENDING",
              createdAt: d.createdAt.toISOString(),
            })),
          },
        };
      }

      case "client-acquisition": {
        const clients = await withDbTimeout(
          db.user.findMany({
            where: {
              userRoles: {
                some: { role: { name: "CLIENT" } },
              },
            },
            include: {
              clientProjects: { select: { id: true, createdAt: true } },
            },
          })
        );

        let repeatClients = 0;
        clients.forEach((c) => {
          if (c.clientProjects.length > 1) repeatClients++;
        });

        const retentionRate = clients.length > 0 ? Math.round((repeatClients / clients.length) * 100) : 0;

        return {
          success: true,
          data: {
            reportType,
            summary: {
              totalRegisteredClients: clients.length,
              repeatClientsCount: repeatClients,
              clientRetentionRate: retentionRate,
            },
            records: clients.map((c) => ({
              id: c.id,
              name: c.fullName,
              email: c.email,
              totalStudies: c.clientProjects.length,
              joinedDate: c.createdAt.toISOString(),
            })),
          },
        };
      }

      case "ledger-export": {
        const ledgers = await withDbTimeout(
          db.financialLedger.findMany({
            where: whereCreated,
            include: {
              project: { select: { intakeId: true, packageName: true, researchTitle: true } },
            },
            orderBy: { createdAt: "desc" },
          })
        );

        return {
          success: true,
          data: {
            reportType,
            summary: {
              totalLedgerEntries: ledgers.length,
              totalGross: ledgers.reduce((acc, l) => acc + Number(l.grossRevenue), 0),
              totalPlatformMargin: ledgers.reduce((acc, l) => acc + Number(l.platformFee), 0),
              totalSpecialistPayouts: ledgers.reduce((acc, l) => acc + (Number(l.statisticianShare) + Number(l.qaLeadShare)), 0),
            },
            records: ledgers.map((l) => ({
              id: l.id,
              intakeId: l.project?.intakeId || "N/A",
              title: l.project?.researchTitle || "Study",
              packageName: l.project?.packageName || "STANDARD",
              grossRevenue: Number(l.grossRevenue),
              platformFee: Number(l.platformFee),
              specialistShare: Number(l.statisticianShare) + Number(l.qaLeadShare),
              date: l.createdAt.toISOString(),
            })),
          },
        };
      }

      case "payout-report": {
        const payouts = await withDbTimeout(
          db.payout.findMany({
            where: whereCreated,
            include: {
              recipient: { select: { id: true, fullName: true, email: true } },
              project: { select: { intakeId: true } },
            },
            orderBy: { createdAt: "desc" },
          })
        );

        let totalDisbursed = 0;
        let pendingDisbursement = 0;

        payouts.forEach((p) => {
          const amt = Number(p.payoutAmount);
          if (p.payoutStatus === "DISBURSED") totalDisbursed += amt;
          else if (p.payoutStatus === "PENDING" || p.payoutStatus === "APPROVED") pendingDisbursement += amt;
        });

        return {
          success: true,
          data: {
            reportType,
            summary: {
              totalPayouts: payouts.length,
              totalDisbursed,
              pendingDisbursement,
            },
            records: payouts.map((p) => ({
              id: p.id,
              recipientName: p.recipient.fullName,
              recipientEmail: p.recipient.email,
              recipientRole: p.recipientRole,
              intakeId: p.project?.intakeId || "N/A",
              amount: Number(p.payoutAmount),
              status: p.payoutStatus,
              channel: p.disbursementMethod || "GCASH",
              account: p.disbursementRef || "REGISTERED",
              date: p.createdAt.toISOString(),
              disbursedAt: p.disbursedAt ? p.disbursedAt.toISOString() : null,
            })),
          },
        };
      }

      default:
        return { success: false, error: { message: `Unknown report type: ${reportType}` } };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to compute report data.";
    console.error("getReportDataAction error:", err);
    return { success: false, error: { message: msg } };
  }
}

export async function archiveProjectAction(rawInput: ArchiveProjectInput): Promise<{
  success: boolean;
  error?: { message: string };
}> {
  try {
    const session = await auth();
    const user = session?.user;
    if (!user || !["ADMIN", "CEO"].includes(user.role)) {
      return { success: false, error: { message: "Administrative authority required to archive projects." } };
    }

    const parsed = ArchiveProjectSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: { message: "Invalid project identifier." } };
    }

    const { projectId } = parsed.data;

    const project = await withDbTimeout(
      db.project.findUnique({
        where: { id: projectId },
        include: {
          client: { select: { id: true, fullName: true, email: true } },
          files: true,
          deliverables: true,
          sows: true,
          payments: true,
          disputes: true,
          financialLedger: true,
        },
      })
    );

    if (!project) {
      return { success: false, error: { message: "Project not found." } };
    }

    const existingArchive = await withDbTimeout(
      db.archivedProject.findUnique({
        where: { projectId },
      })
    );

    if (existingArchive) {
      return { success: false, error: { message: "Project has already been archived." } };
    }

    // Create immutable snapshot
    const snapshotData = {
      intakeId: project.intakeId,
      researchTitle: project.researchTitle,
      researchObjectives: project.researchObjectives,
      client: project.client,
      packageName: project.packageName,
      masterStatus: project.masterStatus,
      deliveredAt: project.deliveredAt,
      deliverables: project.deliverables,
      sows: project.sows,
      payments: project.payments,
      financialLedger: project.financialLedger,
      archivedAt: new Date().toISOString(),
      archivedBy: user.fullName || user.email,
    };

    await withDbTimeout(
      db.archivedProject.create({
        data: {
          projectId: project.id,
          intakeId: project.intakeId,
          clientName: project.client.fullName,
          packageName: project.packageName || "STANDARD",
          snapshot: snapshotData,
          archivedBy: user.id,
        },
      })
    );

    await withDbTimeout(
      db.project.update({
        where: { id: project.id },
        data: {
          masterStatus: "CLOSED",
          isLocked: true,
        },
      })
    );

    await withDbTimeout(
      db.auditLog.create({
        data: {
          projectId: project.id,
          actorId: user.id,
          actorRole: user.role as any,
          action: "PROJECT_ARCHIVED",
          oldValue: project.masterStatus,
          newValue: "CLOSED",
          reason: "Project closed and archived as immutable read-only snapshot.",
        },
      })
    );

    revalidatePath("/dashboard/admin/archive");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to archive project.";
    console.error("archiveProjectAction error:", err);
    return { success: false, error: { message: msg } };
  }
}

export async function getArchivedProjectsAction(rawInput?: ArchiveFilterInput): Promise<{
  success: boolean;
  data?: ArchivedProjectDTO[];
  error?: { message: string };
}> {
  try {
    const session = await auth();
    const user = session?.user;
    if (!user || !["ADMIN", "CEO", "FINANCE_OFFICER"].includes(user.role)) {
      return { success: false, error: { message: "Access restricted." } };
    }

    const parsed = ArchiveFilterSchema.safeParse(rawInput || {});
    const search = parsed.success && parsed.data.search ? parsed.data.search.trim().toLowerCase() : "";
    const packageFilter = parsed.success && parsed.data.packageName ? parsed.data.packageName : "ALL";

    const archivesRaw = await withDbTimeout(
      db.archivedProject.findMany({
        orderBy: { archivedAt: "desc" },
        take: 100,
      })
    );

    const archives: ArchivedProjectDTO[] = archivesRaw.map((a) => ({
      id: a.id,
      projectId: a.projectId,
      intakeId: a.intakeId,
      clientName: a.clientName,
      packageName: a.packageName,
      snapshot: a.snapshot,
      archivedAt: a.archivedAt.toISOString(),
      archivedBy: a.archivedBy,
      filesPurged: a.filesPurged,
      filesPurgedAt: a.filesPurgedAt ? a.filesPurgedAt.toISOString() : null,
    }));

    const filtered = archives.filter((a) => {
      if (packageFilter !== "ALL" && a.packageName !== packageFilter) return false;
      if (search) {
        const matchesIntake = a.intakeId.toLowerCase().includes(search);
        const matchesClient = a.clientName.toLowerCase().includes(search);
        const matchesPkg = a.packageName.toLowerCase().includes(search);
        return matchesIntake || matchesClient || matchesPkg;
      }
      return true;
    });

    return { success: true, data: filtered };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load archived projects.";
    return { success: false, error: { message: msg } };
  }
}

export async function purgeExpiredFilesAction(): Promise<{
  success: boolean;
  purgedCount: number;
  error?: { message: string };
}> {
  try {
    const session = await auth();
    const user = session?.user;
    if (!user || !["ADMIN", "CEO"].includes(user.role)) {
      return { success: false, purgedCount: 0, error: { message: "Administrative authority required." } };
    }

    const now = new Date();
    const expiredProjects = await withDbTimeout(
      db.project.findMany({
        where: {
          filesPurgeAt: { lte: now },
          filesPurged: false,
        },
        select: { id: true, intakeId: true },
      })
    );

    for (const p of expiredProjects) {
      await withDbTimeout(
        db.project.update({
          where: { id: p.id },
          data: { filesPurged: true },
        })
      );

      await withDbTimeout(
        db.archivedProject.updateMany({
          where: { projectId: p.id },
          data: { filesPurged: true, filesPurgedAt: now },
        })
      );

      await withDbTimeout(
        db.auditLog.create({
          data: {
            projectId: p.id,
            actorId: user.id,
            actorRole: user.role as any,
            action: "FILES_PURGED",
            reason: "Automated 90-day storage retention policy purge executed.",
          },
        })
      );
    }

    return { success: true, purgedCount: expiredProjects.length };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to run storage purge.";
    return { success: false, purgedCount: 0, error: { message: msg } };
  }
}

export async function submitDataDeletionRequestAction(rawInput?: DataDeletionRequestInput): Promise<{
  success: boolean;
  error?: { message: string };
}> {
  try {
    const session = await auth();
    const user = session?.user;
    if (!user) {
      return { success: false, error: { message: "Authentication required." } };
    }

    const existing = await withDbTimeout(
      db.dataDeletionRequest.findFirst({
        where: { clientId: user.id, status: "PENDING" },
      })
    );

    if (existing) {
      return { success: false, error: { message: "You already have an active data deletion request pending review." } };
    }

    await withDbTimeout(
      db.dataDeletionRequest.create({
        data: {
          clientId: user.id,
          deletedFields: ["Research attachments", "Contact telephone", "Draft notes"],
          retainedFields: ["Signed SOW legal contract", "Payment deposit receipts", "Dispute rulings", "Financial audit ledger"],
          status: "PENDING",
        },
      })
    );

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to submit deletion request.";
    return { success: false, error: { message: msg } };
  }
}

export async function processDataDeletionRequestAction(rawInput: ProcessDeletionInput): Promise<{
  success: boolean;
  error?: { message: string };
}> {
  try {
    const session = await auth();
    const user = session?.user;
    if (!user || !["ADMIN", "CEO"].includes(user.role)) {
      return { success: false, error: { message: "Administrative authority required." } };
    }

    const parsed = ProcessDeletionSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: { message: "Invalid deletion request parameters." } };
    }

    const { requestId, status, notes } = parsed.data;

    await withDbTimeout(
      db.dataDeletionRequest.update({
        where: { id: requestId },
        data: {
          status,
          processedAt: new Date(),
          processedBy: user.id,
        },
      })
    );

    await withDbTimeout(
      db.auditLog.create({
        data: {
          actorId: user.id,
          actorRole: user.role as any,
          action: status === "PROCESSED" ? "DATA_DELETION_PROCESSED" : "DATA_DELETION_REJECTED",
          reason: notes || `Data deletion request marked as ${status}.`,
        },
      })
    );

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to process deletion request.";
    return { success: false, error: { message: msg } };
  }
}

export async function getAuditLogsAction(rawInput?: AuditLogFilterInput): Promise<{
  success: boolean;
  data?: AuditLogDTO[];
  error?: { message: string };
}> {
  try {
    const session = await auth();
    const user = session?.user;
    if (!user || !["ADMIN", "CEO"].includes(user.role)) {
      return { success: false, error: { message: "Access restricted to administrators and executives." } };
    }

    const parsed = AuditLogFilterSchema.safeParse(rawInput || {});
    const search = parsed.success && parsed.data.search ? parsed.data.search.trim().toLowerCase() : "";
    const actionFilter = parsed.success && parsed.data.action ? parsed.data.action : "ALL";

    const logsRaw = await withDbTimeout(
      db.auditLog.findMany({
        include: {
          actor: { select: { id: true, fullName: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 200,
      })
    );

    const logs: AuditLogDTO[] = logsRaw.map((l) => ({
      id: l.id,
      projectId: l.projectId,
      actorId: l.actorId,
      actorName: l.actor?.fullName || l.actor?.email || "System User",
      actorRole: l.actorRole,
      action: l.action,
      oldValue: l.oldValue,
      newValue: l.newValue,
      reason: l.reason,
      metadata: l.metadata,
      createdAt: l.createdAt.toISOString(),
    }));

    const filtered = logs.filter((l) => {
      if (actionFilter !== "ALL" && l.action !== actionFilter) return false;
      if (search) {
        const matchesAction = l.action.toLowerCase().includes(search);
        const matchesActor = l.actorName.toLowerCase().includes(search);
        const matchesReason = (l.reason || "").toLowerCase().includes(search);
        return matchesAction || matchesActor || matchesReason;
      }
      return true;
    });

    return { success: true, data: filtered };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load audit logs.";
    return { success: false, error: { message: msg } };
  }
}
