import React from "react";
import { getAdminRevisionQueue } from "@/features/deliverables/actions";
import { AdminRevisionQueue } from "@/features/deliverables/components/AdminRevisionQueue";

export default async function AdminRevisionsPage() {
  const revisions = await getAdminRevisionQueue();
  return <AdminRevisionQueue revisions={revisions} />;
}
