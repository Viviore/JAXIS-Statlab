import { z } from "zod";

export const ReportTypeEnum = z.enum([
  "revenue-summary",
  "expert-performance",
  "project-volume",
  "turnaround-analytics",
  "dispute-refund",
  "client-acquisition",
  "ledger-export",
  "payout-report",
]);
export type ReportType = z.infer<typeof ReportTypeEnum>;

export const ReportQuerySchema = z.object({
  reportType: ReportTypeEnum,
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  packageName: z.string().optional(),
});
export type ReportQueryInput = z.infer<typeof ReportQuerySchema>;

export const ArchiveProjectSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
});
export type ArchiveProjectInput = z.infer<typeof ArchiveProjectSchema>;

export const ArchiveFilterSchema = z.object({
  search: z.string().optional(),
  packageName: z.string().optional(),
});
export type ArchiveFilterInput = z.infer<typeof ArchiveFilterSchema>;

export const DataDeletionRequestSchema = z.object({
  notes: z.string().optional(),
});
export type DataDeletionRequestInput = z.infer<typeof DataDeletionRequestSchema>;

export const ProcessDeletionSchema = z.object({
  requestId: z.string().min(1, "Request ID is required"),
  status: z.enum(["PROCESSED", "REJECTED"]),
  notes: z.string().optional(),
});
export type ProcessDeletionInput = z.infer<typeof ProcessDeletionSchema>;

export const AuditLogFilterSchema = z.object({
  search: z.string().optional(),
  action: z.string().optional(),
  actorRole: z.string().optional(),
});
export type AuditLogFilterInput = z.infer<typeof AuditLogFilterSchema>;

export interface ArchivedProjectDTO {
  id: string;
  projectId: string;
  intakeId: string;
  clientName: string;
  packageName: string;
  snapshot: any;
  archivedAt: string;
  archivedBy: string;
  filesPurged: boolean;
  filesPurgedAt: string | null;
}

export interface AuditLogDTO {
  id: string;
  projectId: string | null;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  oldValue: string | null;
  newValue: string | null;
  reason: string | null;
  metadata: any;
  createdAt: string;
}

export interface DataDeletionRequestDTO {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  requestedAt: string;
  processedAt: string | null;
  deletedFields: string[];
  retainedFields: string[];
  status: "PENDING" | "PROCESSED" | "REJECTED";
  processedBy: string | null;
}
