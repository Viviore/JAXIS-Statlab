import type { PaymentStatus, PaymentMethod, RoleName } from "@prisma/client";

/**
 * Role-Based Access Control Guard: RULE_ROL_02
 * Only Finance Officer, Admin, or CEO may verify or reject payment proofs.
 * Statisticians and QA Leads attempting this action must be blocked with HTTP 403.
 */
export const VERIFYING_ROLES: RoleName[] = ["FINANCE_OFFICER", "ADMIN", "CEO"];

export function canVerifyPayment(role?: string | null): boolean {
  if (!role) return false;
  return VERIFYING_ROLES.includes(role as RoleName);
}

export function assertCanVerifyPayment(role?: string | null): void {
  if (!canVerifyPayment(role)) {
    throw new Error(
      "FORBIDDEN_RULE_ROL_02: Only a Finance Officer, Administrator, or CEO has clearance to verify or reject institutional payment receipts."
    );
  }
}

/**
 * Upload constraints for payment receipts (PAY-F01)
 */
export const ALLOWED_PROOF_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export const MAX_PROOF_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Official JAXIS StatLab payment channels displayed to Lead Researchers
 */
export interface PaymentChannelDetails {
  id: PaymentMethod;
  name: string;
  badge: string;
  accountName: string;
  accountNumber: string;
  institution: string;
  branchOrProvider: string;
  notes: string;
  qrImageUrl?: string | null;
  isEnabled?: boolean;
}

export const OFFICIAL_PAYMENT_CHANNELS: PaymentChannelDetails[] = [
  {
    id: "GCASH",
    name: "GCash Corporate Transfer",
    badge: "INSTANT VERIFICATION",
    accountName: "JAXIS STATISTICAL CONSULTING SERVICES",
    accountNumber: "0917-882-5294",
    institution: "GCash / Mynt",
    branchOrProvider: "Merchant Pay & Express Send",
    notes: "Please include your Study Intake ID in the optional message box before completing transfer.",
  },
  {
    id: "BANK_TRANSFER",
    name: "BDO Institutional Direct Deposit",
    badge: "CLEARING: 1-2 HOURS",
    accountName: "JAXIS STATISTICAL CONSULTING SERVICES",
    accountNumber: "0012-8801-4491",
    institution: "Banco de Oro (BDO)",
    branchOrProvider: "Ortigas Center Business Branch",
    notes: "Direct deposit or InstaPay/PESONet. Upload the official transaction confirmation screenshot or deposit slip PDF.",
  },
  {
    id: "BANK_TRANSFER",
    name: "BPI Corporate Account",
    badge: "CLEARING: 1-2 HOURS",
    accountName: "JAXIS STATISTICAL CONSULTING SERVICES",
    accountNumber: "2881-0042-99",
    institution: "Bank of the Philippine Islands (BPI)",
    branchOrProvider: "Ayala Avenue Corporate Center",
    notes: "Include your Study Intake ID in the transfer reference notes.",
  },
];

/**
 * Financial metrics and milestone balance calculation engine
 */
export interface ProjectPaymentSummary {
  totalAmount: number;
  downpaymentRequired: number;
  verifiedPaid: number;
  pendingVerification: number;
  remainingBalance: number;
  isDownpaymentCleared: boolean;
  isFullyPaid: boolean;
  downpaymentPercentage: number;
  totalPaidPercentage: number;
}

export function calculateProjectBalance(
  payments: Array<{
    amountSubmitted: number | string | { toString(): string } | { toNumber?(): number };
    paymentStatus: PaymentStatus;
  }>,
  totalAmount: number,
  downpaymentRequired: number
): ProjectPaymentSummary {
  let verifiedPaid = 0;
  let pendingVerification = 0;

  for (const payment of payments) {
    const amt = Number(payment.amountSubmitted) || 0;
    if (payment.paymentStatus === "VERIFIED" || payment.paymentStatus === "FULLY_PAID") {
      verifiedPaid += amt;
    } else if (payment.paymentStatus === "PROOF_SUBMITTED") {
      pendingVerification += amt;
    }
  }

  const remainingBalance = Math.max(0, totalAmount - verifiedPaid);
  const isDownpaymentCleared = verifiedPaid >= downpaymentRequired && downpaymentRequired > 0;
  const isFullyPaid = verifiedPaid >= totalAmount && totalAmount > 0;

  const downpaymentPercentage =
    downpaymentRequired > 0
      ? Math.min(100, Math.round((verifiedPaid / downpaymentRequired) * 100))
      : 100;

  const totalPaidPercentage =
    totalAmount > 0
      ? Math.min(100, Math.round((verifiedPaid / totalAmount) * 100))
      : 100;

  return {
    totalAmount,
    downpaymentRequired,
    verifiedPaid,
    pendingVerification,
    remainingBalance,
    isDownpaymentCleared,
    isFullyPaid,
    downpaymentPercentage,
    totalPaidPercentage,
  };
}
