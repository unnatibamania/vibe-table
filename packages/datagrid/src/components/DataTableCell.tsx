import type React from "react";
import { cn } from "../lib/cn";
import type { DataTableCellProps } from "../types/table";

export function DataTableCell({
  minWidth,
  maxWidth,
  className,
  style,
  children,
  ...props
}: DataTableCellProps) {
  const mergedStyle: React.CSSProperties = {
    minWidth: typeof minWidth === "number" ? `${minWidth}px` : undefined,
    maxWidth: typeof maxWidth === "number" ? `${maxWidth}px` : undefined,
    ...style,
  };

  return (
    <td
      className={cn("px-3 py-2 align-middle text-zinc-800", className)}
      style={mergedStyle}
      {...props}
    >
      {children}
    </td>
  );
}
