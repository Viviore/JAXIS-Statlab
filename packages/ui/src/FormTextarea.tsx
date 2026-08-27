"use client";

import React from "react";
import { IconAlertTriangle } from "@tabler/icons-react";
import { Label } from "./Label";
import { Textarea, type TextareaProps } from "./Textarea";
import { cn } from "./utils";

export interface FormTextareaProps extends Omit<TextareaProps, "error"> {
  label?: string;
  error?: string;
  helper?: string;
  monoLabel?: boolean;
  containerClassName?: string;
}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      label,
      error,
      helper,
      monoLabel = false,
      id,
      required,
      rows = 4,
      className = "",
      containerClassName = "",
      ...props
    },
    ref
  ) => {
    const textareaId = id ?? (label ? label.toLowerCase().replace(/[^a-z0-9]/g, "-") : undefined);

    return (
      <div className={cn("flex flex-col gap-2 w-full", containerClassName)}>
        {label && (
          <Label
            htmlFor={textareaId}
            variant={monoLabel ? "mono" : "default"}
            required={required}
            className="px-0.5"
          >
            {label}
          </Label>
        )}
        <Textarea
          ref={ref}
          id={textareaId}
          required={required}
          rows={rows}
          error={Boolean(error)}
          className={className}
          {...props}
        />
        {error ? (
          <div className="flex items-center gap-1.5 px-0.5 mt-0.5">
            <IconAlertTriangle size={13} stroke={2} className="text-[#EF4444] shrink-0" />
            <span className="text-xs text-[#EF4444] font-mono leading-relaxed">
              {error}
            </span>
          </div>
        ) : helper ? (
          <span className="text-xs text-white/45 font-sans leading-relaxed px-0.5 mt-0.5 block">
            {helper}
          </span>
        ) : null}
      </div>
    );
  }
);
FormTextarea.displayName = "FormTextarea";
