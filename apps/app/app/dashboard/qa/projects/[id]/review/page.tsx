import React from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getQaInspectionDesk } from "@/features/qa/actions";
import { QAEvaluationDesk } from "@/features/qa/components/QAEvaluationDesk";

interface QAReviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function QAReviewPage({ params }: QAReviewPageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  const { id } = await params;
  const res = await getQaInspectionDesk(id);

  if (!res.success) {
    if (res.error.code === "PROJECT_NOT_FOUND") {
      notFound();
    }
    redirect("/dashboard/qa");
  }

  return <QAEvaluationDesk data={res.data} />;
}
