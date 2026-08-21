import React from "react";

export interface FormFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  align?: "right" | "left" | "between";
  className?: string;
  bordered?: boolean;
}

export const FormFooter: React.FC<FormFooterProps> = ({
  children,
  align = "right",
  className = "",
  bordered = true,
  ...props
}) => {
  const alignClass =
    align === "between"
      ? "justify-between"
      : align === "left"
        ? "justify-start"
        : "justify-end";

  return (
    <div
      className={`flex items-center ${alignClass} gap-3 pt-4 mt-4 ${
        bordered ? "border-t border-white/[0.08]" : ""
      } ${className}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        paddingTop: "1.125rem",
        marginTop: "1.25rem",
        borderTop: bordered ? "1px solid rgba(255, 255, 255, 0.08)" : "none",
        boxSizing: "border-box",
      }}
      {...props}
    >
      {children}
    </div>
  );
};
