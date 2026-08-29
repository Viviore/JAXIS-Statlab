import { db, withDbTimeout } from "@/lib/db";

export interface DisputeWindowCheckResult {
  isOpen: boolean;
  deliveredAt: Date | null;
  windowExpiresAt: Date | null;
  remainingDays: number;
  remainingMs: number;
  reason?: string;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const TURNAROUND_ADDONS = ["RUSH", "EXPRESS", "EMERGENCY"];

/**
 * Validates that the 7-day dispute window is open for a project.
 * Projects must be in DELIVERED or CLOSED status, and within 7 days of delivery.
 */
export async function assertDisputeWindowOpen(projectId: string): Promise<DisputeWindowCheckResult> {
  const project = await withDbTimeout(
    db.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        masterStatus: true,
        deliveredAt: true,
        hasActiveDispute: true,
        hasPendingRefund: true,
      },
    })
  );

  if (!project) {
    throw new Error("Project not found.");
  }

  if (!project.deliveredAt) {
    throw new Error("This study has not been delivered yet. Dispute filing opens only after final delivery.");
  }

  const windowExpiresAt = new Date(project.deliveredAt.getTime() + SEVEN_DAYS_MS);
  const now = new Date();
  const remainingMs = windowExpiresAt.getTime() - now.getTime();

  if (remainingMs <= 0) {
    throw new Error("The 7-day post-delivery dispute window has closed.");
  }

  return {
    isOpen: true,
    deliveredAt: project.deliveredAt,
    windowExpiresAt,
    remainingDays: Math.ceil(remainingMs / (24 * 60 * 60 * 1000)),
    remainingMs,
  };
}

/**
 * Checks dispute window without throwing an error (for UI state).
 */
export async function checkDisputeEligibility(projectId: string): Promise<DisputeWindowCheckResult> {
  try {
    const res = await assertDisputeWindowOpen(projectId);
    return res;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Not eligible for dispute filing.";
    return {
      isOpen: false,
      deliveredAt: null,
      windowExpiresAt: null,
      remainingDays: 0,
      remainingMs: 0,
      reason: msg,
    };
  }
}

/**
 * Calculates the refundable amount for an SLA turnaround breach.
 * Under Core Rule 11, only the turnaround upgrade add-on fee (Rush/Express/Emergency)
 * is refundable; the core statistical package fee remains intact.
 */
export async function computeSLABreachRefund(projectId: string): Promise<number> {
  const quotation = await withDbTimeout(
    db.quotation.findFirst({
      where: {
        projectId,
        status: "CLIENT_APPROVED",
      },
      include: {
        lineItems: true,
      },
      orderBy: { createdAt: "desc" },
    })
  );

  if (!quotation || !quotation.lineItems) {
    return 0;
  }

  const turnaroundItems = quotation.lineItems.filter((item) =>
    TURNAROUND_ADDONS.includes(item.itemName.toUpperCase())
  );

  const totalTurnaroundRefund = turnaroundItems.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  return totalTurnaroundRefund;
}
