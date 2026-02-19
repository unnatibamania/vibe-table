import type React from "react";
import { cn } from "../lib/cn";
import type { DataTableColumnProps } from "../types/table";

export function DataTableColumn({
  minWidth,
  maxWidth,
  className,
  style,
  children,
  ...props
}: DataTableColumnProps) {
  const mergedStyle: React.CSSProperties = {
    minWidth: typeof minWidth === "number" ? `${minWidth}px` : undefined,
    maxWidth: typeof maxWidth === "number" ? `${maxWidth}px` : undefined,
    ...style,
  };

  return (
    <th
      scope="col"
      className={cn(
        "px-3 py-2 text-left align-middle font-medium text-zinc-900",
        className
      )}
      style={mergedStyle}
      {...props}
    >
      {children}
    </th>
  );
}
