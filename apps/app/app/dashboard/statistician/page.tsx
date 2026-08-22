"use client";

import React, { useState } from "react";
import { PageHeader, Card, StatusBadge, Button, Modal, KpiCard } from "@repo/ui";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { Project } from "@/types/project";

import Link from "next/link";

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
        actions={
          <Link href="/dashboard/statistician/profile">
            <Button variant="outline" size="sm">
              SPECIALIZATION PROFILE
            </Button>
          </Link>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">
        <KpiCard
          label="Assigned Analyses"
          value={3}
          variant="sky"
          description="Active computation pipelines"
        />

        <KpiCard
          label="Pending QA Feedback"
          value={2}
          variant="amber"
          description="Under peer verification"
        />

        <KpiCard
          label="Approved Deliverables"
          value={18}
          variant="emerald"
          description="100% Defense Pass Rate"
        />
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
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-[120px] whitespace-nowrap">Study ID</th>
                <th>Project Title</th>
                <th className="w-[200px] whitespace-nowrap">Methodology</th>
                <th className="w-[170px] whitespace-nowrap">Status</th>
                <th className="w-[150px] text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.slice(0, 4).map((study) => (
                <tr key={study.id} className="group">
                  <td className="font-mono text-xs text-[#CC6600] font-semibold whitespace-nowrap">
                    {study.id}
                  </td>
                  <td className="text-white font-medium text-sm">
                    <span className="line-clamp-1 group-hover:text-[#CC6600] transition-colors" title={study.title}>
                      {study.title}
                    </span>
                  </td>
                  <td className="text-slate-300 font-sans text-xs whitespace-nowrap truncate max-w-[200px]">
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
                      className="px-3.5 py-1 font-mono text-xs whitespace-nowrap tracking-wider"
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
          <div className="flex flex-col gap-4 text-xs font-sans text-white/80">
            <div className="p-5 sm:px-7 rounded-[3px] bg-white/[0.03] border border-white/[0.08] flex flex-col gap-3.5">
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[0.6875rem] text-white/40 uppercase tracking-wider">Dataset Package:</span>
                <p className="text-sm font-semibold text-white">{selectedStudy.datasetName || "Dataset_Archived.csv"} ({selectedStudy.datasetSize || "2.4 MB"})</p>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[0.6875rem] text-white/40 uppercase tracking-wider">Syntax &amp; Model Script:</span>
                <p className="text-sm text-slate-200">{selectedStudy.syntaxName || "Syntax_Analysis_Script.R"}</p>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[0.6875rem] text-white/40 uppercase tracking-wider">Methodology:</span>
                <p className="text-sm text-slate-200">{selectedStudy.method}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
