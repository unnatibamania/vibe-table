import React from "react";
import { cn } from "../lib/cn";
import type { DataTableColumnProps } from "../types/table";

export const DataTableColumn = React.forwardRef<
  HTMLTableCellElement,
  DataTableColumnProps
>(({ minWidth, maxWidth, className, style, children, ...props }, ref) => {
  const mergedStyle: React.CSSProperties = {
    minWidth: typeof minWidth === "number" ? `${minWidth}px` : undefined,
    maxWidth: typeof maxWidth === "number" ? `${maxWidth}px` : undefined,
    ...style,
  };

  return (
    <th
      ref={ref}
      scope="col"
      className={cn(
        "border-b border-zinc-200 px-3 py-2 text-left align-middle font-medium text-zinc-900 whitespace-nowrap",
        className
      )}
      style={mergedStyle}
      {...props}
    >
      {children}
    </th>
  );
});

DataTableColumn.displayName = "DataTableColumn";
