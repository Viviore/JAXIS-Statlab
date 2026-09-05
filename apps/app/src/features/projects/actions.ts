"use server";

import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import { auth } from "@/lib/auth";
import { db, withDbTimeout } from "@/lib/db";
import { invalidateCacheTags, CACHE_TAGS } from "@/lib/cache-tags";
import { sendEmail } from "@/lib/email";
import { assertValidStatusTransition, generateIntakeId } from "@/lib/project-rules";
import { getClientProfile } from "@/features/client-profile/actions";
import {
  CreateProjectSchema,
  UpdateProjectStatusSchema,
  RequestMissingInfoSchema,
  ProjectFilterSchema,
  type ProjectDetailItem,
  type ProjectFileItem,
  type ActionResponse,
} from "./schemas";
import { dispatchRealtimeNotification } from "@/features/notifications/dispatcher";
import type { AuditTelemetryEvent } from "@/types/project";
import type { ProjectStatus, FileCategory, Prisma } from "@prisma/client";

const DEV_PROJECTS_FILE = path.join(process.cwd(), ".dev-projects.json");
const DEV_PAYMENTS_FILE = path.join(process.cwd(), "dev_data", "payments.json");

interface PersistedDevPaymentRecord {
  id: string;
  projectId: string;
  paymentStatus: string;
  createdAt: string;
}

