"use client";

import React, { useState } from "react";
import { PageHeader, Card, StatusBadge, Button, Modal, KpiCard, DataTable, Column } from "@repo/ui";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { Project } from "@/types/project";

export default function FinanceDashboardPage() {
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
      header: "Client / University",
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
      key: "amount",
      header: "Escrow Amount",
      width: "140px",
      render: () => (
        <span className="font-mono text-xs text-emerald-400 font-semibold whitespace-nowrap">
          ₱18,500.00
        </span>
      ),
    },
    {
      key: "status",
      header: "QA Status",
      width: "170px",
      render: (study) => <StatusBadge status={study.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      width: "140px",
      align: "right",
      render: (study) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedStudy(study)}
          className="py-1 px-3 whitespace-nowrap font-mono text-xs tracking-wider"
        >
          AUDIT ESCROW
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-16 w-full">
      <PageHeader
        title="Finance Escrow & Settlement Console"
        description="Monitor institutional milestone escrow balances, authorize verified payout releases, and review Stripe payment intents."
        breadcrumbs={[
          { label: "WORKSPACE", href: "/dashboard" },
          { label: "Finance Console" },
        ]}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">
        <KpiCard
          label="Total Escrow Vault"
          value="₱645,000"
          variant="emerald"
          description="Secured in institutional vaults"
        />

        <KpiCard
          label="Pending Release"
          value="₱182,000"
          variant="amber"
          description="Awaiting QA sign-off"
        />

        <KpiCard
          label="Disbursed This Month"
          value="₱463,000"
          variant="sky"
          description="100% milestone fulfillment"
        />
      </div>

      {/* Escrow Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Milestone Payment Releases</h2>
            <p className="text-xs text-white/50">Authorize escrow disbursement upon verified deliverable approval</p>
          </div>
        </div>

        <DataTable<Project>
          columns={columns}
          rows={projects.slice(0, 4)}
          loading={isLoading}
          className="border-0 rounded-none bg-transparent"
        />
      </Card>

      {/* Modal */}
      {selectedStudy && (
        <Modal
          open={!!selectedStudy}
          onClose={() => setSelectedStudy(null)}
          title={`Escrow Audit: ${selectedStudy.id}`}
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
            <p><strong>Payment Status:</strong> {selectedStudy.paymentStatus}</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
