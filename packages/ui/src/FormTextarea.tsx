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
                ? "font-mono uppercase tracking-wider text-white/75 font-medium"
                : "font-sans text-white/80 font-medium"
            }`}
          >
            {label}
            {required && <span className="text-[#CC6600] ml-1.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          required={required}
          rows={rows}
          className={`w-full bg-[#011C38] border ${
            error ? "border-[#EF4444] focus:ring-[#EF4444]/40" : "border-white/12 focus:border-[#CC6600] focus:ring-[#CC6600]/40"
          } rounded-[2px] px-4 py-3.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-y ${className}`}
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
