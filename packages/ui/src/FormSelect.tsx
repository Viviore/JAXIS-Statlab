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
      id,
      required,
      className = "",
      containerClassName = "",
      ...props
    },
    ref
  ) => {
    const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
        {label && (
          <label htmlFor={selectId} className="text-xs font-medium text-white/80 select-none">
            {label}
            {required && <span className="text-[#CC6600] ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          required={required}
          className={`w-full bg-[#012E57] border ${
            error ? "border-[#EF4444] focus:ring-[#EF4444]" : "border-white/10 focus:border-[#CC6600] focus:ring-[#CC6600]"
          } rounded-[2px] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="bg-[#012E57] text-white/40">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled}
              className="bg-[#012E57] text-white"
            >
              {opt.label}
            </option>
          ))}
        </select>
        {error ? (
          <span className="text-xs text-[#EF4444] font-normal">{error}</span>
        ) : helper ? (
          <span className="text-xs text-white/50">{helper}</span>
        ) : null}
      </div>
    );
  }
);

FormSelect.displayName = "FormSelect";
