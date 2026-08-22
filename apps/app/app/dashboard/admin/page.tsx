"use client";

import React, { useState } from "react";
import { PageHeader, Card, StatusBadge, Button, Modal, FilterToolbar, KpiCard } from "@repo/ui";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { Project } from "@/types/project";

export default function AdminDashboardPage() {
  const [selectedStudy, setSelectedStudy] = useState<Project | null>(null);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const {
    projects,
    kpis,
    auditStream,
    isLoading,
    simulateSync,
  } = useProjects({
    initialLoading: false,
  });

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-16 w-full">
      {/* ── Page Header ── */}
      <PageHeader
        title="Admin Operations & Governance Desk"
        description="System-wide command console for stakeholder orchestration, live pipeline audit enforcement, and global deliverable verification."
        breadcrumbs={[
          { label: "WORKSPACE", href: "/dashboard" },
          { label: "Admin Operations" },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={simulateSync}
              loading={isLoading}
            >
              SYNC LIVE DESK
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => alert("Project Intake modal will open.")}
            >
              + NEW PROJECT INTAKE
            </Button>
          </div>
        }
      />

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        <KpiCard
          label="Total Active Studies"
          value={kpis?.totalActiveStudies ?? 24}
          variant="default"
          badge={kpis?.totalActiveStudiesTrend ?? "+14%"}
          badgeColor="emerald"
          description="MoM active growth"
        />

        <KpiCard
          label="Under Evaluation"
          value={kpis?.underEvaluationCount ?? 7}
          variant="sky"
          description="Computational run in progress"
        />

        <KpiCard
          label="QA Review Gates"
          value={kpis?.qaReviewGateCount ?? 5}
          variant="amber"
          description="Dual-blind review pending"
        />

        <KpiCard
          label="Monthly Revenue Escrow"
          value={kpis?.monthlyRevenueEscrow ?? "$42,800"}
          variant="emerald"
          description={kpis?.escrowSecuredRatio ?? "99.4% Secured"}
        />
      </div>

      {/* ── Live Pipeline Table ── */}
      <Card
        className="p-0 overflow-hidden border border-white/[0.08] bg-[#010D1F]"
        style={{ padding: 0 }}
      >
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          style={{ padding: '1.75rem 1.75rem 1.25rem 1.75rem' }}
        >
          <div>
            <h2 className="text-base font-bold text-white tracking-wide font-sans">
              System-Wide Study Registry
            </h2>
            <p className="text-xs text-white/50 mt-1.5 font-sans leading-relaxed">
              Comprehensive pipeline with full audit history and role assignments
            </p>
          </div>
          <span className="text-xs font-mono text-white/60 bg-white/[0.04] px-3.5 py-1.5 rounded-[2px] border border-white/10 self-start sm:self-auto whitespace-nowrap">
            {projects.length} Active Studies
          </span>
        </div>

        {/* ─ Filter Toolbar ─ */}
        <FilterToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search by ID, Title, or Client..."
          filters={[
            {
              key: "method",
              label: "Method",
              value: selectedMethod,
              defaultValue: "ALL",
              options: [
                { value: "ALL", label: "All Methods" },
                { value: "ANOVA", label: "ANOVA" },
                { value: "REGRESSION", label: "Regression" },
                { value: "T_TEST", label: "T-Test" },
              ],
            },
            {
              key: "status",
              label: "Status",
              value: selectedStatus,
              defaultValue: "ALL",
              options: [
                { value: "ALL", label: "All Statuses" },
                { value: "EVALUATION", label: "Evaluation" },
                { value: "QA_REVIEW", label: "QA Review" },
                { value: "COMPLETED", label: "Completed" },
              ],
            },
          ]}
          onFilterChange={(key, value) => {
            if (key === "method") setSelectedMethod(value);
            if (key === "status") setSelectedStatus(value);
          }}
          onClear={() => {
            setSelectedMethod("ALL");
            setSelectedStatus("ALL");
            setSearchQuery("");
          }}
        />

        {/* ─ Table ─ */}
        <div style={{ padding: '1.25rem 1.75rem 1.75rem 1.75rem' }}>
          <div className="w-full overflow-x-auto rounded-[3px] border border-white/[0.08]">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-[120px] whitespace-nowrap">Study ID</th>
                  <th>Project Title</th>
                  <th className="w-[160px] whitespace-nowrap">Client</th>
                  <th className="w-[160px] whitespace-nowrap">Method</th>
                  <th className="w-[170px] whitespace-nowrap">Status</th>
                  <th className="w-[100px] text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((study) => (
                  <tr key={study.id} className="group">
                    <td className="font-mono text-xs text-[#CC6600] font-semibold whitespace-nowrap">
                      {study.id}
                    </td>
                    <td className="text-white font-medium text-sm">
                      <span className="line-clamp-1 group-hover:text-[#CC6600] transition-colors" title={study.title}>
                        {study.title}
                      </span>
                    </td>
                    <td className="text-slate-300 text-xs font-sans whitespace-nowrap truncate max-w-[160px]">
                      {study.client}
                    </td>
                    <td className="text-slate-400 text-xs font-sans whitespace-nowrap truncate max-w-[160px]">
                      {study.method}
                    </td>
                    <td className="whitespace-nowrap">
                      <StatusBadge status={study.status} />
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedStudy(study)}
                        className="py-1 px-3 h-auto whitespace-nowrap font-mono text-xs tracking-wider"
                      >
                        INSPECT
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* ── Inspection Modal ── */}
      {selectedStudy && (
        <Modal
          open={!!selectedStudy}
          onClose={() => setSelectedStudy(null)}
          title={`Study Inspection: ${selectedStudy.id}`}
          description={selectedStudy.title}
          size="lg"
          footer={
            <Button variant="secondary" onClick={() => setSelectedStudy(null)}>
              CLOSE INSPECTOR
            </Button>
          }
        >
          <div className="flex flex-col gap-5 text-xs font-sans text-white/80">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 sm:px-7 rounded-[3px] bg-white/[0.03] border border-white/[0.08]">
              <div>
                <span className="font-mono text-[0.6875rem] text-white/40 uppercase tracking-wider">Lead Researcher:</span>
                <p className="text-sm font-semibold text-white mt-1">{selectedStudy.client}</p>
                <p className="text-white/50 text-xs mt-0.5">{selectedStudy.university}</p>
              </div>
              <div>
                <span className="font-mono text-[0.6875rem] text-white/40 uppercase tracking-wider">Statistical Methodology:</span>
                <p className="text-sm font-semibold text-white mt-1 leading-snug">{selectedStudy.method}</p>
                <p className="text-white/50 text-xs mt-0.5">Field: {selectedStudy.field}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-mono text-[0.6875rem] text-white/40 uppercase tracking-wider">Audit Stream &amp; Verification Trail:</span>
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {auditStream.slice(0, 4).map((log) => (
                  <div key={log.id} className="py-3 px-5 rounded-[2px] bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-4">
                    <span className="font-mono text-[0.72rem] text-slate-300">{log.action}: {log.detail}</span>
                    <span className="font-mono text-[0.65rem] text-white/40 whitespace-nowrap">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
