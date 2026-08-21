import React from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  actions,
  badge,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col gap-2.5 pb-6 border-b border-white/[0.08] ${className}`}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.625rem",
        paddingBottom: "1.5rem",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs font-sans text-white/45 mb-1"
          style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "0.25rem", fontSize: "0.75rem" }}
        >
          {breadcrumbs.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-white/25">/</span>}
              {item.href ? (
                <a href={item.href} className="hover:text-white transition-colors">
                  {item.label}
                </a>
              ) : (
                <span className="text-white/70 font-medium">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* 1. Header (Title & Badge) */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans" style={{ letterSpacing: "-0.025em" }}>
          {title}
        </h1>
        {badge}
      </div>

      {/* 2. Description */}
      {description && (
        <p
          className="text-sm text-white/60 leading-relaxed max-w-3xl font-sans"
          style={{ margin: 0, fontSize: "0.875rem", lineHeight: 1.6 }}
        >
          {description}
        </p>
      )}

      {/* 3. Buttons (Actions) */}
      {actions && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1">
          {actions}
        </div>
      )}
    </div>
  );
};
