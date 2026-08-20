import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
  height?: string | number;
  width?: string | number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  count = 1,
  height,
  width,
  className = "",
  style,
  ...props
}) => {
  const items = Array.from({ length: count });

  const customStyle: React.CSSProperties = {
    ...style,
    ...(height ? { height: typeof height === "number" ? `${height}px` : height } : {}),
    ...(width ? { width: typeof width === "number" ? `${width}px` : width } : {}),
  };

  return (
    <>
      {items.map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-gradient-to-r from-white/[0.05] via-white/[0.09] to-white/[0.05] bg-[length:200%_100%] rounded-[2px] ${
            !height ? "h-4" : ""
          } ${!width ? "w-full" : ""} ${count > 1 ? "mb-2 last:mb-0" : ""} ${className}`}
          style={customStyle}
          aria-hidden="true"
          {...props}
        />
      ))}
    </>
  );
};

export const KpiCardSkeleton: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div
      className={`relative overflow-hidden rounded-[2px] border border-white/[0.08] bg-[#01162E]/70 p-5 flex flex-col justify-between ${className}`}
      style={{ minHeight: "135px" }}
      aria-hidden="true"
    >
      <div className="flex items-center justify-between mb-2">
        <Skeleton width="45%" height={14} />
        <Skeleton width="28%" height={18} className="rounded-full" />
      </div>
      <div className="my-2">
        <Skeleton width="35%" height={32} />
      </div>
      <div className="pt-3 border-t border-white/[0.06] flex items-center gap-2">
        <Skeleton width="75%" height={12} />
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC<{ columns?: number }> = () => {
  return (
    <tr className="border-b border-white/[0.06] animate-pulse" aria-hidden="true">
      <td className="py-4 pr-6 pl-1" style={{ width: "30%" }}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Skeleton width={90} height={18} />
            <Skeleton width={45} height={12} />
          </div>
          <Skeleton width="90%" height={16} />
        </div>
      </td>
      <td className="py-4 px-3" style={{ width: "17%" }}>
        <div className="flex flex-col gap-1.5">
          <Skeleton width="70%" height={14} />
          <Skeleton width="50%" height={12} />
        </div>
      </td>
      <td className="py-4 px-3" style={{ width: "21%" }}>
        <Skeleton width="85%" height={14} count={2} />
      </td>
      <td className="py-4 px-3" style={{ width: "14%" }}>
        <div className="flex items-center gap-2">
          <Skeleton width={24} height={24} className="rounded-full" />
          <Skeleton width="65%" height={14} />
        </div>
      </td>
      <td className="py-4 px-2" style={{ width: "9%" }}>
        <Skeleton width={75} height={20} />
      </td>
      <td className="py-4 px-2" style={{ width: "9%" }}>
        <Skeleton width={75} height={20} />
      </td>
      <td className="py-4 pl-2 pr-1 text-right" style={{ width: "10%" }}>
        <Skeleton width={80} height={28} className="ml-auto" />
      </td>
    </tr>
  );
};
