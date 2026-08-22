"use client";

import React from "react";
import { IconEye, IconEyeOff, IconAlertTriangle } from "@tabler/icons-react";

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelRightAction?: React.ReactNode;
  error?: string;
  isInvalid?: boolean;
  errorVariant?: "text" | "banner";
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  monoLabel?: boolean;
  variant?: "default" | "terminal" | "auth";
  containerClassName?: string;
}

export function EyeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return <IconEye size={16} stroke={1.5} className={className} />;
}

export function EyeOffIcon({ className = "w-4 h-4" }: { className?: string }) {
  return <IconEyeOff size={16} stroke={1.5} className={className} />;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      labelRightAction,
      error,
      isInvalid = false,
      errorVariant = "text",
      helper,
      leftIcon,
      rightIcon,
      monoLabel = false,
      variant = "default",
      id,
      required,
      className = "",
      containerClassName = "",
      ...props
    },
    ref
  ) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/[^a-z0-9]/g, "-") : undefined);
    const hasError = Boolean(error) || Boolean(isInvalid);

    const variantStyles = {
      default: "bg-[#011C38] border-white/12 focus:border-[#CC6600]",
      terminal: "bg-[#010E21] border-white/15 focus:border-[#CC6600] font-mono",
      auth: "bg-[#01142B] border-white/15 focus:border-[#CC6600]",
    };

    return (
      <div className={`flex flex-col w-full ${containerClassName}`}>
        {/* Label Row with explicit bottom spacing */}
        {(label || labelRightAction) && (
          <div
            className="flex items-center justify-between px-0.5"
            style={{ marginBottom: "0.5rem" }}
          >
            {label && (
              <label
                htmlFor={inputId}
                className={`text-xs select-none ${
                  monoLabel
                    ? "font-mono uppercase tracking-wider font-semibold text-slate-200"
                    : "font-sans text-white/80 font-medium"
                }`}
                style={{ fontSize: "0.75rem", fontWeight: 600, color: monoLabel ? "#E2E8F0" : undefined }}
              >
                {label}{required && <> <span style={{ color: "#CC6600" }}>*</span></>}
              </label>
            )}
            {labelRightAction && (
              <div className="text-xs">{labelRightAction}</div>
            )}
          </div>
        )}

        {/* Input Field with optional left/right icons */}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center justify-center text-white/40 pointer-events-none z-10">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            required={required}
            className={`w-full h-12 px-4 text-sm rounded-[2px] text-white placeholder:text-slate-500 focus:outline-none focus:ring-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-sans box-border border [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-90 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 ${
              variantStyles[variant]
            } ${
              hasError
                ? "!border-[#EF4444] focus:!border-[#EF4444]"
                : ""
            } ${leftIcon ? "!pl-11" : ""} ${rightIcon ? "!pr-11" : ""} ${className}`}
            style={{
              height: "3rem",
              paddingLeft: leftIcon ? "2.75rem" : "1rem",
              paddingRight: rightIcon ? "2.75rem" : "1rem",
              boxSizing: "border-box",
              outline: "none",
              boxShadow: "none",
              ...props.style,
            }}
            {...props}
          />



          {rightIcon && (
            <div className="absolute right-3.5 flex items-center justify-center text-white/40 z-10">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Error or Helper text with generous spacing */}
        {error ? (
          errorVariant === "banner" ? (
            <div
              className="flex items-start gap-2.5 rounded-[2px] bg-[#EF4444]/10 border border-[#EF4444]/35 text-[#FCA5A5] text-xs font-sans leading-relaxed"
              style={{
                marginTop: "0.625rem",
                padding: "0.625rem 0.875rem",
                lineHeight: "1.45",
                borderRadius: "2px",
                borderLeft: "3px solid #EF4444",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.625rem",
                boxSizing: "border-box",
              }}
            >
              <div
                className="w-5 h-5 rounded-[2px] bg-[#EF4444]/20 border border-[#EF4444]/40 flex items-center justify-center text-[#EF4444] shrink-0 mt-0.5"
                style={{ width: "1.25rem", height: "1.25rem", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "2px", flexShrink: 0 }}
              >
                <IconAlertTriangle size={12} stroke={2} />
              </div>
              <span className="font-medium text-white/90">{error}</span>
            </div>
          ) : (
            <div
              className="flex items-center gap-1.5 px-0.5"
              style={{ marginTop: "0.375rem", display: "flex", alignItems: "center", gap: "0.375rem" }}
            >
              <IconAlertTriangle size={13} stroke={2} className="text-[#EF4444] shrink-0" style={{ color: "#EF4444", flexShrink: 0 }} />
              <span
                className="text-xs text-[#EF4444] font-mono leading-relaxed"
                style={{ fontSize: "0.75rem", color: "#EF4444" }}
              >
                {error}
              </span>
            </div>
          )
        ) : helper ? (
          <span
            className="text-xs text-white/45 font-sans leading-relaxed px-0.5"
            style={{ marginTop: "0.375rem", display: "block" }}
          >
            {helper}
          </span>
        ) : null}

      </div>
    );
  }
);

FormInput.displayName = "FormInput";

