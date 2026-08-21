"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader, Card, StatusBadge, Button, Modal, KpiCard } from "@repo/ui";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { Project } from "@/types/project";
import { getClientProfile } from "@/features/client-profile/actions";

export default function ClientDashboardPage() {
  const [selectedStudy, setSelectedStudy] = useState<Project | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);

  const { projects } = useProjects({
    initialLoading: false,
  });

  useEffect(() => {
    async function checkProfile() {
      const profile = await getClientProfile();
      if (profile && profile.institutionSchool && profile.contactNumber) {
        setIsProfileComplete(true);
      } else {
        setIsProfileComplete(false);
      }
    }
    checkProfile();
  }, []);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-16 w-full">
      <PageHeader
        title="Client Research Portal & Active Studies"
        description="Submit project intake questionnaires, track analysis progress, inspect QA verification seals, and download deliverable packages."
        breadcrumbs={[
          { label: "WORKSPACE", href: "/dashboard" },
          { label: "Client Portal" },
        ]}
        actions={
          <Link href="/dashboard/client/projects/new">
            <Button
              variant="primary"
              size="sm"
            >
              + NEW PROJECT INTAKE
            </Button>
          </Link>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KpiCard
          label="Profile Status"
          value={isProfileComplete === null ? "CHECKING..." : isProfileComplete ? "100% COMPLETE" : "INCOMPLETE"}
          variant={isProfileComplete ? "emerald" : "orange"}
          description={isProfileComplete ? "Institutional verified" : "Action required →"}
          href="/dashboard/client/profile"
        />

        <KpiCard
          label="Active Studies"
          value={4}
          variant="default"
          description="All milestones on schedule"
          href="/dashboard/client/projects"
        />

        <KpiCard
          label="QA Stage"
          value={2}
          variant="amber"
          description="Dual-blind review pending"
        />

        <KpiCard
          label="Downloads"
          value={1}
          variant="sky"
          description="APA 7th report released"
        />
      </div>

      {/* Studies Table */}
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
              Active Research Projects
            </h2>
            <p className="text-xs text-white/50 mt-1.5 font-sans leading-relaxed">
              Real-time status of your commissioned statistical analyses
            </p>
          </div>
        </div>

        {/* ─ Table ─ */}
        <div style={{ padding: '0 1.75rem 1.75rem 1.75rem' }}>
          <div className="w-full overflow-x-auto rounded-[3px]" style={{ border: '1px solid rgba(255, 255, 255, 0.07)' }}>
            <table className="w-full min-w-[620px] text-left border-collapse font-sans text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.015] text-[0.65rem] font-mono text-white/45 uppercase tracking-widest">
                  <th className="py-3.5 px-5 whitespace-nowrap font-medium">Study ID</th>
                  <th className="py-3.5 px-4 whitespace-nowrap font-medium">Title</th>
                  <th className="py-3.5 px-4 whitespace-nowrap font-medium">Methodology</th>
                  <th className="py-3.5 px-4 whitespace-nowrap font-medium">Status</th>
                  <th className="py-3.5 px-5 text-right whitespace-nowrap font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {projects.slice(0, 4).map((study) => (
                  <tr key={study.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-4 px-5 align-middle font-mono text-xs text-[#CC6600] font-semibold whitespace-nowrap">{study.id}</td>
                    <td className="py-4 px-4 align-middle text-white font-medium text-xs">{study.title}</td>
                    <td className="py-4 px-4 align-middle font-mono text-[0.65rem] text-white/60 uppercase">{study.method}</td>
                    <td className="py-4 px-4 align-middle whitespace-nowrap">
                      <StatusBadge status={study.status} />
                    </td>
                    <td className="py-4 px-5 align-middle text-right whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedStudy(study)}
                        className="text-[0.65rem] py-1.5 px-3 h-auto whitespace-nowrap font-mono tracking-wider"
                      >
                        VIEW STUDY
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
