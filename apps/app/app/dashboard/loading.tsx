import React from "react";
import { Skeleton, KpiCardSkeleton, TableRowSkeleton, Card } from "@repo/ui";

export default function DashboardLoading() {
  return (
    <div
      className="flex flex-col gap-9 max-w-7xl mx-auto pb-16 w-full animate-pulse"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2.25rem",
        maxWidth: "80rem",
        marginLeft: "auto",
        marginRight: "auto",
        paddingBottom: "4rem",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* ── Breadcrumb & Page Header Skeleton ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="flex flex-col gap-2 max-w-xl">
          <div className="flex items-center gap-2">
            <Skeleton width={80} height={12} />
            <span className="text-white/20">/</span>
            <Skeleton width={110} height={12} />
          </div>
          <div className="flex items-center gap-3 mt-1">
            <Skeleton width={320} height={28} />
            <Skeleton width={140} height={22} className="rounded-full" />
          </div>
          <Skeleton width="100%" height={14} className="mt-1" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton width={150} height={36} />
          <Skeleton width={160} height={36} />
        </div>
      </div>

      {/* ── 4 KPI Cards Skeleton ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
        <KpiCardSkeleton />
        <KpiCardSkeleton />
        <KpiCardSkeleton />
        <KpiCardSkeleton />
      </div>

      {/* ── Active Studies Table Skeleton ── */}
      <Card
        header={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <Skeleton width={260} height={18} />
              <Skeleton width={380} height={14} />
            </div>
            <Skeleton width={140} height={32} />
          </div>
        }
      >
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] text-xs font-mono uppercase tracking-wider text-white/45 bg-white/[0.02]">
                <th className="py-3.5 pr-6 pl-1" style={{ width: "30%" }}>Study ID &amp; Title</th>
                <th className="py-3.5 px-3" style={{ width: "17%" }}>Client &amp; Field</th>
                <th className="py-3.5 px-3" style={{ width: "21%" }}>Methodology</th>
                <th className="py-3.5 px-3" style={{ width: "14%" }}>Statistician</th>
                <th className="py-3.5 px-2" style={{ width: "9%" }}>QA Gate</th>
                <th className="py-3.5 px-2" style={{ width: "9%" }}>Payment</th>
                <th className="py-3.5 pl-2 pr-1 text-right" style={{ width: "10%" }}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
