import { z } from "zod";
import type { RoleName } from "@prisma/client";

export const CompensationTypeEnum = z.enum([
  "FIXED_SALARY",
  "PERCENTAGE_PER_STUDY",
  "HOURLY_DUTY",
  "HYBRID",
]);

export type CompensationType = z.infer<typeof CompensationTypeEnum>;

export const RoleCompensationConfigSchema = z.object({
  roleName: z.enum(["STATISTICIAN", "SENIOR_QA_LEAD", "FINANCE_OFFICER", "ADMIN"]),
  compensationType: CompensationTypeEnum,
  baseSalaryMonthly: z.number().min(0, "Base salary must be non-negative."),
  commissionPercentagePerStudy: z.number().min(0).max(100, "Percentage must be between 0 and 100."),
  hourlyDutyRate: z.number().min(0, "Hourly duty rate must be non-negative."),
  fixedPerStudyBonus: z.number().min(0, "Fixed study bonus must be non-negative."),
  allowancesMonthly: z.number().min(0, "Allowances must be non-negative."),
  isActive: z.boolean().default(true),
  notes: z.string().optional().default(""),
});

export type RoleCompensationConfigDTO = z.infer<typeof RoleCompensationConfigSchema> & {
  updatedAt?: string;
  updatedBy?: string | null;
};

export const StaffCompensationOverrideSchema = z.object({
  userId: z.string().min(1, "Staff member ID is required."),
  staffName: z.string().min(1),
  staffEmail: z.string().email(),
  roleName: z.enum(["STATISTICIAN", "SENIOR_QA_LEAD", "FINANCE_OFFICER", "ADMIN"]),
  compensationType: CompensationTypeEnum,
  baseSalaryMonthly: z.number().min(0),
  commissionPercentagePerStudy: z.number().min(0).max(100),
  hourlyDutyRate: z.number().min(0),
  fixedPerStudyBonus: z.number().min(0),
  allowancesMonthly: z.number().min(0),
  notes: z.string().optional().default(""),
});

export type StaffCompensationOverrideDTO = z.infer<typeof StaffCompensationOverrideSchema> & {
  updatedAt?: string;
  updatedBy?: string | null;
};

export const PayslipStatusEnum = z.enum(["DRAFT", "APPROVED", "DISBURSED"]);
export type PayslipStatus = z.infer<typeof PayslipStatusEnum>;

export const DisbursementMethodEnum = z.enum(["GCASH", "BANK_TRANSFER", "CASH"]);
export type DisbursementMethod = z.infer<typeof DisbursementMethodEnum>;

export interface PayslipItemizedStudy {
  projectId: string;
  intakeId: string;
  researchTitle: string;
  grossAmount: number;
  commissionPercentage: number;
  commissionEarned: number;
  status: string;
}

export interface StaffPayslipDTO {
  id: string;
  payslipNumber: string;
  userId: string;
  staffName: string;
  staffEmail: string;
  staffRole: RoleName;
  payPeriodMonth: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  compensationType: CompensationType;
  baseSalary: number;
  verifiedDutyHours: number;
  hourlyRate: number;
  hourlyDutyEarnings: number;
  completedStudiesCount: number;
  completedStudiesGrossValue: number;
  commissionPercentage: number;
  commissionEarnings: number;
  itemizedStudies: PayslipItemizedStudy[];
  overtimeHours: number;
  overtimeEarnings: number;
  allowances: number;
  grossEarnings: number;
  withholdingTax: number;
  otherDeductions: number;
  netPay: number;
  status: PayslipStatus;
  disbursementMethod?: DisbursementMethod | null;
  disbursementReference?: string | null;
  disbursedAt?: string | null;
  disbursedBy?: string | null;
  disbursedByName?: string | null;
  generatedBy: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const GeneratePayrollBatchSchema = z.object({
  payPeriodMonth: z.string().min(1, "Pay period month is required (e.g. August 2026)."),
  payPeriodStart: z.string().min(1, "Pay period start date is required."),
  payPeriodEnd: z.string().min(1, "Pay period end date is required."),
});

export type GeneratePayrollBatchInput = z.infer<typeof GeneratePayrollBatchSchema>;

export const DisbursePayslipSchema = z.object({
  payslipId: z.string().min(1, "Payslip ID is required."),
  disbursementMethod: DisbursementMethodEnum,
  disbursementReference: z
    .string()
    .trim()
    .min(3, "Transaction / disbursement reference number is required (min 3 characters).")
    .max(100),
  notes: z.string().optional(),
});

export type DisbursePayslipInput = z.infer<typeof DisbursePayslipSchema>;

export interface PayrollKpiSummary {
  totalInstitutionalPayroll: number;
  totalDisbursed: number;
  pendingDisbursementsCount: number;
  totalDutyHoursCompensated: number;
  totalStudiesRewarded: number;
  activeStaffCount: number;
}