function readPersistedDevPayments(): PersistedDevPaymentRecord[] {
  try {
    if (fs.existsSync(DEV_PAYMENTS_FILE)) {
      const data = fs.readFileSync(DEV_PAYMENTS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch {
    // Ignore read errors
  }
  return [];
}

function readPersistedDevProjects(): ProjectDetailItem[] {
  try {
    if (fs.existsSync(DEV_PROJECTS_FILE)) {
      const data = fs.readFileSync(DEV_PROJECTS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch {
    // Ignore read errors
  }
  return [];
}

function writePersistedDevProjects(projects: ProjectDetailItem[]): void {
  try {
    fs.writeFileSync(DEV_PROJECTS_FILE, JSON.stringify(projects, null, 2), "utf-8");
  } catch {
    // Ignore write errors
  }
}

/**
 * 1. Create a new research project intake submission.
 * Enforces client profile completion gate (INT-F04 / CLT-F01).
 */
export async function createProject(
  input: unknown
): Promise<ActionResponse<ProjectDetailItem>> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "You must be logged in to submit a project." },
    };
  }

  // Enforce server-side profile gate
  const profile = await getClientProfile();
  if (!profile || !profile.institutionSchool || !profile.contactNumber) {
    return {
      success: false,
      error: {
        code: "PROFILE_INCOMPLETE",
        message: "You must complete your institutional profile before submitting project intake requests.",
      },
    };
  }

  const parsed = CreateProjectSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Please correct the invalid fields in your submission.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const {
    researchTitle,
    researchQuestions,
    researchObjectives,
    hypotheses,
    deadlineRequested,
    chapters13,
    questionnaire,
    files,
  } = parsed.data;

  const intakeId = generateIntakeId();
  const deadlineDate = new Date(deadlineRequested);

  try {
    const project = await withDbTimeout(
      db.$transaction(async (tx) => {
        const createdProj = await tx.project.create({
          data: {
            intakeId,
            clientId: session.user.id,
            researchTitle: researchTitle.trim(),
            researchQuestions: researchQuestions.trim(),
            researchObjectives: researchObjectives.trim(),
            hypotheses: hypotheses?.trim() || null,
            deadlineRequested: deadlineDate,
            chapters13: chapters13?.trim() || null,
            questionnaire: questionnaire?.trim() || null,
            masterStatus: "NEW_REQUEST",
            files: files?.length
              ? {
                  create: files.map((f) => ({
                    fileName: f.fileName,
                    filePath: f.filePath,
                    fileType: f.fileType,
                    fileCategory: f.fileCategory,
                  })),
                }
              : undefined,
          },
          select: {
            id: true,
            intakeId: true,
            clientId: true,
            researchTitle: true,
            researchQuestions: true,
            researchObjectives: true,
            hypotheses: true,
            deadlineRequested: true,
            chapters13: true,
            questionnaire: true,
            masterStatus: true,
            packageName: true,
            missingInfoReason: true,
            deliveredAt: true,
            filesPurgeAt: true,
            filesPurged: true,
            hasActiveDispute: true,
            hasPendingRefund: true,
            createdAt: true,
            updatedAt: true,
            client: {
              select: {
                id: true,
                fullName: true,
                email: true,
                clientProfile: {
                  select: {
                    institutionSchool: true,
                    academicProgram: true,
                    contactNumber: true,
                    region: true,
                  },
                },
              },
            },
            files: {
              select: {
                id: true,
                projectId: true,
                fileName: true,
                filePath: true,
                fileType: true,
                fileCategory: true,
                uploadedAt: true,
              },
            },
          },
        });

        // ── 1. Create In-App Alert for Admins & CEO ──
        try {
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
          } else {
            const fallbackAdmin = await tx.user.findFirst({
              where: {
                OR: [
                  { email: "admin@jaxis.dev" },
                  { email: { contains: "admin" } },
                ],
              },
              select: { id: true },
            });
            if (fallbackAdmin) {
              await tx.inAppAlert.create({
                data: {
                  recipientId: fallbackAdmin.id,
                  recipientRole: "ADMIN",
                  alertType: "NEW_INTAKE",
                  projectId: createdProj.id,
                  message: `New study intake received: ${createdProj.intakeId} — "${createdProj.researchTitle}"`,
                  linkUrl: "/dashboard/admin/intake",
                  isRead: false,
                },
              });
            }
          }
        } catch (alertErr) {
          console.warn("[createProject] Could not create in-app alert:", alertErr);
        }

        // ── 2. Record Permanent Audit Log ──
        try {
          await tx.auditLog.create({
            data: {
              projectId: createdProj.id,
              actorId: session.user.id,
              actorRole: "CLIENT",
              action: "INTAKE_SUBMITTED",
              newValue: "NEW_REQUEST",
              reason: "Client submitted new research study specifications",
              metadata: {
                intakeId: createdProj.intakeId,
                researchTitle: createdProj.researchTitle,
                deadlineRequested: deadlineDate.toISOString(),
                fileCount: files?.length || 0,
              },
            },
          });
        } catch (auditErr) {
          console.warn("[createProject] Could not record audit log:", auditErr);
        }

        return createdProj;
      })
    );

    // ── 3. Dispatch Email Notification to Admin Operations ──
    try {
      const adminUsers = await db.user.findMany({
        where: {
          userRoles: {
            some: {
              role: {
                name: "ADMIN",
              },
            },
          },
        },
        select: { id: true, email: true, fullName: true },
      });

      const targets = adminUsers.length > 0
        ? adminUsers
        : [{ id: "admin_fallback", email: "admin@jaxis.dev", fullName: "Admin Operations" }];

      for (const admin of targets) {
        await sendEmail({
          to: admin.email,
          recipientId: admin.id,
          template: "NewIntake",
          projectId: project.id,
          data: {
            intakeId: project.intakeId,
            researchTitle: project.researchTitle,
            clientName: session.user.name || (session.user as any).fullName || "Client User",
            clientEmail: session.user.email || "client@jaxis.dev",
            deadlineRequested: deadlineDate.toISOString(),
          },
        }).catch((e) => console.warn("[createProject] sendEmail error:", e));
      }
    } catch (emailErr) {
      console.warn("[createProject] Failed to dispatch admin email:", emailErr);
    }

    // ── 4. Dispatch Real-time in-app alert via SSE ──
    try {
      await dispatchRealtimeNotification({
        eventType: "NEW_INTAKE",
        projectId: project.id,
        intakeId: project.intakeId,
        title: "New Research Study Submitted",
        message: `New study intake received: ${project.intakeId} — "${project.researchTitle}"`,
        linkUrl: `/dashboard/admin/projects/${project.id}`,
        targetRoles: ["ADMIN", "CEO"],
        includeProjectParties: true,
      });
    } catch (e) {
      console.warn("[createProject] Realtime dispatch warning:", e);
    }

    // ── 5. Invalidate Cache Tags and Revalidate Paths ──
    invalidateCacheTags(CACHE_TAGS.PROJECTS);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/client");
    revalidatePath("/dashboard/client/projects");
    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/admin/intake");
    revalidatePath("/dashboard/admin/quotations");

    return {
      success: true,
      data: project as unknown as ProjectDetailItem,
    };
  } catch (dbError) {
    console.warn("[createProject] DB offline, writing to persistent dev projects cache.", dbError);

    const devProject: ProjectDetailItem = {
      id: `proj_${Date.now()}`,
      intakeId,
      clientId: session.user.id,
      researchTitle: researchTitle.trim(),
      researchQuestions: researchQuestions.trim(),
      researchObjectives: researchObjectives.trim(),
      hypotheses: hypotheses?.trim() || null,
      deadlineRequested: deadlineDate.toISOString(),
      chapters13: chapters13?.trim() || null,
      questionnaire: questionnaire?.trim() || null,
      masterStatus: "NEW_REQUEST",
      packageName: null,
      missingInfoReason: null,
      deliveredAt: null,
      filesPurgeAt: null,
      filesPurged: false,
      hasActiveDispute: false,
      hasPendingRefund: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      client: {
        id: session.user.id,
        fullName: session.user.name || session.user.fullName || "Client User",
        email: session.user.email || "client@jaxis.dev",
        clientProfile: profile,
      },
      files: (files || []).map((f, i) => ({
        id: `file_${Date.now()}_${i}`,
        projectId: `proj_${Date.now()}`,
        fileName: f.fileName,
        filePath: f.filePath,
        fileType: f.fileType,
        fileCategory: f.fileCategory,
        uploadedAt: new Date().toISOString(),
      })),
    };

    const existingDev = readPersistedDevProjects();
    writePersistedDevProjects([devProject, ...existingDev]);

    try {
      await dispatchRealtimeNotification({
        eventType: "NEW_INTAKE",
        projectId: devProject.id,
        intakeId: devProject.intakeId,
        title: "New Research Study Submitted",
        message: `New study intake received: ${devProject.intakeId} — "${devProject.researchTitle}"`,
        linkUrl: `/dashboard/admin/projects/${devProject.id}`,
        targetRoles: ["ADMIN", "CEO"],
        includeProjectParties: true,
      });
    } catch {
      // Ignore in dev
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/client");
    revalidatePath("/dashboard/client/projects");
    revalidatePath("/dashboard/admin/intake");

    return {
      success: true,
      data: devProject,
    };
  }
}

/**
 * 2. Get role-scoped list of projects.
 * - CLIENT: sees only their own projects.
 * - ADMIN / CEO: sees all projects.
 * - STATISTICIAN / QA: sees assigned (or all active in dev).
 */
export async function getProjects(
  filters?: unknown
): Promise<ActionResponse<ProjectDetailItem[]>> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "You must be logged in." },
    };
  }

  const userRole = session.user.role as string;
  const userId = session.user.id;

  const parsed = ProjectFilterSchema.safeParse(filters || {});
  const { status, search, page, pageSize } = parsed.success
    ? parsed.data
    : { status: undefined, search: undefined, page: undefined, pageSize: undefined };

  try {
    const isClient = userRole === "CLIENT";

    const whereClause: Prisma.ProjectWhereInput = {
      ...(isClient ? { clientId: userId } : {}),
      ...(status && status !== "ALL" ? { masterStatus: status as ProjectStatus } : {}),
      ...(search?.trim()
        ? {
            OR: [
              { researchTitle: { contains: search.trim(), mode: "insensitive" as const } },
              { intakeId: { contains: search.trim(), mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const take = pageSize && pageSize > 0 ? Math.min(pageSize, 100) : undefined;
    const skip = page && page > 0 && take ? (page - 1) * take : undefined;

    const projects = await withDbTimeout(
      db.project.findMany({
        where: whereClause,
        ...(take ? { take } : {}),
        ...(skip ? { skip } : {}),
        select: {
          id: true,
          intakeId: true,
          clientId: true,
          researchTitle: true,
          researchQuestions: true,
          researchObjectives: true,
          hypotheses: true,
          deadlineRequested: true,
          chapters13: true,
          questionnaire: true,
          masterStatus: true,
          packageName: true,
          missingInfoReason: true,
          deliveredAt: true,
          filesPurgeAt: true,
          filesPurged: true,
          hasActiveDispute: true,
          hasPendingRefund: true,
          createdAt: true,
          updatedAt: true,
          client: {
            select: {
              id: true,
              fullName: true,
              email: true,
              clientProfile: {
                select: {
                  institutionSchool: true,
                  academicProgram: true,
                  contactNumber: true,
                  region: true,
                },
              },
            },
          },
          files: {
            select: {
              id: true,
              projectId: true,
              fileName: true,
              filePath: true,
              fileType: true,
              fileCategory: true,
              uploadedAt: true,
            },
          },
          payments: {
            select: {
              id: true,
              paymentStatus: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
      })
    );

    const mappedProjects = (projects as unknown as Array<ProjectDetailItem & { payments?: Array<{ paymentStatus: string }> }>).map((p) => {
      const latestPay = p.payments?.[0];
      return {
        ...p,
        latestPaymentStatus: latestPay?.paymentStatus || null,
        hasPendingPaymentVerification: latestPay?.paymentStatus === "PROOF_SUBMITTED",
      };
    });

    return {
      success: true,
      data: mappedProjects as unknown as ProjectDetailItem[],
    };
  } catch (dbError) {
    console.warn("[getProjects] DB offline, reading from dev projects cache.", dbError);

    let devProjects = readPersistedDevProjects();

    // Default sample project if empty
    if (devProjects.length === 0) {
      devProjects = [
        {
          id: "proj_sample_001",
          intakeId: "JAXIS-202608-0001",
          clientId: userId,
          researchTitle: "Impact of Study Habits on Academic Performance Among State University Students",
          researchQuestions: "Does study frequency significantly affect GPA? Is there a gender difference?",
          researchObjectives: "Determine relationship between study habits and GPA; identify moderating variables.",
          hypotheses: "H1: Positive correlation between study hours and academic performance.",
          chapters13: "https://r2.jaxis.dev/sample-chapters.docx",
          questionnaire: "https://r2.jaxis.dev/sample-survey.pdf",
          deadlineRequested: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
          masterStatus: "UNDER_EVALUATION",
          packageName: "ADVANCED_STATISTICS",
          missingInfoReason: null,
          deliveredAt: null,
          filesPurgeAt: null,
          filesPurged: false,
          hasActiveDispute: false,
          hasPendingRefund: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          client: {
            id: userId,
            fullName: session.user.name || "Client User",
            email: session.user.email || "client@jaxis.dev",
            clientProfile: {
              institutionSchool: "University of the Philippines Diliman",
              academicProgram: "MS in Data Science",
              contactNumber: "0917 123 4567",
              region: "NCR",
            },
          },
          files: [
            {
              id: "file_001",
              projectId: "proj_sample_001",
              fileName: "research_proposal_draft.docx",
              filePath: "uploads/research_proposal_draft.docx",
              fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              fileCategory: "RESEARCH_DOCUMENT",
              uploadedAt: new Date().toISOString(),
            },
            {
              id: "file_002",
              projectId: "proj_sample_001",
              fileName: "raw_survey_responses.xlsx",
              filePath: "uploads/raw_survey_responses.xlsx",
              fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              fileCategory: "DATASET",
              uploadedAt: new Date().toISOString(),
            },
          ],
        },
      ];
      writePersistedDevProjects(devProjects);
    }

    const devPayments = readPersistedDevPayments();
    devProjects = devProjects.map((p) => {
      const projPayments = devPayments.filter((pay) => pay.projectId === p.id);
      const latestPay = projPayments.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      return {
        ...p,
        latestPaymentStatus: latestPay?.paymentStatus || null,
        hasPendingPaymentVerification: latestPay?.paymentStatus === "PROOF_SUBMITTED",
      };
    });

    if (userRole === "CLIENT") {
      devProjects = devProjects.filter(
        (p) =>
          p.clientId === userId ||
          p.client.email === session.user?.email ||
          p.client.email === "client@jaxis.dev" ||
          p.clientId === "usr_dev_client_001"
      );
    }

    if (status && status !== "ALL") {
      devProjects = devProjects.filter((p) => p.masterStatus === status);
    }

    if (search?.trim()) {
      const q = search.toLowerCase().trim();
      devProjects = devProjects.filter(
        (p) =>
          p.researchTitle.toLowerCase().includes(q) ||
          p.intakeId.toLowerCase().includes(q)
      );
    }

    if (page && pageSize && pageSize > 0) {
      const startIndex = (page - 1) * pageSize;
      devProjects = devProjects.slice(startIndex, startIndex + pageSize);
    }

    return {
      success: true,
      data: devProjects,
    };
  }
}

/**
 * 3. Retrieve single project detail by ID or intakeId.
 */
export async function getProjectById(
  id: string
): Promise<ActionResponse<ProjectDetailItem>> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "You must be logged in." },
    };
  }

  try {
    const project = await withDbTimeout(
      db.project.findFirst({
        where: {
          OR: [{ id }, { intakeId: id }],
        },
        select: {
          id: true,
          intakeId: true,
          clientId: true,
          researchTitle: true,
          researchQuestions: true,
          researchObjectives: true,
          hypotheses: true,
          deadlineRequested: true,
          chapters13: true,
          questionnaire: true,
          masterStatus: true,
          packageName: true,
          missingInfoReason: true,
          deliveredAt: true,
          filesPurgeAt: true,
          filesPurged: true,
          hasActiveDispute: true,
          hasPendingRefund: true,
          createdAt: true,
          updatedAt: true,
          client: {
            select: {
              id: true,
              fullName: true,
              email: true,
              clientProfile: {
                select: {
                  institutionSchool: true,
                  academicProgram: true,
                  contactNumber: true,
                  region: true,
                },
              },
            },
          },
          files: {
            select: {
              id: true,
              projectId: true,
              fileName: true,
              filePath: true,
              fileType: true,
              fileCategory: true,
              uploadedAt: true,
            },
          },
          payments: {
            select: {
              id: true,
              paymentStatus: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      })
    );

    if (!project) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Project not found." },
      };
    }

    // Role-based authorization
    if (session.user.role === "CLIENT" && project.clientId !== session.user.id) {
      return {
        success: false,
        error: { code: "FORBIDDEN", message: "You do not have access to this study." },
      };
    }

    const latestPay = (project as unknown as { payments?: Array<{ paymentStatus: string }> }).payments?.[0];
    const mapped = {
      ...project,
      latestPaymentStatus: latestPay?.paymentStatus || null,
      hasPendingPaymentVerification: latestPay?.paymentStatus === "PROOF_SUBMITTED",
    };

    return {
      success: true,
      data: mapped as unknown as ProjectDetailItem,
    };
  } catch (dbError) {
    console.warn("[getProjectById] DB offline, reading from dev projects cache.", dbError);

    const devProjects = readPersistedDevProjects();
    const project = devProjects.find((p) => p.id === id || p.intakeId === id);

    if (!project) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Project not found in dev cache." },
      };
    }

    if (session.user.role === "CLIENT" && project.clientId !== session.user.id && project.client.email !== session.user.email) {
      return {
        success: false,
        error: { code: "FORBIDDEN", message: "You do not have access to this study." },
      };
    }

    const devPayments = readPersistedDevPayments();
    const projPayments = devPayments.filter((pay) => pay.projectId === project.id);
    const latestPay = projPayments.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

    return {
      success: true,
      data: {
        ...project,
        latestPaymentStatus: latestPay?.paymentStatus || null,
        hasPendingPaymentVerification: latestPay?.paymentStatus === "PROOF_SUBMITTED",
      },
    };
  }
}

/**
 * 4. Update project masterStatus, strictly validating state machine transitions.
 * Accessible only to ADMIN and CEO.
 */
export async function updateProjectStatus(
  input: unknown
): Promise<ActionResponse<ProjectDetailItem>> {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "CEO")) {
    return {
      success: false,
      error: { code: "FORBIDDEN", message: "Only Administrators and Executives can transition project statuses." },
    };
  }

  const parsed = UpdateProjectStatusSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid status transition payload." },
    };
  }

  const { projectId, status: targetStatus } = parsed.data;

  try {
    const existing = await db.project.findFirst({
      where: {
        OR: [{ id: projectId }, { intakeId: projectId }],
      },
    });

    if (!existing) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Project not found." },
      };
    }

    // Assert state machine legality
    assertValidStatusTransition(existing.masterStatus, targetStatus);

    const updated = await db.project.update({
      where: { id: existing.id },
      data: { masterStatus: targetStatus },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            clientProfile: true,
          },
        },
        files: true,
      },
    });

    // Real-time multi-role notification dispatch
    try {
      await dispatchRealtimeNotification({
        eventType: "STATUS_UPDATE",
        projectId: existing.id,
        intakeId: existing.intakeId,
        title: "Study Status Updated",
        message: `Study "${existing.researchTitle}" transitioned to ${targetStatus.replace(/_/g, " ")}.`,
        targetRoles: ["ADMIN", "CEO"],
        includeProjectParties: true,
      });
    } catch (notifyErr) {
      console.warn("[updateProjectStatus] Realtime notification dispatch failed:", notifyErr);
    }

    revalidatePath("/dashboard/admin/intake");
    revalidatePath(`/dashboard/admin/projects/${projectId}`);
    revalidatePath(`/dashboard/client/projects/${projectId}`);

    return {
      success: true,
      data: updated as ProjectDetailItem,
    };
  } catch (dbError) {
    if (dbError instanceof Error && dbError.message.includes("INVALID_STATUS_TRANSITION")) {
      return {
        success: false,
        error: { code: "INVALID_STATUS_TRANSITION", message: dbError.message },
      };
    }

    console.warn("[updateProjectStatus] DB offline, updating in dev cache.", dbError);

    const devProjects = readPersistedDevProjects();
    const index = devProjects.findIndex((p) => p.id === projectId || p.intakeId === projectId);

    if (index === -1) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Project not found in dev cache." },
      };
    }

    const currentStatus = devProjects[index]!.masterStatus;
    try {
      assertValidStatusTransition(currentStatus, targetStatus);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Invalid status transition";
      return {
        success: false,
        error: { code: "INVALID_STATUS_TRANSITION", message: msg },
      };
    }

    devProjects[index]!.masterStatus = targetStatus;
    devProjects[index]!.updatedAt = new Date().toISOString();
    writePersistedDevProjects(devProjects);

    try {
      await dispatchRealtimeNotification({
        eventType: "STATUS_UPDATE",
        projectId: devProjects[index]!.id,
        intakeId: devProjects[index]!.intakeId,
        title: "Study Status Updated",
        message: `Study "${devProjects[index]!.researchTitle}" transitioned to ${targetStatus.replace(/_/g, " ")}.`,
        targetRoles: ["ADMIN", "CEO"],
        includeProjectParties: true,
      });
    } catch {
      // Ignore
    }

    revalidatePath("/dashboard/admin/intake");
    revalidatePath(`/dashboard/admin/projects/${projectId}`);
    revalidatePath(`/dashboard/client/projects/${projectId}`);

    return {
      success: true,
      data: devProjects[index]!,
    };
  }
}

