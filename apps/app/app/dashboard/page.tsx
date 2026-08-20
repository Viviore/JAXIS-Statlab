import React from "react";
import { PageHeader, Card, StatusBadge, Button, Alert } from "@repo/ui";

export default function DashboardOverviewPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <PageHeader
        title="Command & Control Overview"
        description="JAXIS StatLab Foundation Dashboard Workspace — Infrastructure, RBAC Desks, and Operations Overview."
        breadcrumbs={[{ label: "JAXIS" }, { label: "Dashboard", href: "/dashboard" }, { label: "Overview" }]}
        badge={<StatusBadge status="ACTIVE" pulse />}
        actions={
          <>
            <Button variant="ghost" size="sm">
              Documentation
            </Button>
            <Button variant="primary" size="sm">
              New Project Intake
            </Button>
          </>
        }
      />

      <Alert variant="info" title="Foundation Module Ready">
        Infrastructure clients (Supabase, Cloudflare R2, Resend, Trigger.dev) and @repo/ui shared component primitives are loaded and passing all quality checks.
      </Alert>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="kpi">
          <span className="text-xs font-mono text-white/50 uppercase tracking-wider">Active Projects</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold font-mono text-white">24</span>
            <StatusBadge status="IN_PROGRESS" />
          </div>
        </Card>

        <Card variant="kpi">
          <span className="text-xs font-mono text-white/50 uppercase tracking-wider">Pending QA</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold font-mono text-white">7</span>
            <StatusBadge status="FOR_QA" />
          </div>
        </Card>

        <Card variant="kpi">
          <span className="text-xs font-mono text-white/50 uppercase tracking-wider">Awaiting Payment</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold font-mono text-white">4</span>
            <StatusBadge status="AWAITING_PAYMENT" />
          </div>
        </Card>

        <Card variant="kpi">
          <span className="text-xs font-mono text-white/50 uppercase tracking-wider">Completed Deliveries</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold font-mono text-white">142</span>
            <StatusBadge status="DELIVERED" />
          </div>
        </Card>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card header={<h3 className="text-sm font-semibold text-white">System Architecture Baseline</h3>}>
          <div className="flex flex-col gap-3 text-xs text-white/70">
            <div className="flex justify-between py-1.5 border-b border-white/5 font-mono">
              <span>Database Provider:</span>
              <span className="text-white">Supabase PostgreSQL (Port 6543 / 5432)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5 font-mono">
              <span>Blob Storage:</span>
              <span className="text-white">Cloudflare R2 (S3 API)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5 font-mono">
              <span>Transactional Email:</span>
              <span className="text-white">Resend API</span>
            </div>
            <div className="flex justify-between py-1.5 font-mono">
              <span>Background Jobs:</span>
              <span className="text-white">Trigger.dev Cloud</span>
            </div>
          </div>
        </Card>

        <Card header={<h3 className="text-sm font-semibold text-white">Next Implementation Steps</h3>}>
          <div className="flex flex-col gap-2 text-xs text-white/80">
            <p className="text-white/60 leading-relaxed">
              Module 00 foundation is complete. Next up is <strong className="text-white">Module 01 (Authentication & RBAC)</strong> to configure NextAuth.js v5 credentials provider, multi-role session tokens, and route protection middleware across all 6 stakeholder desks.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
