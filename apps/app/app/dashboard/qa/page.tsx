import React, { Suspense } from "react";
import type { Metadata } from "next";
import { getQaWorkload } from "@/features/assignments/actions";
import { getStaffSelfProfile } from "@/features/staff/actions";
import { QADashboardClient } from "./QADashboardClient";
import { LoadingState } from "@repo/ui";

export const metadata: Metadata = {
  title: "QA Review Desk | JAXIS StatLab",
  description:
    "Review study calculations, check formatting, and approve defense-ready packages for release.",
};

export const dynamic = "force-dynamic";

export default async function QALeadDashboardPage() {
  const [res, profileRes] = await Promise.all([
    getQaWorkload(),
    getStaffSelfProfile(),
  ]);

  const initialAssignments = res.success && res.data ? res.data : [];
  const initialProfileStatus = (profileRes.success && profileRes.data?.status) || "ACTIVE";
  const initialLeaveData =
    profileRes.success && profileRes.data
      ? {
          reason: (profileRes.data as { leaveReason?: string | null }).leaveReason,
          until: (profileRes.data as { leaveUntil?: string | null }).leaveUntil,
        }
      : null;

  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center py-24">
          <LoadingState variant="page" label="Loading QA review desk..." />
        </div>
      }
    >
      <QADashboardClient
        initialAssignments={initialAssignments}
        initialProfileStatus={initialProfileStatus}
        initialLeaveData={initialLeaveData}
      />
    </Suspense>
  );
}