/**
 * 5. Admin requests missing information from client.
 * Transitions project to AWAITING_INFORMATION and records reason.
 */
export async function requestMissingInfo(
  input: unknown
): Promise<ActionResponse<ProjectDetailItem>> {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "CEO")) {
    return {
      success: false,
      error: { code: "FORBIDDEN", message: "Only Administrators can request missing information." },
    };
  }

  const parsed = RequestMissingInfoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Please provide a valid explanation for the missing information.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const { projectId, reason } = parsed.data;

  try {
    const existing = await db.project.findFirst({
      where: {
        OR: [{ id: projectId }, { intakeId: projectId }],
      },
    });

    if (!existing) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Project not found." },
      };
    }

    assertValidStatusTransition(existing.masterStatus, "AWAITING_INFORMATION");

    const updated = await db.project.update({
      where: { id: existing.id },
      data: {
        masterStatus: "AWAITING_INFORMATION",
        missingInfoReason: reason.trim(),
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            clientProfile: true,
          },
        },
        files: true,
      },
    });

    try {
      await dispatchRealtimeNotification({
        eventType: "INPUT_UPDATE",
        projectId: existing.id,
        intakeId: existing.intakeId,
        title: "Information Requested",
        message: `Details requested for study ${existing.intakeId}: "${reason}"`,
        targetRoles: ["ADMIN"],
        includeProjectParties: true,
      });
    } catch (e) {
      console.warn("[requestMissingInfo] Realtime notification warning:", e);
    }

    revalidatePath("/dashboard/admin/intake");
    revalidatePath(`/dashboard/admin/projects/${projectId}`);
    revalidatePath(`/dashboard/client/projects/${projectId}`);

    return {
      success: true,
      data: updated as ProjectDetailItem,
    };
  } catch (dbError) {
    if (dbError instanceof Error && dbError.message.includes("INVALID_STATUS_TRANSITION")) {
      return {
        success: false,
        error: { code: "INVALID_STATUS_TRANSITION", message: dbError.message },
      };
    }

    console.warn("[requestMissingInfo] DB offline, updating in dev cache.", dbError);

    const devProjects = readPersistedDevProjects();
    const index = devProjects.findIndex((p) => p.id === projectId || p.intakeId === projectId);

    if (index === -1) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Project not found in dev cache." },
      };
    }

    devProjects[index]!.masterStatus = "AWAITING_INFORMATION";
    devProjects[index]!.missingInfoReason = reason.trim();
    devProjects[index]!.updatedAt = new Date().toISOString();
    writePersistedDevProjects(devProjects);

    try {
      await dispatchRealtimeNotification({
        eventType: "INPUT_UPDATE",
        projectId: devProjects[index]!.id,
        intakeId: devProjects[index]!.intakeId,
        title: "Information Requested",
        message: `Details requested for study ${devProjects[index]!.intakeId}: "${reason}"`,
        targetRoles: ["ADMIN"],
        includeProjectParties: true,
      });
    } catch {
      // Ignore
    }

    revalidatePath("/dashboard/admin/intake");
    revalidatePath(`/dashboard/admin/projects/${projectId}`);
    revalidatePath(`/dashboard/client/projects/${projectId}`);

    return {
      success: true,
      data: devProjects[index]!,
    };
  }
}

