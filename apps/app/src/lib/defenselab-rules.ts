import { Decimal } from "@prisma/client/runtime/library";
import { db, withDbTimeout } from "@/lib/db";

export const DEFENSELAB_RATE_PER_HOUR = 250; // PHP 250 per hour
export const RESCHEDULE_MINIMUM_NOTICE_HOURS = 12; // 12-hour strict rule

export interface RescheduleEligibilityResult {
  eligible: boolean;
  violation: "CLIENT_LATE" | "EXPERT_LATE" | null;
  hoursUntilSession: number;
}

/**
 * Calculates whether a DefenseLab session is eligible for standard rescheduling
 * under the 12-hour advance notice rule.
 */
export function assertRescheduleEligible(
  scheduledAt: Date,
  requestedAt: Date = new Date(),
  isClient: boolean = true
): RescheduleEligibilityResult {
  const diffMs = scheduledAt.getTime() - requestedAt.getTime();
  const hoursUntilSession = diffMs / (1000 * 60 * 60);

  if (hoursUntilSession < RESCHEDULE_MINIMUM_NOTICE_HOURS) {
    return {
      eligible: false,
      violation: isClient ? "CLIENT_LATE" : "EXPERT_LATE",
      hoursUntilSession,
    };
  }

  return {
    eligible: true,
    violation: null,
    hoursUntilSession,
  };
}

/**
 * Computes total DefenseLab rehearsal session cost in PHP.
 */
export function computeDefenseLabAmount(hours: number): number {
  const validHours = Math.max(1, Math.min(8, Math.floor(hours || 1)));
  return validHours * DEFENSELAB_RATE_PER_HOUR;
}

/**
 * Asserts that the project has purchased the DefenseLab add-on and has verified payment.
 */
export async function assertDefenseLabEntitlement(projectId: string): Promise<{
  hasAddon: boolean;
  isPaid: boolean;
  totalHoursPurchased: number;
  remainingHours: number;
  projectTitle: string;
  clientId: string;
  assignedStatisticianId: string | null;
}> {
  const [project, rawSessions] = await Promise.all([
    withDbTimeout(
      db.project.findUnique({
        where: { id: projectId },
        include: {
          quotations: {
            where: { status: { in: ["CLIENT_APPROVED", "SUPERSEDED"] } },
            include: { lineItems: true },
          },
          assignment: true,
          payments: {
            where: { paymentStatus: { in: ["VERIFIED", "FULLY_PAID"] } },
          },
        },
      })
    ),
    withDbTimeout(
      (db as any).defenseLabSession
        ? (db as any).defenseLabSession.findMany({
            where: {
              projectId,
              status: { in: ["SCHEDULED", "COMPLETED", "NO_SHOW_CLIENT", "PENALTY_APPLIED"] },
            },
          })
        : Promise.resolve([])
    ),
  ]);

  if (!project) {
    throw new Error("Study project record not found.");
  }

  // Check if DEFENSELAB is present in approved quotation line items
  const defenseLabLineItems = project.quotations.flatMap((q) =>
    q.lineItems.filter(
      (li) =>
        li.itemName === "DEFENSELAB" ||
        (li.description && li.description.toLowerCase().includes("defenselab"))
    )
  );

  const hasAddon = defenseLabLineItems.length > 0;
  
  // Compute hours purchased based on amount or count
  let totalHoursPurchased = 0;
  for (const item of defenseLabLineItems) {
    const itemAmount = Number(item.amount);
    // If priced at 250/hr, compute hours; default min 1 hour
    const hours = Math.max(1, Math.round(itemAmount / DEFENSELAB_RATE_PER_HOUR));
    totalHoursPurchased += hours;
  }

  if (totalHoursPurchased === 0 && hasAddon) {
    totalHoursPurchased = 2; // Default mock defense package is 2 hours
  }

  // Count hours already scheduled or consumed
  const scheduledHours = (rawSessions as any[]).reduce(
    (sum: number, s: any) => sum + (s.durationHours || 1),
    0
  );

  const remainingHours = Math.max(0, totalHoursPurchased - scheduledHours);
  const isPaid = project.payments.length > 0;

  return {
    hasAddon,
    isPaid,
    totalHoursPurchased,
    remainingHours,
    projectTitle: project.researchTitle,
    clientId: project.clientId,
    assignedStatisticianId: project.assignment?.statisticianId || null,
  };
}
