"use client";

import React, { useState } from "react";
import { PageHeader, Card, StatusBadge, Button, Modal } from "@repo/ui";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { Project } from "@/types/project";

export default function StatisticianDashboardPage() {
  const [selectedStudy, setSelectedStudy] = useState<Project | null>(null);

  const { projects } = useProjects({
    initialLoading: false,
  });

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-16 w-full">
      <PageHeader
        title="Statistician Computational Workbench"
        description="Dataset intake processing, statistical code execution (R / Python / SPSS), and draft deliverable submission to QA Lead review."
        breadcrumbs={[
          { label: "WORKSPACE", href: "/dashboard" },
          { label: "Statistician Workbench" },
        ]}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex flex-col gap-1 p-5">
          <span className="text-xs font-mono text-white/50 uppercase tracking-wider">Assigned Analyses</span>
          <span className="text-3xl font-mono font-bold text-sky-400">3</span>
          <span className="text-[0.688rem] text-sky-400 mt-1 font-mono">● Active computation pipelines</span>
        </Card>

        <Card className="flex flex-col gap-1 p-5">
          <span className="text-xs font-mono text-white/50 uppercase tracking-wider">Pending QA Feedback</span>
          <span className="text-3xl font-mono font-bold text-amber-400">2</span>
          <span className="text-[0.688rem] text-amber-400 mt-1 font-mono">● Under peer verification</span>
        </Card>

        <Card className="flex flex-col gap-1 p-5">
          <span className="text-xs font-mono text-white/50 uppercase tracking-wider">Approved Deliverables</span>
          <span className="text-3xl font-mono font-bold text-emerald-400">18</span>
          <span className="text-[0.688rem] text-emerald-400 mt-1 font-mono">● 100% Defense Pass Rate</span>
        </Card>
      </div>

      {/* Assigned Workbench Projects */}
      <Card className="p-0 overflow-hidden">
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Assigned Statistical Runs</h2>
            <p className="text-xs text-white/50">Execute analytical models and upload verified syntax / notebooks</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-xs font-mono text-white/50 uppercase">
                <th className="py-3 px-4">Study ID</th>
                <th className="py-3 px-4">Project Title</th>
                <th className="py-3 px-4">Methodology</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {projects.slice(0, 4).map((study) => (
                <tr key={study.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-mono text-xs text-[#CC6600] font-semibold">{study.id}</td>
                  <td className="py-3.5 px-4 text-white font-medium">{study.title}</td>
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
                      OPEN WORKBENCH
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
          title={`Computational Workbench: ${selectedStudy.id}`}
          description={selectedStudy.title}
          size="md"
          footer={
            <Button variant="secondary" onClick={() => setSelectedStudy(null)}>
              CLOSE
            </Button>
          }
        >
          <div className="flex flex-col gap-3 text-xs text-white/80">
            <p><strong>Dataset:</strong> {selectedStudy.datasetName} ({selectedStudy.datasetSize})</p>
            <p><strong>Syntax File:</strong> {selectedStudy.syntaxName}</p>
            <p><strong>Methodology:</strong> {selectedStudy.method}</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
