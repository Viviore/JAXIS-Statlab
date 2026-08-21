"use client";

import React, { useState } from "react";
import { PageHeader, Card, StatusBadge, Button, Modal } from "@repo/ui";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { Project } from "@/types/project";

export default function QALeadDashboardPage() {
  const [selectedStudy, setSelectedStudy] = useState<Project | null>(null);

  const { projects } = useProjects({
    initialLoading: false,
  });

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-16 w-full">
      <PageHeader
        title="Senior QA Lead Studio & Verification Desk"
        description="Dual-blind recalculation verification, hypothesis reproducibility audits, APA 7th compliance seals, and deliverable release authorization."
        breadcrumbs={[
          { label: "WORKSPACE", href: "/dashboard" },
          { label: "QA Studio" },
        ]}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex flex-col gap-1 p-5">
          <span className="text-xs font-mono text-white/50 uppercase tracking-wider">Awaiting QA Audit</span>
          <span className="text-3xl font-mono font-bold text-amber-400">4</span>
          <span className="text-[0.688rem] text-amber-400 mt-1 font-mono">● Requires blind recalculation</span>
        </Card>

        <Card className="flex flex-col gap-1 p-5">
          <span className="text-xs font-mono text-white/50 uppercase tracking-wider">Approved This Month</span>
          <span className="text-3xl font-mono font-bold text-emerald-400">12</span>
          <span className="text-[0.688rem] text-emerald-400 mt-1 font-mono">● Zero statistical anomalies</span>
        </Card>

        <Card className="flex flex-col gap-1 p-5">
          <span className="text-xs font-mono text-white/50 uppercase tracking-wider">Revision Requested</span>
          <span className="text-3xl font-mono font-bold text-red-400">1</span>
          <span className="text-[0.688rem] text-red-400 mt-1 font-mono">● Returned to statistician desk</span>
        </Card>
      </div>

      {/* QA Verification Queue */}
      <Card className="p-0 overflow-hidden">
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Peer Verification Queue</h2>
            <p className="text-xs text-white/50">Perform independent recalculations and seal deliverables</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-xs font-mono text-white/50 uppercase">
                <th className="py-3 px-4">Study ID</th>
                <th className="py-3 px-4">Project Title</th>
                <th className="py-3 px-4">Statistician</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {projects.slice(0, 4).map((study) => (
                <tr key={study.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-mono text-xs text-[#CC6600] font-semibold">{study.id}</td>
                  <td className="py-3.5 px-4 text-white font-medium">{study.title}</td>
                  <td className="py-3.5 px-4 text-white/70">{study.statisticians || "Dr. Aris Thorne"}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={study.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedStudy(study)}
                    >
                      VERIFY STUDY
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
          title={`QA Peer Verification: ${selectedStudy.id}`}
          description={selectedStudy.title}
          size="md"
          footer={
            <Button variant="secondary" onClick={() => setSelectedStudy(null)}>
              CLOSE
            </Button>
          }
        >
          <div className="flex flex-col gap-3 text-xs text-white/80">
            <p><strong>Primary Statistician:</strong> {selectedStudy.statisticians}</p>
            <p><strong>Methodology:</strong> {selectedStudy.method}</p>
            <p><strong>Dataset:</strong> {selectedStudy.datasetName}</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
