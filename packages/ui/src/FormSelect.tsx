"use client";

import React from "react";
import { IconChevronDown, IconAlertTriangle } from "@tabler/icons-react";
import { Label } from "./Label";
import { cn } from "./utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helper?: string;
  placeholder?: string;
  monoLabel?: boolean;
  containerClassName?: string;
}

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  (
    {
      label,
      options,
      error,
      helper,
      placeholder,
      monoLabel = false,
      id,
      required,
      className = "",
      containerClassName = "",
      ...props
    },
    ref
  ) => {
    const selectId = id ?? (label ? label.toLowerCase().replace(/[^a-z0-9]/g, "-") : undefined);

    return (
      <div className={cn("flex flex-col w-full", containerClassName)}>
        {label && (
          <div className="flex items-center justify-between px-0.5 mb-2">
            <Label
              htmlFor={selectId}
              variant={monoLabel ? "mono" : "default"}
              required={required}
            >
              {label}
            </Label>
          </div>
        )}

        <div className="relative flex items-center w-full">
          <select
            ref={ref}
            id={selectId}
            required={required}
            className={cn(
              "w-full h-11 sm:h-12 px-3.5 sm:px-4 pr-10 text-sm rounded-[2px] text-white bg-[#011C38] border border-white/12 hover:border-white/20 focus:border-[#38BDF8] focus:outline-none focus:ring-1 focus:ring-[#38BDF8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-sans box-border appearance-none cursor-pointer",
              error && "!border-[#EF4444] focus:!border-[#EF4444] focus:!ring-[#EF4444]",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="bg-[#011C38] text-white/40">
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className="bg-[#01162E] text-white"
              >
                {opt.label}
              </option>
            ))}
          </select>

          {/* Sleek custom chevron */}
          <div className="absolute right-3.5 pointer-events-none flex items-center justify-center text-white/40">
            <IconChevronDown size={16} stroke={1.5} />
          </div>
        </div>

        {error ? (
          <div className="flex items-center gap-1.5 px-0.5 mt-1.5">
            <IconAlertTriangle size={13} stroke={2} className="text-[#EF4444] shrink-0" />
            <span className="text-xs text-[#EF4444] font-mono leading-relaxed">
              {error}
            </span>
          </div>
        ) : helper ? (
          <span className="text-xs text-white/45 font-sans leading-relaxed px-0.5 mt-1.5 block">
            {helper}
          </span>
        ) : null}
      </div>
    );
  }
);
FormSelect.displayName = "FormSelect";
