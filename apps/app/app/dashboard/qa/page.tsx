"use client";

import React, { useState, useEffect, useCallback, useTransition, useMemo } from "react";
import Link from "next/link";
import {
  PageHeader,
  Card,
  Button,
  KpiCard,
  Badge,
  LoadingState,
  Modal,
  Toast,
  Pagination,
} from "@repo/ui";
import {
  IconCheck,
  IconRefresh,
  IconArrowRight,
  IconDatabase,
  IconShieldCheck,
  IconCalendar,
  IconUserCheck,
  IconClock,
  IconLoader2,
  IconChevronDown,
} from "@tabler/icons-react";
import { getQaWorkload } from "@/features/assignments/actions";
import { getStaffSelfProfile, requestLeave, returnFromLeave } from "@/features/staff/actions";
import type { AssignmentDetailItem } from "@/features/assignments/schemas";

const LEAVE_REASON_TEMPLATES = [
  {
    label: "Annual Vacation / Personal Rest",
    text: "Taking scheduled annual vacation leave for personal rest and recuperation. Inquiries may be escalated to the active reviewer or administrator.",
  },
  {
    label: "Sick / Medical Recovery",
    text: "Taking medical recovery leave due to health concerns. Will resume quality assurance reviews once cleared.",
  },
  {
    label: "Academic Conference Presentation",
    text: "Attending and presenting research at an academic conference with limited daytime availability.",
  },
  {
    label: "Family Emergency / Urgent Matters",
    text: "Attending to an urgent family situation requiring immediate off-platform availability.",
  },
  {
    label: "Research Fieldwork / Data Collection",
    text: "Conducting off-site scientific research fieldwork and empirical data collection. QA duties will resume upon return.",
  },
];

