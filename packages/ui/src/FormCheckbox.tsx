import React from "react";

export interface FormCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: React.ReactNode;
  description?: string;
  error?: string;
  containerClassName?: string;
}

export const FormCheckbox = React.forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, description, error, id, className = "", containerClassName = "", checked, onChange, disabled, ...props }, ref) => {
    const inputId = id ?? (typeof label === "string" ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={`flex flex-col gap-1.5 py-1 ${containerClassName}`}>
        <label
          htmlFor={inputId}
          className={`flex items-start gap-3 cursor-pointer select-none ${
            disabled ? "opacity-50 cursor-not-allowed" : "hover:text-white"
          } text-xs text-white/75 transition-colors`}
        >
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className={`h-4 w-4 rounded-[2px] bg-[#011227] border border-white/20 text-[#CC6600] focus:ring-0 focus:ring-offset-0 accent-[#CC6600] mt-0.5 cursor-pointer disabled:cursor-not-allowed ${className}`}
            {...props}
          />
          <div className="flex flex-col">
            <span className="font-sans leading-tight font-normal">{label}</span>
            {description && (
              <span className="text-[0.688rem] text-white/40 mt-1 leading-relaxed">
                {description}
              </span>
            )}
          </div>
        </label>
        {error && <span className="text-xs text-[#EF4444] font-mono mt-1 px-0.5">{error}</span>}
      </div>
    );
  }
);

FormCheckbox.displayName = "FormCheckbox";
