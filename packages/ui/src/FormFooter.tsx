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
      ? "sm:justify-between"
      : align === "left"
        ? "sm:justify-start"
        : "sm:justify-end";

  return (
    <div
      className={`flex flex-col-reverse sm:flex-row items-stretch sm:items-center ${alignClass} gap-3 pt-5 mt-6 w-full [&>*]:w-full sm:[&>*]:w-auto [&_button]:w-full sm:[&_button]:w-auto [&_a]:w-full sm:[&_a]:w-auto ${
        bordered ? "border-t border-white/[0.08]" : ""
      } ${className}`}
      style={{
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
