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
    <div className={`flex flex-col gap-3 pb-6 border-b border-white/10 ${className}`}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-mono text-white/50">
          {breadcrumbs.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-white/30">/</span>}
              {item.href ? (
                <a href={item.href} className="hover:text-[#CC6600] transition-colors">
                  {item.label}
                </a>
              ) : (
                <span className="text-white/80">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">{title}</h1>
          {badge}
        </div>
        {actions && <div className="flex items-center gap-2.5">{actions}</div>}
      </div>

      {description && <p className="text-sm text-white/60 leading-relaxed max-w-3xl">{description}</p>}
    </div>
  );
};
