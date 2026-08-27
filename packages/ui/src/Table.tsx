"use client";

import * as React from "react";
import { cn } from "./utils";

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  className?: string;
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn("w-full caption-bottom text-sm font-sans border-collapse", className)}
        {...props}
      />
    </div>
  )
);
Table.displayName = "Table";

export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  className?: string;
}

export const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn("[&_tr]:border-b border-white/10 bg-white/[0.02]", className)}
      {...props}
    />
  )
);
TableHeader.displayName = "TableHeader";

export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  className?: string;
}

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn("[&_tr:last-child]:border-0 divide-y divide-white/[0.06] text-sm text-white/90", className)}
      {...props}
    />
  )
);
TableBody.displayName = "TableBody";

export interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  className?: string;
}

export const TableFooter = React.forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={cn("border-t border-white/10 bg-white/[0.02] font-medium", className)}
      {...props}
    />
  )
);
TableFooter.displayName = "TableFooter";

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  className?: string;
}

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "border-b border-white/[0.06] transition-colors hover:bg-white/[0.03] data-[state=selected]:bg-white/[0.06]",
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = "TableRow";

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  className?: string;
}

export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "h-11 sm:h-12 px-4 sm:px-6 text-left align-middle font-mono text-xs font-semibold text-white/60 uppercase tracking-wider whitespace-nowrap select-none [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
);
TableHead.displayName = "TableHead";

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  className?: string;
}

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        "py-3.5 sm:py-4 px-4 sm:px-6 align-middle [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
);
TableCell.displayName = "TableCell";

export interface TableCaptionProps extends React.HTMLAttributes<HTMLTableCaptionElement> {
  className?: string;
}

export const TableCaption = React.forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  ({ className, ...props }, ref) => (
    <caption
      ref={ref}
      className={cn("mt-4 text-xs text-white/40 font-mono", className)}
      {...props}
    />
  )
);
TableCaption.displayName = "TableCaption";
