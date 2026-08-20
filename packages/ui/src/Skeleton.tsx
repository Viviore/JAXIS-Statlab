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
          className={`animate-pulse bg-white/10 rounded-[2px] ${!height ? "h-4" : ""} ${!width ? "w-full" : ""} ${
            count > 1 ? "mb-2 last:mb-0" : ""
          } ${className}`}
          style={customStyle}
          aria-hidden="true"
          {...props}
        />
      ))}
    </>
  );
};
