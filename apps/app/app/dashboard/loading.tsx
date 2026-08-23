import React from "react";
import { LoadingState } from "@repo/ui";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-7xl mx-auto py-16 animate-content-fade">
      <LoadingState
        variant="page"
        label="Loading workspace..."
        description="Please wait while we load your dashboard"
      />
    </div>
  );
}
