"use client";

import React from "react";
import { Modal, Button, Badge } from "@repo/ui";
import {
  IconPrinter,
  IconClock,
  IconSparkles,
  IconShieldCheck,
} from "@tabler/icons-react";
import type { StaffPayslipDTO } from "../schemas";

interface PayslipStatementModalProps {
  payslip: StaffPayslipDTO | null;
  open: boolean;
  onClose: () => void;
}

export function PayslipStatementModal({
  payslip,
  open,
  onClose,
}: PayslipStatementModalProps) {
  if (!payslip) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Official JAXIS Payslip Statement"
      description={`Document Reference: ${payslip.payslipNumber}`}
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-[0.688rem] font-mono text-white/40">
            JAXIS StatLab Internal Treasury Settlement Protocol
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="gap-1.5 font-sans cursor-pointer text-xs"
            >
              <IconPrinter size={15} stroke={1.5} />
              <span>Print Statement</span>
            </Button>
            <Button variant="secondary" size="sm" onClick={onClose} className="text-xs">
              Close
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-6 text-white font-sans text-xs print:text-black">
        {/* Statement Header */}
        <div className="p-5 bg-[#010D1F] border border-white/10 rounded-[2px] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-[#CC6600]">
                JAXIS STATLAB PHILIPPINES
              </span>
              <Badge variant="emerald" className="text-[0.625rem] font-mono">
                {payslip.status}
              </Badge>
            </div>
            <span className="text-sm font-semibold text-white">
              Institutional Duty &amp; Compensation Statement
            </span>
            <span className="text-[0.688rem] font-mono text-white/50">
              Pay Period: <strong className="text-white">{payslip.payPeriodMonth}</strong>
            </span>
            {payslip.cutOffCycle && (
              <span className="text-[0.688rem] font-mono text-amber-400">
                Settlement Cycle: {payslip.cutOffCycle === "FIRST_HALF" ? "First Half-Month (Days 1–15)" : payslip.cutOffCycle === "SECOND_HALF" ? "Second Half-Month (Days 16–End)" : "Full Calendar Month"}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:items-end gap-1 text-[0.688rem] font-mono text-white/60">
            <span>Doc ID: <strong className="text-[#38BDF8]">{payslip.payslipNumber}</strong></span>
            <span>Issued: {new Date(payslip.createdAt).toLocaleDateString("en-PH")}</span>
            <span>Model: <strong className="text-white">{payslip.compensationType.replace(/_/g, " ")}</strong></span>
          </div>
        </div>

        {/* Employee Particulars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-[#01142B] border border-white/10 rounded-[2px]">
          <div>
            <span className="text-[0.625rem] uppercase font-mono text-white/40 block">Staff Specialist</span>
            <span className="font-semibold text-white text-xs">{payslip.staffName}</span>
          </div>
          <div>
            <span className="text-[0.625rem] uppercase font-mono text-white/40 block">Assigned Role</span>
            <span className="font-mono text-white/80 text-xs">{payslip.staffRole}</span>
          </div>
          <div>
            <span className="text-[0.625rem] uppercase font-mono text-white/40 block">Staff Email</span>
            <span className="font-mono text-white/70 text-xs truncate block">{payslip.staffEmail}</span>
          </div>
          <div>
            <span className="text-[0.625rem] uppercase font-mono text-white/40 block">Payout Destination</span>
            {payslip.payoutDetails ? (
              <span className="font-mono text-white/90 text-xs truncate block">
                {payslip.payoutDetails.payoutChannel} &bull; {payslip.payoutDetails.accountNumber}
              </span>
            ) : (
              <span className="text-white/40 text-xs font-mono">Standard Treasury</span>
            )}
          </div>
          <div>
            <span className="text-[0.625rem] uppercase font-mono text-white/40 block">Settlement Status</span>
            <span className={payslip.status === "DISBURSED" ? "text-emerald-400 font-mono font-bold" : "text-amber-400 font-mono font-semibold"}>
              {payslip.status === "DISBURSED" ? "Paid & Cleared" : "Pending Disbursement"}
            </span>
          </div>
        </div>

        {/* Itemized Deliverables & Studies (if applicable) */}
        {payslip.itemizedStudies && payslip.itemizedStudies.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider font-mono text-white/70 flex items-center gap-1.5">
                <IconSparkles size={14} className="text-[#CC6600]" />
                <span>1. Completed Research Studies &amp; Commission Breakdown</span>
              </span>
              <span className="text-[0.688rem] font-mono text-white/40">
                Rate: {payslip.commissionPercentage}% of gross study value
              </span>
            </div>

            <div className="border border-white/10 rounded-[2px] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#010D1F] border-b border-white/10 text-white/50 font-mono text-[0.688rem] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Study ID</th>
                    <th className="py-2.5 px-3">Research Title</th>
                    <th className="py-2.5 px-3 text-right">Study Value</th>
                    <th className="py-2.5 px-3 text-right">Commission Rate</th>
                    <th className="py-2.5 px-3 text-right">Share Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-[#01142B]">
                  {payslip.itemizedStudies.map((st) => (
                    <tr key={st.projectId} className="hover:bg-white/[0.02]">
                      <td className="py-2 px-3 font-mono text-[#CC6600] font-semibold">{st.intakeId}</td>
                      <td className="py-2 px-3 font-sans text-white/90 max-w-xs truncate">{st.researchTitle}</td>
                      <td className="py-2 px-3 font-mono text-right text-white/70">
                        ₱{st.grossAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3 font-mono text-right text-white/60">{st.commissionPercentage}%</td>
                      <td className="py-2 px-3 font-mono text-right text-emerald-400 font-bold">
                        ₱{st.commissionEarned.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[#010D1F] border-t border-white/10 font-mono font-semibold text-xs">
                  <tr>
                    <td colSpan={2} className="py-2 px-3 text-white/60">Total Commission Earnings</td>
                    <td className="py-2 px-3 text-right text-white/70">
                      ₱{payslip.completedStudiesGrossValue.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3"></td>
                    <td className="py-2 px-3 text-right text-emerald-400 font-bold">
                      ₱{payslip.commissionEarnings.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Itemized Attendance & Duty Wage */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider font-mono text-white/70 flex items-center gap-1.5">
            <IconClock size={14} className="text-[#38BDF8]" />
            <span>2. Verified Platform Duty &amp; Time Tracking</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-[#010D1F] border border-white/10 rounded-[2px] font-mono text-xs">
            <div>
              <span className="text-[0.625rem] text-white/40 block uppercase">Net Verified Hours</span>
              <span className="text-sm font-bold text-white">{payslip.verifiedDutyHours} hrs</span>
            </div>
            <div>
              <span className="text-[0.625rem] text-white/40 block uppercase">Base Hourly Wage</span>
              <span className="text-sm font-bold text-white">₱{payslip.hourlyRate.toFixed(2)} / hr</span>
            </div>
            <div>
              <span className="text-[0.625rem] text-white/40 block uppercase">Attendance Subtotal</span>
              <span className="text-sm font-bold text-emerald-400">
                ₱{payslip.hourlyDutyEarnings.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Comprehensive Financial Ledger Breakdown */}
        <div className="border border-white/10 rounded-[2px] bg-[#010D1F] p-4 flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-wider font-mono text-white/70">
            3. Compensation Summary &amp; Net Take-Home
          </span>

          <div className="space-y-1.5 text-xs">
            {payslip.baseSalary > 0 && (
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-white/70 font-sans">Monthly Base Retainer / Fixed Salary</span>
                <span className="font-mono text-white">₱{payslip.baseSalary.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {payslip.commissionEarnings > 0 && (
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-white/70 font-sans">Study Deliverables Commission ({payslip.completedStudiesCount} studies)</span>
                <span className="font-mono text-emerald-400">₱{payslip.commissionEarnings.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {payslip.hourlyDutyEarnings > 0 && (
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-white/70 font-sans">Verified Duty Compute Hours ({payslip.verifiedDutyHours}h @ ₱{payslip.hourlyRate}/h)</span>
                <span className="font-mono text-emerald-400">₱{payslip.hourlyDutyEarnings.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {payslip.overtimeEarnings > 0 && (
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-white/70 font-sans">Approved Overtime / Urgent SLA Premiums</span>
                <span className="font-mono text-white">₱{payslip.overtimeEarnings.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {payslip.allowances > 0 && (
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-white/70 font-sans">StatLab Compute, Cloud &amp; Connectivity Allowance</span>
                <span className="font-mono text-white">₱{payslip.allowances.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            <div className="flex items-center justify-between py-1.5 font-bold border-t border-white/10 text-white">
              <span>Gross Earnings</span>
              <span className="font-mono">₱{payslip.grossEarnings.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
            </div>

            {payslip.withholdingTax > 0 && (
              <div className="flex items-center justify-between py-1 text-white/50">
                <span>Withholding Tax (BIR Compensation Baseline)</span>
                <span className="font-mono text-red-400">-₱{payslip.withholdingTax.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-[2px] mt-2">
              <span className="text-sm font-bold text-white uppercase tracking-wider font-sans">
                Net Take-Home Pay
              </span>
              <span className="text-xl font-mono font-extrabold text-emerald-400">
                ₱{payslip.netPay.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Disbursement Stamp (if disbursed) */}
        {payslip.status === "DISBURSED" && (
          <div className="p-3.5 bg-sky-950/30 border border-sky-500/30 rounded-[2px] flex items-center justify-between text-xs font-mono text-sky-200">
            <div className="flex items-center gap-2">
              <IconShieldCheck size={18} className="text-sky-400" />
              <div>
                <span className="font-bold text-white block">Treasury Disbursement Cleared</span>
                <span>
                  Ref: <strong className="text-sky-300">{payslip.disbursementReference}</strong> ({payslip.disbursementMethod}
                  {payslip.payoutDetails?.accountNumber ? ` · ${payslip.payoutDetails.accountNumber}` : ""})
                </span>
              </div>
            </div>
            <div className="text-right text-[0.688rem] text-white/50">
              <span>Disbursed by: {payslip.disbursedByName || "Finance Officer"}</span>
              <span className="block">{payslip.disbursedAt ? new Date(payslip.disbursedAt).toLocaleString("en-PH") : ""}</span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
