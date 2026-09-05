import React from "react";
import { LoadingState } from "@repo/ui";

export default function DashboardLoading() {
  return (
    <div className="flex-1 w-full min-h-full flex items-center justify-center animate-content-fade my-auto">
      <LoadingState
        variant="page"
        label="Loading workspace..."
        description="Please wait while we load your dashboard"
      />
    </div>
  );
}
