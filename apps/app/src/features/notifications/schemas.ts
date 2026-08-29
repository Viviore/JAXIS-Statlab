import { z } from "zod";

export const MarkAlertReadSchema = z.object({
  alertId: z.string().min(1, "Alert ID is required"),
});
export type MarkAlertReadInput = z.infer<typeof MarkAlertReadSchema>;

export const CreateInAppAlertSchema = z.object({
  recipientId: z.string().min(1, "Recipient ID is required"),
  recipientRole: z.enum([
    "CLIENT",
    "STATISTICIAN",
    "SENIOR_QA_LEAD",
    "FINANCE_OFFICER",
    "ADMIN",
    "CEO",
  ]),
  alertType: z.string().min(1, "Alert type is required"),
  projectId: z.string().optional(),
  message: z.string().min(1, "Alert message is required"),
  linkUrl: z.string().optional(),
});
export type CreateInAppAlertInput = z.infer<typeof CreateInAppAlertSchema>;

export const NotificationFilterSchema = z.object({
  status: z.string().optional(),
  search: z.string().optional(),
  template: z.string().optional(),
});
export type NotificationFilterInput = z.infer<typeof NotificationFilterSchema>;

export interface InAppAlertDTO {
  id: string;
  recipientId: string;
  recipientRole: string;
  alertType: string;
  projectId: string | null;
  projectIntakeId?: string | null;
  message: string;
  linkUrl: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationLogDTO {
  id: string;
  recipientId: string;
  recipientName: string;
  email: string;
  template: string;
  projectId: string | null;
  projectIntakeId?: string | null;
  status: "SENT" | "FAILED" | "RETRYING";
  attemptCount: number;
  errorMessage: string | null;
  sentAt: string;
  lastAttemptAt: string | null;
}

export interface NotificationSummaryDTO {
  totalSent: number;
  totalFailed: number;
  totalRetrying: number;
  totalAlerts: number;
  unreadAlerts: number;
}
