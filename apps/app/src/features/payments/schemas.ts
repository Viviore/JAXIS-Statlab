import { z } from "zod";

export const PaymentTypeEnum = z.enum([
  "DOWNPAYMENT",
  "INSTALLMENT",
  "BALANCE",
  "FULL",
]);

export const PaymentMethodEnum = z.enum(["GCASH", "BANK_TRANSFER"]);

export const SubmitPaymentProofSchema = z.object({
  projectId: z.string().min(1, "Project ID is required."),
  quotationId: z.string().min(1, "Quotation ID is required."),
  paymentType: PaymentTypeEnum.default("DOWNPAYMENT"),
  paymentMethod: PaymentMethodEnum,
  amountSubmitted: z
    .union([z.number(), z.string()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Amount deposited must be a valid positive amount in PHP.",
    }),
  referenceNumber: z
    .string()
    .trim()
    .min(3, "Reference/Transaction number is required (at least 3 characters).")
    .max(100, "Reference number cannot exceed 100 characters."),
  receiptFilePath: z
    .string()
    .min(1, "Receipt document or screenshot is required."),
  receiptFileName: z.string().min(1, "File name is required."),
  receiptFileSize: z.number().optional(),
});

export type SubmitPaymentProofInput = z.infer<typeof SubmitPaymentProofSchema>;

export const VerifyPaymentSchema = z.object({
  paymentId: z.string().min(1, "Payment ID is required."),
});

export type VerifyPaymentInput = z.infer<typeof VerifyPaymentSchema>;

export const RejectPaymentSchema = z.object({
  paymentId: z.string().min(1, "Payment ID is required."),
  rejectionReason: z
    .string()
    .trim()
    .min(5, "Please provide an explanatory reason for rejection (min 5 characters).")
    .max(500, "Reason cannot exceed 500 characters."),
});

export type RejectPaymentInput = z.infer<typeof RejectPaymentSchema>;

export const PaymentChannelConfigSchema = z.object({
  id: PaymentMethodEnum,
  name: z.string().min(1, "Name is required"),
  badge: z.string().default("VERIFIED"),
  accountName: z.string().min(1, "Account name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  institution: z.string().min(1, "Institution name is required"),
  branchOrProvider: z.string().default("Official Merchant"),
  notes: z.string().default(""),
  qrImageUrl: z.string().nullable().optional(),
  isEnabled: z.boolean().default(true),
});

export const UpdatePaymentChannelsSchema = z.object({
  channels: z.array(PaymentChannelConfigSchema),
});

export type PaymentChannelConfigInput = z.infer<typeof PaymentChannelConfigSchema>;
export type UpdatePaymentChannelsInput = z.infer<typeof UpdatePaymentChannelsSchema>;

import type { PaymentStatus, PaymentType, PaymentMethod, ProjectStatus } from "@prisma/client";
import type { ProjectPaymentSummary } from "@/lib/payment-rules";

export interface PaymentProofItem {
  id: string;
  paymentId: string;
  filePath: string;
  fileName: string;
  fileSize?: number | null;
  uploadedAt: string;
}

export interface PaymentItem {
  id: string;
  projectId: string;
  quotationId: string;
  paymentType: PaymentType;
  paymentMethod: PaymentMethod | null;
  amountSubmitted: number;
  balancePaidTotal: number;
  referenceNumber: string | null;
  paymentStatus: PaymentStatus;
  rejectionReason: string | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  proofs: PaymentProofItem[];
  project?: {
    id: string;
    intakeId: string;
    researchTitle: string;
    masterStatus: ProjectStatus;
    client: {
      fullName: string;
      email: string;
      clientProfile?: {
        institutionSchool: string;
      } | null;
    };
  };
  quotation?: {
    id: string;
    packageName: string;
    totalAmount: number;
    downpaymentRequired: number;
  };
}

export interface ProjectPaymentsData {
  payments: PaymentItem[];
  summary: ProjectPaymentSummary;
  quotationId?: string | null;
}

export interface StudyReceivableItem {
  id: string;
  intakeId: string;
  researchTitle: string;
  clientName: string;
  university: string;
  masterStatus: ProjectStatus;
  totalContractAmount: number;
  totalPaidAmount: number;
  remainingBalance: number;
  downpaymentRequired: number;
  isDownpaymentCleared: boolean;
  isFullyPaid: boolean;
  isOverpaid?: boolean;
  overpaidAmount?: number;
  paymentCount: number;
  lastPaymentAt: string | null;
}

export interface FinanceOverviewData {
  kpis: {
    totalVaultCleared: number;
    totalOutstandingReceivables: number;
    totalContractVolume: number;
    pendingClearancesCount: number;
    completedStudiesCount: number;
  };
  receivables: StudyReceivableItem[];
}

export type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; fieldErrors?: Record<string, string[]> } };
