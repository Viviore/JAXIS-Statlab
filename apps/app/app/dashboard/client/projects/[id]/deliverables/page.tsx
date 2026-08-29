import React from "react";
import { notFound } from "next/navigation";
import { getClientDeliverables } from "@/features/deliverables/actions";
import { ClientDeliverablesDesk } from "@/features/deliverables/components/ClientDeliverablesDesk";

interface ClientDeliverablesPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientDeliverablesPage({ params }: ClientDeliverablesPageProps) {
  const { id } = await params;

  try {
    const data = await getClientDeliverables(id);
    return <ClientDeliverablesDesk data={data} />;
  } catch (err: unknown) {
    console.error("Failed to load client deliverables desk:", err);
    notFound();
  }
}