/**
 * 6. Admin marks intake complete, transitioning project to UNDER_EVALUATION.
 */
export async function markIntakeComplete(
  projectId: string
): Promise<ActionResponse<ProjectDetailItem>> {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "CEO")) {
    return {
      success: false,
      error: { code: "FORBIDDEN", message: "Only Administrators can approve intake completeness." },
    };
  }

  try {
    const existing = await db.project.findFirst({
      where: {
        OR: [{ id: projectId }, { intakeId: projectId }],
      },
    });

    if (!existing) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Project not found." },
      };
    }

    assertValidStatusTransition(existing.masterStatus, "UNDER_EVALUATION");

    const updated = await db.project.update({
      where: { id: existing.id },
      data: {
        masterStatus: "UNDER_EVALUATION",
        missingInfoReason: null,
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            clientProfile: true,
          },
        },
        files: true,
      },
    });

    try {
      await dispatchRealtimeNotification({
        eventType: "STATUS_UPDATE",
        projectId: existing.id,
        intakeId: existing.intakeId,
        title: "Intake Evaluation Begun",
        message: `Study ${existing.intakeId} has been verified and is under evaluation.`,
        targetRoles: ["ADMIN", "CEO"],
        includeProjectParties: true,
      });
    } catch (e) {
      console.warn("[markIntakeComplete] Realtime notification warning:", e);
    }

    revalidatePath("/dashboard/admin/intake");
    revalidatePath(`/dashboard/admin/projects/${projectId}`);
    revalidatePath(`/dashboard/client/projects/${projectId}`);

    return {
      success: true,
      data: updated as ProjectDetailItem,
    };
  } catch (dbError) {
    if (dbError instanceof Error && dbError.message.includes("INVALID_STATUS_TRANSITION")) {
      return {
        success: false,
        error: { code: "INVALID_STATUS_TRANSITION", message: dbError.message },
      };
    }

    console.warn("[markIntakeComplete] DB offline, updating in dev cache.", dbError);

    const devProjects = readPersistedDevProjects();
    const index = devProjects.findIndex((p) => p.id === projectId || p.intakeId === projectId);

    if (index === -1) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Project not found in dev cache." },
      };
    }

    devProjects[index]!.masterStatus = "UNDER_EVALUATION";
    devProjects[index]!.missingInfoReason = null;
    devProjects[index]!.updatedAt = new Date().toISOString();
    writePersistedDevProjects(devProjects);

    try {
      await dispatchRealtimeNotification({
        eventType: "STATUS_UPDATE",
        projectId: devProjects[index]!.id,
        intakeId: devProjects[index]!.intakeId,
        title: "Intake Evaluation Begun",
        message: `Study ${devProjects[index]!.intakeId} has been verified and is under evaluation.`,
        targetRoles: ["ADMIN", "CEO"],
        includeProjectParties: true,
      });
    } catch {
      // Ignore
    }

    revalidatePath("/dashboard/admin/intake");
    revalidatePath(`/dashboard/admin/projects/${projectId}`);
    revalidatePath(`/dashboard/client/projects/${projectId}`);

    return {
      success: true,
      data: devProjects[index]!,
    };
  }
}

