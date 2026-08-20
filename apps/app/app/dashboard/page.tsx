"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageHeader, Card, StatusBadge, Button, Modal, KpiCardSkeleton, TableRowSkeleton, AnimateHeight } from "@repo/ui";

interface Project {
  id: string;
  title: string;
  client: string;
  university: string;
  field: string;
  method: string;
  statisticians: string;
  qaStatus: string;
  paymentStatus: string;
  updated: string;
  datasetName?: string;
  datasetSize?: string;
  syntaxName?: string;
}

const MOCK_PROJECTS: Project[] = [
  {
    id: "JAX-2026-089",
    title: "Impact of FinTech Adoption on SME Liquidity During Inflationary Shocks",
    client: "Maria C.",
    university: "DLSU Manila",
    field: "Financial Economics · Master's Thesis",
    method: "Hierarchical Linear Regression, VIF, Heteroscedasticity",
    statisticians: "Dr. E. Santos (Lead)",
    qaStatus: "IN_PROGRESS",
    paymentStatus: "FULLY_PAID",
    updated: "14m ago",
    datasetName: "sme_fintech_survey_n2400.csv",
    datasetSize: "2.4 MB",
    syntaxName: "fintech_hierarchical_reg.sps",
  },
  {
    id: "JAX-2026-088",
    title: "Efficacy of Blended Problem-Based Learning on Clinical Diagnostic Speed",
    client: "Dr. Kenneth V.",
    university: "UST Medicine",
    field: "Health Sciences · Clinical Dissertation",
    method: "Two-Way Repeated Measures ANOVA & Bonferroni Post-Hoc",
    statisticians: "Prof. L. Rivera",
    qaStatus: "FOR_QA",
    paymentStatus: "FULLY_PAID",
    updated: "35m ago",
    datasetName: "clinical_diagnostic_trials_n180.xlsx",
    datasetSize: "840 KB",
    syntaxName: "repeated_measures_anova.R",
  },
  {
    id: "JAX-2026-087",
    title: "Consumer Perception and Purchase Intention in Sustainable Packaging",
    client: "G. Tan",
    university: "Ateneo Graduate School",
    field: "Marketing Management · MBA Thesis",
    method: "Exploratory Factor Analysis (EFA) & PLS-SEM",
    statisticians: "M. Ramirez (Lead)",
    qaStatus: "QA_APPROVED",
    paymentStatus: "AWAITING_PAYMENT",
    updated: "1h ago",
    datasetName: "packaging_consumer_survey_n650.sav",
    datasetSize: "1.1 MB",
    syntaxName: "smartpls_sem_model.spls",
  },
  {
    id: "JAX-2026-085",
    title: "Predictors of Employee Retention in BPO Hybrid Working Models",
    client: "Samantha R.",
    university: "UP Diliman",
    field: "Industrial Psychology · Ph.D. Study",
    method: "Multiple Linear Regression & PROCESS Macro",
    statisticians: "Dr. E. Santos (Lead)",
    qaStatus: "QA_APPROVED",
    paymentStatus: "FULLY_PAID",
    updated: "3h ago",
    datasetName: "bpo_retention_dataset_n1200.csv",
    datasetSize: "1.8 MB",
    syntaxName: "process_macro_model4.sps",
  },
];

