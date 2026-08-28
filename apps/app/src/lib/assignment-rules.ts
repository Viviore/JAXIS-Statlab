import type { RoleName, ProjectStatus } from "@prisma/client";

/**
 * Ensures only Administrators and Executives can assign or reassign staff.
 */
export function assertCanManageAssignments(role: RoleName): void {
  if (role !== "ADMIN" && role !== "CEO") {
    throw new Error("FORBIDDEN: Only Administrators and Executives can manage staff assignments.");
  }
}

/**
 * Validates that a project is ready for expert assignment.
 * Projects must have cleared initial downpayment (status ACTIVE).
 */
export function assertCanBeAssigned(status: ProjectStatus): void {
  if (status !== "ACTIVE" && status !== "REASSIGNMENT_NEEDED" && status !== "EXPERT_ASSIGNED") {
    throw new Error(
      `INVALID_STATUS: Projects must be in "ACTIVE" status with cleared payment before assigning experts. Current status is "${status}".`
    );
  }
}

/**
 * Computes a specialization affinity score (0 to 100) between project requirements
 * and a statistician's academic specializations & software tools.
 */
export function calculateSpecializationScore(
  projectMethod: string | null | undefined,
  projectField: string | null | undefined,
  staffSpecializations: string[],
  staffTools: string[]
): number {
  let score = 50; // Base score for any certified statistician

  const normMethod = (projectMethod || "").toLowerCase();
  const normField = (projectField || "").toLowerCase();

  for (const spec of staffSpecializations) {
    const s = spec.toLowerCase();
    if (normMethod && (s.includes(normMethod) || normMethod.includes(s))) {
      score += 25;
    }
    if (normField && (s.includes(normField) || normField.includes(s))) {
      score += 25;
    }
  }

  // Bonus for relevant tools (SPSS, R, Python, Stata)
  for (const tool of staffTools) {
    const t = tool.toLowerCase();
    if (normMethod.includes(t)) {
      score += 10;
    }
  }

  return Math.min(100, score);
}

export interface BurnoutRiskResult {
  isAtRisk: boolean;
  level: "NONE" | "MODERATE" | "HIGH";
  reasons: string[];
}

/**
 * Assesses operational burnout risk for a specialist based on:
 * 1. High concurrent workload (3+ active studies)
 * 2. SLA deadline collisions (2 or more deliverables due within 24 hours)
 * 3. Urgent deadline concentration (2 or more urgent/overdue studies)
 */
export function assessBurnoutRisk(
  assignedStudies: { slaDueAt: Date | string; isUrgent?: boolean; isOverdue?: boolean; isPaused?: boolean }[]
): BurnoutRiskResult {
  const activeStudies = assignedStudies.filter((s) => !s.isPaused);
  const reasons: string[] = [];

  // 1. High concurrent workload check
  if (activeStudies.length >= 3) {
    reasons.push(`High concurrent load: ${activeStudies.length} active studies`);
  }

  // 2. Urgent concentration check
  const urgentCount = activeStudies.filter((s) => s.isUrgent || s.isOverdue).length;
  if (urgentCount >= 2) {
    reasons.push(`Critical urgency concentration: ${urgentCount} studies due within 24 hours or overdue`);
  }

  // 3. Deadline collision check (studies due within 24 hours of each other)
  const timestamps = activeStudies
    .map((s) => new Date(s.slaDueAt).getTime())
    .sort((a, b) => a - b);

  let hasCollision = false;
  for (let i = 0; i < timestamps.length - 1; i++) {
    const current = timestamps[i];
    const next = timestamps[i + 1];
    if (current && next) {
      const diffHours = Math.abs(next - current) / (1000 * 60 * 60);
      if (diffHours <= 24) {
        hasCollision = true;
        break;
      }
    }
  }

  if (hasCollision) {
    reasons.push("Deadline collision: Multiple deliverables scheduled within 24 hours of each other");
  }

  if (activeStudies.length >= 3 || urgentCount >= 2) {
    return { isAtRisk: true, level: "HIGH", reasons };
  }

  if (hasCollision || (activeStudies.length === 2 && urgentCount === 1)) {
    return { isAtRisk: true, level: "MODERATE", reasons };
  }

  return { isAtRisk: false, level: "NONE", reasons: [] };
}
