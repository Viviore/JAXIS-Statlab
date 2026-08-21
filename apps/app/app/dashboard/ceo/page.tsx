"use client";

import React, { useState } from "react";
import { PageHeader, Card, StatusBadge, Button, Modal } from "@repo/ui";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { Project } from "@/types/project";

export default function CEODashboardPage() {
  const [selectedStudy, setSelectedStudy] = useState<Project | null>(null);

  const { projects } = useProjects({
    initialLoading: false,
  });

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-16 w-full">
      <PageHeader
        title="Executive Intelligence & Macro Governance Desk"
        description="Executive visibility into institutional client retention, turnaround SLAs, revenue throughput, and cross-desk statistical integrity."
        breadcrumbs={[
          { label: "WORKSPACE", href: "/dashboard" },
          { label: "CEO Console" },
        ]}
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[2px] bg-[#CC6600]/15 border border-[#CC6600]/30 text-[#CC6600] text-xs font-mono font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-[#CC6600] animate-pulse" />
            EXECUTIVE OVERSIGHT ACTIVE
          </span>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="flex flex-col gap-1 p-5">
          <span className="text-xs font-mono text-white/50 uppercase tracking-wider">Gross Pipeline Value</span>
          <span className="text-3xl font-mono font-bold text-white">$142,500</span>
          <span className="text-[0.688rem] text-emerald-400 mt-1 font-mono">+18.4% MoM growth</span>
        </Card>

        <Card className="flex flex-col gap-1 p-5">
          <span className="text-xs font-mono text-white/50 uppercase tracking-wider">Avg Turnaround SLA</span>
          <span className="text-3xl font-mono font-bold text-sky-400">4.2 Days</span>
          <span className="text-[0.688rem] text-sky-400 mt-1 font-mono">● 99.2% on-time delivery</span>
        </Card>

        <Card className="flex flex-col gap-1 p-5">
          <span className="text-xs font-mono text-white/50 uppercase tracking-wider">QA Rejection Rate</span>
          <span className="text-3xl font-mono font-bold text-emerald-400">0.8%</span>
          <span className="text-[0.688rem] text-emerald-400 mt-1 font-mono">● Elite statistical accuracy</span>
        </Card>

        <Card className="flex flex-col gap-1 p-5">
          <span className="text-xs font-mono text-white/50 uppercase tracking-wider">Active Institutional Orgs</span>
          <span className="text-3xl font-mono font-bold text-amber-400">14</span>
          <span className="text-[0.688rem] text-amber-400 mt-1 font-mono">● Universities &amp; Labs</span>
        </Card>
      </div>

      {/* Global Pipeline Registry */}
      <Card className="p-0 overflow-hidden">
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Cross-Department Study Pipeline</h2>
            <p className="text-xs text-white/50">Macro lifecycle oversight across all client universities and medical centers</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-xs font-mono text-white/50 uppercase">
                <th className="py-3 px-4">Study ID</th>
                <th className="py-3 px-4">Institution / Client</th>
                <th className="py-3 px-4">Methodology</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {projects.map((study) => (
                <tr key={study.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-mono text-xs text-[#CC6600] font-semibold">{study.id}</td>
                  <td className="py-3.5 px-4 text-white font-medium">{study.client} ({study.university})</td>
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
                      EXECUTIVE AUDIT
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      {selectedStudy && (
        <Modal
          open={!!selectedStudy}
          onClose={() => setSelectedStudy(null)}
          title={`Executive Overview: ${selectedStudy.id}`}
          description={selectedStudy.title}
          size="md"
          footer={
            <Button variant="secondary" onClick={() => setSelectedStudy(null)}>
              CLOSE
            </Button>
          }
        >
          <div className="flex flex-col gap-3 text-xs text-white/80">
            <p><strong>Commissioning Client:</strong> {selectedStudy.client}</p>
            <p><strong>University:</strong> {selectedStudy.university}</p>
            <p><strong>Field of Research:</strong> {selectedStudy.field}</p>
            <p><strong>Methodology:</strong> {selectedStudy.method}</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
