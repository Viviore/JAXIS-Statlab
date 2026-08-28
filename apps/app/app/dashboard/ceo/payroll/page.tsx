"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  KpiCard,
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
  IconCalendarTime,
} from "@tabler/icons-react";
import {
  getPayrollConfigurations,
  saveRoleCompensationConfig,
  saveCompanyPayrollSchedule,
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
  CorporatePayrollScheduleConfigDTO,
  CutOffCycle,
  PayrollFrequency,
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

  // Corporate schedule config state
  const [scheduleConfig, setScheduleConfig] = useState<CorporatePayrollScheduleConfigDTO | null>(null);
  const [scheduleForm, setScheduleForm] = useState<CorporatePayrollScheduleConfigDTO | null>(null);
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [selectedBatchCycle, setSelectedBatchCycle] = useState<CutOffCycle>("FIRST_HALF");

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
      setScheduleConfig(configData.scheduleConfig);
      setScheduleForm({ ...configData.scheduleConfig });
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

  const handleSelectRoleModel = (modelId: CompensationType) => {
    setFormConfig((prev) => {
      if (!prev) return null;
      const next = { ...prev, compensationType: modelId };
      if (modelId === "PERCENTAGE_PER_STUDY") {
        next.baseSalaryMonthly = 0;
        next.hourlyDutyRate = 0;
        if (!next.commissionPercentagePerStudy) next.commissionPercentagePerStudy = 50;
      } else if (modelId === "FIXED_SALARY") {
        next.commissionPercentagePerStudy = 0;
        next.hourlyDutyRate = 0;
        next.fixedPerStudyBonus = 0;
        if (!next.baseSalaryMonthly) next.baseSalaryMonthly = 35000;
      } else if (modelId === "HOURLY_DUTY") {
        next.baseSalaryMonthly = 0;
        next.commissionPercentagePerStudy = 0;
        next.fixedPerStudyBonus = 0;
        if (!next.hourlyDutyRate) next.hourlyDutyRate = 450;
      } else if (modelId === "HYBRID") {
        next.hourlyDutyRate = 0;
        next.fixedPerStudyBonus = 0;
        if (!next.baseSalaryMonthly) next.baseSalaryMonthly = 12000;
        if (!next.commissionPercentagePerStudy) next.commissionPercentagePerStudy = 10;
      }
      return next;
    });
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm) return;
    setIsSavingSchedule(true);
    try {
      const res = await saveCompanyPayrollSchedule(scheduleForm);
      if (res.success && res.config) {
        setScheduleConfig(res.config);
        setToast({
          variant: "success",
          message: "Corporate Payroll Schedule Updated",
          description: `Settlement cadence configured to ${
            res.config.frequency === "SEMI_MONTHLY"
              ? "Semi-Monthly (Twice Monthly / 15-Day Cut-Off)"
              : res.config.frequency === "MONTHLY"
              ? "Monthly (Full Calendar Month)"
              : "Bi-Weekly (Every 14 Days)"
          }.`,
        });
        await loadData();
      } else {
        setToast({
          variant: "danger",
          message: "Schedule Update Failed",
          description: res.error?.message,
        });
      }
    } catch {
      setToast({
        variant: "danger",
        message: "Error",
        description: "Failed to save corporate schedule policy.",
      });
    } finally {
      setIsSavingSchedule(false);
    }
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

  const handleGenerateBatch = async (cycle: CutOffCycle = selectedBatchCycle) => {
    setIsGeneratingBatch(true);
    try {
      const currentMonthStr = new Date().toLocaleDateString("en-PH", { month: "long", year: "numeric" });
      const now = new Date();

      let startStr: string;
      let endStr: string;
      let cycleTitle: string;

      if (cycle === "FIRST_HALF") {
        startStr = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0).toISOString();
        endStr = new Date(now.getFullYear(), now.getMonth(), 15, 23, 59, 59).toISOString();
        cycleTitle = "First Half-Month Cycle (Days 1–15)";
      } else if (cycle === "SECOND_HALF") {
        startStr = new Date(now.getFullYear(), now.getMonth(), 16, 0, 0, 0).toISOString();
        endStr = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
        cycleTitle = "Second Half-Month Cycle (Days 16–End)";
      } else {
        startStr = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0).toISOString();
        endStr = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
        cycleTitle = "Full Calendar Month Cycle";
      }

      const res = await generateBatchPayslips({
        payPeriodMonth: currentMonthStr,
        payPeriodStart: startStr,
        payPeriodEnd: endStr,
        cutOffCycle: cycle,
      });

      if (res.success) {
        setToast({
          variant: "success",
          message: "Institutional Payroll Run Generated",
          description: `Calculated official payslips for ${res.count} active specialists for ${cycleTitle} (${currentMonthStr}).`,
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
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="amber" className="text-xs font-mono flex items-center gap-1">
              <IconShieldLock size={13} stroke={2} />
              <span>CEO Executive Authority</span>
            </Badge>

            <select
              value={selectedBatchCycle}
              onChange={(e) => setSelectedBatchCycle(e.target.value as CutOffCycle)}
              className="bg-[#010D1F] border border-white/10 rounded-[2px] px-2.5 py-1.5 text-xs text-white font-mono outline-none focus:border-[#CC6600]"
            >
              <option value="FIRST_HALF">First Half (Days 1–15)</option>
              <option value="SECOND_HALF">Second Half (Days 16–End)</option>
              <option value="FULL_MONTH">Full Calendar Month</option>
            </select>

            <Button
              variant="primary"
              size="sm"
              onClick={() => handleGenerateBatch(selectedBatchCycle)}
              disabled={isGeneratingBatch}
              className="gap-1.5 font-sans font-semibold cursor-pointer rounded-[2px]"
            >
              {isGeneratingBatch ? (
                <IconLoader2 size={15} stroke={2.5} className="animate-spin text-white/90" />
              ) : (
                <IconReceipt size={15} stroke={2} />
              )}
              <span>Run Selected Cycle</span>
            </Button>
          </div>
        }
      />

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Institutional Payroll Net"
          value={`₱${payrollKpis.totalInstitutionalPayroll.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`}
          variant="default"
          icon={<IconCoins size={16} stroke={1.5} />}
          description={`${payrollKpis.activeStaffCount} Specialists in Active Cycle`}
        />

        <KpiCard
          label="Treasury Disbursed"
          value={`₱${payrollKpis.totalDisbursed.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`}
          variant="sky"
          icon={<IconBuildingBank size={16} stroke={1.5} />}
          description={payrollKpis.pendingDisbursementsCount === 0 ? "100% Cleared" : `${payrollKpis.pendingDisbursementsCount} Pending`}
        />

        <KpiCard
          label="Compensated Duty Hours"
          value={payrollKpis.totalDutyHoursCompensated}
          unit="hrs total"
          icon={<IconClock size={16} stroke={1.5} />}
          description="Verified Platform Attendance"
        />

        <KpiCard
          label="Study Deliverables Paid"
          value={payrollKpis.totalStudiesRewarded}
          unit="completed"
          variant="amber"
          icon={<IconSparkles size={16} stroke={1.5} />}
          description="Active Cycle Commissions"
        />
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
          {/* Corporate Settlement Schedule Card */}
          {scheduleForm && (
            <Card className="p-6 sm:p-7 bg-[#01142B] border border-white/10 rounded-[2px]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-950/50 border border-amber-500/30 text-amber-400 rounded-[2px]">
                    <IconCalendarTime size={20} stroke={1.5} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white font-sans">
                        Corporate Settlement Cadence &amp; Schedule Policy
                      </h3>
                      <Badge variant="amber" className="text-[0.625rem] font-mono">
                        Active: {(scheduleConfig?.frequency || scheduleForm.frequency) === "SEMI_MONTHLY"
                          ? "Semi-Monthly (Twice Monthly / 15-Day Cut-Off)"
                          : (scheduleConfig?.frequency || scheduleForm.frequency) === "MONTHLY"
                          ? "Monthly (Full Calendar Month)"
                          : "Bi-Weekly (Every 14 Days)"}
                      </Badge>
                    </div>
                    <p className="text-xs text-white/50 font-sans mt-0.5">
                      Configure company-wide settlement frequency. For Semi-Monthly schedules, monthly base retainers are divided into two equal 15-day cut-offs.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveSchedule}
                    disabled={isSavingSchedule}
                    className="gap-1.5 font-sans font-semibold cursor-pointer rounded-[2px]"
                  >
                    {isSavingSchedule ? (
                      <IconLoader2 size={15} stroke={2.5} className="animate-spin text-white/90" />
                    ) : (
                      <IconCheck size={15} stroke={2} />
                    )}
                    <span>Save Schedule Policy</span>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="text-xs font-mono text-white/70 block mb-1.5 font-semibold">
                    Settlement Frequency Cadence
                  </label>
                  <select
                    value={scheduleForm.frequency}
                    onChange={(e) =>
                      setScheduleForm((prev) =>
                        prev ? { ...prev, frequency: e.target.value as PayrollFrequency } : prev
                      )
                    }
                    className="w-full bg-[#010D1F] border border-white/10 rounded-[2px] p-2.5 text-xs text-white outline-none focus:border-[#CC6600] font-sans"
                  >
                    <option value="SEMI_MONTHLY">Semi-Monthly (Twice Monthly / Every 15 Days)</option>
                    <option value="MONTHLY">Monthly (Full Calendar Month)</option>
                    <option value="BI_WEEKLY">Bi-Weekly (Every 14 Days)</option>
                  </select>
                  <span className="text-[0.625rem] text-white/40 font-mono mt-1 block">
                    1st Cut-Off: Days 1–15 | 2nd Cut-Off: Days 16–End of Month
                  </span>
                </div>

                <div>
                  <label className="text-xs font-mono text-white/70 block mb-1.5 font-semibold">
                    First Half-Month Boundary
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={10}
                      max={20}
                      value={scheduleForm.firstCutoffDay}
                      onChange={(e) =>
                        setScheduleForm((prev) =>
                          prev ? { ...prev, firstCutoffDay: Number(e.target.value) } : prev
                        )
                      }
                      className="w-full bg-[#010D1F] border border-white/10 rounded-[2px] p-2.5 text-xs text-white font-mono outline-none focus:border-[#CC6600]"
                    />
                    <span className="text-xs font-mono text-white/40 shrink-0">th of Month</span>
                  </div>
                  <span className="text-[0.625rem] text-white/40 font-mono mt-1 block">
                    Day marking closure of the 1st cycle.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-mono text-white/70 block mb-1.5 font-semibold">
                    Disbursement Settlement Grace
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={scheduleForm.disbursementGraceDays}
                      onChange={(e) =>
                        setScheduleForm((prev) =>
                          prev ? { ...prev, disbursementGraceDays: Number(e.target.value) } : prev
                        )
                      }
                      className="w-full bg-[#010D1F] border border-white/10 rounded-[2px] p-2.5 text-xs text-white font-mono outline-none focus:border-[#CC6600]"
                    />
                    <span className="text-xs font-mono text-white/40 shrink-0">Days Post-Cutoff</span>
                  </div>
                  <span className="text-[0.625rem] text-white/40 font-mono mt-1 block">
                    Disbursement window post cut-off closure.
                  </span>
                </div>
              </div>

              {scheduleForm.frequency === "SEMI_MONTHLY" && (
                <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="prorateBase"
                    checked={scheduleForm.prorateMonthlyBase}
                    onChange={(e) =>
                      setScheduleForm((prev) =>
                        prev ? { ...prev, prorateMonthlyBase: e.target.checked } : prev
                      )
                    }
                    className="accent-[#CC6600] rounded-[2px]"
                  />
                  <label htmlFor="prorateBase" className="text-xs text-white/80 font-sans cursor-pointer">
                    Automatically prorate fixed monthly base retainers and allowances (divide by 2) for each 15-day cut-off run.
                  </label>
                </div>
              )}
            </Card>
          )}

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
                      <form onSubmit={handleSaveRole} className="flex flex-col gap-5 text-xs">
                        {/* Compensation Model Selector */}
                        <div className="flex flex-col gap-2">
                          <label className="text-[0.688rem] uppercase font-mono text-white/60 font-semibold">
                            Select Compensation Model
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {[
                              {
                                id: "PERCENTAGE_PER_STUDY",
                                title: "Study % Commission",
                                subtitle: "Earn percentage per completed study",
                              },
                              {
                                id: "FIXED_SALARY",
                                title: "Fixed Monthly Base",
                                subtitle: "Guaranteed monthly or 15-day salary",
                              },
                              {
                                id: "HOURLY_DUTY",
                                title: "Hourly Duty Wage",
                                subtitle: "Paid per verified attendance hour",
                              },
                              {
                                id: "HYBRID",
                                title: "Hybrid (Base + %)",
                                subtitle: "Base monthly pay + Study % commission",
                              },
                            ].map((m) => {
                              const isSelected = formConfig.compensationType === m.id;
                              return (
                                <button
                                  key={m.id}
                                  type="button"
                                  onClick={() => handleSelectRoleModel(m.id as CompensationType)}
                                  className={`p-3 rounded-[2px] border text-left font-sans transition-all cursor-pointer ${
                                    isSelected
                                      ? "bg-[#CC6600]/20 border-[#CC6600] text-white ring-1 ring-[#CC6600]"
                                      : "bg-[#010D1F] border-white/10 text-white/70 hover:text-white hover:border-white/20"
                                  }`}
                                >
                                  <div className="font-semibold text-xs text-white mb-0.5">{m.title}</div>
                                  <div className="text-[0.688rem] text-white/50">{m.subtitle}</div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Focused Inputs - Show ONLY what is needed for the active model */}
                        <div className="p-4 bg-[#010D1F] border border-white/10 rounded-[2px] flex flex-col gap-4">
                          {formConfig.compensationType === "PERCENTAGE_PER_STUDY" && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs font-mono text-white/80 block mb-1.5 font-semibold">
                                  Commission % Per Study
                                </label>
                                <div className="relative flex items-center">
                                  <input
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={formConfig.commissionPercentagePerStudy}
                                    onChange={(e) =>
                                      setFormConfig((p) =>
                                        p ? { ...p, commissionPercentagePerStudy: Number(e.target.value) } : null
                                      )
                                    }
                                    className="w-full bg-[#01142B] border border-white/15 rounded-[2px] px-3 py-2 text-sm text-white font-mono outline-none focus:border-[#CC6600]"
                                  />
                                  <span className="absolute right-3 text-xs font-mono text-white/50">
                                    % of study fee
                                  </span>
                                </div>
                                <span className="text-[0.688rem] text-white/40 font-sans mt-1 block">
                                  Specialist receives this percentage of the project contract value upon completion.
                                </span>
                              </div>

                              <div>
                                <label className="text-xs font-mono text-white/80 block mb-1.5 font-semibold">
                                  Optional Deliverable Bonus (₱)
                                </label>
                                <div className="relative flex items-center">
                                  <span className="absolute left-3 text-xs font-mono text-white/50">₱</span>
                                  <input
                                    type="number"
                                    step={100}
                                    min={0}
                                    value={formConfig.fixedPerStudyBonus}
                                    onChange={(e) =>
                                      setFormConfig((p) =>
                                        p ? { ...p, fixedPerStudyBonus: Number(e.target.value) } : null
                                      )
                                    }
                                    className="w-full bg-[#01142B] border border-white/15 rounded-[2px] pl-7 pr-3 py-2 text-sm text-white font-mono outline-none focus:border-[#CC6600]"
                                    placeholder="0"
                                  />
                                </div>
                                <span className="text-[0.688rem] text-white/40 font-sans mt-1 block">
                                  Extra fixed incentive credited on each delivered study.
                                </span>
                              </div>
                            </div>
                          )}

                          {formConfig.compensationType === "FIXED_SALARY" && (
                            <div>
                              <label className="text-xs font-mono text-white/80 block mb-1.5 font-semibold">
                                Monthly Base Salary (₱)
                              </label>
                              <div className="relative flex items-center max-w-md">
                                <span className="absolute left-3 text-sm font-mono text-white/50">₱</span>
                                <input
                                  type="number"
                                  step={500}
                                  min={0}
                                  value={formConfig.baseSalaryMonthly}
                                  onChange={(e) =>
                                    setFormConfig((p) =>
                                      p ? { ...p, baseSalaryMonthly: Number(e.target.value) } : null
                                    )
                                  }
                                  className="w-full bg-[#01142B] border border-white/15 rounded-[2px] pl-8 pr-3 py-2 text-sm text-white font-mono outline-none focus:border-[#CC6600]"
                                />
                              </div>
                              <span className="text-[0.688rem] text-white/40 font-sans mt-1.5 block">
                                In a semi-monthly schedule, this pays ₱{(formConfig.baseSalaryMonthly / 2).toLocaleString()} every 15-day cut-off.
                              </span>
                            </div>
                          )}

                          {formConfig.compensationType === "HOURLY_DUTY" && (
                            <div>
                              <label className="text-xs font-mono text-white/80 block mb-1.5 font-semibold">
                                Hourly Duty Rate (₱ / hour)
                              </label>
                              <div className="relative flex items-center max-w-md">
                                <span className="absolute left-3 text-sm font-mono text-white/50">₱</span>
                                <input
                                  type="number"
                                  step={25}
                                  min={0}
                                  value={formConfig.hourlyDutyRate}
                                  onChange={(e) =>
                                    setFormConfig((p) =>
                                      p ? { ...p, hourlyDutyRate: Number(e.target.value) } : null
                                    )
                                  }
                                  className="w-full bg-[#01142B] border border-white/15 rounded-[2px] pl-8 pr-16 py-2 text-sm text-white font-mono outline-none focus:border-[#CC6600]"
                                />
                                <span className="absolute right-3 text-xs font-mono text-white/50">/ hour</span>
                              </div>
                              <span className="text-[0.688rem] text-white/40 font-sans mt-1.5 block">
                                Calculated automatically from verified clock-in/out attendance logs in Module 18.
                              </span>
                            </div>
                          )}

                          {formConfig.compensationType === "HYBRID" && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs font-mono text-white/80 block mb-1.5 font-semibold">
                                  Monthly Base Retainer (₱)
                                </label>
                                <div className="relative flex items-center">
                                  <span className="absolute left-3 text-sm font-mono text-white/50">₱</span>
                                  <input
                                    type="number"
                                    step={500}
                                    min={0}
                                    value={formConfig.baseSalaryMonthly}
                                    onChange={(e) =>
                                      setFormConfig((p) =>
                                        p ? { ...p, baseSalaryMonthly: Number(e.target.value) } : null
                                      )
                                    }
                                    className="w-full bg-[#01142B] border border-white/15 rounded-[2px] pl-8 pr-3 py-2 text-sm text-white font-mono outline-none focus:border-[#CC6600]"
                                  />
                                </div>
                                <span className="text-[0.688rem] text-white/40 font-sans mt-1 block">
                                  Guaranteed baseline pay (₱{(formConfig.baseSalaryMonthly / 2).toLocaleString()} per 15-day cut-off).
                                </span>
                              </div>

                              <div>
                                <label className="text-xs font-mono text-white/80 block mb-1.5 font-semibold">
                                  Commission % Per Study
                                </label>
                                <div className="relative flex items-center">
                                  <input
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={formConfig.commissionPercentagePerStudy}
                                    onChange={(e) =>
                                      setFormConfig((p) =>
                                        p ? { ...p, commissionPercentagePerStudy: Number(e.target.value) } : null
                                      )
                                    }
                                    className="w-full bg-[#01142B] border border-white/15 rounded-[2px] px-3 py-2 text-sm text-white font-mono outline-none focus:border-[#CC6600]"
                                  />
                                  <span className="absolute right-3 text-xs font-mono text-white/50">
                                    % of study fee
                                  </span>
                                </div>
                                <span className="text-[0.688rem] text-white/40 font-sans mt-1 block">
                                  Commission added on top of base pay for each completed study.
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Monthly Allowance - Compact Optional Row */}
                          <div className="pt-3 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <label className="text-xs font-mono text-white/80 font-semibold block">
                                Monthly Allowance / Stipend (Optional)
                              </label>
                              <span className="text-[0.688rem] text-white/40 font-sans">
                                Fixed connectivity, compute, or research allowance added each month.
                              </span>
                            </div>
                            <div className="relative flex items-center w-full sm:w-44 shrink-0">
                              <span className="absolute left-3 text-xs font-mono text-white/50">₱</span>
                              <input
                                type="number"
                                step={250}
                                min={0}
                                value={formConfig.allowancesMonthly}
                                onChange={(e) =>
                                  setFormConfig((p) =>
                                    p ? { ...p, allowancesMonthly: Number(e.target.value) } : null
                                  )
                                }
                                className="w-full bg-[#01142B] border border-white/15 rounded-[2px] pl-7 pr-3 py-1.5 text-xs text-white font-mono outline-none focus:border-[#CC6600]"
                                placeholder="0"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Conversational Rule Preview Box */}
                        <div className="p-3.5 bg-[#010D1F] border border-emerald-500/20 rounded-[2px] flex items-start gap-3">
                          <div className="p-1 bg-emerald-950/60 border border-emerald-500/30 rounded-[2px] text-emerald-400 shrink-0 mt-0.5">
                            <IconSparkles size={14} stroke={1.5} />
                          </div>
                          <div className="text-xs font-sans text-white/90 leading-relaxed">
                            <span className="font-bold text-emerald-400 mr-1.5">How this role gets paid:</span>
                            {formConfig.compensationType === "PERCENTAGE_PER_STUDY" && (
                              <span>
                                Specialist earns <strong>{formConfig.commissionPercentagePerStudy}%</strong> of the project fee for every completed study
                                {formConfig.fixedPerStudyBonus > 0 ? ` + ₱${formConfig.fixedPerStudyBonus.toLocaleString()} bonus` : ""}
                                {formConfig.allowancesMonthly > 0 ? ` + ₱${formConfig.allowancesMonthly.toLocaleString()} monthly allowance` : ""}.
                              </span>
                            )}
                            {formConfig.compensationType === "FIXED_SALARY" && (
                              <span>
                                Fixed salary of <strong>₱{formConfig.baseSalaryMonthly.toLocaleString()} / month</strong>
                                {" "}(paid as ₱{(formConfig.baseSalaryMonthly / 2).toLocaleString()} every 15 days)
                                {formConfig.allowancesMonthly > 0 ? ` + ₱${formConfig.allowancesMonthly.toLocaleString()} monthly allowance` : ""}.
                              </span>
                            )}
                            {formConfig.compensationType === "HOURLY_DUTY" && (
                              <span>
                                Paid <strong>₱{formConfig.hourlyDutyRate.toLocaleString()} / hour</strong> based on verified duty attendance
                                {formConfig.allowancesMonthly > 0 ? ` + ₱${formConfig.allowancesMonthly.toLocaleString()} monthly allowance` : ""}.
                              </span>
                            )}
                            {formConfig.compensationType === "HYBRID" && (
                              <span>
                                Base salary of <strong>₱{formConfig.baseSalaryMonthly.toLocaleString()} / month</strong> + <strong>{formConfig.commissionPercentagePerStudy}%</strong> per completed study
                                {formConfig.allowancesMonthly > 0 ? ` + ₱${formConfig.allowancesMonthly.toLocaleString()} allowance` : ""}.
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 pt-1">
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
                        <div className="p-4 bg-[#010D1F] border border-white/10 rounded-[2px] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <span className="text-[0.625rem] uppercase font-mono text-white/40 block mb-1">
                              Primary Compensation Model
                            </span>
                            <div className="font-sans font-bold text-sm text-white flex items-center gap-2">
                              {role.compensationType === "PERCENTAGE_PER_STUDY" && (
                                <span className="text-emerald-400 font-mono text-base">
                                  {role.commissionPercentagePerStudy}% Commission per Study
                                </span>
                              )}
                              {role.compensationType === "FIXED_SALARY" && (
                                <span className="text-white font-mono text-base">
                                  ₱{role.baseSalaryMonthly.toLocaleString()} / month
                                  <span className="text-xs text-white/50 font-sans font-normal ml-1.5">
                                    (₱{(role.baseSalaryMonthly / 2).toLocaleString()} every 15 days)
                                  </span>
                                </span>
                              )}
                              {role.compensationType === "HOURLY_DUTY" && (
                                <span className="text-purple-300 font-mono text-base">
                                  ₱{role.hourlyDutyRate.toFixed(2)} / hour
                                </span>
                              )}
                              {role.compensationType === "HYBRID" && (
                                <span className="text-sky-400 font-mono text-sm">
                                  ₱{role.baseSalaryMonthly.toLocaleString()} Base + {role.commissionPercentagePerStudy}% Commission
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {role.fixedPerStudyBonus > 0 && (
                              <span className="px-2 py-1 bg-amber-950/40 border border-amber-500/30 text-amber-300 rounded-[2px] text-xs font-mono">
                                +₱{role.fixedPerStudyBonus.toLocaleString()} Bonus
                              </span>
                            )}
                            {role.allowancesMonthly > 0 && (
                              <span className="px-2 py-1 bg-sky-950/40 border border-sky-500/30 text-sky-300 rounded-[2px] text-xs font-mono">
                                +₱{role.allowancesMonthly.toLocaleString()} Allowance
                              </span>
                            )}
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
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[0.688rem] font-mono text-white/40">{staff.email}</span>
                              {staff.payoutDetails && (
                                <span
                                  className="text-[0.562rem] font-mono px-1.5 py-0.2 rounded-[2px] bg-orange-500/15 text-[#FFA040] border border-[#FFA040]/30"
                                  title={`${staff.payoutDetails.payoutChannel}: ${staff.payoutDetails.accountNumber} (${staff.payoutDetails.accountName})`}
                                >
                                  {staff.payoutDetails.payoutChannel.replace(/_/g, " ")}
                                </span>
                              )}
                            </div>
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
                  onClick={() => handleGenerateBatch(selectedBatchCycle)}
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
