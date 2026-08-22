"use client";

import React from "react";
import { IconCheck } from "@tabler/icons-react";

export interface StepItem {
  id: number | string;
  title: string;
  subtitle?: string;
}

export interface StepperProps {
  steps: StepItem[];
  currentStep: number; // 1-indexed
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  className = "",
}) => {
  return (
    <nav
      aria-label="Submission Progress"
      className={`grid grid-cols-1 md:grid-cols-3 rounded-[2px] border border-white/[0.09] divide-y md:divide-y-0 md:divide-x divide-white/[0.08] backdrop-blur-md shadow-lg overflow-hidden ${className}`}
      style={{
        borderRadius: "2px",
        border: "1px solid rgba(255, 255, 255, 0.09)",
        backgroundColor: "rgba(1, 22, 46, 0.75)",
      }}
    >
      {steps.map((step, idx) => {
        const stepNumber = idx + 1;
        const isCompleted = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;
        const isClickable = isCompleted && Boolean(onStepClick);

        return (
          <button
            key={step.id}
            type="button"
            disabled={!isClickable}
            onClick={() => isClickable && onStepClick?.(stepNumber)}
            className={`relative flex flex-col justify-between text-left transition-all group min-h-[96px] ${
              isClickable
                ? "cursor-pointer hover:bg-white/[0.03]"
                : "cursor-default"
            } ${isActive ? "bg-white/[0.03]" : ""}`}
            style={{
              padding: "1.25rem 1.5rem",
              boxSizing: "border-box",
            }}
          >
            {/* Top Row: Index Badge + Status Indicator */}
            <div className="flex items-center justify-between w-full mb-3">
              <div
                className={`w-7 h-7 rounded-[2px] font-mono text-xs font-bold flex items-center justify-center border transition-colors ${
                  isCompleted
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : isActive
                    ? "bg-[#CC6600]/20 text-[#CC6600] border-[#CC6600]/40"
                    : "bg-white/[0.03] text-white/30 border-white/[0.08]"
                }`}
              >
                {isCompleted ? (
                  <IconCheck size={14} stroke={2.5} />
                ) : (
                  <span>{String(stepNumber).padStart(2, "0")}</span>
                )}
              </div>

              {/* Status Badge */}
              {isCompleted ? (
                <span className="text-[0.625rem] font-mono text-emerald-400 font-semibold uppercase px-2 py-0.5 rounded-[2px] bg-emerald-500/10 border border-emerald-500/20">
                  Done
                </span>
              ) : isActive ? (
                <span className="text-[0.625rem] font-mono text-amber-400 font-semibold uppercase px-2 py-0.5 rounded-[2px] bg-[#CC6600]/20 border border-[#CC6600]/40 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#CC6600] animate-pulse" />
                  Active
                </span>
              ) : (
                <span className="text-[0.625rem] font-mono text-white/30 uppercase px-2 py-0.5 rounded-[2px] bg-white/[0.02] border border-white/[0.05]">
                  Stage {stepNumber}
                </span>
              )}
            </div>

            {/* Bottom Content: Title + Subtitle */}
            <div className="flex flex-col gap-1 w-full">
              <span
                className={`font-mono text-xs font-bold uppercase tracking-wider ${
                  isActive
                    ? "text-white"
                    : isCompleted
                    ? "text-white/80 group-hover:text-white"
                    : "text-white/40"
                }`}
              >
                {step.title.replace(/^\d+\.\s*/, "")}
              </span>

              {step.subtitle && (
                <p
                  className={`text-xs font-sans leading-relaxed ${
                    isActive
                      ? "text-white/70"
                      : isCompleted
                      ? "text-white/50"
                      : "text-white/30"
                  }`}
                >
                  {step.subtitle}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </nav>
  );
};
