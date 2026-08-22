"use client";

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
  style,
  ...props
}) => {
  const alignClass =
    align === "between"
      ? "justify-between"
      : align === "left"
        ? "justify-start"
        : "justify-end";

  const isBetween = align === "between";

  return (
    <div
      className={`flex flex-col-reverse sm:flex-row items-stretch sm:items-center ${alignClass} gap-3 pt-4 mt-4 w-full [&>button]:w-full [&>button]:sm:w-auto [&>a]:w-full [&>a]:sm:w-auto ${
        bordered ? "border-t border-white/[0.08]" : ""
      } ${className}`}
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: isBetween ? "space-between" : align === "left" ? "flex-start" : "flex-end",
        alignItems: "center",
        gap: "0.75rem",
        paddingTop: "1.25rem",
        marginTop: "1.5rem",
        borderTop: bordered ? "1px solid rgba(255, 255, 255, 0.08)" : "none",
        boxSizing: "border-box",
        width: "100%",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};