export default function DashboardOverviewPage() {
  const [selectedStudy, setSelectedStudy] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const triggerSimulatedLoading = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

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
              onClick={triggerSimulatedLoading}
              title="Click to test 2-second skeleton loading state"
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
                    +16.4% MoM
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-bold font-mono text-white tracking-tight" style={{ fontSize: "2.25rem", lineHeight: 1.1 }}>24</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.06]" style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <div className="flex items-center gap-1.5 text-xs text-white/60 font-mono" style={{ fontSize: "0.75rem" }}>
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  <span>12 Modeling</span>
                  <span className="text-white/25">·</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span>8 Intake</span>
                  <span className="text-white/25">·</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>4 Review</span>
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
                  <span className="text-3xl font-bold font-mono text-white tracking-tight" style={{ fontSize: "2.25rem", lineHeight: 1.1 }}>7</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.06]" style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <div className="flex items-center gap-1.5 text-xs text-amber-300/80 font-mono" style={{ fontSize: "0.75rem" }}>
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>2 Senior Signoffs Pending Today</span>
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
                  <span className="text-3xl font-bold font-mono text-white tracking-tight" style={{ fontSize: "2.25rem", lineHeight: 1.1 }}>4</span>
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
                  <span className="text-xs font-mono font-semibold text-white/50 uppercase tracking-wider" style={{ fontSize: "0.75rem" }}>Defense Ready</span>
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
                  <span className="text-3xl font-bold font-mono text-white tracking-tight" style={{ fontSize: "2.25rem", lineHeight: 1.1 }}>142</span>
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
                onChange={triggerSimulatedLoading}
                className="bg-[#011B38] border border-white/[0.12] rounded-[2px] text-xs text-white px-3 py-1.5 focus:outline-none focus:border-[#CC6600]"
                style={{ fontSize: "0.75rem", borderRadius: "2px" }}
              >
                <option>All Desks (24)</option>
                <option>Pending QA (7)</option>
                <option>Awaiting Payment (4)</option>
                <option>Ready for Release (3)</option>
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
                key={isLoading ? "loading-rows" : "loaded-rows"}
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
                ) : (
                  MOCK_PROJECTS.map((proj) => (
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
                      <td className="py-4 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-6 w-6 rounded-full bg-[#012E57] border border-white/20 flex items-center justify-center text-xs font-bold text-white shadow-inner flex-shrink-0"
                            style={{ height: "1.5rem", width: "1.5rem", borderRadius: "9999px", fontSize: "0.75rem" }}
                          >
                            {proj.statisticians.charAt(0)}
                          </div>
                          <span className="text-xs text-white/85 font-medium" style={{ fontSize: "0.75rem" }}>{proj.statisticians}</span>
                        </div>
                      </td>

                      {/* QA Gate */}
                      <td className="py-4 px-2 whitespace-nowrap">
                        <StatusBadge status={proj.qaStatus} pulse={proj.qaStatus === "FOR_QA"} />
                      </td>

                      {/* Payment */}
                      <td className="py-4 px-2 whitespace-nowrap">
                        <StatusBadge status={proj.paymentStatus} />
                      </td>

                      {/* Action Button */}
                      <td className="py-4 pl-2 pr-1 text-right whitespace-nowrap">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudy(proj);
                          }}
                        >
                          Open Desk →
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </AnimateHeight>
      </Card>

      {/* ── Two-Column Bottom Modules (Compliance Engine + Activity Stream) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-7">
        {/* Compliance & Release Gate Engine */}
        <Card
          header={
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white font-sans" style={{ fontSize: "0.875rem" }}>
                  Cryptographic Release Gate Protocol
                </h3>
              </div>
              <span className="text-xs font-mono text-[#38bdf8] uppercase tracking-wider" style={{ fontSize: "0.75rem" }}>
                Strict Server Enforcement
              </span>
            </div>
          }
        >
          <div className="flex flex-col gap-4 text-xs text-white/75 font-sans" style={{ fontSize: "0.75rem" }}>
            <div
              className="p-4 rounded-[2px] bg-emerald-500/[0.08] border border-emerald-500/20 flex items-start gap-3.5"
              style={{ borderRadius: "2px", padding: "1rem", border: "1px solid rgba(16, 185, 129, 0.25)" }}
            >
              <svg className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white text-xs" style={{ padding: "0.15rem 0.4rem", borderRadius: "2px", backgroundColor: "rgba(255, 255, 255, 0.1)", fontSize: "0.75rem" }}>RULE_REL_01</span>
                  <span className="text-xs text-emerald-400 uppercase font-sans font-semibold" style={{ fontSize: "0.75rem" }}>Payment Release Gate</span>
                </div>
                <span className="text-xs text-white/60 mt-1 leading-relaxed" style={{ fontSize: "0.75rem" }}>
                  Final deliverable zip packages are mathematically un-downloadable unless payment status evaluates to <code className="text-emerald-300 font-mono">FULLY_PAID</code> on server.
                </span>
              </div>
            </div>

            <div
              className="p-4 rounded-[2px] bg-sky-500/[0.08] border border-sky-500/20 flex items-start gap-3.5"
              style={{ borderRadius: "2px", padding: "1rem", border: "1px solid rgba(56, 189, 248, 0.25)" }}
            >
              <svg className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white text-xs" style={{ padding: "0.15rem 0.4rem", borderRadius: "2px", backgroundColor: "rgba(255, 255, 255, 0.1)", fontSize: "0.75rem" }}>RULE_ETH_01</span>
                  <span className="text-xs text-sky-400 uppercase font-sans font-semibold" style={{ fontSize: "0.75rem" }}>Ethical Integrity Engine</span>
                </div>
                <span className="text-xs text-white/60 mt-1 leading-relaxed" style={{ fontSize: "0.75rem" }}>
                  Forced statistical significance and synthetic data manipulation requests trigger automatic security escalation and permanent study lock.
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
            <div className="py-3.5 flex items-start gap-3.5">
              <span className="text-xs font-mono text-white/35 whitespace-nowrap pt-0.5" style={{ fontSize: "0.75rem" }}>12m ago</span>
              <div className="flex flex-col">
                <span className="text-white/85">
                  <strong className="text-white">Senior QA Lead (Prof. Rivera)</strong> approved p-value verification on <code className="text-sky-300 font-mono">JAX-2026-088</code>.
                </span>
                <span className="text-xs text-white/45 font-mono mt-1" style={{ fontSize: "0.75rem" }}>Two-Way ANOVA · F(2, 58) = 14.82, p &lt; .001, ηp² = .34</span>
              </div>
            </div>

            <div className="py-3.5 flex items-start gap-3.5">
              <span className="text-xs font-mono text-white/35 whitespace-nowrap pt-0.5" style={{ fontSize: "0.75rem" }}>38m ago</span>
              <div className="flex flex-col">
                <span className="text-white/85">
                  <strong className="text-white">Finance Officer</strong> verified downpayment proof receipt #84920 via GCash.
                </span>
                <span className="text-xs text-emerald-400 font-mono mt-1" style={{ fontSize: "0.75rem" }}>Milestone 1 Escrow Locked · ₱4,500.00</span>
              </div>
            </div>

            <div className="py-3.5 flex items-start gap-3.5">
              <span className="text-xs font-mono text-white/35 whitespace-nowrap pt-0.5" style={{ fontSize: "0.75rem" }}>1h ago</span>
              <div className="flex flex-col">
                <span className="text-white/85">
                  <strong className="text-white">Lead Statistician (Dr. Santos)</strong> generated APA 7th Chapter 4 tables for <code className="text-sky-300 font-mono">JAX-2026-085</code>.
                </span>
                <span className="text-xs text-white/45 font-mono mt-1" style={{ fontSize: "0.75rem" }}>SPSS Syntax &amp; Cleaned Dataset archived to Cloudflare R2</span>
              </div>
            </div>

            <div className="py-3.5 flex items-start gap-3.5">
              <span className="text-xs font-mono text-white/35 whitespace-nowrap pt-0.5" style={{ fontSize: "0.75rem" }}>2h ago</span>
              <div className="flex flex-col">
                <span className="text-white/85">
                  <strong className="text-white">Client (Maria C.)</strong> submitted new thesis intake dataset (2,400 survey rows).
                </span>
                <span className="text-xs text-sky-400 font-mono mt-1" style={{ fontSize: "0.75rem" }}>Trigger.dev automated hygiene worker scheduled</span>
              </div>
            </div>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
