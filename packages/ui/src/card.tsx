import React from "react";

export type CardVariant = "default" | "kpi";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", children, className = "", header, footer, ...props }, ref) => {
    const isKpi = variant === "kpi";

    return (
      <div
        ref={ref}
        className={`bg-[#012E57] border border-white/10 rounded-[2px] text-white transition-colors duration-150 ${
          isKpi ? "p-4 flex flex-col justify-between" : "p-6"
        } ${className}`}
        {...props}
      >
        {header && <div className="border-b border-white/10 pb-3 mb-4">{header}</div>}
        <div className="flex-1">{children}</div>
        {footer && <div className="border-t border-white/10 pt-3 mt-4">{footer}</div>}
      </div>
    );
  }
);

Card.displayName = "Card";
