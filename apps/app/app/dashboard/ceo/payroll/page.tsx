"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Badge,
  Button,
  LoadingState,
  PageHeader,
  Toast,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@repo/ui";
import {
  IconSettings,
  IconReceipt,
  IconClock,
  IconBuildingBank,
  IconCheck,
  IconLoader2,
  IconShieldLock,
  IconUsers,
  IconSparkles,
  IconCoins,
  IconAdjustments,
} from "@tabler/icons-react";
import {
  getPayrollConfigurations,
  saveRoleCompensationConfig,
  getCompanyPayslips,
  generateBatchPayslips,
  approvePayslip,
  type InternalStaffMember,
} from "@/features/payroll/actions";
import type {
  RoleCompensationConfigDTO,
  StaffPayslipDTO,
  PayrollKpiSummary,
  CompensationType,
} from "@/features/payroll/schemas";
import { PayslipStatementModal } from "@/features/payroll/components/PayslipStatementModal";
import { SpecialistOverrideModal } from "@/features/payroll/components/SpecialistOverrideModal";

const ROLE_DISPLAY_NAMES: Record<string, { title: string; subtitle: string }> = {
  STATISTICIAN: {
    title: "Lead Research Statistician",
    subtitle: "Multivariate analysis, statistical modeling, and computational deliverables.",
  },
  SENIOR_QA_LEAD: {
    title: "Senior QA & Methodological Reviewer",
    subtitle: "Peer verification, script audits, data reproducibility, and APA compliance.",
  },
  FINANCE_OFFICER: {
    title: "Finance & HR Governance Officer",
    subtitle: "Institutional escrow release gates, treasury disbursements, and leave management.",
  },
  ADMIN: {
    title: "Operations & Study Administrator",
    subtitle: "Client intake triage, scoping quotations, SLA monitoring, and platform coordination.",
  },
};

