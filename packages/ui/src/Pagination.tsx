"use client";

import React, { useMemo } from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react";
import { cn } from "./utils";

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
  showPageSizeSelector?: boolean;
  itemLabel?: string;
}

export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  className = "",
  showPageSizeSelector = true,
  itemLabel = "entries",
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  // Generate pagination range with smart ellipsis
  const paginationRange = useMemo(() => {
    const delta = 1; // Number of pages to show around current page
    const range: (number | "...")[] = [];

    const left = Math.max(2, safeCurrentPage - delta);
    const right = Math.min(totalPages - 1, safeCurrentPage + delta);

    range.push(1);

    if (left > 2) {
      range.push("...");
    }

    for (let i = left; i <= right; i++) {
      range.push(i);
    }

    if (right < totalPages - 1) {
      range.push("...");
    }

    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  }, [safeCurrentPage, totalPages]);

  if (totalItems === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-white/10 bg-[#01142B]/70 select-none",
        className
      )}
    >
      {/* Left Info & Page Size */}
      <div className="flex flex-wrap items-center gap-3 text-xs font-sans text-white/50 w-full sm:w-auto justify-between sm:justify-start">
        <span>
          Showing{" "}
          <span className="font-mono font-semibold text-white">
            {totalItems === 0 ? 0 : startIndex + 1}
          </span>{" "}
          to{" "}
          <span className="font-mono font-semibold text-white">{endIndex}</span>{" "}
          of{" "}
          <span className="font-mono font-semibold text-white">{totalItems}</span>{" "}
          {itemLabel}
        </span>

        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
            <span className="text-white/40">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                onPageSizeChange(newSize);
                onPageChange(1);
              }}
              className="bg-[#011B38] text-white border border-white/10 rounded-[2px] px-2 py-0.5 text-xs font-mono focus:outline-none focus:border-[#CC6600] transition-colors cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-[#01142B] text-white">
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right Page Controls */}
      <div className="flex items-center gap-1 w-full sm:w-auto justify-end">
        {/* First Page */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={safeCurrentPage === 1}
          title="First Page"
          className="h-7 w-7 flex items-center justify-center rounded-[2px] border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <IconChevronsLeft size={13} stroke={2} />
        </button>

        {/* Previous Page */}
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, safeCurrentPage - 1))}
          disabled={safeCurrentPage === 1}
          title="Previous Page"
          className="h-7 px-2 flex items-center gap-1 rounded-[2px] border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:pointer-events-none transition-colors text-xs font-sans font-medium"
        >
          <IconChevronLeft size={13} stroke={2} />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Numbered Page Buttons */}
        <div className="flex items-center gap-1 mx-1">
          {paginationRange.map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="h-7 w-5 flex items-center justify-center text-xs font-mono text-white/30"
                >
                  ...
                </span>
              );
            }

            const isCurrent = page === safeCurrentPage;
            return (
              <button
                key={`page-${page}`}
                type="button"
                onClick={() => onPageChange(page)}
                className={cn(
                  "h-7 min-w-[1.75rem] px-1.5 flex items-center justify-center text-xs font-mono font-medium rounded-[2px] transition-colors",
                  isCurrent
                    ? "bg-[#CC6600] text-white font-bold border border-[#CC6600] shadow-sm"
                    : "border border-white/10 text-white/70 hover:text-white hover:bg-white/[0.06]"
                )}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, safeCurrentPage + 1))}
          disabled={safeCurrentPage === totalPages}
          title="Next Page"
          className="h-7 px-2 flex items-center gap-1 rounded-[2px] border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:pointer-events-none transition-colors text-xs font-sans font-medium"
        >
          <span className="hidden sm:inline">Next</span>
          <IconChevronRight size={13} stroke={2} />
        </button>

        {/* Last Page */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={safeCurrentPage === totalPages}
          title="Last Page"
          className="h-7 w-7 flex items-center justify-center rounded-[2px] border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <IconChevronsRight size={13} stroke={2} />
        </button>
      </div>
    </div>
  );
}
