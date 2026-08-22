"use server";

import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import { auth } from "@/lib/auth";
import { db, withDbTimeout } from "@/lib/db";
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
import type { ProjectStatus, FileCategory } from "@prisma/client";

const DEV_PROJECTS_FILE = path.join(process.cwd(), ".dev-projects.json");

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
        return tx.project.create({
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
      })
    );

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/client");
    revalidatePath("/dashboard/client/projects");
    revalidatePath("/dashboard/admin/intake");

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
  const { status, search } = parsed.success ? parsed.data : { status: undefined, search: undefined };

  try {
    const isClient = userRole === "CLIENT";

    const projects = await withDbTimeout(
      db.project.findMany({
        where: {
          ...(isClient ? { clientId: userId } : {}),
          ...(status && status !== "ALL" ? { masterStatus: status as ProjectStatus } : {}),
          ...(search?.trim()
            ? {
                OR: [
                  { researchTitle: { contains: search.trim(), mode: "insensitive" } },
                  { intakeId: { contains: search.trim(), mode: "insensitive" } },
                ],
              }
            : {}),
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
        orderBy: { createdAt: "desc" },
      })
    );

    return {
      success: true,
      data: projects as unknown as ProjectDetailItem[],
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

    return {
      success: true,
      data: project as unknown as ProjectDetailItem,
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

    return {
      success: true,
      data: project,
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
    const existing = await db.project.findUnique({
      where: { id: projectId },
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
      where: { id: projectId },
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

    revalidatePath("/dashboard/admin/intake");
    revalidatePath(`/dashboard/admin/projects/${projectId}`);
    revalidatePath(`/dashboard/client/projects/${projectId}`);

    return {
      success: true,
      data: updated as ProjectDetailItem,
    };
  } catch (dbError) {
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
 * 5. Admin requests missing information, transitioning status to AWAITING_INFORMATION.
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
    const existing = await db.project.findUnique({
      where: { id: projectId },
    });

    if (!existing) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Project not found." },
      };
    }

    assertValidStatusTransition(existing.masterStatus, "AWAITING_INFORMATION");

    const updated = await db.project.update({
      where: { id: projectId },
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

    revalidatePath("/dashboard/admin/intake");
    revalidatePath(`/dashboard/admin/projects/${projectId}`);
    revalidatePath(`/dashboard/client/projects/${projectId}`);

    return {
      success: true,
      data: updated as ProjectDetailItem,
    };
  } catch (dbError) {
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
    const existing = await db.project.findUnique({
      where: { id: projectId },
    });

    if (!existing) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Project not found." },
      };
    }

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

    revalidatePath("/dashboard/admin/intake");
    revalidatePath(`/dashboard/admin/projects/${projectId}`);
    revalidatePath(`/dashboard/client/projects/${projectId}`);

    return {
      success: true,
      data: updated as ProjectDetailItem,
    };
  } catch (dbError) {
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

    const created = await db.projectFile.create({
      data: {
        projectId,
        fileName: fileData.fileName,
        filePath: fileData.filePath,
        fileType: fileData.fileType,
        fileCategory: fileData.fileCategory,
      },
    });

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