/**
 * 7. Remove an uploaded project file (Allowed pre-SOW signing only).
 */
export async function deleteProjectFile(
  projectId: string,
  fileId: string
): Promise<ActionResponse<{ deletedFileId: string }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "You must be logged in." },
    };
  }

  try {
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { files: true },
    });

    if (!project) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Project not found." },
      };
    }

    if (
      project.masterStatus === "SOW_SIGNED" ||
      project.masterStatus === "ACTIVE" ||
      project.masterStatus === "IN_PROGRESS" ||
      project.masterStatus === "DELIVERED"
    ) {
      return {
        success: false,
        error: {
          code: "IMMUTABLE_PRE_SOW",
          message: "Files cannot be removed after SOW has been signed and commissioned.",
        },
      };
    }

    await db.projectFile.delete({
      where: { id: fileId },
    });

    revalidatePath(`/dashboard/client/projects/${projectId}`);
    revalidatePath(`/dashboard/admin/projects/${projectId}`);

    return {
      success: true,
      data: { deletedFileId: fileId },
    };
  } catch (dbError) {
    console.warn("[deleteProjectFile] DB offline, deleting from dev cache.", dbError);

    const devProjects = readPersistedDevProjects();
    const pIndex = devProjects.findIndex((p) => p.id === projectId || p.intakeId === projectId);

    if (pIndex !== -1) {
      devProjects[pIndex]!.files = devProjects[pIndex]!.files.filter((f) => f.id !== fileId);
      writePersistedDevProjects(devProjects);
    }

    return {
      success: true,
      data: { deletedFileId: fileId },
    };
  }
}

