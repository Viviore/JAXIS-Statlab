import React from "react";

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
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
      <div className={`flex flex-col gap-2 w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={textareaId}
            className={`text-xs select-none px-0.5 ${
              monoLabel
                ? "font-mono uppercase tracking-wider font-semibold text-slate-200"
                : "font-sans text-white/80 font-medium"
            }`}
            style={{ fontSize: "0.75rem", fontWeight: 600, color: monoLabel ? "#E2E8F0" : undefined }}
          >
            {label}{required && <> <span style={{ color: "#CC6600" }}>*</span></>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          required={required}
          rows={rows}
          className={`w-full bg-[#011C38] border ${
            error ? "border-[#EF4444] focus:border-[#EF4444]" : "border-white/12 focus:border-[#CC6600]"
          } rounded-[2px] px-5 py-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed resize-y ${className}`}
          style={{
            padding: "1rem 1.25rem",
            boxSizing: "border-box",
            lineHeight: "1.6",
            fontSize: "0.875rem",
            outline: "none",
            boxShadow: "none",
            ...props.style,
          }}
          {...props}
        />
        {error ? (
          <span className="text-xs text-[#EF4444] font-mono leading-relaxed mt-1 px-0.5">{error}</span>
        ) : helper ? (
          <span className="text-xs text-white/45 font-sans leading-relaxed mt-1 px-0.5">{helper}</span>
        ) : null}
      </div>
    );
  }
);

FormTextarea.displayName = "FormTextarea";
