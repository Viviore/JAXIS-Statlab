import { Project, ProjectKPIs, AuditTelemetryEvent } from "@/types/project";
import { INITIAL_PROJECTS, INITIAL_KPIS, INITIAL_AUDIT_STREAM } from "@/lib/mock-data/projects.data";

// In-memory data store for client runtime mutations
let projectsStore: Project[] = [...INITIAL_PROJECTS];
const kpisStore: ProjectKPIs = { ...INITIAL_KPIS };
let auditStore: AuditTelemetryEvent[] = [...INITIAL_AUDIT_STREAM];

export interface ProjectFilterOptions {
  status?: string;
  search?: string;
  statistician?: string;
}

export class ProjectService {
  /**
   * Retrieves active projects with optional search & status filtering
   */
  async getProjects(filter?: ProjectFilterOptions): Promise<Project[]> {
    // Simulates non-blocking micro-latency for smooth UX
    await new Promise((resolve) => setTimeout(resolve, 50));

    let results = [...projectsStore];

    if (filter?.status && filter.status !== "ALL") {
      results = results.filter((p) => p.status === filter.status);
    }

    if (filter?.search && filter.search.trim() !== "") {
      const q = filter.search.toLowerCase().trim();
      results = results.filter(
        (p) =>
          p.id.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.client.toLowerCase().includes(q) ||
          p.university.toLowerCase().includes(q) ||
          p.field.toLowerCase().includes(q) ||
          p.statisticians.toLowerCase().includes(q) ||
          p.method.toLowerCase().includes(q)
      );
    }

    if (filter?.statistician && filter.statistician !== "ALL") {
      results = results.filter((p) => p.statisticians === filter.statistician);
    }

    return results;
  }

  /**
   * Retrieves a single project by ID
   */
  async getProjectById(id: string): Promise<Project | null> {
    await new Promise((resolve) => setTimeout(resolve, 30));
    const project = projectsStore.find((p) => p.id === id);
    return project || null;
  }

  /**
   * Retrieves dashboard KPI aggregated metrics
   */
  async getKPIs(): Promise<ProjectKPIs> {
    await new Promise((resolve) => setTimeout(resolve, 30));
    return {
      ...kpisStore,
      totalActiveStudies: projectsStore.length,
      underEvaluationCount: projectsStore.filter((p) => p.status === "UNDER_EVALUATION" || p.status === "DRAFT").length,
      qaReviewGateCount: projectsStore.filter((p) => p.qaStatus === "FOR_QA" || p.qaStatus === "IN_QA_REVIEW").length,
      fullyPaidReleasedCount: projectsStore.filter((p) => p.paymentStatus === "FULLY_PAID").length,
    };
  }

  /**
   * Retrieves live governance audit telemetry stream
   */
  async getAuditStream(): Promise<AuditTelemetryEvent[]> {
    await new Promise((resolve) => setTimeout(resolve, 30));
    return [...auditStore];
  }

  /**
   * Creates a new project intake record
   */
  async createProject(input: Partial<Project>): Promise<Project> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const nextNumber = projectsStore.length + 90;
    const newProject: Project = {
      id: input.id || `JAX-2026-0${nextNumber}`,
      title: input.title || "Untitled Research Study",
      client: input.client || "Lead Researcher",
      university: input.university || "Academic Institution",
      field: input.field || "General Science",
      statisticians: input.statisticians || "Unassigned",
      method: input.method || "Descriptive & Inferential Analysis",
      status: input.status || "UNDER_EVALUATION",
      qaStatus: input.qaStatus || "FOR_QA",
      paymentStatus: input.paymentStatus || "UNPAID",
      updated: "Just now",
      datasetName: input.datasetName || "survey_data.csv",
      datasetSize: input.datasetSize || "1.0 MB",
      syntaxName: input.syntaxName || "syntax.sps",
      artifacts: input.artifacts || [],
    };

    projectsStore = [newProject, ...projectsStore];

    // Add telemetry log
    const auditEvent: AuditTelemetryEvent = {
      id: `aud-${Date.now()}`,
      timestamp: "Just now",
      actor: "Client System",
      actorRole: "CLIENT",
      action: "submitted new intake dataset",
      targetId: newProject.id,
      detail: `${newProject.title.slice(0, 50)}...`,
      badgeText: "Intake Submitted",
      badgeType: "info",
    };
    auditStore = [auditEvent, ...auditStore];

    return newProject;
  }

  /**
   * Updates an existing project status / fields
   */
  async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    await new Promise((resolve) => setTimeout(resolve, 60));
    const index = projectsStore.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const existing = projectsStore[index]!;
    const updated: Project = {
      ...existing,
      ...updates,
      id: existing.id,
      updated: "Just now",
    };
    projectsStore[index] = updated;
    return updated;
  }
}

export const projectService = new ProjectService();
