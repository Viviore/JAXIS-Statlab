"use client";

import React, { useState } from "react";
import { PageHeader, Card, StatusBadge, Button, Modal } from "@repo/ui";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { Project } from "@/types/project";

export default function ClientDashboardPage() {
  const [selectedStudy, setSelectedStudy] = useState<Project | null>(null);

  const { projects } = useProjects({
    initialLoading: false,
  });

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-16 w-full">
      <PageHeader
        title="Client Research Portal & Active Studies"
        description="Submit project intake questionnaires, track analysis progress, inspect QA verification seals, and download deliverable packages."
        breadcrumbs={[
          { label: "WORKSPACE", href: "/dashboard" },
          { label: "Client Portal" },
        ]}
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[2px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            RESEARCH DESK ACTIVE
          </span>
        }
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => alert("New Study Intake Form will launch.")}
          >
            + NEW PROJECT INTAKE
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex flex-col gap-1 p-5">
          <span className="text-xs font-mono text-white/50 uppercase tracking-wider">My Active Studies</span>
          <span className="text-3xl font-mono font-bold text-white">4</span>
          <span className="text-[0.688rem] text-emerald-400 mt-1 font-mono">● All milestones on schedule</span>
        </Card>

        <Card className="flex flex-col gap-1 p-5">
          <span className="text-xs font-mono text-white/50 uppercase tracking-wider">QA Verification Stage</span>
          <span className="text-3xl font-mono font-bold text-amber-400">2</span>
          <span className="text-[0.688rem] text-amber-400 mt-1 font-mono">● Dual-blind recalculation in progress</span>
        </Card>

        <Card className="flex flex-col gap-1 p-5">
          <span className="text-xs font-mono text-white/50 uppercase tracking-wider">Ready For Download</span>
          <span className="text-3xl font-mono font-bold text-sky-400">1</span>
          <span className="text-[0.688rem] text-sky-400 mt-1 font-mono">● Signed APA 7th report released</span>
        </Card>
      </div>

      {/* Studies Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Active Research Projects</h2>
            <p className="text-xs text-white/50">Real-time status of your commissioned statistical analyses</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-xs font-mono text-white/50 uppercase">
                <th className="py-3 px-4">Study ID</th>
                <th className="py-3 px-4">Title</th>
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
                      VIEW STUDY
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
          title={`Study Details: ${selectedStudy.id}`}
          description={selectedStudy.title}
          size="md"
          footer={
            <Button variant="secondary" onClick={() => setSelectedStudy(null)}>
              CLOSE
            </Button>
          }
        >
          <div className="flex flex-col gap-3 text-xs text-white/80">
            <p><strong>Methodology:</strong> {selectedStudy.method}</p>
            <p><strong>Assigned Statistician:</strong> {selectedStudy.statisticians || "Pending allocation"}</p>
            <p><strong>Institution:</strong> {selectedStudy.university}</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
