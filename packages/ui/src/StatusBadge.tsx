import React from "react";

export type StatusCategory = "success" | "warning" | "danger" | "info" | "neutral";

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: string;
  label?: string;
  className?: string;
  pulse?: boolean;
}

const statusColorMap: Record<string, { bg: string; text: string; border: string }> = {
  // Success states
  ACTIVE: { bg: "bg-[#10B981]/15", text: "text-[#10B981]", border: "border-[#10B981]/30" },
  SOW_SIGNED: { bg: "bg-[#10B981]/15", text: "text-[#10B981]", border: "border-[#10B981]/30" },
  CLIENT_APPROVED: { bg: "bg-[#10B981]/15", text: "text-[#10B981]", border: "border-[#10B981]/30" },
  DELIVERED: { bg: "bg-[#10B981]/15", text: "text-[#10B981]", border: "border-[#10B981]/30" },
  CLOSED: { bg: "bg-[#10B981]/15", text: "text-[#10B981]", border: "border-[#10B981]/30" },
  QA_APPROVED: { bg: "bg-[#10B981]/15", text: "text-[#10B981]", border: "border-[#10B981]/30" },
  VERIFIED: { bg: "bg-[#10B981]/15", text: "text-[#10B981]", border: "border-[#10B981]/30" },
  FULLY_PAID: { bg: "bg-[#10B981]/15", text: "text-[#10B981]", border: "border-[#10B981]/30" },
  RESOLVED_REFUND: { bg: "bg-[#10B981]/15", text: "text-[#10B981]", border: "border-[#10B981]/30" },
  RESOLVED_NO_REFUND: { bg: "bg-[#10B981]/15", text: "text-[#10B981]", border: "border-[#10B981]/30" },

  // Warning states
  NEW_REQUEST: { bg: "bg-[#F59E0B]/15", text: "text-[#F59E0B]", border: "border-[#F59E0B]/30" },
  AWAITING_INFORMATION: { bg: "bg-[#F59E0B]/15", text: "text-[#F59E0B]", border: "border-[#F59E0B]/30" },
  UNDER_EVALUATION: { bg: "bg-[#F59E0B]/15", text: "text-[#F59E0B]", border: "border-[#F59E0B]/30" },
  QUOTE_SENT: { bg: "bg-[#F59E0B]/15", text: "text-[#F59E0B]", border: "border-[#F59E0B]/30" },
  SOW_PENDING: { bg: "bg-[#F59E0B]/15", text: "text-[#F59E0B]", border: "border-[#F59E0B]/30" },
  AWAITING_PAYMENT: { bg: "bg-[#F59E0B]/15", text: "text-[#F59E0B]", border: "border-[#F59E0B]/30" },
  EXPERT_ASSIGNED: { bg: "bg-[#F59E0B]/15", text: "text-[#F59E0B]", border: "border-[#F59E0B]/30" },
  IN_PROGRESS: { bg: "bg-[#3B82F6]/15", text: "text-[#3B82F6]", border: "border-[#3B82F6]/30" },
  FOR_QA: { bg: "bg-[#F59E0B]/15", text: "text-[#F59E0B]", border: "border-[#F59E0B]/30" },
  QA_REVISION: { bg: "bg-[#F59E0B]/15", text: "text-[#F59E0B]", border: "border-[#F59E0B]/30" },
  REVISION_REQUESTED: { bg: "bg-[#F59E0B]/15", text: "text-[#F59E0B]", border: "border-[#F59E0B]/30" },
  SLA_PAUSED: { bg: "bg-[#F59E0B]/15", text: "text-[#F59E0B]", border: "border-[#F59E0B]/30" },
  PROOF_SUBMITTED: { bg: "bg-[#F59E0B]/15", text: "text-[#F59E0B]", border: "border-[#F59E0B]/30" },
  PENDING: { bg: "bg-[#F59E0B]/15", text: "text-[#F59E0B]", border: "border-[#F59E0B]/30" },
  UNDER_REVIEW: { bg: "bg-[#F59E0B]/15", text: "text-[#F59E0B]", border: "border-[#F59E0B]/30" },

  // Danger states
  HALTED: { bg: "bg-[#EF4444]/15", text: "text-[#EF4444]", border: "border-[#EF4444]/30" },
  CANCELLED: { bg: "bg-[#EF4444]/15", text: "text-[#EF4444]", border: "border-[#EF4444]/30" },
  DISPUTED: { bg: "bg-[#EF4444]/15", text: "text-[#EF4444]", border: "border-[#EF4444]/30" },
  ETHICAL_BREACH: { bg: "bg-[#EF4444]/15", text: "text-[#EF4444]", border: "border-[#EF4444]/30" },
  EXPIRED: { bg: "bg-[#EF4444]/15", text: "text-[#EF4444]", border: "border-[#EF4444]/30" },
  REASSIGNMENT_NEEDED: { bg: "bg-[#EF4444]/15", text: "text-[#EF4444]", border: "border-[#EF4444]/30" },
  SCOPE_CREEP_HALTED: { bg: "bg-[#EF4444]/15", text: "text-[#EF4444]", border: "border-[#EF4444]/30" },
  QA_REJECTED: { bg: "bg-[#EF4444]/15", text: "text-[#EF4444]", border: "border-[#EF4444]/30" },
  REJECTED: { bg: "bg-[#EF4444]/15", text: "text-[#EF4444]", border: "border-[#EF4444]/30" },
  SUSPENDED: { bg: "bg-[#EF4444]/15", text: "text-[#EF4444]", border: "border-[#EF4444]/30" },
  TERMINATED: { bg: "bg-[#EF4444]/15", text: "text-[#EF4444]", border: "border-[#EF4444]/30" },
  CHARGEBACK: { bg: "bg-[#EF4444]/15", text: "text-[#EF4444]", border: "border-[#EF4444]/30" },
};

function formatStatus(status: string): string {
  return status.replace(/_/g, " ").toUpperCase();
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className = "",
  pulse = false,
  ...props
}) => {
  const normalizedKey = status.toUpperCase().replace(/\s+/g, "_");
  const style = statusColorMap[normalizedKey] ?? {
    bg: "bg-white/10",
    text: "text-white/80",
    border: "border-white/20",
  };

  const displayText = label ?? formatStatus(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[0.625rem] tracking-wider uppercase px-2 py-0.5 rounded-[2px] border ${style.bg} ${style.text} ${style.border} font-medium select-none ${className}`}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
        </span>
      )}
      <span>{displayText}</span>
    </span>
  );
};
