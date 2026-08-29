import React from "react";
import { notFound } from "next/navigation";
import { getClientDeliverables } from "@/features/deliverables/actions";
import { ClientRevisionForm } from "@/features/deliverables/components/ClientRevisionForm";

interface ClientRevisionPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientRevisionPage({ params }: ClientRevisionPageProps) {
  const { id } = await params;

  try {
    const data = await getClientDeliverables(id);
    return <ClientRevisionForm data={data} />;
  } catch (err: unknown) {
    console.error("Failed to load client revision desk:", err);
    notFound();
  }
}
