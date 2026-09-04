import React from "react";
import type { Metadata } from "next";
import { getFinanceReceivablesSummary } from "@/features/payments/actions";
import { FinanceDashboardClient } from "./FinanceDashboardClient";

export const metadata: Metadata = {
  title: "Finance Overview | JAXIS StatLab",
  description: "Track client payments, downpayments, leave approvals, and payment channels.",
};

export const dynamic = "force-dynamic";

export default async function FinanceDashboardPage() {
  const res = await getFinanceReceivablesSummary();

  return (
    <FinanceDashboardClient
      initialData={res.success && res.data ? res.data : null}
    />
  );
}
