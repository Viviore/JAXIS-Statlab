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
          <tr className="border-b border-white/10 bg-[#010114]/50">
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={`py-3 px-4 text-xs font-mono font-medium text-white/60 tracking-wider uppercase select-none ${
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
                  <td key={col.key} className="py-3.5 px-4">
                    <Skeleton height={14} className="bg-white/10" />
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-12 px-4 text-center text-white/40">
                {emptyState ?? (
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <p className="text-sm">No records found</p>
                    <p className="text-xs text-white/30">There is no data to display at this time.</p>
                  </div>
                )}
              </td>
            </tr>
          ) : (
            rows.map((row, rIdx) => (
              <tr
                key={(row.id as string) ?? rIdx}
                onClick={() => onRowClick?.(row)}
                className={`transition-colors hover:bg-white/5 ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
              >
                {columns.map((col) => {
                  const content = col.render ? col.render(row) : (row[col.key] as React.ReactNode);
                  return (
                    <td
                      key={col.key}
                      className={`py-3.5 px-4 ${
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
