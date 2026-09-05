"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  PageHeader,
  Card,
  Button,
  Badge,
  KpiCard,
  LoadingState,
  Toast,
  Pagination,
} from "@repo/ui";
import {
  IconUserCheck,
  IconClock,
  IconRefresh,
  IconChevronDown,
  IconChevronUp,
  IconArrowRight,
  IconAlertTriangle,
  IconCalendarOff,
} from "@tabler/icons-react";
import { getProjects } from "@/features/projects/actions";
import { getStaffCapacity } from "@/features/assignments/actions";
import { AssignmentModal } from "@/features/assignments/components/AssignmentModal";
import { WorkloadAnalyticsCard } from "@/features/assignments/components/WorkloadAnalyticsCard";
import type { StaffCapacityItem } from "@/features/assignments/schemas";
import type { ProjectDetailItem } from "@/features/projects/schemas";

export interface AssignmentsClientProps {
  initialProjects?: ProjectDetailItem[];
  initialStatisticians?: StaffCapacityItem[];
  initialQaLeads?: StaffCapacityItem[];
}

export function AssignmentsClient({
  initialProjects,
  initialStatisticians,
  initialQaLeads,
}: AssignmentsClientProps) {
  const [unassignedProjects, setUnassignedProjects] = useState<ProjectDetailItem[]>(initialProjects || []);
  const [statisticians, setStatisticians] = useState<StaffCapacityItem[]>(initialStatisticians || []);
  const [qaLeads, setQaLeads] = useState<StaffCapacityItem[]>(initialQaLeads || []);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProjectForAssign, setSelectedProjectForAssign] = useState<ProjectDetailItem | null>(null);
  const [expandedStaffIds, setExpandedStaffIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const toggleExpandStaff = (id: string) => {
    setExpandedStaffIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Toast
  const [toastMessage, setToastMessage] = useState<{
    message: string;
    description?: string;
    variant: "info" | "success" | "warning" | "danger";
  } | null>(null);

  const isMountedRef = React.useRef(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [projRes, capRes] = await Promise.all([
        getProjects({ status: "ACTIVE" }),
        getStaffCapacity(),
      ]);

      if (!isMountedRef.current) return;

      if (projRes.success && projRes.data) {
        setUnassignedProjects(projRes.data);
      }
      if (capRes.success && capRes.data) {
        setStatisticians(capRes.data.statisticians);
        setQaLeads(capRes.data.qaLeads);
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error("Failed to load assignment desk:", err);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    if (!initialProjects && !initialStatisticians) {
      loadData();
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [loadData, initialProjects, initialStatisticians]);

  if (isLoading && unassignedProjects.length === 0 && statisticians.length === 0) {
    return (
      <div className="flex-1 w-full min-h-full flex items-center justify-center animate-content-fade my-auto">
        <LoadingState
          variant="page"
          label="Loading assignment workbench..."
          description="Retrieving active studies and specialist workload."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-24 w-full animate-content-fade font-sans">
      {/* Page Header */}
      <PageHeader
        title="Expert Assignment & Workload Desk"
        description="Assign qualified Lead Statisticians and Senior QA Leads to paid studies, monitor staff capacity, and govern contractual SLA timelines."
        breadcrumbs={[
          { label: "WORKSPACE", href: "/dashboard" },
          { label: "Admin Command", href: "/dashboard/admin" },
          { label: "Expert Assignments" },
        ]}
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={loadData}
            className="gap-2 font-sans font-semibold rounded-[2px]"
          >
            <IconRefresh size={15} stroke={2} />
            <span>Refresh Directory</span>
          </Button>
        }
      />

      {/* KPI Grid */}
      {(() => {
        const allStaff = [...statisticians, ...qaLeads];
        const burnoutRiskCount = allStaff.filter((s) => s.burnoutRisk?.isAtRisk).length;

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
            <KpiCard
              label="Unassigned Active Studies"
              value={unassignedProjects.length}
              variant={unassignedProjects.length > 0 ? "amber" : "default"}
              description={unassignedProjects.length > 0 ? "Awaiting staff assignment" : "All studies staffed"}
            />
            <KpiCard
              label="Active Statisticians"
              value={statisticians.length}
              variant="sky"
              description="Certified specialists directory"
            />
            <KpiCard
              label="Senior QA Leads"
              value={qaLeads.length}
              variant="emerald"
              description="Quality gatekeepers on duty"
            />
            <KpiCard
              label="Burnout Guard & Capacity"
              value={burnoutRiskCount > 0 ? `${burnoutRiskCount} At Risk` : "100% Balanced"}
              variant={burnoutRiskCount > 0 ? "amber" : "emerald"}
              description={
                burnoutRiskCount > 0
                  ? "Deadline collisions or high load"
                  : "Zero specialist overload detected"
              }
            />
          </div>
        );
      })()}

      <div className="flex flex-col gap-8">
        {/* Section 1: Awaiting Staffing */}
        <Card className="p-0 overflow-hidden border border-white/10 bg-[#01142B]/90 rounded-[2px]">
          <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white tracking-normal font-sans flex items-center gap-2">
                <span>Studies Awaiting Specialist Assignment</span>
                {unassignedProjects.length > 0 && (
                  <Badge variant="amber" className="text-[0.688rem] py-0 px-2 font-mono">
                    {unassignedProjects.length} Pending
                  </Badge>
                )}
              </h2>
              <p className="text-sm text-white/60 mt-1 font-sans leading-relaxed">
                Downpayment cleared and contract executed. SLA starts upon assignment.
              </p>
            </div>
          </div>

          {unassignedProjects.length === 0 ? (
            <div className="p-12 text-center text-white/50 text-sm font-sans flex flex-col items-center justify-center gap-2">
              <IconUserCheck size={32} stroke={1.5} className="text-[#10B981]" />
              <span className="font-semibold text-white">All Active Studies Assigned</span>
              <span className="text-xs text-white/40">There are no pending studies waiting for staffing right now.</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02] text-white/50 text-xs uppercase tracking-wider font-semibold">
                      <th className="py-3.5 px-6">Study ID</th>
                      <th className="py-3.5 px-6">Research Title &amp; Client</th>
                      <th className="py-3.5 px-6">Package / Methodology</th>
                      <th className="py-3.5 px-6">Turnaround</th>
                      <th className="py-3.5 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {unassignedProjects.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((proj) => (
                      <tr key={proj.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-6 font-mono text-xs text-[#CC6600] font-semibold">
                          {proj.intakeId}
                        </td>
                        <td className="py-4 px-6 max-w-md">
                          <p className="font-semibold text-white text-sm line-clamp-1">
                            {proj.researchTitle}
                          </p>
                          <p className="text-xs text-white/50 mt-0.5">
                            {proj.client?.fullName || "Lead Researcher"} • {proj.client?.clientProfile?.institutionSchool || "Institution"}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-xs text-white/80 font-sans">
                            {proj.packageName?.replace(/_/g, " ") || "Empirical Analysis"}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 text-xs text-[#38BDF8]">
                            <IconClock size={15} stroke={2} />
                            <span>5-7 Days Standard</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setSelectedProjectForAssign(proj)}
                            className="font-sans text-xs font-semibold rounded-[2px]"
                          >
                            + Assign Specialists
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {unassignedProjects.length > 0 && (
                <div className="border-t border-white/10 p-3 sm:px-6">
                  <Pagination
                    currentPage={currentPage}
                    totalItems={unassignedProjects.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                  />
                </div>
              )}
            </>
          )}
        </Card>

        {/* Section 2: Workload Distribution & Burnout Analytics Visual Chart */}
        <WorkloadAnalyticsCard
          statisticians={statisticians}
          qaLeads={qaLeads}
        />

        {/* Section 3: Staff Capacity Directory */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Statisticians */}
          <Card className="p-6 border border-white/10 bg-[#01142B]/90 rounded-[2px] flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-semibold text-white text-base">Lead Statisticians Directory</h3>
                <p className="text-xs text-white/60 mt-0.5">Specialization match and current active study load</p>
              </div>
              <span className="text-xs font-mono text-white/40">{statisticians.length} specialists</span>
            </div>

            <div className="space-y-3 max-h-[32rem] overflow-y-auto pr-1">
              {statisticians.map((stat) => {
                const isExpanded = expandedStaffIds.has(stat.id);
                return (
                  <div
                    key={stat.id}
                    className="bg-[#011B38] border border-white/10 rounded-[2px] overflow-hidden transition-all"
                  >
                    <div
                      onClick={() => toggleExpandStaff(stat.id)}
                      className="p-3.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.03] transition-colors select-none"
                    >
                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                          <span className="font-semibold text-white text-xs whitespace-nowrap">{stat.fullName}</span>
                          <span className="text-[0.688rem] text-white/40 whitespace-nowrap">({stat.email})</span>
                          {!stat.isOnLeave && stat.burnoutRisk?.isAtRisk && (
                            <Badge variant="amber" className="text-[0.625rem] py-0 px-1.5 font-mono flex items-center gap-1 whitespace-nowrap">
                              <IconAlertTriangle size={10} stroke={2} />
                              <span>Burnout Risk</span>
                            </Badge>
                          )}
                        </div>
                        <p className="text-[0.688rem] text-white/50 truncate font-sans">
                          {stat.isOnLeave
                            ? `Unavailable for assignments — Reason: "${stat.leaveReason || "Scheduled Absence"}"`
                            : stat.specializations.length > 0
                            ? stat.specializations.join(", ")
                            : "General Analytics"}
                        </p>
                        {!stat.isOnLeave && stat.burnoutRisk?.isAtRisk && (
                          <span className="text-[0.688rem] text-amber-300/80 font-sans">
                            {stat.burnoutRisk.reasons.join(" • ")}
                          </span>
                        )}
                      </div>

                      <div className="shrink-0 flex items-center gap-2.5">
                        {stat.isOnLeave ? (
                          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-[2px] border bg-purple-950/50 text-purple-300 border-purple-500/30 flex items-center gap-1.5 whitespace-nowrap">
                            <IconCalendarOff size={13} stroke={2} />
                            <span>On Leave{stat.leaveUntil ? ` (until ${new Date(stat.leaveUntil).toLocaleDateString("en-PH", { month: "short", day: "numeric" })})` : ""}</span>
                          </span>
                        ) : (
                          <span
                            className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-[2px] border whitespace-nowrap ${
                              stat.activeAssignmentCount === 0
                                ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/30"
                                : stat.activeAssignmentCount < 3
                                ? "bg-sky-950/40 text-sky-300 border-sky-500/30"
                                : "bg-amber-950/40 text-amber-300 border-amber-500/30"
                            }`}
                          >
                            {stat.activeAssignmentCount} Active Studies
                          </span>
                        )}
                        <span className="text-white/40 hover:text-white transition-colors">
                          {isExpanded ? (
                            <IconChevronUp size={15} stroke={2} />
                          ) : (
                            <IconChevronDown size={15} stroke={2} />
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Expandable Assigned Studies List */}
                    {isExpanded && (
                      <div className="border-t border-white/10 bg-black/40 p-3.5 flex flex-col gap-2.5 animate-content-fade">
                        <div className="flex items-center justify-between text-[0.688rem] uppercase font-mono text-white/50 px-1 font-semibold">
                          <span>Assigned Computational Runs</span>
                          <span>{stat.assignedStudies.length} Active</span>
                        </div>

                        {stat.assignedStudies.length === 0 ? (
                          <div className="p-3 text-center text-xs text-white/40 font-sans italic bg-white/[0.01] rounded-[2px] border border-white/5">
                            {stat.isOnLeave
                              ? `Specialist is currently on leave${stat.leaveUntil ? ` until ${new Date(stat.leaveUntil).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}` : ""} and unavailable for new computational assignments.`
                              : "Zero active studies currently assigned. Specialist is available for new pipeline allocations."}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {stat.assignedStudies.map((study) => (
                              <div
                                key={study.id}
                                className="p-2.5 bg-[#01142B] border border-white/[0.08] rounded-[2px] flex items-center justify-between gap-3 text-xs"
                              >
                                <div className="min-w-0 flex flex-col gap-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs text-[#CC6600] font-semibold">
                                      {study.intakeId}
                                    </span>
                                    <Badge
                                      variant={
                                        study.isPaused
                                          ? "amber"
                                          : study.isOverdue
                                          ? "danger"
                                          : study.isUrgent
                                          ? "amber"
                                          : "emerald"
                                      }
                                      className="font-mono text-[0.625rem] py-0 px-1.5"
                                    >
                                      {study.slaLabel}
                                    </Badge>
                                  </div>
                                  <p className="text-white/80 font-medium truncate max-w-xs text-xs font-sans">
                                    {study.title}
                                  </p>
                                </div>

                                <Link
                                  href={`/dashboard/admin/projects/${study.id}`}
                                  className="shrink-0 flex items-center gap-1 text-[0.688rem] font-sans font-semibold text-sky-400 hover:text-sky-300 hover:underline"
                                >
                                  <span>Open Desk</span>
                                  <IconArrowRight size={12} stroke={2} />
                                </Link>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* QA Leads */}
          <Card className="p-6 border border-white/10 bg-[#01142B]/90 rounded-[2px] flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-semibold text-white text-base">Senior QA Leads Directory</h3>
                <p className="text-xs text-white/60 mt-0.5">Verification gates and review queue volume</p>
              </div>
              <span className="text-xs font-mono text-white/40">{qaLeads.length} gatekeepers</span>
            </div>

            <div className="space-y-3 max-h-[32rem] overflow-y-auto pr-1">
              {qaLeads.map((qa) => {
                const isExpanded = expandedStaffIds.has(qa.id);
                return (
                  <div
                    key={qa.id}
                    className="bg-[#011B38] border border-white/10 rounded-[2px] overflow-hidden transition-all"
                  >
                    <div
                      onClick={() => toggleExpandStaff(qa.id)}
                      className="p-3.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.03] transition-colors select-none"
                    >
                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                          <span className="font-semibold text-white text-xs whitespace-nowrap">{qa.fullName}</span>
                          <span className="text-[0.688rem] text-white/40 whitespace-nowrap">({qa.email})</span>
                          {!qa.isOnLeave && qa.burnoutRisk?.isAtRisk && (
                            <Badge variant="amber" className="text-[0.625rem] py-0 px-1.5 font-mono flex items-center gap-1 whitespace-nowrap">
                              <IconAlertTriangle size={10} stroke={2} />
                              <span>Burnout Risk</span>
                            </Badge>
                          )}
                        </div>
                        <p className="text-[0.688rem] text-white/50 truncate font-sans">
                          {qa.isOnLeave
                            ? `Unavailable for reviews — Reason: "${qa.leaveReason || "Scheduled Absence"}"`
                            : "Senior Verification & Dual-Blind Review"}
                        </p>
                        {!qa.isOnLeave && qa.burnoutRisk?.isAtRisk && (
                          <span className="text-[0.688rem] text-amber-300/80 font-sans">
                            {qa.burnoutRisk.reasons.join(" • ")}
                          </span>
                        )}
                      </div>

                      <div className="shrink-0 flex items-center gap-2.5">
                        {qa.isOnLeave ? (
                          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-[2px] border bg-purple-950/50 text-purple-300 border-purple-500/30 flex items-center gap-1.5 whitespace-nowrap">
                            <IconCalendarOff size={13} stroke={2} />
                            <span>On Leave{qa.leaveUntil ? ` (until ${new Date(qa.leaveUntil).toLocaleDateString("en-PH", { month: "short", day: "numeric" })})` : ""}</span>
                          </span>
                        ) : (
                          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-[2px] border bg-emerald-950/40 text-emerald-300 border-emerald-500/30 whitespace-nowrap">
                            {qa.activeAssignmentCount} in QA Review
                          </span>
                        )}
                        <span className="text-white/40 hover:text-white transition-colors">
                          {isExpanded ? (
                            <IconChevronUp size={15} stroke={2} />
                          ) : (
                            <IconChevronDown size={15} stroke={2} />
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Expandable Assigned Studies List */}
                    {isExpanded && (
                      <div className="border-t border-white/10 bg-black/40 p-3.5 flex flex-col gap-2.5 animate-content-fade">
                        <div className="flex items-center justify-between text-[0.688rem] uppercase font-mono text-white/50 px-1 font-semibold">
                          <span>Assigned Verification Queue</span>
                          <span>{qa.assignedStudies.length} Studies</span>
                        </div>

                        {qa.assignedStudies.length === 0 ? (
                          <div className="p-3 text-center text-xs text-white/40 font-sans italic bg-white/[0.01] rounded-[2px] border border-white/5">
                            {qa.isOnLeave
                              ? `Quality gatekeeper is currently on leave${qa.leaveUntil ? ` until ${new Date(qa.leaveUntil).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}` : ""} and unavailable for new QA assignments.`
                              : "Zero studies currently under review. Quality gatekeeper is clear."}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {qa.assignedStudies.map((study) => (
                              <div
                                key={study.id}
                                className="p-2.5 bg-[#01142B] border border-white/[0.08] rounded-[2px] flex items-center justify-between gap-3 text-xs"
                              >
                                <div className="min-w-0 flex flex-col gap-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs text-[#CC6600] font-semibold">
                                      {study.intakeId}
                                    </span>
                                    <Badge
                                      variant={
                                        study.isPaused
                                          ? "amber"
                                          : study.isOverdue
                                          ? "danger"
                                          : study.isUrgent
                                          ? "amber"
                                          : "emerald"
                                      }
                                      className="font-mono text-[0.625rem] py-0 px-1.5"
                                    >
                                      {study.slaLabel}
                                    </Badge>
                                  </div>
                                  <p className="text-white/80 font-medium truncate max-w-xs text-xs font-sans">
                                    {study.title}
                                  </p>
                                </div>

                                <Link
                                  href={`/dashboard/admin/projects/${study.id}`}
                                  className="shrink-0 flex items-center gap-1 text-[0.688rem] font-sans font-semibold text-sky-400 hover:text-sky-300 hover:underline"
                                >
                                  <span>Open Desk</span>
                                  <IconArrowRight size={12} stroke={2} />
                                </Link>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Assignment Modal */}
      {selectedProjectForAssign && (
        <AssignmentModal
          isOpen={!!selectedProjectForAssign}
          onClose={() => setSelectedProjectForAssign(null)}
          projectId={selectedProjectForAssign.id}
          projectTitle={selectedProjectForAssign.researchTitle}
          projectMethod={selectedProjectForAssign.packageName?.replace(/_/g, " ")}
          onSuccess={() => {
            loadData();
            setToastMessage({
              message: "Specialists Assigned Successfully",
              description: `Lead Statistician and QA Lead have been assigned to ${selectedProjectForAssign.intakeId}. SLA clock is now active.`,
              variant: "success",
            });
          }}
        />
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
