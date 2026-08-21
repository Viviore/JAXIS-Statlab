import React from "react";

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelRightAction?: React.ReactNode;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  monoLabel?: boolean;
  variant?: "default" | "terminal" | "auth";
  containerClassName?: string;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      labelRightAction,
      error,
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

    const variantClasses = {
      default: "bg-[#011C38] border-white/12 focus:border-[#CC6600] focus:ring-[#CC6600]/40 px-4 h-12 text-sm",
      terminal: "bg-[#010E21] border-white/15 focus:border-[#CC6600] focus:ring-[#CC6600]/40 font-mono px-3.5 h-11 text-sm",
      auth: "bg-[#011227] border-white/[0.14] focus:border-[#CC6600] focus:ring-[#CC6600]/40 px-4 h-12 text-sm",
    };

    return (
      <div className={`flex flex-col w-full mb-4 ${containerClassName}`}>
        {/* Label Row with explicit bottom spacing */}
        {(label || labelRightAction) && (
          <div className="flex items-center justify-between px-0.5 mb-2">
            {label && (
              <label
                htmlFor={inputId}
                className={`text-xs select-none ${
                  monoLabel
                    ? "font-mono uppercase tracking-wider text-white/75 font-medium"
                    : "font-sans text-white/80 font-medium"
                }`}
              >
                {label}
                {required && <span className="text-[#CC6600] ml-1.5">*</span>}
              </label>
            )}
            {labelRightAction && (
              <div className="text-xs">{labelRightAction}</div>
            )}
          </div>
        )}

        {/* Input Field with optional left/right icons */}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center justify-center text-white/40 pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            required={required}
            className={`w-full border ${
              error
                ? "border-[#EF4444] focus:ring-[#EF4444]/40"
                : variantClasses[variant]
            } rounded-[2px] text-white placeholder:text-white/25 focus:outline-none focus:ring-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              leftIcon ? "pl-11" : ""
            } ${rightIcon ? "pr-11" : "" } ${className}`}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3.5 flex items-center justify-center text-white/40">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Error or Helper text with generous margin */}
        {error ? (
          <span className="text-xs text-[#EF4444] font-mono leading-relaxed mt-1.5 px-0.5">{error}</span>
        ) : helper ? (
          <span className="text-xs text-white/45 font-sans leading-relaxed mt-1.5 px-0.5">{helper}</span>
        ) : null}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";
