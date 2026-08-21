import React from "react";

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
      <div className={`flex flex-col gap-2 w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={selectId}
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
        <select
          ref={ref}
          id={selectId}
          required={required}
          className={`w-full bg-[#011C38] border ${
            error ? "border-[#EF4444] focus:ring-[#EF4444]/40" : "border-white/12 focus:border-[#CC6600] focus:ring-[#CC6600]/40"
          } rounded-[2px] px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
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
        {error ? (
          <span className="text-xs text-[#EF4444] font-mono leading-relaxed mt-1 px-0.5">{error}</span>
        ) : helper ? (
          <span className="text-xs text-white/45 font-sans leading-relaxed mt-1 px-0.5">{helper}</span>
        ) : null}
      </div>
    );
  }
);

FormSelect.displayName = "FormSelect";
