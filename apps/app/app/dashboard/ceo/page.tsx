"use client";

import React, { useState } from "react";
import { PageHeader, Card, StatusBadge, Button, Modal, KpiCard } from "@repo/ui";
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
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        <KpiCard
          label="Gross Pipeline Value"
          value="$142,500"
          variant="default"
          badge="+18.4%"
          badgeColor="emerald"
          description="MoM growth trend"
        />

        <KpiCard
          label="Avg Turnaround SLA"
          value="4.2 Days"
          variant="sky"
          description="99.2% on-time delivery"
        />

        <KpiCard
          label="QA Rejection Rate"
          value="0.8%"
          variant="emerald"
          description="Elite statistical accuracy"
        />

        <KpiCard
          label="Active Institutional Orgs"
          value={14}
          variant="amber"
          description="Universities & Labs"
        />
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
          <table className="w-full min-w-[680px] text-left border-collapse font-sans text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-xs font-mono text-white/50 uppercase tracking-wider">
                <th className="py-4 px-6">Study ID</th>
                <th className="py-4 px-6">Institution / Client</th>
                <th className="py-4 px-6">Methodology</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {projects.map((study) => (
                <tr key={study.id} className="hover:bg-white/[0.03] transition-colors group">
                  <td className="py-5 px-6 font-mono text-xs text-[#CC6600] font-semibold whitespace-nowrap align-middle">{study.id}</td>
                  <td className="py-5 px-6 text-white font-medium align-middle">
                    <span className="line-clamp-1 group-hover:text-[#CC6600] transition-colors">
                      {study.client} <span className="text-white/40 text-xs">({study.university})</span>
                    </span>
                  </td>
                  <td className="py-5 px-6 font-mono text-xs text-white/60 whitespace-nowrap align-middle">{study.method}</td>
                  <td className="py-5 px-6 whitespace-nowrap align-middle">
                    <StatusBadge status={study.status} />
                  </td>
                  <td className="py-5 px-6 text-right whitespace-nowrap align-middle">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedStudy(study)}
                      className="py-2 px-3.5 h-auto whitespace-nowrap font-mono text-xs tracking-wider"
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
