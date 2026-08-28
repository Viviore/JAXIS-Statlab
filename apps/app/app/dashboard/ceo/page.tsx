"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageHeader, Card, StatusBadge, Button, Modal, KpiCard, DataTable, Column } from "@repo/ui";
import { IconReceipt } from "@tabler/icons-react";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { Project } from "@/types/project";

export default function CEODashboardPage() {
  const [selectedStudy, setSelectedStudy] = useState<Project | null>(null);

  const { projects, isLoading } = useProjects({
    initialLoading: false,
  });

  const columns: Column<Project>[] = [
    {
      key: "id",
      header: "Study ID",
      width: "120px",
      render: (study) => (
        <span className="font-mono text-xs text-[#CC6600] font-semibold whitespace-nowrap">
          {study.id}
        </span>
      ),
    },
    {
      key: "client",
      header: "Institution / Client",
      render: (study) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-white font-medium group-hover:text-[#CC6600] transition-colors">
            {study.client}
          </span>
          <span className="text-white/40 text-xs font-mono">{study.university}</span>
        </div>
      ),
    },
    {
      key: "method",
      header: "Methodology",
      width: "220px",
      render: (study) => (
        <span className="font-mono text-xs text-white/60 whitespace-nowrap truncate max-w-[220px] block" title={study.method}>
          {study.method}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "170px",
      render: (study) => <StatusBadge status={study.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      width: "150px",
      align: "right",
      render: (study) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedStudy(study)}
          className="py-1 px-3 whitespace-nowrap font-mono text-xs tracking-wider"
        >
          EXECUTIVE AUDIT
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-16 w-full">
      <PageHeader
        title="Executive Intelligence & Macro Governance Desk"
        description="Executive visibility into institutional client retention, turnaround SLAs, revenue throughput, and cross-desk statistical integrity."
        breadcrumbs={[
          { label: "WORKSPACE", href: "/dashboard" },
          { label: "CEO Console" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/dashboard/ceo/payroll">
              <Button variant="primary" size="sm" className="gap-2 font-sans font-semibold cursor-pointer rounded-[2px]">
                <IconReceipt size={15} stroke={1.5} />
                <span>Executive Payroll Policy →</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        <KpiCard
          label="Gross Pipeline Value"
          value="₱1,425,000"
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

        <DataTable<Project>
          columns={columns}
          rows={projects}
          loading={isLoading}
          className="border-0 rounded-none bg-transparent"
        />
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
