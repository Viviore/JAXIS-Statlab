"use client";

import React, { useState } from "react";
import { PageHeader, Card, StatusBadge, Button, Modal, KpiCard } from "@repo/ui";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { Project } from "@/types/project";

export default function FinanceDashboardPage() {
  const [selectedStudy, setSelectedStudy] = useState<Project | null>(null);

  const { projects } = useProjects({
    initialLoading: false,
  });

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label="Total Escrow Vault"
          value="$64,500"
          variant="emerald"
          description="Secured in institutional vaults"
        />

        <KpiCard
          label="Pending Release"
          value="$18,200"
          variant="amber"
          description="Awaiting QA sign-off"
        />

        <KpiCard
          label="Disbursed This Month"
          value="$46,300"
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

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left border-collapse font-sans text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-xs font-mono text-white/50 uppercase">
                <th className="py-3 px-4">Study ID</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">QA Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {projects.slice(0, 4).map((study) => (
                <tr key={study.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-mono text-xs text-[#CC6600] font-semibold">{study.id}</td>
                  <td className="py-3.5 px-4 text-white font-medium">{study.client}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-emerald-400 font-semibold">$3,450.00</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={study.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedStudy(study)}
                    >
                      AUDIT ESCROW
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
