"use client";

import React from "react";
import { Skeleton } from "./Skeleton";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  emptyState?: React.ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
  skeletonRowCount?: number;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  loading = false,
  emptyState,
  onRowClick,
  className = "",
  skeletonRowCount = 5,
}: DataTableProps<T>): React.ReactElement {
  return (
    <div className={`w-full overflow-x-auto border border-white/10 rounded-[2px] bg-[#012E57] ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/10 bg-[#010114]/60">
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={`py-4 px-5 text-xs font-mono font-semibold text-white/70 tracking-wider uppercase select-none whitespace-nowrap ${
                  col.align === "center"
                    ? "text-center"
                    : col.align === "right"
                    ? "text-right"
                    : "text-left"
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-sm text-white/90">
          {loading ? (
            Array.from({ length: skeletonRowCount }).map((_, rIdx) => (
              <tr key={rIdx} className="animate-pulse">
                {columns.map((col) => (
                  <td key={col.key} className="py-5 px-5 align-middle">
                    <Skeleton height={16} className="bg-white/10" />
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-16 px-5 text-center text-white/40">
                {emptyState ?? (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-sm font-medium">No records found</p>
                    <p className="text-xs text-white/40">There is no data to display at this time.</p>
                  </div>
                )}
              </td>
            </tr>
          ) : (
            rows.map((row, rIdx) => (
              <tr
                key={(row.id as string) ?? rIdx}
                onClick={() => onRowClick?.(row)}
                className={`transition-colors hover:bg-white/[0.03] ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
              >
                {columns.map((col) => {
                  const content = col.render ? col.render(row) : (row[col.key] as React.ReactNode);
                  return (
                    <td
                      key={col.key}
                      className={`py-5 px-5 align-middle ${
                        col.align === "center"
                          ? "text-center"
                          : col.align === "right"
                          ? "text-right"
                          : "text-left"
                      }`}
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
