import React from "react";
import { notFound } from "next/navigation";
import { getAdminDeliverablesDesk } from "@/features/deliverables/actions";
import { AdminDeliverablesDesk } from "@/features/deliverables/components/AdminDeliverablesDesk";

interface AdminDeliverablesPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminDeliverablesPage({ params }: AdminDeliverablesPageProps) {
  const { id } = await params;

  try {
    const data = await getAdminDeliverablesDesk(id);
    return <AdminDeliverablesDesk data={data} />;
  } catch (err: unknown) {
    console.error("Failed to load admin deliverables desk:", err);
    notFound();
  }
}
