"use client";

import React from "react";
import {
  Card,
  MoneyDisplay,
  StatusBadge,
  Button,
  ProgressBar,
} from "@repo/ui";
import {
  IconReceipt,
  IconClock,
  IconCheck,
  IconAlertCircle,
  IconFileText,
  IconPlus,
} from "@tabler/icons-react";
import type { PaymentItem } from "../schemas";
import type { ProjectPaymentSummary } from "@/lib/payment-rules";

interface PaymentLedgerCardProps {
  summary: ProjectPaymentSummary;
  payments: PaymentItem[];
  onOpenUploadModal?: () => void;
  canUpload?: boolean;
}

export function PaymentLedgerCard({
  summary,
  payments,
  onOpenUploadModal,
  canUpload = true,
}: PaymentLedgerCardProps) {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* ── Financial Milestone Metric Ribbon ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex flex-col justify-between border-white/10 bg-[#01142B]/80">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-semibold text-white/50 uppercase tracking-wider">
              Total Contract Fee
            </span>
            <IconFileText size={16} stroke={1.5} className="text-white/40" />
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-sans font-bold text-white tracking-tight">
              <MoneyDisplay amount={summary.totalAmount} />
            </div>
            <p className="font-sans text-xs text-white/50 mt-1">
              Agreed in Statement of Work
            </p>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between border-white/10 bg-[#01142B]/80">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-semibold text-white/50 uppercase tracking-wider">
              Downpayment Threshold
            </span>
            {summary.isDownpaymentCleared ? (
              <span className="px-2 py-0.5 rounded-[2px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-sans text-[0.688rem] font-semibold flex items-center gap-1">
                <IconCheck size={12} stroke={2.5} />
                CLEARED
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-[2px] bg-amber-500/10 border border-amber-500/30 text-amber-400 font-sans text-[0.688rem] font-semibold flex items-center gap-1">
                <IconClock size={12} stroke={2} />
                REQUIRED
              </span>
            )}
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-sans font-bold text-[#FFA040] tracking-tight">
              <MoneyDisplay amount={summary.downpaymentRequired} />
            </div>
            <p className="font-sans text-xs text-white/50 mt-1">
              Unlocks statistician assignment
            </p>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between border-white/10 bg-[#01142B]/80">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-semibold text-white/50 uppercase tracking-wider">
              Verified Paid Balance
            </span>
            <IconReceipt size={16} stroke={1.5} className="text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-sans font-bold text-emerald-400 tracking-tight">
              <MoneyDisplay amount={summary.verifiedPaid} />
            </div>
            <p className="font-sans text-xs text-white/50 mt-1">
              {summary.pendingVerification > 0
                ? `+ ₱${summary.pendingVerification.toLocaleString("en-PH", { minimumFractionDigits: 2 })} pending verification`
                : "All submitted deposits cleared"}
            </p>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between border-white/10 bg-[#01142B]/80">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-semibold text-white/50 uppercase tracking-wider">
              Remaining Release Balance
            </span>
            <IconAlertCircle size={16} stroke={1.5} className="text-white/40" />
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-sans font-bold text-white tracking-tight">
              <MoneyDisplay amount={summary.remainingBalance} />
            </div>
            <p className="font-sans text-xs text-white/50 mt-1">
              {summary.remainingBalance === 0
                ? "Fully paid — release unlocked"
                : "Payable upon deliverable inspection"}
            </p>
          </div>
        </Card>
      </div>

      {/* ── Progress Towards Milestone Activation ── */}
      <Card className="p-6 border-white/10 bg-[#01162E]/70 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-sans text-sm font-semibold text-white">
              Project Milestone Activation Status
            </h3>
            <p className="font-sans text-xs text-white/50 mt-0.5">
              {summary.isFullyPaid
                ? "100% Contract Fee Settled. All deliverable release gates are fully unlocked."
                : summary.isDownpaymentCleared
                ? "Downpayment Cleared. Statistical modeling & QA reviews are currently active."
                : `Awaiting ₱${Math.max(0, summary.downpaymentRequired - summary.verifiedPaid).toLocaleString("en-PH", { minimumFractionDigits: 2 })} downpayment clearance to activate study.`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-white/70">
              {summary.totalPaidPercentage}% Paid
            </span>
            {canUpload && !summary.isFullyPaid && onOpenUploadModal && (
              <Button
                variant="primary"
                size="sm"
                onClick={onOpenUploadModal}
                className="gap-1.5"
              >
                <IconPlus size={14} stroke={2.5} />
                <span>Submit Deposit Proof</span>
              </Button>
            )}
          </div>
        </div>

        <div className="w-full">
          <ProgressBar
            value={summary.totalPaidPercentage}
            color={summary.isFullyPaid ? "emerald" : "sky"}
            className="h-2"
          />
        </div>
      </Card>

      {/* ── Itemized Payment Transactions Ledger ── */}
      <Card className="p-0 border-white/10 overflow-hidden bg-[#01142B]/90">
        <div className="p-5 border-b border-white/10 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-sans text-sm font-semibold text-white">
              Payment Transactions & Proof Ledger
            </h3>
            <p className="font-sans text-xs text-white/50 mt-0.5">
              Official audit history of all submitted GCash and bank receipts
            </p>
          </div>

          <span className="font-mono text-xs text-white/60 bg-white/[0.04] px-2.5 py-1 rounded-[2px] border border-white/10">
            {payments.length} {payments.length === 1 ? "Record" : "Records"}
          </span>
        </div>

        {payments.length === 0 ? (
          <div className="py-14 px-6 text-center flex flex-col items-center justify-center gap-6">
            <div className="w-12 h-12 rounded-[2px] bg-white/[0.04] border border-white/10 flex items-center justify-center">
              <IconReceipt size={22} stroke={1.5} className="text-white/40" />
            </div>

            <div className="flex flex-col items-center gap-2 max-w-md">
              <h4 className="font-sans text-sm sm:text-base font-semibold text-white">
                No Payment Deposits Submitted Yet
              </h4>
              <p className="font-sans text-xs text-white/50 leading-relaxed">
                To proceed with research assignment, please transfer your required downpayment and submit the official receipt screenshot.
              </p>
            </div>

            {canUpload && onOpenUploadModal && (
              <div className="pt-2">
                <Button variant="primary" size="sm" onClick={onOpenUploadModal} className="gap-2 font-sans font-medium px-4 py-2">
                  <IconPlus size={15} stroke={2.5} />
                  <span>Submit First Deposit Proof</span>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[700px] text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-white/50 font-mono uppercase tracking-wider">
                  <th className="py-3 px-5">Date & Time</th>
                  <th className="py-3 px-5">Method & Type</th>
                  <th className="py-3 px-5">Reference No.</th>
                  <th className="py-3 px-5">Amount Submitted</th>
                  <th className="py-3 px-5">Verification Status</th>
                  <th className="py-3 px-5 text-right">Receipt Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-white/80">
                {payments.map((payment) => {
                  const proof = payment.proofs[0];
                  return (
                    <tr key={payment.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="font-sans text-white font-medium">
                          {new Date(payment.createdAt).toLocaleDateString("en-PH", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="font-mono text-[0.688rem] text-white/40">
                          {new Date(payment.createdAt).toLocaleTimeString("en-PH", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="font-sans text-white font-medium flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#CC6600]" />
                          {payment.paymentMethod === "GCASH" ? "GCash" : "Bank Transfer"}
                        </div>
                        <div className="font-mono text-[0.688rem] text-white/40">
                          {payment.paymentType}
                        </div>
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="font-mono text-xs text-white/90 bg-white/[0.04] px-2 py-0.5 rounded-[2px] border border-white/10">
                          {payment.referenceNumber || "N/A"}
                        </span>
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="font-sans text-sm font-bold text-white">
                          <MoneyDisplay amount={payment.amountSubmitted} />
                        </span>
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap">
                        <StatusBadge status={payment.paymentStatus} />
                        {payment.rejectionReason && (
                          <p className="font-sans text-[0.688rem] text-red-400/90 mt-1 max-w-xs">
                            Reason: {payment.rejectionReason}
                          </p>
                        )}
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap text-right">
                        {proof ? (
                          <a
                            href={proof.filePath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-sans text-sky-400 hover:text-sky-300 transition-colors p-1"
                          >
                            <IconFileText size={14} stroke={1.5} />
                            <span>View Receipt</span>
                          </a>
                        ) : (
                          <span className="text-white/30 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