/**
 * 7b. Upload/Attach a new project file (Allowed pre-SOW signing only).
 */
export async function addProjectFile(
  projectId: string,
  fileData: {
    fileName: string;
    filePath: string;
    fileType: string;
    fileCategory: FileCategory;
  }
): Promise<ActionResponse<ProjectFileItem>> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "You must be logged in to upload files." },
    };
  }

  try {
    const project = await db.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Project not found." },
      };
    }

    if (
      project.masterStatus === "SOW_SIGNED" ||
      project.masterStatus === "ACTIVE" ||
      project.masterStatus === "IN_PROGRESS" ||
      project.masterStatus === "DELIVERED"
    ) {
      return {
        success: false,
        error: {
          code: "IMMUTABLE_PRE_SOW",
          message: "Files cannot be added after SOW has been signed and commissioned.",
        },
      };
    }

    const ALLOWED_CATEGORY_EXTENSIONS: Partial<Record<FileCategory, string[]>> = {
      RESEARCH_DOCUMENT: [".pdf", ".docx", ".doc", ".zip"],
      DATASET: [".xlsx", ".xls", ".csv", ".sav", ".dta", ".tsv"],
      QUESTIONNAIRE: [".pdf", ".docx", ".doc", ".xlsx", ".csv"],
      PAYMENT_PROOF: [".pdf", ".png", ".jpg", ".jpeg"],
      ANALYSIS_OUTPUT: [".pdf", ".docx", ".xlsx", ".csv", ".zip", ".sav"],
      DELIVERABLE: [".pdf", ".docx", ".xlsx", ".csv", ".zip"],
      DISPUTE_EVIDENCE: [".pdf", ".docx", ".png", ".jpg", ".jpeg", ".zip"],
    };

    const fileNameLower = fileData.fileName.toLowerCase();
    const allowed = ALLOWED_CATEGORY_EXTENSIONS[fileData.fileCategory] || [".pdf", ".docx", ".xlsx", ".csv", ".sav"];
    const hasValidExtension = allowed.some((ext) => fileNameLower.endsWith(ext));

    if (!hasValidExtension) {
      return {
        success: false,
        error: {
          code: "INVALID_FILE_TYPE",
          message: `The file "${fileData.fileName}" is not an accepted format for the selected category (${allowed.join(", ")}).`,
        },
      };
    }

    const created = await db.projectFile.create({
      data: {
        projectId,
        fileName: fileData.fileName,
        filePath: fileData.filePath,
        fileType: fileData.fileType,
        fileCategory: fileData.fileCategory,
      },
    });

    try {
      await dispatchRealtimeNotification({
        eventType: "INPUT_UPDATE",
        projectId: project.id,
        intakeId: project.intakeId,
        title: "Study File Uploaded",
        message: `File "${fileData.fileName}" (${fileData.fileCategory.replace(/_/g, " ")}) uploaded to study ${project.intakeId}.`,
        targetRoles: ["ADMIN"],
        includeProjectParties: true,
      });
    } catch (e) {
      console.warn("[addProjectFile] Realtime notification warning:", e);
    }

    revalidatePath(`/dashboard/client/projects/${projectId}`);
    revalidatePath(`/dashboard/admin/projects/${projectId}`);
    revalidatePath(`/dashboard/admin/intake`);
    revalidatePath(`/dashboard/client`);
    revalidatePath(`/dashboard/client/projects`);

    return {
      success: true,
      data: created as unknown as ProjectFileItem,
    };
  } catch (dbError) {
    console.warn("[addProjectFile] DB offline, saving to dev cache.", dbError);

    const devProjects = readPersistedDevProjects();
    const pIndex = devProjects.findIndex((p) => p.id === projectId || p.intakeId === projectId);

    if (pIndex === -1) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Project not found in dev cache." },
      };
    }

    const newFile: ProjectFileItem = {
      id: `file_${Date.now()}`,
      projectId: devProjects[pIndex]!.id,
      fileName: fileData.fileName,
      filePath: fileData.filePath,
      fileType: fileData.fileType,
      fileCategory: fileData.fileCategory,
      uploadedAt: new Date().toISOString(),
    };

    devProjects[pIndex]!.files.push(newFile);
    writePersistedDevProjects(devProjects);

    try {
      await dispatchRealtimeNotification({
        eventType: "INPUT_UPDATE",
        projectId: devProjects[pIndex]!.id,
        intakeId: devProjects[pIndex]!.intakeId,
        title: "Study File Uploaded",
        message: `File "${fileData.fileName}" (${fileData.fileCategory.replace(/_/g, " ")}) uploaded to study ${devProjects[pIndex]!.intakeId}.`,
        targetRoles: ["ADMIN"],
        includeProjectParties: true,
      });
    } catch {
      // Ignore
    }

    revalidatePath(`/dashboard/client/projects/${projectId}`);
    revalidatePath(`/dashboard/admin/projects/${projectId}`);
    revalidatePath(`/dashboard/admin/intake`);
    revalidatePath(`/dashboard/client`);
    revalidatePath(`/dashboard/client/projects`);

    return {
      success: true,
      data: newFile,
    };
  }
}

