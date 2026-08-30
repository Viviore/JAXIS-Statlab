"use client";

import React, { useState } from "react";
import { PageHeader, Card, KpiCard, StatusBadge, Button, Modal, LoadingState, AnimateHeight } from "@repo/ui";
import {
  IconUpload,
  IconLock,
  IconShieldCheck,
  IconChartBar,
  IconFileTypeCsv,
  IconFileCode,
} from "@tabler/icons-react";
import { Project } from "@/types/project";
import { useProjects } from "@/features/projects/hooks/useProjects";

export default function DashboardOverviewPage() {
  const [selectedStudy, setSelectedStudy] = useState<Project | null>(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");

  const {
    projects,
    kpis,
    auditStream,
    isLoading,
  } = useProjects({
    status: selectedStatusFilter === "ALL" ? undefined : selectedStatusFilter,
    initialLoading: false,
  });

  return (
    <div
      className="flex flex-col gap-9 max-w-7xl mx-auto pb-16"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2.25rem",
        maxWidth: "80rem",
        marginLeft: "auto",
        marginRight: "auto",
        paddingBottom: "4rem",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* ── Breadcrumb & Page Header ── */}
      <PageHeader
        title="Workspace Overview"
        description="Overview of active research studies, quality reviews, payments, and team activity."
        breadcrumbs={[
          { label: "WORKSPACE", href: "/dashboard" },
          { label: "Overview" },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Button variant="secondary" size="md">
              <IconUpload size={16} stroke={1.5} className="text-white/70" />
              <span>Upload Data</span>
            </Button>
            <Button variant="primary" size="md">
              <span>+ New Study Request</span>
            </Button>
          </div>
        }
      />

      {/* ── Live KPI Matrix (4 Glass Cards or Skeletons) ── */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        style={{
          display: "grid",
          gap: "1.25rem",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {isLoading ? (
          <>
            <Card variant="kpi"><LoadingState variant="card" label="Loading studies..." /></Card>
            <Card variant="kpi"><LoadingState variant="card" label="Loading revisions..." /></Card>
            <Card variant="kpi"><LoadingState variant="card" label="Loading QA queue..." /></Card>
            <Card variant="kpi"><LoadingState variant="card" label="Loading payments..." /></Card>
          </>
        ) : (
          <div key="kpi-loaded" className="contents animate-content-fade">
            {/* KPI 1 */}
            <KpiCard
              label="Active Studies"
              value={projects.length}
              badge={`${projects.length} Total`}
              badgeColor="emerald"
              description={
                <span className="flex items-center gap-1.5 font-mono text-xs text-white/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  <span>{projects.filter((p) => p.status === "ANALYSIS_IN_PROGRESS" || p.status === "IN_PROGRESS").length} Active</span>
                  <span className="text-white/25">·</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span>{projects.filter((p) => p.status === "UNDER_EVALUATION" || p.status === "NEW_REQUEST").length} Intake</span>
                  <span className="text-white/25">·</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>{projects.filter((p) => p.status === "FOR_QA" || p.status === "QA_REVISION").length} In QA</span>
                </span>
              }
            />

            {/* KPI 2 */}
            <KpiCard
              label="In QA Review"
              value={projects.filter((p) => p.status === "FOR_QA" || p.status === "QA_REVISION").length}
              badge="Active"
              badgeColor="sky"
              description="Studies waiting for QA quality check"
            />

            {/* KPI 3 */}
            <KpiCard
              label="Pending Payments"
              value={projects.filter((p) => p.paymentStatus !== "FULLY_PAID").length}
              badge="Unpaid"
              badgeColor="amber"
              description="Studies with pending balance"
            />

            {/* KPI 4 */}
            <KpiCard
              label="Completed Studies"
              value={projects.filter((p) => p.status === "DELIVERED" || p.status === "CLOSED").length}
              badge="100% Pass"
              badgeColor="emerald"
              description="Delivered and approved research studies"
            />
          </div>
        )}
      </div>

      {/* ── Active Studies Table Section (Interactive Row Preview) ── */}
      <Card
        header={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight font-sans" style={{ fontSize: "1rem" }}>
                Active Research Studies
              </h2>
              <p className="text-sm text-white/50 mt-1 font-sans" style={{ fontSize: "0.875rem" }}>
                Click any research study to view its details and dataset files.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-sans text-white/40" style={{ fontSize: "0.75rem" }}>Filter:</span>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-[#011B38] border border-white/[0.12] rounded-[2px] text-xs text-white px-3 py-1.5 focus:outline-none focus:border-[#CC6600]"
                style={{ fontSize: "0.75rem", borderRadius: "2px" }}
              >
                <option value="ALL">All Studies ({projects.length})</option>
                <option value="UNDER_EVALUATION">Under Evaluation</option>
                <option value="ANALYSIS_IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="APPROVED">Approved / Ready</option>
              </select>
            </div>
          </div>
        }
      >
        <AnimateHeight duration={280}>
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[800px] text-left border-collapse" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  className="border-b border-white/[0.08] text-xs font-mono font-semibold uppercase tracking-wider text-white/45 bg-white/[0.02]"
                  style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}
                >
                  <th className="py-3.5 pr-6 pl-1" style={{ width: "30%" }}>Study ID &amp; Title</th>
                  <th className="py-3.5 px-3" style={{ width: "17%" }}>Client &amp; Field</th>
                  <th className="py-3.5 px-3" style={{ width: "21%" }}>Methodology</th>
                  <th className="py-3.5 px-3" style={{ width: "14%" }}>Statistician</th>
                  <th className="py-3.5 px-2" style={{ width: "9%" }}>QA Status</th>
                  <th className="py-3.5 px-2" style={{ width: "9%" }}>Payment</th>
                  <th className="py-3.5 pl-2 pr-1 text-right" style={{ width: "10%" }}>Actions</th>
                </tr>
              </thead>
              <tbody
                key={isLoading ? "loading-rows" : `loaded-rows-${projects.length}`}
                className="divide-y divide-white/[0.06] text-sm font-sans animate-content-fade"
                style={{ fontSize: "0.875rem" }}
              >
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-14 text-center">
                      <LoadingState variant="table" label="Loading research studies..." />
                    </td>
                  </tr>
                ) : projects.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-white/45 font-sans">
                      No research studies matching the selected filter.
                    </td>
                  </tr>
                ) : (
                  projects.map((proj) => (
                    <tr
                      key={proj.id}
                      onClick={() => setSelectedStudy(proj)}
                      className="hover:bg-white/[0.05] transition-colors duration-150 ease-out group cursor-pointer"
                    >
                      {/* Study ID & Title */}
                      <td className="py-4 pr-6 pl-1" style={{ width: "30%" }}>
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className="font-mono text-xs font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-[2px] border border-sky-500/20"
                              style={{
                                padding: "0.2rem 0.5rem",
                                borderRadius: "2px",
                                display: "inline-flex",
                                alignItems: "center",
                                fontSize: "0.75rem",
                                lineHeight: 1,
                                backgroundColor: "rgba(56, 189, 248, 0.15)",
                                color: "#38BDF8",
                                border: "1px solid rgba(56, 189, 248, 0.3)",
                              }}
                            >
                              {proj.id}
                            </span>
                            <span className="text-xs text-white/40 font-mono" style={{ fontSize: "0.75rem" }}>{proj.updated}</span>
                          </div>
                          <span className="font-semibold text-sm text-white group-hover:text-sky-300 transition-colors duration-150 ease-out leading-snug line-clamp-2" style={{ fontSize: "0.875rem" }}>
                            {proj.title}
                          </span>
                        </div>
                      </td>

                      {/* Client & Field */}
                      <td className="py-4 px-3" style={{ width: "17%" }}>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-sm text-white" style={{ fontSize: "0.875rem" }}>{proj.client}</span>
                          <span className="text-xs text-white/50 truncate" style={{ fontSize: "0.75rem" }}>
                            {proj.university}
                          </span>
                          <span className="text-[0.688rem] text-sky-400/80 leading-tight mt-0.5" style={{ fontSize: "0.688rem" }}>
                            {proj.field}
                          </span>
                        </div>
                      </td>

                      {/* Methodology */}
                      <td className="py-4 px-3">
                        <span className="text-xs text-white/70 leading-relaxed line-clamp-2" style={{ fontSize: "0.75rem", lineHeight: 1.5 }}>
                          {proj.method}
                        </span>
                      </td>

                      {/* Statistician */}
                      <td className="py-4 px-3" style={{ width: "14%" }}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-6 w-6 rounded-full bg-[#012E57] border border-white/10 flex items-center justify-center text-[0.688rem] font-bold text-white shadow-inner flex-shrink-0"
                            style={{ height: "1.5rem", width: "1.5rem", borderRadius: "9999px" }}
                          >
                            {proj.statisticians.charAt(0)}
                          </div>
                          <span className="text-xs text-white/90 truncate" style={{ fontSize: "0.75rem" }}>{proj.statisticians}</span>
                        </div>
                      </td>

                      {/* QA Status */}
                      <td className="py-4 px-2" style={{ width: "9%" }}>
                        <StatusBadge status={proj.qaStatus} pulse={proj.qaStatus === "FOR_QA"} />
                      </td>

                      {/* Payment Status */}
                      <td className="py-4 px-2" style={{ width: "9%" }}>
                        <StatusBadge status={proj.paymentStatus} />
                      </td>

                      {/* Action */}
                      <td className="py-4 pl-2 pr-1 text-right" style={{ width: "10%" }}>
                        <span className="inline-flex items-center text-xs font-mono text-[#CC6600] group-hover:text-white transition-colors gap-1 justify-end font-semibold" style={{ fontSize: "0.75rem" }}>
                          View →
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </AnimateHeight>
      </Card>

      {/* ── Operational Intelligence & System Status ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Important Platform Rules Card */}
        <Card
          header={
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <h3 className="text-sm font-bold text-white font-sans" style={{ fontSize: "0.875rem" }}>
                  Important Platform Rules
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-semibold" style={{ fontSize: "0.75rem" }}>ACTIVE</span>
            </div>
          }
        >
          <div className="flex flex-col gap-4 text-xs font-sans" style={{ fontSize: "0.75rem" }}>
            <div
              className="p-4 rounded-[2px] bg-white/[0.03] border border-white/[0.08] flex items-start gap-3.5"
              style={{ borderRadius: "2px", padding: "1rem", border: "1px solid rgba(255, 255, 255, 0.08)" }}
            >
              <IconLock size={16} stroke={1.5} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white text-xs" style={{ padding: "0.15rem 0.4rem", borderRadius: "2px", backgroundColor: "rgba(255, 255, 255, 0.1)", fontSize: "0.75rem" }}>PAYMENT RULE</span>
                  <span className="text-xs text-emerald-400 uppercase font-sans font-semibold" style={{ fontSize: "0.75rem" }}>File Downloads</span>
                </div>
                <span className="text-xs text-white/60 mt-1 leading-relaxed" style={{ fontSize: "0.75rem" }}>
                  Final chapter results and datasets stay locked until payment is confirmed by Finance.
                </span>
              </div>
            </div>

            <div
              className="p-4 rounded-[2px] bg-[#CC6600]/[0.08] border border-[#CC6600]/25 flex items-start gap-3.5"
              style={{ borderRadius: "2px", padding: "1rem", border: "1px solid rgba(204, 102, 0, 0.25)" }}
            >
              <IconShieldCheck size={16} stroke={1.5} className="text-[#CC6600] flex-shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white text-xs" style={{ padding: "0.15rem 0.4rem", borderRadius: "2px", backgroundColor: "rgba(255, 255, 255, 0.1)", fontSize: "0.75rem" }}>SCOPE RULE</span>
                  <span className="text-xs text-[#CC6600] uppercase font-sans font-semibold" style={{ fontSize: "0.75rem" }}>Pricing &amp; Scope</span>
                </div>
                <span className="text-xs text-white/60 mt-1 leading-relaxed" style={{ fontSize: "0.75rem" }}>
                  Statisticians cannot alter quoted prices. Extra requests outside agreed scope require an updated quotation from Admin.
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Activity Log */}
        <Card
          header={
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-[#CC6600]" />
                <h3 className="text-sm font-bold text-white font-sans" style={{ fontSize: "0.875rem" }}>
                  Recent Activity Log
                </h3>
              </div>
              <span className="text-xs font-mono text-white/40 uppercase tracking-wide" style={{ fontSize: "0.75rem" }}>Live Updates</span>
            </div>
          }
        >
          <div className="flex flex-col divide-y divide-white/[0.06] text-xs font-sans" style={{ fontSize: "0.75rem" }}>
            {auditStream.map((event) => (
              <div key={event.id} className="py-3.5 flex items-start gap-3.5">
                <span className="text-xs font-mono text-white/35 whitespace-nowrap pt-0.5" style={{ fontSize: "0.75rem" }}>
                  {event.timestamp}
                </span>
                <div className="flex flex-col">
                  <span className="text-white/85">
                    <strong className="text-white">{event.actor}</strong> {event.action} on{" "}
                    <code className="text-sky-300 font-mono">{event.targetId}</code>.
                  </span>
                  <span className="text-xs text-white/45 font-mono mt-1" style={{ fontSize: "0.75rem" }}>
                    {event.detail}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Center Study Inspection Modal ── */}
      <Modal
        open={Boolean(selectedStudy)}
        onClose={() => setSelectedStudy(null)}
        size="2xl"
        title={
          selectedStudy ? (
            <div className="flex items-center gap-3">
              <span
                className="font-mono text-xs font-semibold text-sky-400 bg-sky-500/15 px-2.5 py-1 rounded-[2px] border border-sky-500/30"
                style={{ fontSize: "0.75rem", borderRadius: "2px" }}
              >
                {selectedStudy.id}
              </span>
              <span className="text-base font-bold text-white tracking-tight" style={{ fontSize: "1.063rem" }}>
                Study Details
              </span>
            </div>
          ) : null
        }
        description={selectedStudy?.title}
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setSelectedStudy(null)}>
              Close
            </Button>
            <Button variant="primary" size="md">
              <span>Open Study →</span>
            </Button>
          </>
        }
      >
        {selectedStudy && (
          <div className="flex flex-col gap-6 text-sm font-sans" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Top Status Bar */}
            <div
              className="px-4 py-3 rounded-[4px] bg-[#01142B] border border-white/10 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-sans font-semibold uppercase tracking-wider text-white/50">
                  QA Status:
                </span>
                <StatusBadge status={selectedStudy.qaStatus} pulse={selectedStudy.qaStatus === "FOR_QA"} />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-sans font-semibold uppercase tracking-wider text-white/50">
                  Payment Status:
                </span>
                <StatusBadge status={selectedStudy.paymentStatus} />
              </div>
            </div>

            {/* 2-Column Balanced Architecture Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
              {/* Left Column: Context & Methodology */}
              <div className="flex flex-col gap-5">
                {/* Researcher & School */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-sans font-semibold uppercase tracking-wider text-white/50">
                    Researcher &amp; School
                  </span>
                  <div
                    className="p-4 rounded-[4px] bg-[#01142B] border border-white/10 flex flex-col gap-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-white/50">Lead Researcher</span>
                      <span className="text-sm font-semibold text-white">{selectedStudy.client}</span>
                    </div>
                    <div className="h-px bg-white/[0.05]" />
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-white/50">School / University</span>
                      <span className="text-sm font-medium text-white/90">{selectedStudy.university}</span>
                    </div>
                    <div className="h-px bg-white/[0.05]" />
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-white/50">Degree &amp; Program</span>
                      <span className="text-xs font-medium text-sky-400">{selectedStudy.field}</span>
                    </div>
                  </div>
                </div>

                {/* Methodology */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-sans font-semibold uppercase tracking-wider text-white/50">
                    Analysis Method
                  </span>
                  <div
                    className="p-4 rounded-[4px] bg-[#01142B] border border-white/10 flex items-start gap-3"
                  >
                    <IconChartBar size={16} stroke={1.5} className="text-sky-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-white/85 leading-relaxed font-sans">
                      {selectedStudy.method}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Desk & Artifacts */}
              <div className="flex flex-col gap-5">
                {/* Assigned Statistician */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-sans font-semibold uppercase tracking-wider text-white/50">
                    Assigned Statistician
                  </span>
                  <div
                    className="p-3.5 rounded-[4px] bg-[#01142B] border border-white/10 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-9 w-9 rounded-full bg-[#012E57] border border-white/20 flex items-center justify-center text-xs font-bold text-white shadow-inner flex-shrink-0"
                      >
                        {selectedStudy.statisticians.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white">{selectedStudy.statisticians}</span>
                        <span className="text-xs text-white/45">Statistician</span>
                      </div>
                    </div>
                    <span
                      className="text-xs font-sans font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-[3px] border border-emerald-500/25"
                    >
                      Active
                    </span>
                  </div>
                </div>

                {/* Dataset Files */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-white/45" style={{ fontSize: "0.688rem" }}>
                    Uploaded Files
                  </span>
                  <div className="flex flex-col gap-2.5">
                    <div
                      className="p-3 rounded-[2px] bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.07] flex items-center justify-between transition-colors"
                      style={{ padding: "0.75rem 1rem", borderRadius: "2px", border: "1px solid rgba(255, 255, 255, 0.07)" }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <IconFileTypeCsv size={16} stroke={1.5} className="text-sky-400 flex-shrink-0" />
                        <span className="text-xs font-mono text-white/90 truncate" style={{ fontSize: "0.75rem" }}>
                          {selectedStudy.datasetName || "dataset.csv"}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-white/40 flex-shrink-0 ml-2" style={{ fontSize: "0.75rem" }}>
                        {selectedStudy.datasetSize || "1.5 MB"}
                      </span>
                    </div>

                    <div
                      className="p-3 rounded-[2px] bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.07] flex items-center justify-between transition-colors"
                      style={{ padding: "0.75rem 1rem", borderRadius: "2px", border: "1px solid rgba(255, 255, 255, 0.07)" }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <IconFileCode size={16} stroke={1.5} className="text-emerald-400 flex-shrink-0" />
                        <span className="text-xs font-mono text-white/90 truncate" style={{ fontSize: "0.75rem" }}>
                          {selectedStudy.syntaxName || "analysis_script.sps"}
                        </span>
                      </div>
                      <span
                        className="text-xs font-sans font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-[2px] border border-emerald-500/20 flex-shrink-0 ml-2"
                        style={{ fontSize: "0.688rem", padding: "0.15rem 0.5rem", borderRadius: "2px" }}
                      >
                        Verified
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