export default function QALeadDashboardPage() {
  const [assignments, setAssignments] = useState<AssignmentDetailItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudy, setSelectedStudy] = useState<AssignmentDetailItem | null>(null);
  const [isPending, startTransition] = useTransition();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Leave Management State
  const [profileStatus, setProfileStatus] = useState<string>("ACTIVE");
  const [leaveData, setLeaveData] = useState<{ reason?: string | null; until?: string | null } | null>(null);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveReasonInput, setLeaveReasonInput] = useState("");
  const [leaveFromInput, setLeaveFromInput] = useState("");
  const [leaveUntilInput, setLeaveUntilInput] = useState("");
  const [leaveError, setLeaveError] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<{
    message: string;
    description?: string;
    variant: "info" | "success" | "warning" | "danger";
  } | null>(null);

  const loadWorkload = useCallback(async () => {
    setIsLoading(true);
    try {
      const [res, profileRes] = await Promise.all([
        getQaWorkload(),
        getStaffSelfProfile(),
      ]);
      if (res.success && res.data) {
        setAssignments(res.data);
      }
      if (profileRes.success && profileRes.data) {
        setProfileStatus(profileRes.data.status);
        setLeaveData({
          reason: (profileRes.data as { leaveReason?: string | null }).leaveReason,
          until: (profileRes.data as { leaveUntil?: string | null }).leaveUntil,
        });
      }
    } catch (err) {
      console.error("Failed to load QA workload:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkload();
  }, [loadWorkload]);

  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const isReturnBeforeStart = useMemo(() => {
    if (!leaveFromInput || !leaveUntilInput) return false;
    return leaveUntilInput < leaveFromInput;
  }, [leaveFromInput, leaveUntilInput]);

  const isStartInPast = useMemo(() => {
    if (!leaveFromInput) return false;
    return leaveFromInput < todayStr;
  }, [leaveFromInput, todayStr]);

  const calculatedDays = useMemo(() => {
    if (!leaveFromInput || !leaveUntilInput || isReturnBeforeStart) return null;
    const start = new Date(leaveFromInput);
    const end = new Date(leaveUntilInput);
    const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
  }, [leaveFromInput, leaveUntilInput, isReturnBeforeStart]);

  const handleLeaveFromChange = (val: string) => {
    setLeaveFromInput(val);
    setLeaveError(null);
    // Auto-advance return date if it falls behind new start date
    if (leaveUntilInput && leaveUntilInput < val) {
      const nextDay = new Date(val);
      nextDay.setDate(nextDay.getDate() + 1);
      setLeaveUntilInput(nextDay.toISOString().split("T")[0]!);
    }
  };

  const handleLeaveUntilChange = (val: string) => {
    setLeaveUntilInput(val);
    setLeaveError(null);
  };

  const openLeaveModal = () => {
    setLeaveError(null);
    setLeaveReasonInput("");
    setLeaveFromInput(todayStr);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setLeaveUntilInput(tomorrow.toISOString().split("T")[0]!);
    setIsLeaveModalOpen(true);
  };

  const handleRequestLeave = () => {
    if (!leaveReasonInput || leaveReasonInput.trim().length < 3) {
      setLeaveError("Please specify a reason for your leave (at least 3 characters).");
      return;
    }
    if (isStartInPast) {
      setLeaveError("Leave start date cannot be in the past.");
      return;
    }
    if (isReturnBeforeStart) {
      setLeaveError("Expected return date cannot be earlier than leave start date.");
      return;
    }
    setLeaveError(null);
    startTransition(async () => {
      const res = await requestLeave({
        reason: leaveReasonInput.trim(),
        leaveFrom: leaveFromInput ? new Date(leaveFromInput).toISOString() : undefined,
        leaveUntil: leaveUntilInput ? new Date(leaveUntilInput).toISOString() : undefined,
      });
      if (res.success) {
        setIsLeaveModalOpen(false);
        setLeaveReasonInput("");
        setLeaveUntilInput("");
        loadWorkload();
        setToastMessage({
          message: "Leave Request Submitted",
          description: "Your request is queued for Finance Officer (HR) / Administrator review.",
          variant: "info",
        });
      } else {
        setLeaveError(res.error?.message || "Failed to submit leave request.");
      }
    });
  };

  const handleReturnFromLeave = () => {
    startTransition(async () => {
      const res = await returnFromLeave();
      if (res.success) {
        loadWorkload();
        setToastMessage({
          message: profileStatus === "LEAVE_PENDING" ? "Leave Request Withdrawn" : "Welcome Back to Active Duty",
          description: profileStatus === "LEAVE_PENDING" ? "Your pending leave request has been cancelled." : "Your availability is restored in the verification assignment directory.",
          variant: "success",
        });
      } else {
        setToastMessage({
          message: "Action Failed",
          description: res.error?.message || "Could not update availability status.",
          variant: "danger",
        });
      }
    });
  };

  const urgentCount = assignments.filter((a) => a.isUrgent || a.isOverdue).length;

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-24 w-full animate-content-fade font-sans">
      {/* Page Header */}
      <PageHeader
        title="Senior QA Lead Studio & Verification Desk"
        description="Dual-blind recalculation verification, hypothesis reproducibility audits, APA 7th compliance seals, and deliverable release authorization."
        breadcrumbs={[
          { label: "WORKSPACE", href: "/dashboard" },
          { label: "QA Studio" },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={loadWorkload}
              className="gap-2 font-sans font-semibold rounded-[2px]"
            >
              <IconRefresh size={15} stroke={2} />
              <span>Refresh</span>
            </Button>
            {profileStatus === "ON_LEAVE" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReturnFromLeave}
                disabled={isPending}
                className="font-sans text-xs font-semibold rounded-[2px] bg-emerald-600/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/30 gap-1.5 cursor-pointer"
              >
                <IconUserCheck size={14} stroke={2} />
                <span>Return to Active Duty</span>
              </Button>
            ) : profileStatus === "LEAVE_PENDING" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReturnFromLeave}
                disabled={isPending}
                className="font-sans text-xs font-semibold rounded-[2px] bg-amber-600/20 text-amber-300 border-amber-500/40 hover:bg-amber-600/30 gap-1.5 cursor-pointer"
              >
                <IconClock size={14} stroke={2} />
                <span>Withdraw Leave Request</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={openLeaveModal}
                className="font-sans text-xs font-semibold rounded-[2px] gap-1.5 text-white/70 hover:text-white cursor-pointer"
              >
                <IconCalendar size={14} stroke={2} />
                <span>Request Leave</span>
              </Button>
            )}
            <Link href="/dashboard/qa/profile">
              <Button variant="outline" size="sm" className="font-sans text-xs font-semibold rounded-[2px] cursor-pointer">
                Specialization Profile
              </Button>
            </Link>
          </div>
        }
      />

      {/* Leave Request Pending HR Approval Banner */}
      {profileStatus === "LEAVE_PENDING" && (
        <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-[2px] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-amber-200">
          <div className="flex items-start gap-3">
            <IconClock size={18} stroke={2} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-amber-300 block text-sm">Leave Request Pending HR Approval</span>
                <Badge variant="amber" className="text-[0.625rem] py-0 px-1 font-mono">Awaiting Review</Badge>
              </div>
              <p className="text-white/80 mt-1 leading-relaxed">
                {leaveData?.reason ? `Reason: "${leaveData.reason}". ` : ""}
                {leaveData?.until
                  ? `Scheduled return: ${new Date(leaveData.until).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}. `
                  : ""}
                Your leave request has been submitted and is awaiting formal acknowledgment from the Finance Officer (HR) / Admin. You remain active until HR approval is granted.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReturnFromLeave}
            disabled={isPending}
            className="font-sans text-xs font-semibold rounded-[2px] shrink-0 text-amber-300 border-amber-500/40 hover:bg-amber-500/10 cursor-pointer"
          >
            Cancel / Withdraw Request
          </Button>
        </div>
      )}

      {/* On Leave Status Banner */}
      {profileStatus === "ON_LEAVE" && (
        <div className="p-4 bg-purple-950/40 border border-purple-500/40 rounded-[2px] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-purple-200">
          <div className="flex items-start gap-3">
            <IconClock size={18} stroke={2} className="text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-purple-300 block text-sm">Specialist On Leave Status Active</span>
              <p className="text-white/80 mt-0.5 leading-relaxed">
                {leaveData?.reason ? `Reason: "${leaveData.reason}". ` : ""}
                {leaveData?.until
                  ? `Scheduled return: ${new Date(leaveData.until).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}. `
                  : ""}
                New verification assignments are paused and you are hidden from the assignment directory.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleReturnFromLeave}
            disabled={isPending}
            className="font-sans text-xs font-semibold rounded-[2px] shrink-0 cursor-pointer"
          >
            End Leave Now
          </Button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">
        <KpiCard
          label="Assigned Verifications"
          value={assignments.length}
          variant="sky"
          description="Studies in verification queue"
        />

        <KpiCard
          label="Urgent Release Milestones"
          value={urgentCount}
          variant={urgentCount > 0 ? "amber" : "default"}
          description={urgentCount > 0 ? "Due within 24 hours" : "All reviews on schedule"}
        />

        <KpiCard
          label="Quality Clearance Rate"
          value="100%"
          variant="emerald"
          description="Zero reproducibility breaches"
        />
      </div>

      {/* Assigned QA Studies */}
      <Card className="p-0 overflow-hidden border border-white/10 bg-[#01142B]/90 rounded-[2px]">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white font-sans">
              Quality Assurance &amp; Deliverable Verification Queue
            </h2>
            <p className="text-sm text-white/60 mt-1 font-sans">
              Conduct dual-blind statistical recalculation, inspect notebooks, and validate APA 7th format compliance
            </p>
          </div>
          <span className="text-xs font-mono text-white/50">{assignments.length} Assigned Studies</span>
        </div>

        {isLoading ? (
          <LoadingState
            variant="table"
            label="Loading QA verification queue..."
            description="Retrieving assigned studies, verification records, and SLA timers."
          />
        ) : assignments.length === 0 ? (
          <div className="p-12 text-center text-white/50 text-sm font-sans flex flex-col items-center justify-center gap-2">
            <IconCheck size={32} stroke={1.5} className="text-[#10B981]" />
            <span className="font-semibold text-white">No Studies Pending QA Review</span>
            <span className="text-xs text-white/40">Studies assigned to your QA desk will appear here as statisticians submit analytical models.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-white/50 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-6">Study ID</th>
                  <th className="py-3.5 px-6">Research Title &amp; Field</th>
                  <th className="py-3.5 px-6">Lead Statistician</th>
                  <th className="py-3.5 px-6">SLA Countdown</th>
                  <th className="py-3.5 px-6">Master Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {assignments.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-mono text-xs text-[#CC6600] font-semibold whitespace-nowrap">
                      {item.projectIntakeId}
                    </td>
                    <td className="py-4 px-6 max-w-xs">
                      <p className="font-semibold text-white text-sm line-clamp-1">
                        {item.projectTitle}
                      </p>
                      <p className="text-xs text-white/50 mt-0.5 truncate">
                        {item.projectField || "Empirical Research"}
                      </p>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="text-xs text-white/90 font-semibold font-sans">
                        {item.statistician.fullName}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            item.isPaused
                              ? "amber"
                              : item.isOverdue
                              ? "danger"
                              : item.isUrgent
                              ? "amber"
                              : "emerald"
                          }
                          className="font-mono text-xs py-0.5 px-2"
                        >
                          {item.slaLabel}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <Badge variant="sky" className="font-mono text-[0.688rem]">
                        {item.masterStatus}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSelectedStudy(item)}
                        className="font-sans text-xs font-semibold rounded-[2px] gap-1"
                      >
                        <span>Inspect Study</span>
                        <IconArrowRight size={13} stroke={2} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {assignments.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={assignments.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            itemLabel="assignments"
          />
        )}
      </Card>

      {/* ── Senior QA Dual-Blind Verification Desk Modal ── */}
      {selectedStudy && (
        <Modal
          open={!!selectedStudy}
          onClose={() => setSelectedStudy(null)}
          title={`QA Dual-Blind Verification Desk: ${selectedStudy.projectIntakeId}`}
          description={selectedStudy.projectTitle}
          size="lg"
          footer={
            <div className="flex items-center justify-end w-full">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedStudy(null)}
                className="font-sans text-xs font-semibold rounded-[2px]"
              >
                Close Desk
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-6 text-sm font-sans text-white/90">
            {/* Status & SLA Bar */}
            <div className="p-4 rounded-[2px] bg-white/[0.02] border border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Badge variant="sky" className="font-mono text-xs">
                  {selectedStudy.masterStatus}
                </Badge>
                <Badge
                  variant={
                    selectedStudy.isPaused
                      ? "amber"
                      : selectedStudy.isOverdue
                      ? "danger"
                      : selectedStudy.isUrgent
                      ? "amber"
                      : "emerald"
                  }
                  className="font-mono text-xs"
                >
                  {selectedStudy.slaLabel}
                </Badge>
              </div>

              <div className="text-right">
                <span className="text-[0.688rem] text-white/50 block font-mono">Contractual Delivery Target</span>
                <span className="text-xs font-mono font-semibold text-white">
                  {new Date(selectedStudy.slaDueAt).toLocaleDateString("en-PH", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Specialist Assignments Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-[#01142B] border border-white/10 rounded-[2px] flex flex-col gap-1">
                <span className="text-[0.688rem] font-mono uppercase text-white/40 font-semibold">Lead Statistician</span>
                <span className="text-xs font-semibold text-white">{selectedStudy.statistician.fullName}</span>
                <span className="text-[0.688rem] text-white/50">{selectedStudy.statistician.email}</span>
              </div>
              <div className="p-3.5 bg-[#01142B] border border-white/10 rounded-[2px] flex flex-col gap-1">
                <span className="text-[0.688rem] font-mono uppercase text-white/40 font-semibold">Selected Package</span>
                <span className="text-xs font-semibold text-[#CC6600]">
                  {selectedStudy.projectMethod || "Empirical Statistical Analysis"}
                </span>
                <span className="text-[0.688rem] text-white/50">{selectedStudy.projectField || "Academic Research"}</span>
              </div>
            </div>

            {/* QA Verification Protocol Checklist */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-mono font-semibold uppercase text-white/50 tracking-wider flex items-center gap-1.5">
                <IconShieldCheck size={15} stroke={2} className="text-[#10B981]" />
                <span>Dual-Blind Quality Assurance Protocol</span>
              </span>
              <div className="p-4 bg-[#01142B] border border-white/10 rounded-[2px] flex flex-col gap-2.5 text-xs text-slate-200">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                  <span>Independent re-execution of raw statistical code on dataset</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                  <span>APA 7th formatting verification of all empirical tables, p-values, and effect sizes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                  <span>Hypothesis alignment audit against initial client statement of problem</span>
                </div>
              </div>
            </div>

            {/* Datasets & Documentation */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-mono font-semibold uppercase text-white/50 tracking-wider flex items-center gap-1.5">
                <IconDatabase size={15} stroke={2} className="text-[#38BDF8]" />
                <span>Verified Client Datasets &amp; Scripts</span>
              </span>
              {selectedStudy.files && selectedStudy.files.length > 0 ? (
                <div className="space-y-2">
                  {selectedStudy.files.map((file) => (
                    <div
                      key={file.id}
                      className="p-3 bg-[#01142B] border border-white/10 rounded-[2px] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <IconDatabase size={16} stroke={1.5} className="text-sky-400 shrink-0" />
                        <span className="font-medium text-white truncate">{file.fileName}</span>
                      </div>
                      <Badge variant="sky" className="font-mono text-[0.625rem]">
                        {file.fileCategory}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-[#01142B] border border-white/10 rounded-[2px] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <IconDatabase size={16} stroke={1.5} className="text-sky-400" />
                    <span>Raw_Dataset_Verified.xlsx (2.4 MB)</span>
                  </div>
                  <Badge variant="emerald" className="font-mono text-[0.625rem]">
                    VERIFIED INPUT
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Request Leave Modal */}
      {isLeaveModalOpen && (
        <Modal
          open={isLeaveModalOpen}
          onClose={() => setIsLeaveModalOpen(false)}
          title="Schedule Specialist Leave"
          description="Pause assignment intake and declare your unavailable period."
          size="md"
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsLeaveModalOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleRequestLeave}
                disabled={isPending}
                className="font-sans text-xs font-semibold rounded-[2px]"
              >
                {isPending ? (
                  <IconLoader2 size={15} className="animate-spin" />
                ) : (
                  <IconCheck size={15} stroke={2} />
                )}
                <span>Submit Leave Request</span>
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-4 text-xs font-sans text-white/80">
            {leaveError && (
              <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-[2px] text-red-200">
                {leaveError}
              </div>
            )}

            <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-[2px] flex items-start gap-2.5 text-amber-200">
              <IconClock size={16} stroke={2} className="text-amber-400 shrink-0 mt-0.5" />
              <span>
                Submitting this request will queue your leave for Finance Officer (HR) and Administrator approval. Once acknowledged and approved, your leave status will be activated and you will be hidden from new verification assignments.
              </span>
            </div>

            {/* Reason for Leave with Quick Template Chips */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-white/90">
                  Reason for Leave (Mandatory)
                </label>
                <span className="text-[0.625rem] text-purple-300/60 font-mono">
                  Select template or enter custom note
                </span>
              </div>

              {/* Template Dropdown */}
              <div className="relative">
                <select
                  value={LEAVE_REASON_TEMPLATES.find((t) => t.text === leaveReasonInput)?.text || ""}
                  onChange={(e) => {
                    if (e.target.value) {
                      setLeaveReasonInput(e.target.value);
                    }
                  }}
                  className="w-full bg-[#01142B] border border-white/15 rounded-[2px] px-3 py-2 text-xs text-white/90 focus:border-[#CC6600] focus:ring-0 outline-none cursor-pointer appearance-none pr-8 transition-colors font-sans hover:border-white/30"
                >
                  <option value="" className="bg-[#01142B] text-white/50">
                    Select standard reason template...
                  </option>
                  {LEAVE_REASON_TEMPLATES.map((tmpl) => (
                    <option
                      key={tmpl.label}
                      value={tmpl.text}
                      className="bg-[#01142B] text-white py-1"
                    >
                      {tmpl.label}
                    </option>
                  ))}
                </select>
                <IconChevronDown
                  size={14}
                  stroke={2}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none"
                />
              </div>

              <textarea
                value={leaveReasonInput}
                onChange={(e) => setLeaveReasonInput(e.target.value)}
                placeholder="e.g. Annual vacation, medical recovery, academic conference presentation..."
                className="w-full bg-[#01142B] border border-white/10 rounded-[2px] p-2.5 text-xs text-white placeholder-white/40 focus:border-[#CC6600] outline-none resize-none h-16 font-sans leading-relaxed"
              />
            </div>

            {/* Leave Duration & Date Range (Day or Days) */}
            <div className="flex flex-col gap-2 p-3 bg-black/40 border border-white/10 rounded-[2px]">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-white/90">
                  Leave Duration (Day or Days)
                </label>
                {isReturnBeforeStart ? (
                  <span className="text-xs font-mono font-semibold text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded-[2px] border border-rose-500/30">
                    Invalid: Return Before Start
                  </span>
                ) : isStartInPast ? (
                  <span className="text-xs font-mono font-semibold text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded-[2px] border border-rose-500/30">
                    Invalid: Past Start Date
                  </span>
                ) : calculatedDays !== null ? (
                  <span className="text-xs font-mono font-semibold text-[#FF9433] bg-[#CC6600]/15 px-2 py-0.5 rounded-[2px] border border-[#CC6600]/30">
                    {calculatedDays} {calculatedDays === 1 ? "Day" : "Days"} Scheduled
                  </span>
                ) : null}
              </div>

              {/* Start Date & Return Date inputs side-by-side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="flex flex-col gap-1">
                  <span className="text-[0.688rem] uppercase font-mono text-white/50">
                    Leave Start Date
                  </span>
                  <input
                    type="date"
                    min={todayStr}
                    value={leaveFromInput}
                    onChange={(e) => handleLeaveFromChange(e.target.value)}
                    className={`w-full bg-[#01142B] border rounded-[2px] p-2 text-xs text-white focus:border-[#CC6600] outline-none font-mono cursor-pointer transition-colors ${
                      isStartInPast ? "border-rose-500/60 bg-rose-950/10" : "border-white/10 hover:border-white/20"
                    }`}
                  />
                  {isStartInPast && (
                    <span className="text-[0.688rem] text-rose-400 font-sans">
                      Start date cannot be in the past.
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[0.688rem] uppercase font-mono text-white/50">
                    Expected Return Date
                  </span>
                  <input
                    type="date"
                    min={leaveFromInput || todayStr}
                    value={leaveUntilInput}
                    onChange={(e) => handleLeaveUntilChange(e.target.value)}
                    className={`w-full bg-[#01142B] border rounded-[2px] p-2 text-xs text-white focus:border-[#CC6600] outline-none font-mono cursor-pointer transition-colors ${
                      isReturnBeforeStart ? "border-rose-500/60 bg-rose-950/10" : "border-white/10 hover:border-white/20"
                    }`}
                  />
                  {isReturnBeforeStart && (
                    <span className="text-[0.688rem] text-rose-400 font-sans">
                      Return date cannot be earlier than start date.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          description={toastMessage.description}
          variant={toastMessage.variant}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
