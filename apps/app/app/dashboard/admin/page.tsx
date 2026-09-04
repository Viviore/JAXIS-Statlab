import React from "react";
import type { Metadata } from "next";
import { projectService } from "@/features/projects/services/project.service";
import { getFinanceReceivablesSummary } from "@/features/payments/actions";
import { AdminDashboardClient } from "./AdminDashboardClient";

export const metadata: Metadata = {
  title: "Admin Overview | JAXIS StatLab",
  description: "Manage study requests, expert assignments, staff, and project progress.",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [initialProjects, financeRes] = await Promise.all([
    projectService.getProjects(),
    getFinanceReceivablesSummary(),
  ]);

  return (
    <AdminDashboardClient
      initialProjects={initialProjects}
      initialFinanceData={financeRes.success && financeRes.data ? financeRes.data : null}
    />
  );
}
