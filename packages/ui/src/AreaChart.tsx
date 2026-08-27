"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts";
import { cn } from "./utils";

export interface AreaChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: Record<string, unknown>[];
  index: string;
  categories: string[];
  colors?: string[];
  valueFormatter?: (value: number) => string;
  yAxisWidth?: number;
  showLegend?: boolean;
  showGridLines?: boolean;
  height?: number | string;
}

const defaultColors = ["#CC6600", "#38BDF8", "#10B981", "#F59E0B", "#EF4444"];

export function AreaChart({
  data = [],
  index,
  categories = [],
  colors = defaultColors,
  valueFormatter = (value: number) => `${value}`,
  yAxisWidth = 45,
  showLegend = true,
  showGridLines = true,
  height = 280,
  className,
  ...props
}: AreaChartProps) {
  return (
    <div className={cn("w-full space-y-3", className)} {...props}>
      {showLegend && (
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          {categories.map((cat, idx) => (
            <div key={cat} className="flex items-center gap-1.5 text-white/80">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: colors[idx % colors.length] }}
              />
              <span>{cat}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ height, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsAreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            {showGridLines && (
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" vertical={false} />
            )}
            <XAxis
              dataKey={index}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 11, fontFamily: "monospace" }}
              dy={8}
            />
            <YAxis
              width={yAxisWidth}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 11, fontFamily: "monospace" }}
              tickFormatter={valueFormatter}
            />
            <RechartsTooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                return (
                  <div className="rounded-[2px] border border-white/15 bg-[#01142B] p-3 shadow-xl backdrop-blur-md">
                    {label && <p className="text-xs font-mono font-bold text-white/70 mb-1.5">{label}</p>}
                    {payload.map((entry, i: number) => {
                      const item = entry as { color?: string; name?: string; value?: number | string };
                      return (
                        <div key={i} className="flex items-center justify-between gap-4 text-xs font-mono py-0.5">
                          <span className="flex items-center gap-1.5 text-white/80">
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            {item.name}
                          </span>
                          <span className="font-bold text-white">
                            {valueFormatter(Number(item.value ?? 0))}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              }}
            />
            <defs>
              {categories.map((cat, idx) => {
                const color = colors[idx % colors.length];
                const gradId = `color-${cat.replace(/\s+/g, "-")}-${idx}`;
                return (
                  <linearGradient key={gradId} id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                );
              })}
            </defs>
            {categories.map((cat, idx) => {
              const color = colors[idx % colors.length];
              const gradId = `color-${cat.replace(/\s+/g, "-")}-${idx}`;
              return (
                <Area
                  key={cat}
                  type="monotone"
                  dataKey={cat}
                  stroke={color}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#${gradId})`}
                />
              );
            })}
          </RechartsAreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
