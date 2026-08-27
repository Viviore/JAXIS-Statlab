import { Project, ProjectKPIs, AuditTelemetryEvent } from "@/types/project";

export const INITIAL_PROJECTS: Project[] = [];

export const INITIAL_KPIS: ProjectKPIs = {
  totalActiveStudies: 0,
  totalActiveStudiesTrend: "0% this month",
  underEvaluationCount: 0,
  qaReviewGateCount: 0,
  fullyPaidReleasedCount: 0,
  monthlyRevenueEscrow: "₱0.00",
  escrowSecuredRatio: "100% Escrow Secured",
};

export const INITIAL_AUDIT_STREAM: AuditTelemetryEvent[] = [];