/**
 * 8. Client resolves missing information request, transitioning project back to UNDER_EVALUATION.
 */
export async function resolveMissingInfo(
  projectId: string
): Promise<ActionResponse<ProjectDetailItem>> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "You must be logged in to update this study." },
    };
  }

  try {
    const existing = await db.project.findUnique({
      where: { id: projectId },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            clientProfile: true,
          },
        },
        files: true,
      },
    });

    if (!existing) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Project not found." },
      };
    }

    // Ensure state transition legality (AWAITING_INFORMATION -> UNDER_EVALUATION)
    assertValidStatusTransition(existing.masterStatus, "UNDER_EVALUATION");

    const updated = await db.project.update({
      where: { id: projectId },
      data: {
        masterStatus: "UNDER_EVALUATION",
        missingInfoReason: null,
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            clientProfile: true,
          },
        },
        files: true,
      },
    });

    // Notify admin & parties that missing information has been submitted
    try {
      await dispatchRealtimeNotification({
        eventType: "INPUT_UPDATE",
        projectId: updated.id,
        intakeId: updated.intakeId,
        title: "Information Provided",
        message: `Client provided requested information for ${updated.intakeId}. Ready for quote builder.`,
        targetRoles: ["ADMIN"],
        includeProjectParties: true,
      });
    } catch (e) {
      console.warn("[resolveMissingInfo] Realtime notification error:", e);
    }

    revalidatePath("/dashboard/client");
    revalidatePath("/dashboard/client/projects");
    revalidatePath(`/dashboard/client/projects/${projectId}`);
    revalidatePath("/dashboard/admin/intake");
    revalidatePath(`/dashboard/admin/projects/${projectId}`);

    return {
      success: true,
      data: updated as ProjectDetailItem,
    };
  } catch (dbError) {
    console.warn("[resolveMissingInfo] DB offline, updating in dev cache.", dbError);

    const devProjects = readPersistedDevProjects();
    const index = devProjects.findIndex((p) => p.id === projectId || p.intakeId === projectId);

    if (index === -1) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Project not found in dev cache." },
      };
    }

    devProjects[index]!.masterStatus = "UNDER_EVALUATION";
    devProjects[index]!.missingInfoReason = null;
    devProjects[index]!.updatedAt = new Date().toISOString();
    writePersistedDevProjects(devProjects);

    try {
      await dispatchRealtimeNotification({
        eventType: "INPUT_UPDATE",
        projectId: devProjects[index]!.id,
        intakeId: devProjects[index]!.intakeId,
        title: "Information Provided",
        message: `Client provided requested information for ${devProjects[index]!.intakeId}. Ready for quote builder.`,
        targetRoles: ["ADMIN"],
        includeProjectParties: true,
      });
    } catch {
      // Ignore
    }

    revalidatePath("/dashboard/client");
    revalidatePath("/dashboard/client/projects");
    revalidatePath(`/dashboard/client/projects/${projectId}`);
    revalidatePath("/dashboard/admin/intake");
    revalidatePath(`/dashboard/admin/projects/${projectId}`);

    return {
      success: true,
      data: devProjects[index]!,
    };
  }
}

/**
 * 8. Retrieve complete audit stream and verification trail for a specific study.
 */
