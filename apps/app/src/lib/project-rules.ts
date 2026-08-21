import type { ProjectStatus } from "@prisma/client";

/**
 * Valid state transitions for the JAXIS StatLab Project lifecycle state machine.
 * All transitions are validated server-side to prevent illegal status bypasses.
 */
export const VALID_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  NEW_REQUEST: ["AWAITING_INFORMATION", "UNDER_EVALUATION", "CANCELLED"],
  AWAITING_INFORMATION: ["UNDER_EVALUATION", "CANCELLED"],
  UNDER_EVALUATION: ["QUOTE_SENT", "CANCELLED"],
  QUOTE_SENT: ["CLIENT_APPROVED", "CANCELLED"],
  CLIENT_APPROVED: ["SOW_PENDING"],
  SOW_PENDING: ["SOW_SIGNED"],
  SOW_SIGNED: ["AWAITING_PAYMENT"],
  AWAITING_PAYMENT: ["ACTIVE", "EXPIRED", "HALTED"],
  ACTIVE: ["EXPERT_ASSIGNED", "CANCELLED"],
  EXPERT_ASSIGNED: ["IN_PROGRESS"],
  IN_PROGRESS: ["FOR_QA", "SCOPE_CREEP_HALTED", "SLA_PAUSED", "REASSIGNMENT_NEEDED"],
  SLA_PAUSED: ["IN_PROGRESS"],
  SCOPE_CREEP_HALTED: ["IN_PROGRESS", "CANCELLED"],
  FOR_QA: ["QA_REVISION", "DELIVERED", "ETHICAL_BREACH"],
  QA_REVISION: ["FOR_QA"],
  DELIVERED: ["REVISION_REQUESTED", "CLOSED", "DISPUTED"],
  REVISION_REQUESTED: ["IN_PROGRESS"],
  DISPUTED: ["HALTED", "CLOSED"],
  HALTED: ["CLOSED", "DISPUTED"],
  ETHICAL_BREACH: ["CANCELLED"],
  REASSIGNMENT_NEEDED: ["IN_PROGRESS"],
  CLOSED: [],
  CANCELLED: [],
  EXPIRED: [],
};

/**
 * Checks if transitioning from currentStatus to targetStatus is valid.
 */
export function isValidStatusTransition(
  currentStatus: ProjectStatus,
  targetStatus: ProjectStatus
): boolean {
  if (currentStatus === targetStatus) return true;
  const allowed = VALID_TRANSITIONS[currentStatus];
  return allowed ? allowed.includes(targetStatus) : false;
}

/**
 * Asserts that a status transition is permitted, throwing an error if illegal.
 */
export function assertValidStatusTransition(
  currentStatus: ProjectStatus,
  targetStatus: ProjectStatus
): void {
  if (!isValidStatusTransition(currentStatus, targetStatus)) {
    throw new Error(
      `INVALID_STATUS_TRANSITION: Cannot transition project from "${currentStatus}" to "${targetStatus}".`
    );
  }
}

/**
 * Generates a human-readable unique intake ID: JAXIS-YYYYMM-XXXX (e.g. JAXIS-202608-0042).
 */
export function generateIntakeId(seq?: number): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const yearMonth = `${year}${month}`;

  if (seq !== undefined && seq > 0) {
    const paddedSeq = String(seq).padStart(4, "0");
    return `JAXIS-${yearMonth}-${paddedSeq}`;
  }

  // High-entropy 4-digit number fallback
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `JAXIS-${yearMonth}-${randomSuffix}`;
}

/**
 * Human-friendly labels for each ProjectStatus enum value.
 */
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  NEW_REQUEST: "New Request",
  AWAITING_INFORMATION: "Awaiting Information",
  UNDER_EVALUATION: "Under Evaluation",
  QUOTE_SENT: "Quote Sent",
  CLIENT_APPROVED: "Client Approved",
  SOW_PENDING: "SOW Pending",
  SOW_SIGNED: "SOW Signed",
  AWAITING_PAYMENT: "Awaiting Payment",
  ACTIVE: "Active",
  EXPERT_ASSIGNED: "Expert Assigned",
  IN_PROGRESS: "In Progress",
  SCOPE_CREEP_HALTED: "Scope Creep Halted",
  SLA_PAUSED: "SLA Paused",
  FOR_QA: "For QA Review",
  QA_REVISION: "QA Revision Required",
  DELIVERED: "Delivered",
  REVISION_REQUESTED: "Revision Requested",
  CLOSED: "Closed",
  HALTED: "Halted",
  CANCELLED: "Cancelled",
  DISPUTED: "Disputed",
  ETHICAL_BREACH: "Ethical Breach",
  EXPIRED: "Expired",
  REASSIGNMENT_NEEDED: "Reassignment Needed",
};
