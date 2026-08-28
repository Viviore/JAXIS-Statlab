"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Badge,
  Button,
  LoadingState,
  PageHeader,
  Toast,
  Pagination,
} from "@repo/ui";
import {
  IconReceipt,
  IconClock,
  IconBuildingBank,
  IconLoader2,
  IconCoins,
  IconSparkles,
  IconShieldCheck,
  IconSearch,
} from "@tabler/icons-react";
import {
  getCompanyPayslips,
  generateBatchPayslips,
  approvePayslip,
  getPayrollConfigurations,
} from "@/features/payroll/actions";
import type {
  StaffPayslipDTO,
  PayrollKpiSummary,
  RoleCompensationConfigDTO,
} from "@/features/payroll/schemas";
import { PayslipStatementModal } from "@/features/payroll/components/PayslipStatementModal";
import { DisbursePayslipModal } from "@/features/payroll/components/DisbursePayslipModal";

export default function FinancePayrollOperationsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [payslips, setPayslips] = useState<StaffPayslipDTO[]>([]);
  const [roleConfigs, setRoleConfigs] = useState<RoleCompensationConfigDTO[]>([]);
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [kpis, setKpis] = useState<PayrollKpiSummary>({
    totalInstitutionalPayroll: 0,
    totalDisbursed: 0,
    pendingDisbursementsCount: 0,
    totalDutyHoursCompensated: 0,
    totalStudiesRewarded: 0,
    activeStaffCount: 0,
  });

  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [selectedPayslipForStatement, setSelectedPayslipForStatement] = useState<StaffPayslipDTO | null>(null);
  const [selectedPayslipForDisburse, setSelectedPayslipForDisburse] = useState<StaffPayslipDTO | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    description?: string;
    variant: "success" | "warning" | "danger" | "info";
  } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [payslipRes, configRes] = await Promise.all([
        getCompanyPayslips({
          period: selectedPeriod,
          status: filterStatus,
        }),
        getPayrollConfigurations(),
      ]);
      setPayslips(payslipRes.payslips);
      setKpis(payslipRes.kpis);
      setAvailablePeriods(payslipRes.availablePeriods);
      setRoleConfigs(configRes.roleConfigs);
    } catch (err) {
      console.error("Failed to load Finance payroll data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriod, filterStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleGenerateBatch = async () => {
    setIsGeneratingBatch(true);
    try {
      const currentMonthStr = new Date().toLocaleDateString("en-PH", { month: "long", year: "numeric" });
      const now = new Date();
      const startStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endStr = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const res = await generateBatchPayslips({
        payPeriodMonth: currentMonthStr,
        payPeriodStart: startStr,
        payPeriodEnd: endStr,
      });

      if (res.success) {
        setToast({
          variant: "success",
          message: "Payroll Calculation Completed",
          description: `Generated payslips for ${res.count} staff members using active CEO compensation formulas.`,
        });
        await loadData();
      } else {
        setToast({
          variant: "danger",
          message: "Payroll Run Failed",
          description: res.error?.message,
        });
      }
    } catch {
      setToast({
        variant: "danger",
        message: "Error",
        description: "Failed to generate batch payroll.",
      });
    } finally {
      setIsGeneratingBatch(false);
    }
  };

  const handleApprove = async (payslipId: string) => {
    try {
      const res = await approvePayslip(payslipId);
      if (res.success) {
        setToast({
          variant: "success",
          message: "Payslip Approved",
          description: "Ready for treasury disbursement via GCash or Bank Transfer.",
        });
        await loadData();
      }
    } catch {
      setToast({
        variant: "danger",
        message: "Error",
        description: "Failed to approve payslip.",
      });
    }
  };

  const filteredPayslips = payslips.filter(
    (p) =>
      p.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.staffRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.payslipNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedPayslips = filteredPayslips.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (isLoading) {
    return (
      <div className="flex-1 w-full flex items-center justify-center animate-content-fade my-auto">
        <LoadingState
          variant="page"
          label="Loading Finance Payroll Desk..."
          description="Retrieving staff duty hours, study commission shares, and disbursement queues"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-24 w-full animate-content-fade">
      {/* Toast Alert Portal */}
      {toast && (
        <Toast
          message={toast.message}
          description={toast.description}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      )}

      {/* Standardized PageHeader */}
      <PageHeader
        title="Finance &amp; HR: Staff Payroll &amp; Payslips Desk"
        description="Execute monthly staff payroll runs using CEO-authorized compensation formulas, verify duty hours and completed studies, and record GCash and bank disbursements."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Finance Console", href: "/dashboard/finance" },
          { label: "Staff Payroll & Payslips" },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="primary"
              size="sm"
              onClick={handleGenerateBatch}
              disabled={isGeneratingBatch}
              className="gap-2 font-sans font-semibold cursor-pointer rounded-[2px]"
            >
              {isGeneratingBatch ? (
                <IconLoader2 size={16} stroke={2.5} className="animate-spin text-white/90" />
              ) : (
                <IconReceipt size={16} stroke={1.5} />
              )}
              <span>Run Payroll Cycle</span>
            </Button>
          </div>
        }
      />

      {/* Active CEO Policy Banner */}
      <div className="p-4 bg-[#01142B] border border-white/10 rounded-[2px] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#CC6600]/15 border border-[#CC6600]/40 rounded-[2px] text-[#FFA040] shrink-0 mt-0.5">
            <IconShieldCheck size={18} stroke={1.5} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-semibold text-white text-xs">
                CEO Authorized Compensation Policy Active
              </span>
              <Badge variant="emerald" className="text-[0.625rem] font-mono">
                Verified Formula
              </Badge>
            </div>
            <p className="text-xs text-white/60 font-sans">
              All payroll numbers are governed by the executive rate matrix configured by the CEO Office.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 text-xs font-mono">
          {roleConfigs.map((rc) => (
            <span
              key={rc.roleName}
              className="px-2 py-1 bg-[#010D1F] border border-white/10 rounded-[2px] text-white/80 text-[0.688rem]"
            >
              <strong className="text-white">{rc.roleName}:</strong>{" "}
              {rc.compensationType === "PERCENTAGE_PER_STUDY"
                ? `${rc.commissionPercentagePerStudy}% / study`
                : rc.compensationType === "FIXED_SALARY"
                ? `₱${rc.baseSalaryMonthly.toLocaleString()} Base`
                : rc.compensationType === "HYBRID"
                ? `₱${rc.baseSalaryMonthly.toLocaleString()} + ${rc.commissionPercentagePerStudy}%`
                : `₱${rc.hourlyDutyRate}/h`}
            </span>
          ))}
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="kpi" className="group p-5 sm:p-6 bg-[#01142B] border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[0.688rem] uppercase font-mono tracking-wider font-semibold text-white/50">
                Total Payroll Net
              </span>
              <div className="p-2 bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 rounded-[2px]">
                <IconCoins size={16} stroke={1.5} />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-mono text-white/50">₱</span>
              <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                {kpis.totalInstitutionalPayroll.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[0.688rem] font-mono text-white/50">
            <span>Active Specialists</span>
            <span className="text-emerald-400 font-semibold">{kpis.activeStaffCount} Headcount</span>
          </div>
        </Card>

        <Card variant="kpi" className="group p-5 sm:p-6 bg-[#01142B] border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[0.688rem] uppercase font-mono tracking-wider font-semibold text-white/50">
                Disbursed from Vault
              </span>
              <div className="p-2 bg-sky-950/50 border border-sky-500/30 text-sky-400 rounded-[2px]">
                <IconBuildingBank size={16} stroke={1.5} />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-mono text-white/50">₱</span>
              <span className="text-3xl font-extrabold font-mono text-sky-400 tracking-tight">
                {kpis.totalDisbursed.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[0.688rem] font-mono text-white/50">
            <span>Treasury Status</span>
            <span className="text-[#38BDF8] font-semibold">
              {kpis.pendingDisbursementsCount === 0 ? "All Cleared" : `${kpis.pendingDisbursementsCount} Pending`}
            </span>
          </div>
        </Card>

        <Card variant="kpi" className="group p-5 sm:p-6 bg-[#01142B] border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[0.688rem] uppercase font-mono tracking-wider font-semibold text-white/50">
                Compensated Duty Hours
              </span>
              <div className="p-2 bg-purple-950/50 border border-purple-500/30 text-purple-300 rounded-[2px]">
                <IconClock size={16} stroke={1.5} />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold font-mono text-purple-300 tracking-tight">
                {kpis.totalDutyHoursCompensated}
              </span>
              <span className="text-xs font-mono text-white/40">hrs total</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[0.688rem] font-mono text-white/50">
            <span>Verified Attendance</span>
            <span className="text-purple-300 font-semibold">Audited Punches</span>
          </div>
        </Card>

        <Card variant="kpi" className="group p-5 sm:p-6 bg-[#01142B] border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[0.688rem] uppercase font-mono tracking-wider font-semibold text-white/50">
                Study Deliverables Paid
              </span>
              <div className="p-2 bg-amber-950/50 border border-amber-500/30 text-amber-400 rounded-[2px]">
                <IconSparkles size={16} stroke={1.5} />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold font-mono text-amber-400 tracking-tight">
                {kpis.totalStudiesRewarded}
              </span>
              <span className="text-xs font-mono text-white/40">completed</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[0.688rem] font-mono text-white/50">
            <span>Study Commissions</span>
            <span className="text-amber-400 font-semibold">Active Cycle</span>
          </div>
        </Card>
      </div>

      {/* Main Payslips Ledger Card */}
      <Card className="p-6 sm:p-8 bg-[#01142B] border-white/10 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-base font-bold text-white font-sans">
              Employee Payslip Ledger &amp; Disbursement Queue
            </h2>
            <p className="text-xs text-white/50 font-sans mt-0.5">
              Review computed earnings, inspect official itemized statements, and disburse via GCash or institutional bank transfers.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Period Selector */}
            {availablePeriods.length > 0 && (
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-[#010D1F] border border-white/10 rounded-[2px] px-3 py-2 text-xs text-white font-mono outline-none focus:border-[#CC6600]"
              >
                <option value="ALL">All Pay Periods</option>
                {availablePeriods.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            )}

            <div className="relative w-full sm:w-60">
              <IconSearch size={15} stroke={1.5} className="absolute left-3 top-2.5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search specialist or ID..."
                className="w-full bg-[#010D1F] border border-white/10 rounded-[2px] pl-9 pr-3 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-[#CC6600] font-sans"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-[#010D1F] p-1 border border-white/10 rounded-[2px]">
              {["ALL", "DRAFT", "APPROVED", "DISBURSED"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 text-[0.688rem] font-mono rounded-[2px] cursor-pointer transition-colors ${
                    filterStatus === st
                      ? "bg-[#CC6600] text-white font-bold"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredPayslips.length === 0 ? (
          <div className="py-12 text-center text-xs text-white/40 italic font-sans">
            Zero payslip records found matching the active filter. Click &ldquo;Run Payroll Cycle&rdquo; to calculate.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-white/50 font-mono uppercase text-[0.688rem]">
                  <th className="py-3 px-3">Statement Number</th>
                  <th className="py-3 px-3">Specialist</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Period</th>
                  <th className="py-3 px-3">Duty Hours</th>
                  <th className="py-3 px-3">Studies</th>
                  <th className="py-3 px-3 text-right">Gross Pay</th>
                  <th className="py-3 px-3 text-right">Net Take-Home</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedPayslips.map((ps) => (
                  <tr key={ps.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-[#CC6600]">
                      {ps.payslipNumber}
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span className="font-semibold text-white block">{ps.staffName}</span>
                      <span className="text-[0.688rem] font-mono text-white/40">{ps.staffEmail}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[0.688rem] text-white/70">
                      {ps.staffRole}
                    </td>
                    <td className="py-3 px-3 font-mono text-white/70">
                      {ps.payPeriodMonth}
                    </td>
                    <td className="py-3 px-3 font-mono text-white/80">
                      {ps.verifiedDutyHours}h
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {ps.completedStudiesCount > 0 ? (
                        <span className="text-amber-400 font-semibold">
                          {ps.completedStudiesCount} studies
                        </span>
                      ) : (
                        <span className="text-white/40">--</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-right text-white/70">
                      ₱{ps.grossEarnings.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 font-mono text-right font-bold text-emerald-400">
                      ₱{ps.netPay.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3">
                      {ps.status === "DISBURSED" && (
                        <div className="flex flex-col gap-0.5">
                          <Badge variant="emerald" className="text-[0.625rem] font-mono">
                            Disbursed
                          </Badge>
                          <span className="text-[0.625rem] font-mono text-white/40">
                            {ps.disbursementMethod}
                          </span>
                        </div>
                      )}
                      {ps.status === "APPROVED" && (
                        <Badge variant="sky" className="text-[0.625rem] font-mono">
                          Approved
                        </Badge>
                      )}
                      {ps.status === "DRAFT" && (
                        <Badge variant="amber" className="text-[0.625rem] font-mono">
                          Draft
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {ps.status === "DRAFT" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(ps.id)}
                            className="font-mono text-xs py-1 px-2 cursor-pointer text-sky-400"
                          >
                            Approve
                          </Button>
                        )}
                        {ps.status !== "DISBURSED" && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setSelectedPayslipForDisburse(ps)}
                            className="font-sans text-xs py-1 px-2.5 cursor-pointer rounded-[2px]"
                          >
                            Disburse →
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedPayslipForStatement(ps)}
                          className="font-sans text-xs py-1 px-2.5 cursor-pointer"
                        >
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredPayslips.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredPayslips.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            itemLabel="payslips"
          />
        )}
      </Card>

      {/* Modals */}
      {selectedPayslipForStatement && (
        <PayslipStatementModal
          payslip={selectedPayslipForStatement}
          open={!!selectedPayslipForStatement}
          onClose={() => setSelectedPayslipForStatement(null)}
        />
      )}

      {selectedPayslipForDisburse && (
        <DisbursePayslipModal
          payslip={selectedPayslipForDisburse}
          open={!!selectedPayslipForDisburse}
          onClose={() => setSelectedPayslipForDisburse(null)}
          onSuccess={async () => {
            setToast({
              variant: "success",
              message: "Payment Disbursed Successfully",
              description: `Disbursement record saved for ${selectedPayslipForDisburse.staffName}.`,
            });
            await loadData();
          }}
        />
      )}
    </div>
  );
}
