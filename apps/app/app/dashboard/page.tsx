"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageHeader, Card, StatusBadge, Button, Modal, KpiCardSkeleton, TableRowSkeleton, AnimateHeight } from "@repo/ui";
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
    simulateSync,
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
        title="Operations & Statistical Governance"
        description="Real-time multi-role command center connecting intake queues, statistical computation desks, QA peer verification, and escrow payment release gates."
        breadcrumbs={[
          { label: "WORKSPACE", href: "/dashboard" },
          { label: "Command & Control" },
        ]}
        badge={
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[2px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold"
            style={{
              padding: "0.3rem 0.875rem",
              borderRadius: "2px",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "rgba(16, 185, 129, 0.12)",
              color: "#10B981",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              fontSize: "0.75rem",
              fontWeight: 600,
              lineHeight: 1,
            }}
          >
            <span
              className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"
              style={{ height: "0.45rem", width: "0.45rem", borderRadius: "9999px", backgroundColor: "#10B981" }}
            />
            LIVE TELEMETRY v2.4
          </span>
        }
        actions={
          <div className="flex items-center gap-3" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Button
              variant="secondary"
              size="md"
              onClick={simulateSync}
              title="Click to test live backend sync with skeleton loader"
            >
              <svg className={`w-4 h-4 text-sky-400 ${isLoading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{isLoading ? "Syncing..." : "Simulate Sync"}</span>
            </Button>
            <Button variant="secondary" size="md">
              <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>Upload Survey Data</span>
            </Button>
            <Button variant="primary" size="md">
              <span>+ New Project Intake</span>
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
          <div key="kpi-skeletons" className="contents animate-content-fade">
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
          </div>
        ) : (
          <div key="kpi-loaded" className="contents animate-content-fade">
            {/* KPI 1 */}
            <Card variant="kpi" className="group">
              <div>
                <div className="flex items-center justify-between mb-2" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="text-xs font-mono font-semibold text-white/50 uppercase tracking-wider" style={{ fontSize: "0.75rem" }}>Active Studies</span>
                  <span
                    className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-[2px] border border-emerald-500/20"
                    style={{
                      padding: "0.2rem 0.625rem",
                      borderRadius: "2px",
                      display: "inline-flex",
                      alignItems: "center",
                      lineHeight: 1,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      backgroundColor: "rgba(16, 185, 129, 0.15)",
                      color: "#10B981",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                    }}
                  >
                    {kpis?.totalActiveStudiesTrend || "+12% MoM"}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-bold font-mono text-white tracking-tight" style={{ fontSize: "2.25rem", lineHeight: 1.1 }}>
                    {kpis?.totalActiveStudies ?? projects.length}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.06]" style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <div className="flex items-center gap-1.5 text-xs text-white/60 font-mono" style={{ fontSize: "0.75rem" }}>
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  <span>{projects.filter((p) => p.status === "ANALYSIS_IN_PROGRESS").length} Modeling</span>
                  <span className="text-white/25">·</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span>{kpis?.underEvaluationCount ?? 2} Intake</span>
                  <span className="text-white/25">·</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>{kpis?.qaReviewGateCount ?? 2} Review</span>
                </div>
              </div>
            </Card>

            {/* KPI 2 */}
            <Card variant="kpi" className="group">
              <div>
                <div className="flex items-center justify-between mb-2" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="text-xs font-mono font-semibold text-white/50 uppercase tracking-wider" style={{ fontSize: "0.75rem" }}>QA Audit Queue</span>
                  <span
                    className="text-xs font-mono font-semibold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-[2px] border border-sky-500/20"
                    style={{
                      padding: "0.2rem 0.625rem",
                      borderRadius: "2px",
                      display: "inline-flex",
                      alignItems: "center",
                      lineHeight: 1,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      backgroundColor: "rgba(56, 189, 248, 0.15)",
                      color: "#38BDF8",
                      border: "1px solid rgba(56, 189, 248, 0.3)",
                    }}
                  >
                    Dual-Blind
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-bold font-mono text-white tracking-tight" style={{ fontSize: "2.25rem", lineHeight: 1.1 }}>
                    {kpis?.qaReviewGateCount ?? 3}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.06]" style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <div className="flex items-center gap-1.5 text-xs text-amber-300/80 font-mono" style={{ fontSize: "0.75rem" }}>
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>RULE_REL_02 QA Signoff Active</span>
                </div>
              </div>
            </Card>

            {/* KPI 3 */}
            <Card variant="kpi" className="group">
              <div>
                <div className="flex items-center justify-between mb-2" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="text-xs font-mono font-semibold text-white/50 uppercase tracking-wider" style={{ fontSize: "0.75rem" }}>Payment Vault</span>
                  <span
                    className="text-xs font-mono font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-[2px] border border-amber-500/20"
                    style={{
                      padding: "0.2rem 0.625rem",
                      borderRadius: "2px",
                      display: "inline-flex",
                      alignItems: "center",
                      lineHeight: 1,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      backgroundColor: "rgba(245, 158, 11, 0.15)",
                      color: "#F59E0B",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                    }}
                  >
                    Escrow Locked
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-bold font-mono text-white tracking-tight" style={{ fontSize: "2.25rem", lineHeight: 1.1 }}>
                    {projects.filter((p) => p.paymentStatus !== "FULLY_PAID").length}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.06]" style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400/80 font-mono" style={{ fontSize: "0.75rem" }}>
                  <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>RULE_REL_01 Release Gate Active</span>
                </div>
              </div>
            </Card>

            {/* KPI 4 */}
            <Card variant="kpi" className="group">
              <div>
                <div className="flex items-center justify-between mb-2" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="text-xs font-mono font-semibold text-white/50 uppercase tracking-wider" style={{ fontSize: "0.75rem" }}>Released Deliverables</span>
                  <span
                    className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-[2px] border border-emerald-500/20"
                    style={{
                      padding: "0.2rem 0.625rem",
                      borderRadius: "2px",
                      display: "inline-flex",
                      alignItems: "center",
                      lineHeight: 1,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      backgroundColor: "rgba(16, 185, 129, 0.15)",
                      color: "#10B981",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                    }}
                  >
                    100% Defense Pass
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-bold font-mono text-white tracking-tight" style={{ fontSize: "2.25rem", lineHeight: 1.1 }}>
                    {kpis?.fullyPaidReleasedCount ?? 64}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.06]" style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <div className="flex items-center gap-1.5 text-xs text-white/60 font-mono" style={{ fontSize: "0.75rem" }}>
                  <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>APA 7th Verified Deliverables</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* ── Active Studies Table Section (Interactive Row Preview) ── */}
      <Card
        header={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight font-sans" style={{ fontSize: "1rem" }}>
                Active Research Studies &amp; Statistical Workspaces
              </h2>
              <p className="text-sm text-white/50 mt-1 font-sans" style={{ fontSize: "0.875rem" }}>
                Click any research study to open its instant inspection drawer and dataset telemetry.
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
                <option value="ANALYSIS_IN_PROGRESS">Analysis In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="APPROVED">Approved / Ready</option>
              </select>
            </div>
          </div>
        }
      >
        <AnimateHeight duration={280}>
          <div className="w-full">
            <table className="w-full text-left border-collapse" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  className="border-b border-white/[0.08] text-xs font-mono font-semibold uppercase tracking-wider text-white/45 bg-white/[0.02]"
                  style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}
                >
                  <th className="py-3.5 pr-6 pl-1" style={{ width: "30%" }}>Study ID &amp; Title</th>
                  <th className="py-3.5 px-3" style={{ width: "17%" }}>Client &amp; Field</th>
                  <th className="py-3.5 px-3" style={{ width: "21%" }}>Methodology</th>
                  <th className="py-3.5 px-3" style={{ width: "14%" }}>Statistician</th>
                  <th className="py-3.5 px-2" style={{ width: "9%" }}>QA Gate</th>
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
                  <>
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                  </>
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

                      {/* QA Gate */}
                      <td className="py-4 px-2" style={{ width: "9%" }}>
                        <StatusBadge status={proj.qaStatus} pulse={proj.qaStatus === "FOR_QA"} />
                      </td>

                      {/* Payment Gate (RULE_REL_01) */}
                      <td className="py-4 px-2" style={{ width: "9%" }}>
                        <StatusBadge status={proj.paymentStatus} />
                      </td>

                      {/* Action */}
                      <td className="py-4 pl-2 pr-1 text-right" style={{ width: "10%" }}>
                        <span className="inline-flex items-center text-xs font-mono text-[#CC6600] group-hover:text-white transition-colors gap-1 justify-end font-semibold" style={{ fontSize: "0.75rem" }}>
                          Inspect →
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
        {/* Release Integrity Compliance Card */}
        <Card
          header={
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <h3 className="text-sm font-bold text-white font-sans" style={{ fontSize: "0.875rem" }}>
                  Operational Business Rules Enforcement
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-semibold" style={{ fontSize: "0.75rem" }}>STRICT COMPLIANCE</span>
            </div>
          }
        >
          <div className="flex flex-col gap-4 text-xs font-sans" style={{ fontSize: "0.75rem" }}>
            <div
              className="p-4 rounded-[2px] bg-white/[0.03] border border-white/[0.08] flex items-start gap-3.5"
              style={{ borderRadius: "2px", padding: "1rem", border: "1px solid rgba(255, 255, 255, 0.08)" }}
            >
              <svg className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white text-xs" style={{ padding: "0.15rem 0.4rem", borderRadius: "2px", backgroundColor: "rgba(255, 255, 255, 0.1)", fontSize: "0.75rem" }}>RULE_REL_01</span>
                  <span className="text-xs text-emerald-400 uppercase font-sans font-semibold" style={{ fontSize: "0.75rem" }}>Payment Release Gate</span>
                </div>
                <span className="text-xs text-white/60 mt-1 leading-relaxed" style={{ fontSize: "0.75rem" }}>
                  Final chapter deliverables and raw datasets remain server-locked until escrow payment status is confirmed <code className="text-emerald-300 font-mono">FULLY_PAID</code> by Finance.
                </span>
              </div>
            </div>

            <div
              className="p-4 rounded-[2px] bg-[#CC6600]/[0.08] border border-[#CC6600]/25 flex items-start gap-3.5"
              style={{ borderRadius: "2px", padding: "1rem", border: "1px solid rgba(204, 102, 0, 0.25)" }}
            >
              <svg className="w-4 h-4 text-[#CC6600] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white text-xs" style={{ padding: "0.15rem 0.4rem", borderRadius: "2px", backgroundColor: "rgba(255, 255, 255, 0.1)", fontSize: "0.75rem" }}>RULE_QUO_01</span>
                  <span className="text-xs text-[#CC6600] uppercase font-sans font-semibold" style={{ fontSize: "0.75rem" }}>Pricing &amp; Scope Boundary</span>
                </div>
                <span className="text-xs text-white/60 mt-1 leading-relaxed" style={{ fontSize: "0.75rem" }}>
                  Statisticians are restricted from altering quotes or fee schedules. New hypotheses outside SOW require Admin/CEO supplemental quotes.
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Live Operational Audit Stream */}
        <Card
          header={
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-[#CC6600]" />
                <h3 className="text-sm font-bold text-white font-sans" style={{ fontSize: "0.875rem" }}>
                  Real-time Governance Audit Stream
                </h3>
              </div>
              <span className="text-xs font-mono text-white/40 uppercase tracking-wide" style={{ fontSize: "0.75rem" }}>Live Telemetry</span>
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

      {/* ── Center Study Inspection Modal (Command & Control Focus) ── */}
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
                Study Inspection Desk
              </span>
            </div>
          ) : null
        }
        description={selectedStudy?.title}
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setSelectedStudy(null)}>
              Close Dialog
            </Button>
            <Button variant="primary" size="md">
              <span>Launch Statistical Desk →</span>
            </Button>
          </>
        }
      >
        {selectedStudy && (
          <div className="flex flex-col gap-6 text-sm font-sans" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Top Governance & Release Status Bar */}
            <div
              className="px-4 py-3 rounded-[2px] bg-white/[0.03] border border-white/[0.08] flex flex-wrap items-center justify-between gap-3"
              style={{ padding: "0.75rem 1rem", borderRadius: "2px", border: "1px solid rgba(255, 255, 255, 0.08)" }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-white/45" style={{ fontSize: "0.688rem" }}>
                  QA Review Gate:
                </span>
                <StatusBadge status={selectedStudy.qaStatus} pulse={selectedStudy.qaStatus === "FOR_QA"} />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-white/45" style={{ fontSize: "0.688rem" }}>
                  Payment Gate (RULE_REL_01):
                </span>
                <StatusBadge status={selectedStudy.paymentStatus} />
              </div>
            </div>

            {/* 2-Column Balanced Architecture Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
              {/* Left Column: Context & Methodology */}
              <div className="flex flex-col gap-5">
                {/* Researcher & Institutional Affiliation */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-white/45" style={{ fontSize: "0.688rem" }}>
                    Researcher &amp; Institution
                  </span>
                  <div
                    className="p-4 rounded-[2px] bg-[#011C38]/70 border border-white/[0.08] flex flex-col gap-2.5"
                    style={{ padding: "1rem", borderRadius: "2px", border: "1px solid rgba(255, 255, 255, 0.08)" }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-white/50" style={{ fontSize: "0.75rem" }}>Primary Researcher</span>
                      <span className="text-sm font-semibold text-white" style={{ fontSize: "0.875rem" }}>{selectedStudy.client}</span>
                    </div>
                    <div className="h-px bg-white/[0.05]" />
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-white/50" style={{ fontSize: "0.75rem" }}>University / Affiliation</span>
                      <span className="text-sm font-medium text-white/90" style={{ fontSize: "0.875rem" }}>{selectedStudy.university}</span>
                    </div>
                    <div className="h-px bg-white/[0.05]" />
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-white/50" style={{ fontSize: "0.75rem" }}>Degree &amp; Program</span>
                      <span className="text-xs font-medium text-sky-400" style={{ fontSize: "0.75rem" }}>{selectedStudy.field}</span>
                    </div>
                  </div>
                </div>

                {/* Methodology Matrix */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-white/45" style={{ fontSize: "0.688rem" }}>
                    Methodology &amp; Computational Model
                  </span>
                  <div
                    className="p-4 rounded-[2px] bg-[#011C38]/70 border border-white/[0.08] flex items-start gap-3"
                    style={{ padding: "1rem", borderRadius: "2px", border: "1px solid rgba(255, 255, 255, 0.08)" }}
                  >
                    <svg className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-xs text-white/85 leading-relaxed font-sans" style={{ fontSize: "0.75rem", lineHeight: 1.6 }}>
                      {selectedStudy.method}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Desk & Cloudflare R2 Artifacts */}
              <div className="flex flex-col gap-5">
                {/* Assigned Desk */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-white/45" style={{ fontSize: "0.688rem" }}>
                    Assigned Statistical Desk
                  </span>
                  <div
                    className="p-3.5 rounded-[2px] bg-white/[0.03] border border-white/[0.08] flex items-center justify-between"
                    style={{ padding: "0.875rem 1rem", borderRadius: "2px", border: "1px solid rgba(255, 255, 255, 0.08)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-9 w-9 rounded-full bg-[#012E57] border border-white/20 flex items-center justify-center text-xs font-bold text-white shadow-inner flex-shrink-0"
                        style={{ height: "2.25rem", width: "2.25rem", borderRadius: "9999px" }}
                      >
                        {selectedStudy.statisticians.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white" style={{ fontSize: "0.875rem" }}>{selectedStudy.statisticians}</span>
                        <span className="text-xs text-white/45" style={{ fontSize: "0.75rem" }}>Senior Statistical Lead</span>
                      </div>
                    </div>
                    <span
                      className="text-xs font-sans font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-[2px] border border-emerald-500/25"
                      style={{ fontSize: "0.75rem", padding: "0.2rem 0.625rem", borderRadius: "2px" }}
                    >
                      Active Desk
                    </span>
                  </div>
                </div>

                {/* Cloudflare R2 Dataset Artifacts */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-white/45" style={{ fontSize: "0.688rem" }}>
                    Cloudflare R2 Dataset Artifacts
                  </span>
                  <div className="flex flex-col gap-2.5">
                    <div
                      className="p-3 rounded-[2px] bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.07] flex items-center justify-between transition-colors"
                      style={{ padding: "0.75rem 1rem", borderRadius: "2px", border: "1px solid rgba(255, 255, 255, 0.07)" }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <svg className="w-4 h-4 text-sky-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
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
                        <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
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