export default function CeoPayrollPolicyPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ROLES" | "STAFF" | "PAYSLIPS">("ROLES");
  const [roleConfigs, setRoleConfigs] = useState<RoleCompensationConfigDTO[]>([]);
  const [staffMembers, setStaffMembers] = useState<InternalStaffMember[]>([]);
  const [payslips, setPayslips] = useState<StaffPayslipDTO[]>([]);
  const [payrollKpis, setPayrollKpis] = useState<PayrollKpiSummary>({
    totalInstitutionalPayroll: 0,
    totalDisbursed: 0,
    pendingDisbursementsCount: 0,
    totalDutyHoursCompensated: 0,
    totalStudiesRewarded: 0,
    activeStaffCount: 0,
  });

  // Selected for modals
  const [selectedStaffForOverride, setSelectedStaffForOverride] = useState<InternalStaffMember | null>(null);
  const [selectedPayslipForView, setSelectedPayslipForView] = useState<StaffPayslipDTO | null>(null);

  // Editing state for roles
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [formConfig, setFormConfig] = useState<RoleCompensationConfigDTO | null>(null);
  const [isSavingRole, setIsSavingRole] = useState(false);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    description?: string;
    variant: "success" | "warning" | "danger" | "info";
  } | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [configData, payslipData] = await Promise.all([
        getPayrollConfigurations(),
        getCompanyPayslips(),
      ]);
      setRoleConfigs(configData.roleConfigs);
      setStaffMembers(configData.staffMembers);
      setPayslips(payslipData.payslips);
      setPayrollKpis(payslipData.kpis);
    } catch (err) {
      console.error("Failed to load CEO payroll configurations:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStartEditRole = (role: RoleCompensationConfigDTO) => {
    setEditingRole(role.roleName);
    setFormConfig({ ...role });
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formConfig) return;

    setIsSavingRole(true);
    try {
      const res = await saveRoleCompensationConfig(formConfig);
      if (res.success) {
        setToast({
          variant: "success",
          message: "Role Compensation Policy Updated",
          description: `New compensation formula and rates applied to all ${formConfig.roleName} team members.`,
        });
        setEditingRole(null);
        await loadData();
      } else {
        setToast({
          variant: "danger",
          message: "Policy Update Failed",
          description: res.error?.message || "Failed to update compensation policy.",
        });
      }
    } catch {
      setToast({
        variant: "danger",
        message: "Network Error",
        description: "Unable to reach server to save compensation parameters.",
      });
    } finally {
      setIsSavingRole(false);
    }
  };

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
          message: "Institutional Payroll Run Generated",
          description: `Calculated official payslips for ${res.count} active staff specialists for ${currentMonthStr}.`,
        });
        await loadData();
      } else {
        setToast({
          variant: "danger",
          message: "Payroll Generation Failed",
          description: res.error?.message,
        });
      }
    } catch {
      setToast({
        variant: "danger",
        message: "Error",
        description: "Failed to generate batch payslips.",
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
          description: "Payslip marked as approved for institutional disbursement.",
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

  if (isLoading) {
    return (
      <div className="flex-1 w-full flex items-center justify-center animate-content-fade my-auto">
        <LoadingState
          variant="page"
          label="Loading Corporate Payroll Policies..."
          description="Retrieving institutional compensation matrices and staff compensation parameters"
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

      {/* Page Header */}
      <PageHeader
        title="Corporate Payroll Policies &amp; Compensation Desk"
        description="Configure institutional compensation models by employee role (fixed salary, study percentage, or duty wages), customize specialist terms, and oversee company-wide payslip generation."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Executive Oversight", href: "/dashboard/ceo" },
          { label: "Payroll & Compensation" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="amber" className="text-xs font-mono flex items-center gap-1">
              <IconShieldLock size={13} stroke={2} />
              <span>CEO Executive Authority</span>
            </Badge>
            <Button
              variant="primary"
              size="sm"
              onClick={handleGenerateBatch}
              disabled={isGeneratingBatch}
              className="gap-1.5 font-sans font-semibold cursor-pointer rounded-[2px]"
            >
              {isGeneratingBatch ? (
                <IconLoader2 size={15} stroke={2.5} className="animate-spin text-white/90" />
              ) : (
                <IconReceipt size={15} stroke={2} />
              )}
              <span>Run Payroll Cycle</span>
            </Button>
          </div>
        }
      />

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="kpi" className="group p-5 sm:p-6 bg-[#01142B] border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[0.688rem] uppercase font-mono tracking-wider font-semibold text-white/50">
                Institutional Payroll Net
              </span>
              <div className="p-2 bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 rounded-[2px]">
                <IconCoins size={16} stroke={1.5} />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-mono text-white/50">₱</span>
              <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                {payrollKpis.totalInstitutionalPayroll.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[0.688rem] font-mono text-white/50">
            <span>Total Active Cycle</span>
            <span className="text-emerald-400 font-semibold">{payrollKpis.activeStaffCount} Specialists</span>
          </div>
        </Card>

        <Card variant="kpi" className="group p-5 sm:p-6 bg-[#01142B] border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[0.688rem] uppercase font-mono tracking-wider font-semibold text-white/50">
                Treasury Disbursed
              </span>
              <div className="p-2 bg-sky-950/50 border border-sky-500/30 text-sky-400 rounded-[2px]">
                <IconBuildingBank size={16} stroke={1.5} />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-mono text-white/50">₱</span>
              <span className="text-3xl font-extrabold font-mono text-sky-400 tracking-tight">
                {payrollKpis.totalDisbursed.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[0.688rem] font-mono text-white/50">
            <span>Disbursement Progress</span>
            <span className="text-[#38BDF8] font-semibold">
              {payrollKpis.pendingDisbursementsCount === 0 ? "100% Cleared" : `${payrollKpis.pendingDisbursementsCount} Pending`}
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
                {payrollKpis.totalDutyHoursCompensated}
              </span>
              <span className="text-xs font-mono text-white/40">hrs logged</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[0.688rem] font-mono text-white/50">
            <span>Module 18 Attendance</span>
            <span className="text-purple-300 font-semibold">Verified Punches</span>
          </div>
        </Card>

        <Card variant="kpi" className="group p-5 sm:p-6 bg-[#01142B] border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[0.688rem] uppercase font-mono tracking-wider font-semibold text-white/50">
                Studies Rewarded
              </span>
              <div className="p-2 bg-amber-950/50 border border-amber-500/30 text-amber-400 rounded-[2px]">
                <IconSparkles size={16} stroke={1.5} />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold font-mono text-amber-400 tracking-tight">
                {payrollKpis.totalStudiesRewarded}
              </span>
              <span className="text-xs font-mono text-white/40">deliverables</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[0.688rem] font-mono text-white/50">
            <span>Commission Deliverables</span>
            <span className="text-amber-400 font-semibold">Active Cycle</span>
          </div>
        </Card>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as "ROLES" | "STAFF" | "PAYSLIPS")}
        className="w-full"
      >
        <TabsList className="bg-[#01142B] border border-white/10 p-1 rounded-[2px] w-fit flex flex-wrap gap-1">
          <TabsTrigger
            value="ROLES"
            className="flex items-center gap-2 px-4 py-2 text-xs font-sans font-semibold rounded-[2px] transition-colors data-[state=active]:bg-[#CC6600] data-[state=active]:text-white text-white/70 hover:text-white cursor-pointer"
          >
            <IconSettings size={15} stroke={2} />
            <span>Role Compensation Policies</span>
          </TabsTrigger>
          <TabsTrigger
            value="STAFF"
            className="flex items-center gap-2 px-4 py-2 text-xs font-sans font-semibold rounded-[2px] transition-colors data-[state=active]:bg-[#CC6600] data-[state=active]:text-white text-white/70 hover:text-white cursor-pointer"
          >
            <IconUsers size={15} stroke={2} />
            <span>Specialist Overrides ({staffMembers.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="PAYSLIPS"
            className="flex items-center gap-2 px-4 py-2 text-xs font-sans font-semibold rounded-[2px] transition-colors data-[state=active]:bg-[#CC6600] data-[state=active]:text-white text-white/70 hover:text-white cursor-pointer"
          >
            <IconReceipt size={15} stroke={2} />
            <span>Company Payslips Ledger ({payslips.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: ROLE COMPENSATION POLICIES ── */}
        <TabsContent value="ROLES" className="mt-6 flex flex-col gap-6">
          <div className="p-4 bg-sky-950/40 border border-sky-500/30 rounded-[2px] flex items-start gap-3 text-xs text-sky-200">
            <IconAdjustments size={20} stroke={1.5} className="text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block text-sm">
                Executive Compensation Model Controls
              </span>
              <p className="text-white/80 mt-1 leading-relaxed">
                As CEO, you define the compensation model for each employee role. You can choose whether specialists earn a fixed monthly salary, a percentage commission per study delivered, an hourly attendance rate, or a hybrid combination. Finance uses these active parameters to generate official employee payslips.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {roleConfigs.map((role) => {
              const isEditing = editingRole === role.roleName;
              const meta = ROLE_DISPLAY_NAMES[role.roleName] || {
                title: role.roleName,
                subtitle: "Platform internal staff role.",
              };

              return (
                <Card
                  key={role.roleName}
                  className={`p-6 sm:p-7 bg-[#01142B] border transition-colors flex flex-col justify-between ${
                    isEditing ? "border-[#CC6600] ring-1 ring-[#CC6600]" : "border-white/10"
                  }`}
                >
                  <div className="flex flex-col gap-5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-[#CC6600] font-bold">
                            {role.roleName}
                          </span>
                          <Badge variant="sky" className="text-[0.625rem] font-mono">
                            {role.compensationType.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <h3 className="text-base font-bold text-white font-sans">{meta.title}</h3>
                        <p className="text-xs text-white/50 font-sans mt-0.5">{meta.subtitle}</p>
                      </div>

                      {!isEditing && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartEditRole(role)}
                          className="text-xs font-mono font-semibold cursor-pointer shrink-0"
                        >
                          Configure Rates →
                        </Button>
                      )}
                    </div>

                    {/* Content View / Form */}
                    {isEditing && formConfig ? (
                      <form onSubmit={handleSaveRole} className="flex flex-col gap-4 text-xs">
                        {/* Compensation Model Selector */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[0.688rem] uppercase font-mono text-white/60 font-semibold">
                            Select Compensation Model
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { id: "PERCENTAGE_PER_STUDY", label: "Study % Commission" },
                              { id: "FIXED_SALARY", label: "Fixed Monthly Base" },
                              { id: "HOURLY_DUTY", label: "Hourly Duty Wage" },
                              { id: "HYBRID", label: "Hybrid (Base + %)" },
                            ].map((m) => (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() =>
                                  setFormConfig((prev) =>
                                    prev ? { ...prev, compensationType: m.id as CompensationType } : null
                                  )
                                }
                                className={`p-2 rounded-[2px] border text-left text-xs font-sans transition-colors cursor-pointer ${
                                  formConfig.compensationType === m.id
                                    ? "bg-[#CC6600]/20 border-[#CC6600] text-white font-bold"
                                    : "bg-[#010D1F] border-white/10 text-white/60 hover:text-white"
                                }`}
                              >
                                {m.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Numeric Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {(formConfig.compensationType === "FIXED_SALARY" ||
                            formConfig.compensationType === "HYBRID") && (
                            <div className="flex flex-col gap-1">
                              <label className="text-[0.688rem] uppercase font-mono text-white/60 font-semibold">
                                Monthly Base Salary (₱)
                              </label>
                              <input
                                type="number"
                                step="500"
                                min="0"
                                value={formConfig.baseSalaryMonthly}
                                onChange={(e) =>
                                  setFormConfig((p) =>
                                    p ? { ...p, baseSalaryMonthly: Number(e.target.value) } : null
                                  )
                                }
                                className="bg-[#010D1F] border border-white/10 rounded-[2px] p-2 text-xs text-white font-mono outline-none focus:border-[#CC6600]"
                              />
                            </div>
                          )}

                          {(formConfig.compensationType === "PERCENTAGE_PER_STUDY" ||
                            formConfig.compensationType === "HYBRID") && (
                            <div className="flex flex-col gap-1">
                              <label className="text-[0.688rem] uppercase font-mono text-white/60 font-semibold">
                                Commission % Per Study
                              </label>
                              <input
                                type="number"
                                step="1"
                                min="0"
                                max="100"
                                value={formConfig.commissionPercentagePerStudy}
                                onChange={(e) =>
                                  setFormConfig((p) =>
                                    p ? { ...p, commissionPercentagePerStudy: Number(e.target.value) } : null
                                  )
                                }
                                className="bg-[#010D1F] border border-white/10 rounded-[2px] p-2 text-xs text-white font-mono outline-none focus:border-[#CC6600]"
                              />
                            </div>
                          )}

                          <div className="flex flex-col gap-1">
                            <label className="text-[0.688rem] uppercase font-mono text-white/60 font-semibold">
                              Hourly Duty Rate (₱ / hr)
                            </label>
                            <input
                              type="number"
                              step="25"
                              min="0"
                              value={formConfig.hourlyDutyRate}
                              onChange={(e) =>
                                setFormConfig((p) =>
                                  p ? { ...p, hourlyDutyRate: Number(e.target.value) } : null
                                )
                              }
                              className="bg-[#010D1F] border border-white/10 rounded-[2px] p-2 text-xs text-white font-mono outline-none focus:border-[#CC6600]"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[0.688rem] uppercase font-mono text-white/60 font-semibold">
                              Per-Study Bonus (₱)
                            </label>
                            <input
                              type="number"
                              step="100"
                              min="0"
                              value={formConfig.fixedPerStudyBonus}
                              onChange={(e) =>
                                setFormConfig((p) =>
                                  p ? { ...p, fixedPerStudyBonus: Number(e.target.value) } : null
                                )
                              }
                              className="bg-[#010D1F] border border-white/10 rounded-[2px] p-2 text-xs text-white font-mono outline-none focus:border-[#CC6600]"
                            />
                          </div>

                          <div className="flex flex-col gap-1 sm:col-span-2">
                            <label className="text-[0.688rem] uppercase font-mono text-white/60 font-semibold">
                              Monthly Allowances (₱)
                            </label>
                            <input
                              type="number"
                              step="250"
                              min="0"
                              value={formConfig.allowancesMonthly}
                              onChange={(e) =>
                                setFormConfig((p) =>
                                  p ? { ...p, allowancesMonthly: Number(e.target.value) } : null
                                )
                              }
                              className="bg-[#010D1F] border border-white/10 rounded-[2px] p-2 text-xs text-white font-mono outline-none focus:border-[#CC6600]"
                            />
                          </div>
                        </div>

                        {/* Formula Preview Box */}
                        <div className="p-3 bg-[#010D1F] border border-white/10 rounded-[2px] flex flex-col gap-1">
                          <span className="text-[0.625rem] uppercase font-mono text-white/40">
                            Effective Formula Preview
                          </span>
                          <span className="font-mono text-emerald-400 text-xs">
                            Take-Home ={" "}
                            {formConfig.baseSalaryMonthly > 0 ? `₱${formConfig.baseSalaryMonthly.toLocaleString()} Base + ` : ""}
                            {formConfig.commissionPercentagePerStudy > 0
                              ? `(${formConfig.commissionPercentagePerStudy}% × Total Study Value) + `
                              : ""}
                            {formConfig.hourlyDutyRate > 0 ? `(Duty Hours × ₱${formConfig.hourlyDutyRate}/h) + ` : ""}
                            ₱{formConfig.allowancesMonthly.toLocaleString()} Allowances
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 pt-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setEditingRole(null)}
                            disabled={isSavingRole}
                            className="text-xs"
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            type="submit"
                            disabled={isSavingRole}
                            className="gap-1.5 font-sans font-semibold cursor-pointer rounded-[2px] text-xs"
                          >
                            {isSavingRole ? (
                              <IconLoader2 size={14} stroke={2.5} className="animate-spin text-white/90" />
                            ) : (
                              <IconCheck size={14} stroke={2} />
                            )}
                            <span>Save Policy</span>
                          </Button>
                        </div>
                      </form>
                    ) : (
                      /* Readonly Display */
                      <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-[#010D1F] border border-white/10 rounded-[2px]">
                          <div>
                            <span className="text-[0.625rem] uppercase font-mono text-white/40 block">Base Salary</span>
                            <span className="font-mono text-white font-bold text-xs">
                              {role.baseSalaryMonthly > 0 ? `₱${role.baseSalaryMonthly.toLocaleString()}` : "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[0.625rem] uppercase font-mono text-white/40 block">Commission</span>
                            <span className="font-mono text-emerald-400 font-bold text-xs">
                              {role.commissionPercentagePerStudy > 0 ? `${role.commissionPercentagePerStudy}% / study` : "None"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[0.625rem] uppercase font-mono text-white/40 block">Duty Wage</span>
                            <span className="font-mono text-white font-bold text-xs">
                              ₱{role.hourlyDutyRate.toFixed(2)}/h
                            </span>
                          </div>
                          <div>
                            <span className="text-[0.625rem] uppercase font-mono text-white/40 block">Allowances</span>
                            <span className="font-mono text-white font-bold text-xs">
                              ₱{role.allowancesMonthly.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-[2px] text-xs text-white/70 font-sans">
                          <strong className="text-white">Active Rule: </strong>
                          {role.notes || "Standard institutional compensation rule."}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[0.688rem] font-mono text-white/40">
                    <span>Authorized by: {role.updatedBy || "CEO"}</span>
                    <span>Updated: {role.updatedAt ? new Date(role.updatedAt).toLocaleDateString("en-PH") : "Active"}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ── TAB 2: SPECIALIST OVERRIDES ── */}
        <TabsContent value="STAFF" className="mt-6 flex flex-col gap-6">
          <Card className="p-6 sm:p-8 bg-[#01142B] border-white/10 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-base font-bold text-white font-sans">
                  Internal Specialists &amp; Custom Overrides
                </h2>
                <p className="text-xs text-white/50 font-sans mt-0.5">
                  View each team member&rsquo;s effective compensation structure. Apply bespoke contract terms to individual senior specialists without altering company-wide role baselines.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-white/50 font-mono uppercase text-[0.688rem]">
                    <th className="py-3 px-3">Specialist Name</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Pay Structure</th>
                    <th className="py-3 px-3">Base Retainer</th>
                    <th className="py-3 px-3">Study %</th>
                    <th className="py-3 px-3">Duty Wage</th>
                    <th className="py-3 px-3">Override Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {staffMembers.map((staff) => {
                    const cfg = staff.effectiveConfig;
                    const hasOverride = Boolean(staff.overrideConfig);

                    return (
                      <tr key={staff.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex flex-col">
                            <span className="font-semibold text-white">{staff.fullName}</span>
                            <span className="text-[0.688rem] font-mono text-white/40">{staff.email}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-[0.688rem] text-white/70">
                          {staff.role}
                        </td>
                        <td className="py-3 px-3 font-mono text-white/80">
                          {cfg.compensationType.replace(/_/g, " ")}
                        </td>
                        <td className="py-3 px-3 font-mono text-white">
                          {cfg.baseSalaryMonthly > 0 ? `₱${cfg.baseSalaryMonthly.toLocaleString()}` : "--"}
                        </td>
                        <td className="py-3 px-3 font-mono text-emerald-400 font-semibold">
                          {cfg.commissionPercentagePerStudy > 0 ? `${cfg.commissionPercentagePerStudy}%` : "--"}
                        </td>
                        <td className="py-3 px-3 font-mono text-white/70">
                          ₱{cfg.hourlyDutyRate.toFixed(2)}/h
                        </td>
                        <td className="py-3 px-3">
                          {hasOverride ? (
                            <Badge variant="amber" className="text-[0.625rem] font-mono">
                              Bespoke Override
                            </Badge>
                          ) : (
                            <Badge variant="sky" className="text-[0.625rem] font-mono">
                              Role Default
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedStaffForOverride(staff)}
                            className="font-mono text-xs py-1 px-3 cursor-pointer"
                          >
                            {hasOverride ? "Modify Terms" : "Set Override"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ── TAB 3: EXECUTIVE PAYSLIP AUDIT VAULT ── */}
        <TabsContent value="PAYSLIPS" className="mt-6 flex flex-col gap-6">
          <Card className="p-6 sm:p-8 bg-[#01142B] border-white/10 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-base font-bold text-white font-sans">
                  Institutional Payslip Audit Ledger
                </h2>
                <p className="text-xs text-white/50 font-sans mt-0.5">
                  Executive oversight over all generated employee payslips, itemized study deliverables, and disbursement timestamps.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleGenerateBatch}
                  disabled={isGeneratingBatch}
                  className="gap-1.5 font-sans font-semibold cursor-pointer rounded-[2px]"
                >
                  <IconReceipt size={14} stroke={2} />
                  <span>Run Batch Cycle</span>
                </Button>
              </div>
            </div>

            {payslips.length === 0 ? (
              <div className="py-12 text-center text-xs text-white/40 italic font-sans">
                Zero payslips generated for this cycle. Click &ldquo;Run Batch Cycle&rdquo; to calculate.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-white/50 font-mono uppercase text-[0.688rem]">
                      <th className="py-3 px-3">Statement Ref</th>
                      <th className="py-3 px-3">Specialist</th>
                      <th className="py-3 px-3">Period</th>
                      <th className="py-3 px-3">Duty Hours</th>
                      <th className="py-3 px-3">Studies</th>
                      <th className="py-3 px-3 text-right">Gross Pay</th>
                      <th className="py-3 px-3 text-right">Net Take-Home</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Audit &amp; Preview</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {payslips.map((ps) => (
                      <tr key={ps.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-3 font-mono font-semibold text-[#CC6600]">
                          {ps.payslipNumber}
                        </td>
                        <td className="py-3 px-3 font-sans">
                          <span className="font-semibold text-white block">{ps.staffName}</span>
                          <span className="text-[0.688rem] font-mono text-white/40">{ps.staffRole}</span>
                        </td>
                        <td className="py-3 px-3 font-mono text-white/70">
                          {ps.payPeriodMonth}
                        </td>
                        <td className="py-3 px-3 font-mono text-white/80">
                          {ps.verifiedDutyHours} hrs
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
                            <Badge variant="emerald" className="text-[0.625rem] font-mono">
                              Disbursed
                            </Badge>
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
                          <div className="flex items-center justify-end gap-2">
                            {ps.status === "DRAFT" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApprove(ps.id)}
                                className="font-mono text-xs py-1 px-2 cursor-pointer text-emerald-400"
                              >
                                Approve
                              </Button>
                            )}
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setSelectedPayslipForView(ps)}
                              className="font-sans text-xs py-1 px-3 cursor-pointer"
                            >
                              Statement →
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Specialist Override Modal */}
      {selectedStaffForOverride && (
        <SpecialistOverrideModal
          staff={selectedStaffForOverride}
          open={!!selectedStaffForOverride}
          onClose={() => setSelectedStaffForOverride(null)}
          onSuccess={async () => {
            setToast({
              variant: "success",
              message: "Specialist Terms Saved",
              description: `Custom compensation override updated for ${selectedStaffForOverride.fullName}.`,
            });
            await loadData();
          }}
        />
      )}

      {/* Official Payslip Statement Modal */}
      {selectedPayslipForView && (
        <PayslipStatementModal
          payslip={selectedPayslipForView}
          open={!!selectedPayslipForView}
          onClose={() => setSelectedPayslipForView(null)}
        />
      )}
    </div>
  );
}
