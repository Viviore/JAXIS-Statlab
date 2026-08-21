"use client";

import React, { useState } from "react";
import { PageHeader, Card, StatusBadge, Button, Modal } from "@repo/ui";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { Project } from "@/types/project";

export default function AdminDashboardPage() {
  const [selectedStudy, setSelectedStudy] = useState<Project | null>(null);

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
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[2px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ADMIN CONSOLE READY
          </span>
        }
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex flex-col gap-1 p-5">
          <span className="text-xs font-mono text-white/50 uppercase tracking-wider">Total Active Studies</span>
          <span className="text-3xl font-mono font-bold text-white">{kpis?.totalActiveStudies ?? 24}</span>
          <span className="text-[0.688rem] text-emerald-400 mt-1 font-mono">● {kpis?.totalActiveStudiesTrend ?? "+14% MoM"}</span>
        </Card>

        <Card className="flex flex-col gap-1 p-5">
          <span className="text-xs font-mono text-white/50 uppercase tracking-wider">Under Evaluation</span>
          <span className="text-3xl font-mono font-bold text-sky-400">{kpis?.underEvaluationCount ?? 7}</span>
          <span className="text-[0.688rem] text-sky-400 mt-1 font-mono">● Computational run in progress</span>
        </Card>

        <Card className="flex flex-col gap-1 p-5">
          <span className="text-xs font-mono text-white/50 uppercase tracking-wider">QA Review Gates</span>
          <span className="text-3xl font-mono font-bold text-amber-400">{kpis?.qaReviewGateCount ?? 5}</span>
          <span className="text-[0.688rem] text-amber-400 mt-1 font-mono">● Dual-blind review pending</span>
        </Card>

        <Card className="flex flex-col gap-1 p-5">
          <span className="text-xs font-mono text-white/50 uppercase tracking-wider">Monthly Revenue Escrow</span>
          <span className="text-3xl font-mono font-bold text-emerald-400">
            {kpis?.monthlyRevenueEscrow ?? "$42,800"}
          </span>
          <span className="text-[0.688rem] text-emerald-400 mt-1 font-mono">● {kpis?.escrowSecuredRatio ?? "99.4% Secured"}</span>
        </Card>
      </div>

      {/* ── Live Pipeline Table ── */}
      <Card className="p-0 overflow-hidden">
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-base font-bold text-white">System-Wide Study Registry</h2>
            <p className="text-xs text-white/50">Comprehensive pipeline with full audit history and role assignments</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-xs font-mono text-white/50 uppercase">
                <th className="py-3 px-4">Study ID</th>
                <th className="py-3 px-4">Project Title</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {projects.map((study) => (
                <tr key={study.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-mono text-xs text-[#CC6600] font-semibold">{study.id}</td>
                  <td className="py-3.5 px-4 text-white font-medium">{study.title}</td>
                  <td className="py-3.5 px-4 text-white/70">{study.client}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-white/60">{study.method}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={study.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedStudy(study)}
                    >
                      INSPECT
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          <div className="flex flex-col gap-4 text-xs font-sans text-white/80">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-[2px] bg-white/[0.03] border border-white/[0.08]">
              <div>
                <span className="font-mono text-white/40 uppercase">Primary Investigator:</span>
                <p className="text-sm font-semibold text-white mt-0.5">{selectedStudy.client}</p>
                <p className="text-white/50">{selectedStudy.university}</p>
              </div>
              <div>
                <span className="font-mono text-white/40 uppercase">Statistical Methodology:</span>
                <p className="text-sm font-semibold text-white mt-0.5">{selectedStudy.method}</p>
                <p className="text-white/50">Field: {selectedStudy.field}</p>
              </div>
            </div>

            <div>
              <span className="font-mono text-white/40 uppercase">Audit Stream &amp; Verification Trail:</span>
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                {auditStream.slice(0, 4).map((log) => (
                  <div key={log.id} className="p-2.5 rounded-[2px] bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                    <span className="font-mono text-[0.688rem] text-slate-300">{log.action}: {log.detail}</span>
                    <span className="font-mono text-[0.625rem] text-white/40">{log.timestamp}</span>
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