export async function getProjectAuditTrail(
  id: string
): Promise<ActionResponse<AuditTelemetryEvent[]>> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "You must be logged in." },
    };
  }

  try {
    const project = await withDbTimeout(
      db.project.findFirst({
        where: {
          OR: [{ id }, { intakeId: id }],
        },
        include: {
          client: true,
          files: {
            orderBy: { uploadedAt: "asc" },
          },
          quotations: {
            orderBy: { createdAt: "asc" },
          },
          sows: {
            orderBy: { generatedAt: "asc" },
          },
          payments: {
            orderBy: { createdAt: "asc" },
          },
        },
      })
    );

    if (!project) {
      return { success: false, error: { code: "NOT_FOUND", message: "Project not found." } };
    }

    const events: AuditTelemetryEvent[] = [];

    // 1. Project Intake creation
    events.push({
      id: `intake-${project.id}`,
      timestamp: new Date(project.createdAt).toLocaleString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      rawDate: project.createdAt,
      actor: project.client.fullName || "Lead Researcher",
      actorRole: "CLIENT",
      action: "Study Intake Registered",
      targetId: project.intakeId,
      detail: `Study intake submitted: "${project.researchTitle}"`,
      badgeText: "Intake",
      badgeType: "info",
    });

    // 2. Uploaded files
    for (const f of project.files) {
      events.push({
        id: `file-${f.id}`,
        timestamp: new Date(f.uploadedAt).toLocaleString("en-PH", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
        rawDate: f.uploadedAt,
        actor: project.client.fullName || "Lead Researcher",
        actorRole: "CLIENT",
        action: "Document Uploaded",
        targetId: project.intakeId,
        detail: `${f.fileName} (${f.fileCategory.replace(/_/g, " ")})`,
        badgeText: "Upload",
        badgeType: "info",
      });
    }

    // 3. Quotation milestones
    for (const q of project.quotations) {
      events.push({
        id: `quote-create-${q.id}`,
        timestamp: new Date(q.createdAt).toLocaleString("en-PH", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
        rawDate: q.createdAt,
        actor: "Admin Desk",
        actorRole: "ADMIN",
        action: "Quotation Generated",
        targetId: project.intakeId,
        detail: `Package ${q.packageName.replace(/_/g, " ")} valued at ₱${Number(q.totalAmount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`,
        badgeText: "Quote",
        badgeType: "info",
      });

      if (q.status === "CLIENT_APPROVED" && q.respondedAt) {
        events.push({
          id: `quote-approved-${q.id}`,
          timestamp: new Date(q.respondedAt).toLocaleString("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          }),
          rawDate: q.respondedAt,
          actor: project.client.fullName || "Lead Researcher",
          actorRole: "CLIENT",
          action: "Quotation Approved",
          targetId: project.intakeId,
          detail: `Approved ₱${Number(q.totalAmount).toLocaleString("en-PH", { minimumFractionDigits: 2 })} quotation terms.`,
          badgeText: "Approved",
          badgeType: "success",
        });
      } else if (q.status === "QUOTE_DECLINED" && q.respondedAt) {
        events.push({
          id: `quote-declined-${q.id}`,
          timestamp: new Date(q.respondedAt).toLocaleString("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          }),
          rawDate: q.respondedAt,
          actor: project.client.fullName || "Lead Researcher",
          actorRole: "CLIENT",
          action: "Quotation Declined",
          targetId: project.intakeId,
          detail: q.declineReason || "Client requested revision to quotation.",
          badgeText: "Declined",
          badgeType: "warning",
        });
      }
    }

    // 4. SOW milestones
    for (const s of project.sows) {
      events.push({
        id: `sow-gen-${s.id}`,
        timestamp: new Date(s.generatedAt).toLocaleString("en-PH", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
        rawDate: s.generatedAt,
        actor: "Admin Desk",
        actorRole: "ADMIN",
        action: "Scope of Work Drafted",
        targetId: project.intakeId,
        detail: `SOW prepared with ${s.turnaroundDays} business days turnaround.`,
        badgeText: "SOW",
        badgeType: "info",
      });

      if (s.isLocked && s.signedAt) {
        events.push({
          id: `sow-signed-${s.id}`,
          timestamp: new Date(s.signedAt).toLocaleString("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          }),
          rawDate: s.signedAt,
          actor: s.signedByName || project.client.fullName,
          actorRole: "CLIENT",
          action: "Scope of Work Executed",
          targetId: project.intakeId,
          detail: `Digitally signed by ${s.signedByName || "Client"}.`,
          badgeText: "Executed",
          badgeType: "success",
        });
      }
    }

    // 5. Payment milestones
    for (const p of project.payments) {
      events.push({
        id: `pay-submit-${p.id}`,
        timestamp: new Date(p.createdAt).toLocaleString("en-PH", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
        rawDate: p.createdAt,
        actor: project.client.fullName || "Lead Researcher",
        actorRole: "CLIENT",
        action: "Payment Deposit Submitted",
        targetId: project.intakeId,
        detail: `${p.paymentType.replace(/_/g, " ")} of ₱${Number(p.amountSubmitted).toLocaleString("en-PH", { minimumFractionDigits: 2 })} via ${p.paymentMethod || "Electronic Deposit"}${p.referenceNumber ? ` (Ref: ${p.referenceNumber})` : ""}.`,
        badgeText: "Deposit",
        badgeType: "info",
      });

      if (p.paymentStatus === "VERIFIED" || p.paymentStatus === "FULLY_PAID") {
        events.push({
          id: `pay-verified-${p.id}`,
          timestamp: new Date(p.verifiedAt || p.updatedAt).toLocaleString("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          }),
          rawDate: p.verifiedAt || p.updatedAt,
          actor: "Finance Officer",
          actorRole: "FINANCE_OFFICER",
          action: p.paymentStatus === "FULLY_PAID" ? "Full Settlement Cleared" : "Downpayment Cleared",
          targetId: project.intakeId,
          detail: `Cleared ₱${Number(p.amountSubmitted).toLocaleString("en-PH", { minimumFractionDigits: 2 })} into verified project escrow.`,
          badgeText: "Cleared",
          badgeType: "success",
        });
      } else if (p.paymentStatus === "REJECTED") {
        events.push({
          id: `pay-rejected-${p.id}`,
          timestamp: new Date(p.updatedAt).toLocaleString("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          }),
          rawDate: p.updatedAt,
          actor: "Finance Officer",
          actorRole: "FINANCE_OFFICER",
          action: "Payment Proof Rejected",
          targetId: project.intakeId,
          detail: p.rejectionReason || "Receipt did not meet verification criteria.",
          badgeText: "Rejected",
          badgeType: "danger",
        });
      }
    }

    // Sort chronologically descending (newest first)
    events.sort((a, b) => new Date(b.rawDate || 0).getTime() - new Date(a.rawDate || 0).getTime());

    return {
      success: true,
      data: events,
    };
  } catch (err) {
    console.warn("[getProjectAuditTrail] Error fetching database trail:", err);
    return {
      success: true,
      data: [],
    };
  }
}

