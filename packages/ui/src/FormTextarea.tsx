import React from "react";

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
  containerClassName?: string;
}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      label,
      error,
      helper,
      id,
      required,
      rows = 4,
      className = "",
      containerClassName = "",
      ...props
    },
    ref
  ) => {
    const textareaId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
        {label && (
          <label htmlFor={textareaId} className="text-xs font-medium text-white/80 select-none">
            {label}
            {required && <span className="text-[#CC6600] ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          required={required}
          rows={rows}
          className={`w-full bg-[#012E57] border ${
            error ? "border-[#EF4444] focus:ring-[#EF4444]" : "border-white/10 focus:border-[#CC6600] focus:ring-[#CC6600]"
          } rounded-[2px] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed resize-y ${className}`}
          {...props}
        />
        {error ? (
          <span className="text-xs text-[#EF4444] font-normal">{error}</span>
        ) : helper ? (
          <span className="text-xs text-white/50">{helper}</span>
        ) : null}
      </div>
    );
  }
);

FormTextarea.displayName = "FormTextarea";
