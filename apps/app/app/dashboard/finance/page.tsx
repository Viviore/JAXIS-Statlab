"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  PageHeader,
  Card,
  Button,
  KpiCard,
  MoneyDisplay,
  LoadingState,
  EmptyState,
  Badge,
} from "@repo/ui";
import {
  IconSettings,
  IconReceipt,
  IconShieldCheck,
  IconArrowRight,
  IconCheck,
} from "@tabler/icons-react";
import { getFinanceReceivablesSummary } from "@/features/payments/actions";
import { PaymentChannelSettingsModal } from "@/features/payments/components/PaymentChannelSettingsModal";
import type { FinanceOverviewData } from "@/features/payments/schemas";

export default function FinanceDashboardPage() {
  const [data, setData] = useState<FinanceOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "DOWNPAYMENT_CLEARED" | "OUTSTANDING" | "FULLY_PAID">("ALL");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await getFinanceReceivablesSummary();
      if (res.success) {
        setData(res.data);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const receivables = data?.receivables || [];
  const kpis = data?.kpis || {
    totalVaultCleared: 0,
    totalOutstandingReceivables: 0,
    totalContractVolume: 0,
    pendingClearancesCount: 0,
    completedStudiesCount: 0,
  };

  const filteredReceivables = receivables.filter((item) => {
    if (filterStatus === "ALL") return true;
    if (filterStatus === "FULLY_PAID") return item.isFullyPaid;
    if (filterStatus === "DOWNPAYMENT_CLEARED") return item.isDownpaymentCleared && !item.isFullyPaid && !item.isOverpaid;
    if (filterStatus === "OUTSTANDING") return !item.isFullyPaid && !item.isOverpaid;
    return true;
  });

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-24 w-full animate-content-fade">
      <PageHeader
        title="Finance Receivables & Escrow Vault"
        description="Monitor institutional study revenue, track downpayment clearances, reconcile remaining receivable balances, and audit cleared client proofs."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Finance Console" },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
              className="gap-2 font-sans"
            >
              <IconSettings size={15} stroke={1.5} />
              <span>Configure Channels &amp; QR</span>
            </Button>
            <Link href="/dashboard/finance/payments">
              <Button variant="primary" size="sm" className="gap-2 font-sans font-semibold">
                <IconReceipt size={15} stroke={1.5} />
                <span>
                  Deposit Queue
                  {kpis.pendingClearancesCount > 0 ? ` (${kpis.pendingClearancesCount})` : ""} →
                </span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* ── Live Financial KPI Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">
        <KpiCard
          label="Total Cleared Vault"
          value={`₱${kpis.totalVaultCleared.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`}
          variant="emerald"
          description="Verified institutional deposits in vault"
        />

        <KpiCard
          label="Outstanding Receivables"
          value={`₱${kpis.totalOutstandingReceivables.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`}
          variant="amber"
          description="Remaining milestone balances to collect"
        />

        <KpiCard
          label="Total Contracted Volume"
          value={`₱${kpis.totalContractVolume.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`}
          variant="sky"
          description={`${receivables.length} active research studies contracted`}
        />
      </div>

      {/* ── Receivables & Ledger Table ── */}
      <Card className="p-0 overflow-hidden border-white/10 bg-[#01142B]/90">
        <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white font-sans">
              Study Receivables &amp; Payment Balances
            </h2>
            <p className="text-xs text-white/50 mt-0.5">
              Live ledger of total contract prices, cleared downpayments, and outstanding balances.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterStatus("ALL")}
              className={`px-3 py-1.5 rounded-[2px] font-sans text-xs font-semibold transition-all cursor-pointer ${
                filterStatus === "ALL"
                  ? "bg-[#CC6600] text-white shadow-sm"
                  : "text-white/60 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              All Studies ({receivables.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("DOWNPAYMENT_CLEARED")}
              className={`px-3 py-1.5 rounded-[2px] font-sans text-xs font-semibold transition-all cursor-pointer ${
                filterStatus === "DOWNPAYMENT_CLEARED"
                  ? "bg-[#CC6600] text-white shadow-sm"
                  : "text-white/60 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              Downpaid ({receivables.filter((r) => r.isDownpaymentCleared && !r.isFullyPaid && !r.isOverpaid).length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("OUTSTANDING")}
              className={`px-3 py-1.5 rounded-[2px] font-sans text-xs font-semibold transition-all cursor-pointer ${
                filterStatus === "OUTSTANDING"
                  ? "bg-[#CC6600] text-white shadow-sm"
                  : "text-white/60 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              With Balance ({receivables.filter((r) => !r.isFullyPaid && !r.isOverpaid).length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("FULLY_PAID")}
              className={`px-3 py-1.5 rounded-[2px] font-sans text-xs font-semibold transition-all cursor-pointer ${
                filterStatus === "FULLY_PAID"
                  ? "bg-[#CC6600] text-white shadow-sm"
                  : "text-white/60 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              Fully Settled ({receivables.filter((r) => r.isFullyPaid).length})
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-16">
            <LoadingState
              variant="table"
              label="Compiling institutional receivables ledger..."
              description="Please wait while financial telemetry syncs."
            />
          </div>
        ) : filteredReceivables.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={IconShieldCheck}
              title="No Studies in Selected Filter"
              description="All contracted research studies match your current receivables criteria."
            />
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[950px] text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-white/50 font-mono uppercase tracking-wider">
                  <th className="py-3.5 px-5">Study &amp; Title</th>
                  <th className="py-3.5 px-5">Lead Researcher</th>
                  <th className="py-3.5 px-5">Contract Total</th>
                  <th className="py-3.5 px-5">Amount Cleared</th>
                  <th className="py-3.5 px-5">Remaining Balance</th>
                  <th className="py-3.5 px-5">Payment Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-white/80">
                {filteredReceivables.map((study) => (
                  <tr key={study.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Study & Title */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <Link
                        href={`/dashboard/admin/projects/${study.id}/payment`}
                        className="font-mono text-xs font-bold text-[#FFA040] hover:underline"
                      >
                        {study.intakeId}
                      </Link>
                      <div className="font-sans text-xs text-white/80 line-clamp-1 max-w-[220px]">
                        {study.researchTitle}
                      </div>
                    </td>

                    {/* Client & University */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="font-sans text-xs text-white font-medium">
                        {study.clientName}
                      </div>
                      <div className="font-sans text-[0.688rem] text-white/40">
                        {study.university}
                      </div>
                    </td>

                    {/* Contract Total */}
                    <td className="py-4 px-5 whitespace-nowrap font-mono text-xs font-semibold text-white">
                      <MoneyDisplay amount={study.totalContractAmount} />
                    </td>

                    {/* Amount Cleared */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="font-mono text-xs font-bold text-emerald-400">
                        <MoneyDisplay amount={study.totalPaidAmount} />
                      </div>
                      <div className="font-sans text-[0.688rem]">
                        {study.totalContractAmount > 0 ? (
                          study.isOverpaid ? (
                            <span className="text-amber-400 font-medium">
                              Exceeds Quote (+₱{(study.overpaidAmount || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })})
                            </span>
                          ) : (
                            <span className="text-white/40">
                              {Math.min(100, Math.round((study.totalPaidAmount / study.totalContractAmount) * 100))}% Cleared
                            </span>
                          )
                        ) : (
                          <span className="text-white/40">No quote</span>
                        )}
                      </div>
                    </td>

                    {/* Remaining Balance */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      {study.isOverpaid ? (
                        <div>
                          <div className="font-mono text-xs font-bold text-amber-400">
                            +₱{(study.overpaidAmount || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                          </div>
                          <div className="font-sans text-[0.688rem] text-amber-300/70">
                            Overpaid / Reconcile
                          </div>
                        </div>
                      ) : study.remainingBalance > 0 ? (
                        <div>
                          <div className="font-mono text-xs font-bold text-amber-400">
                            <MoneyDisplay amount={study.remainingBalance} />
                          </div>
                          <div className="font-sans text-[0.688rem] text-amber-300/60">
                            Due upon delivery
                          </div>
                        </div>
                      ) : (
                        <div className="font-mono text-xs text-emerald-400 font-semibold flex items-center gap-1">
                          <IconCheck size={14} stroke={2.5} />
                          <span>₱0.00 Due</span>
                        </div>
                      )}
                    </td>

                    {/* Payment Status Badge */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      {study.isOverpaid ? (
                        <Badge variant="amber" className="font-mono text-[0.688rem]">
                          OVERPAID / MISMATCH
                        </Badge>
                      ) : study.isFullyPaid ? (
                        <Badge variant="emerald" className="font-mono text-[0.688rem]">
                          FULLY PAID
                        </Badge>
                      ) : study.isDownpaymentCleared ? (
                        <Badge variant="amber" className="font-mono text-[0.688rem]">
                          DOWNPAYMENT CLEARED
                        </Badge>
                      ) : (
                        <Badge variant="muted" className="font-mono text-[0.688rem]">
                          AWAITING DEPOSIT
                        </Badge>
                      )}
                    </td>

                    {/* Action Links */}
                    <td className="py-4 px-5 whitespace-nowrap text-right">
                      <Link href={`/dashboard/admin/projects/${study.id}/payment`}>
                        <Button
                          variant="primary"
                          size="sm"
                          className="font-sans text-xs py-1 px-3 gap-1 whitespace-nowrap"
                        >
                          <span>Open Ledger</span>
                          <IconArrowRight size={13} stroke={2} />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── CEO / Finance Payment Channel Settings Modal ── */}
      <PaymentChannelSettingsModal
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
