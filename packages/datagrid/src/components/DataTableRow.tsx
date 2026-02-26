import { cn } from "../lib/cn";
import type { DataTableRowProps } from "../types/table";

export function DataTableRow({ className, children, ...props }: DataTableRowProps) {
  return (
    <tr
      className={cn(
        "transition-colors hover:bg-zinc-50/70",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}
