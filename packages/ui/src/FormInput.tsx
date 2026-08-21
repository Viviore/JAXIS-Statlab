import React from "react";

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
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

export function EyeOffIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
      />
    </svg>
  );
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
            className={`w-full h-12 px-4 text-sm rounded-[2px] text-white placeholder:text-slate-500 focus:outline-none focus:ring-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-sans box-border border ${
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
              className="flex items-start gap-2.5 rounded-[4px] bg-[#EF4444]/12 border border-[#EF4444]/35 text-[#FCA5A5] text-xs font-sans leading-relaxed"
              style={{
                marginTop: "0.625rem",
                padding: "0.75rem 1rem",
                lineHeight: "1.45",
              }}
            >
              <svg
                className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span className="font-normal">{error}</span>
            </div>
          ) : (
            <span
              className="text-xs text-[#EF4444] font-mono leading-relaxed px-0.5"
              style={{ marginTop: "0.5rem" }}
            >
              {error}
            </span>
          )
        ) : helper ? (
          <span
            className="text-xs text-white/45 font-sans leading-relaxed px-0.5"
            style={{ marginTop: "0.5rem" }}
          >
            {helper}
          </span>
        ) : null}

      </div>
    );
  }
);

FormInput.displayName = "FormInput";

