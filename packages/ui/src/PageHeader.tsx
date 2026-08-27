import React from "react";

export interface PageHeaderBreadcrumb {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: PageHeaderBreadcrumb[];
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
      className={`flex flex-col gap-3 pb-8 border-b border-white/10 ${className}`}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-sans text-white/50 mb-1"
        >
          {breadcrumbs.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-white/30">/</span>}
              {item.href ? (
                <a href={item.href} className="hover:text-white transition-colors">
                  {item.label}
                </a>
              ) : (
                <span className="text-white/80 font-medium">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Header Container: Title, Description & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
              {title}
            </h1>
            {badge}
          </div>

          {description && (
            <p className="text-sm text-white/60 leading-relaxed max-w-3xl font-sans">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-3 shrink-0 pt-1 sm:pt-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
