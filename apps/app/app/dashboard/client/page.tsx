import React, { Suspense } from "react";
import type { Metadata } from "next";
import { getProjects } from "@/features/projects/actions";
import { getClientProfile } from "@/features/client-profile/actions";
import { ClientDashboardClient } from "./ClientDashboardClient";
import { LoadingState } from "@repo/ui";

export const metadata: Metadata = {
  title: "Client Portal | JAXIS StatLab",
  description:
    "Track your research progress, message your assigned statistician, and download defense-ready statistical packages.",
};

export const dynamic = "force-dynamic";

export default async function ClientDashboardPage() {
  const [projRes, profile] = await Promise.all([
    getProjects(),
    getClientProfile(),
  ]);

  const initialProjects = projRes.success && projRes.data ? projRes.data : [];
  const initialIsProfileComplete = Boolean(
    profile && profile.institutionSchool && profile.contactNumber
  );

  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center py-24">
          <LoadingState variant="page" label="Loading workspace..." />
        </div>
      }
    >
      <ClientDashboardClient
        initialProjects={initialProjects}
        initialIsProfileComplete={initialIsProfileComplete}
      />
    </Suspense>
  );
}
