import React from "react";

export type CardVariant = "default" | "kpi" | "glass" | "bordered";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  contentClassName?: string;
  contentStyle?: React.CSSProperties;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", children, className = "", header, footer, contentClassName = "", contentStyle, style, ...props }, ref) => {
    const isKpi = variant === "kpi";
    const hasZeroPadding = className.includes("p-0");

    return (
      <div
        ref={ref}
        className={`relative overflow-hidden rounded-[2px] border border-white/[0.09] hover:border-white/[0.18] transition-colors duration-150 backdrop-blur-md ${className}`}
        style={{
          borderRadius: "2px",
          border: "1px solid rgba(255, 255, 255, 0.09)",
          backgroundColor: isKpi ? "rgba(1, 22, 46, 0.85)" : "rgba(1, 22, 46, 0.75)",
          padding: hasZeroPadding ? 0 : isKpi ? "1.25rem 1.5rem" : "1.5rem 1.75rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: isKpi ? "space-between" : "flex-start",
          boxSizing: "border-box",
          ...style,
        }}
        {...props}
      >
        {/* Subtle top edge specular highlight */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.15] to-transparent"
          aria-hidden="true"
        />

        {header && (
          <div
            className="border-b border-white/[0.08] pb-3 mb-4"
            style={{
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              paddingBottom: "0.875rem",
              marginBottom: "1rem",
              width: "100%",
            }}
          >
            {header}
          </div>
        )}
        <div
          className={`flex-1 w-full flex flex-col ${contentClassName}`}
          style={{
            flex: 1,
            width: "100%",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            ...contentStyle,
          }}
        >
          {children}
        </div>
        {footer && (
          <div
            className="border-t border-white/[0.08] pt-3 mt-4"
            style={{
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              paddingTop: "0.875rem",
              marginTop: "1rem",
              width: "100%",
            }}
          >
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = "Card";
